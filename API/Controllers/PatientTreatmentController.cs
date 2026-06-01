using ClinicManager.DAL;
using ClinicManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClinicManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientTreatmentController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<PatientTreatmentController> _logger;
        public PatientTreatmentController(ClinicDbContext context, ILogger<PatientTreatmentController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientTreatment>>> Get(int pageNumber = 1, int pageSize = 10)
        {
            _logger.LogInformation($"Fetching patient treatments page {pageNumber} with size {pageSize}");
            var treatments = await _context.PatientTreatments
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return treatments;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientTreatment>> Get(int id)
        {
            _logger.LogInformation($"Fetching patient treatment with ID: {id}");
            var entity = await _context.PatientTreatments.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient treatment with ID: {id} not found");
                return NotFound();
            }
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<PatientTreatment>> Post(PatientTreatment treatment)
        {
            _context.PatientTreatments.Add(treatment);
            await _context.SaveChangesAsync();
            await SaveBillingRecordAsync(treatment.ID, treatment, true);         
            _logger.LogInformation($"Created new patient treatment with ID: {treatment.ID}");
            return CreatedAtAction(nameof(Get), new { id = treatment.ID }, treatment);
        }

        private async Task SaveBillingRecordAsync(int treatmentId, PatientTreatment treatment, bool IsCreate)
        {
            string patientName = "";
            if (treatment.PatientID.HasValue)
            {
                var patient = await _context.Patients.FindAsync(treatment.PatientID.Value);
                if (patient != null)
                {
                    var user = await _context.Users.FindAsync(patient.UserID);
                    if (user != null)
                    {
                        patientName = user.FullName;
                    }
                }
            }

            string doctorName = "";
            if (treatment.DoctorID.HasValue)
            {
                var doctor = await _context.Users.FindAsync(treatment.DoctorID.Value);
                if (doctor != null)
                {
                    doctorName = doctor.FullName;
                }
            }

            if (IsCreate)
            {
                var billingRecord = new BillingRecord
                {
                    TreatmentID = treatmentId,
                    PatientID = treatment.PatientID,
                    DoctorID = treatment.DoctorID,
                    PatientName = patientName,
                    DoctorName = doctorName,
                    TreatmentName = treatment.TreatmentPlan,
                    ServiceDate = DateTime.Now,
                    PostedDate = DateTime.Now,
                    BalanceDue = treatment.EstimatedCost ?? 0,
                    CreatedBy = treatment.CreatedBy,
                    CreatedDate = DateTime.Now,
                    DiscountTotal = 0,
                    Subtotal = treatment.EstimatedCost ?? 0,
                    TaxTotal = 0,
                    Total = treatment.EstimatedCost ?? 0,
                    IsActive = 1,
                    ModifiedBy = treatment.CreatedBy,
                    ModifiedDate = DateTime.Now,
                    Status = Models.Enums.BillingStatus.Submitted,
                    AmountPaid = 0
                };
                _context.BillingRecords.Add(billingRecord);
                await _context.SaveChangesAsync();
            }
            else
            {
                BillingRecord? bilrec = await _context.BillingRecords
                    .FirstOrDefaultAsync(br => br.TreatmentID == treatmentId && br.PatientID == treatment.PatientID);
                if (bilrec != null)
                {
                    if (treatment.EstimatedCost.HasValue && treatment.EstimatedCost.Value != bilrec.Total)
                    {
                        bilrec.Subtotal = treatment.EstimatedCost.Value;
                        bilrec.Total = treatment.EstimatedCost.Value - (bilrec.DiscountTotal ?? 0) + (bilrec.TaxTotal ?? 0);
                        bilrec.BalanceDue = bilrec.Total - (bilrec.AmountPaid ?? 0);
                        bilrec.ModifiedBy = treatment.ModifiedBy;
                        bilrec.ModifiedDate = DateTime.Now;
                        _context.BillingRecords.Update(bilrec);
                        await _context.SaveChangesAsync();
                    }
                }
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, PatientTreatment treatment)
        {
            if (id != treatment.ID)
            {
                _logger.LogWarning($"Patient treatment ID mismatch: {id} != {treatment.ID}");
                return BadRequest();
            }
            _context.Entry(treatment).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            await SaveBillingRecordAsync(treatment.ID, treatment, false);
            _logger.LogInformation($"Updated patient treatment with ID: {id}");
            return NoContent();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, JsonPatchDocument<PatientTreatment> patchDoc)
        {
            var entity = await _context.PatientTreatments.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient treatment with ID: {id} not found for patch");
                return NotFound();
            }
            patchDoc.ApplyTo(entity);
            await _context.SaveChangesAsync();
            await SaveBillingRecordAsync(entity.ID, entity, false);
            _logger.LogInformation($"Patched patient treatment with ID: {id}");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.PatientTreatments.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient treatment with ID: {id} not found for deletion");
                return NotFound();
            }
            _context.PatientTreatments.Remove(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted patient treatment with ID: {id}");
            return NoContent();
        }

        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetbybyUserId(int id)
        {
            _logger.LogInformation($"Fetching patient treatment with User ID: {id}");
            var entity = await _context.PatientTreatments.Where(x=> x.UserID == id).ToListAsync();
            if (entity == null)
            {
                _logger.LogWarning($"Patient treatment with User ID: {id} not found");
                return NotFound();
            }
            return Ok(entity);
        }
    }
}
