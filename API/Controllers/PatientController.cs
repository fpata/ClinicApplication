using ClinicManager.DAL;
using ClinicManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;

namespace ClinicManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<PatientController> _logger;
        public PatientController(ClinicDbContext context, ILogger<PatientController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Patient>>> Get(int pageNumber = 1, int pageSize = 10)
        {
            _logger.LogInformation($"Fetching patients page {pageNumber} with size {pageSize}");
            var patients = await _context.Patients
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return patients;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Patient>> Get(int id)
        {
            _logger.LogInformation($"Fetching patient with ID: {id}");
            var entity = await _context.Patients.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient with ID: {id} not found");
                return NotFound();
            }
            else
            {
                // Optionally, you can include related data if needed
                entity.PatientAppointments = await _context.PatientAppointments
                    .Where(a => a.PatientID == id)
                    .ToListAsync();
                entity.PatientReports = await _context.PatientReports
                    .Where(r => r.PatientID == id)
                    .ToListAsync();
                entity.PatientTreatment = await _context.PatientTreatments
                    .Where(t => t.PatientID == id)
                    .FirstOrDefaultAsync();
                if (entity.PatientTreatment != null)
                {
                    entity.PatientTreatment.PatientTreatmentDetails = await _context.PatientTreatmentDetails
                        .Where(td => td.PatientID == id)
                        .ToListAsync();
                }
                    _logger.LogInformation($"Fetched patient with ID: {id}");
            }
            return entity;
        }

        [HttpGet("Complete/{id}")]
        public async Task<ActionResult<User>> GetComplete(int id)
        {
            _logger.LogInformation($"Fetching patient with ID: {id}");

            User? user =null;
            Patient? patient = await _context.Patients.FindAsync(id) as Patient;
          

            if (patient == null)
            {
                _logger.LogWarning($"Patient with ID: {id} not found");
                return NotFound();
            }
            else
            {
                user = await _context.Users.FindAsync(patient.UserID);
                if(user.Patients==null) user.Patients = new List<Patient>();
                user?.Patients?.Add(patient);

                user.Address = await _context.Addresses
                .Where(a => a.UserID == patient.UserID)
                .FirstOrDefaultAsync();

                user.Contact = await _context.Contacts.
                Where(c => c.UserID == patient.UserID)
                .FirstOrDefaultAsync();
                
                patient.PatientAppointments = await _context.PatientAppointments
                    .Where(a => a.PatientID == id)
                    .ToListAsync();
                patient.PatientReports = await _context.PatientReports
                    .Where(r => r.PatientID == id)
                    .ToListAsync();
                patient.PatientTreatment = await _context.PatientTreatments
                    .Where(t => t.PatientID == id)
                    .FirstOrDefaultAsync();
               if(patient.PatientTreatment !=null) patient.PatientTreatment.PatientTreatmentDetails = await _context.PatientTreatmentDetails
                    .Where(td => td.PatientID == id)
                    .ToListAsync();
                _logger.LogInformation($"Fetched full details for patient with ID: {id}");

            }
            return user;
        }

        [HttpPost]
        public async Task<ActionResult<Patient>> Post(Patient patient)
        {
           IDbContextTransaction dbContextTransaction = _context.Database.BeginTransaction();

            try
            {
                _context.Patients.Add(patient);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Created new patient with ID: {patient.ID}");

                if (patient.PatientReports != null)
                {
                    foreach (var report in patient.PatientReports)
                    {
                        report.PatientID = patient.ID;
                        report.UserID = patient.UserID;
                        _context.PatientReports.Add(report);
                    }
                    await _context.SaveChangesAsync();
                }
                if (patient.PatientAppointments != null)
                {
                    foreach (var appointment in patient.PatientAppointments)
                    {
                        appointment.PatientID = patient.ID;
                        _context.PatientAppointments.Add(appointment);
                    }
                    await _context.SaveChangesAsync();
                }
                if (patient.PatientTreatment != null)
                {
                    patient.PatientTreatment.PatientID = patient.ID;
                    patient.PatientTreatment.UserID = patient.UserID;
                    _context.PatientTreatments.Add(patient.PatientTreatment);
                    if (patient.PatientTreatment.PatientTreatmentDetails != null)
                    {
                        foreach (var detail in patient.PatientTreatment.PatientTreatmentDetails)
                        {
                            detail.PatientID = patient.ID;
                            _context.PatientTreatmentDetails.Add(detail);
                        }
                        await _context.SaveChangesAsync();
                    }
                }
                await dbContextTransaction.CommitAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating patient");
                await dbContextTransaction.RollbackAsync();
                return StatusCode(500, "Internal server error");
            }
            finally
            {
                _context.Entry(patient).State = EntityState.Detached; // Detach to avoid tracking issues
                if (patient.PatientReports != null)
                {
                    foreach (var report in patient.PatientReports)
                    {
                        _context.Entry(report).State = EntityState.Detached;
                    }
                }
                if (patient.PatientAppointments != null)
                {
                    foreach (var appointment in patient.PatientAppointments)
                    {
                        _context.Entry(appointment).State = EntityState.Detached;
                    }
                }
                if (patient.PatientTreatment != null)
                {
                    _context.Entry(patient.PatientTreatment).State = EntityState.Detached;
                    if (patient.PatientTreatment.PatientTreatmentDetails != null)
                    {
                        foreach (var detail in patient.PatientTreatment.PatientTreatmentDetails)
                        {
                            _context.Entry(detail).State = EntityState.Detached;
                        }
                    }
                }
            }
            return CreatedAtAction(nameof(Get), new { id = patient.ID }, patient);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Patient patient)
        {
            if (id != patient.ID)
            {
                _logger.LogWarning($"Patient ID mismatch: {id} != {patient.ID}");
                return BadRequest();
            }
            _context.Entry(patient).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Updated patient with ID: {id}");
            return NoContent();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, JsonPatchDocument<Patient> patchDoc)
        {
            var entity = await _context.Patients.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient with ID: {id} not found for patch");
                return NotFound();
            }
            patchDoc.ApplyTo(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Patched patient with ID: {id}");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Patients.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient with ID: {id} not found for deletion");
                return NotFound();
            }
            _context.Patients.Remove(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted patient with ID: {id}");
            return NoContent();
        }
    }
}
