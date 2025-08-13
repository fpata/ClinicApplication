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

        private const int CACHE_EXPIRY_MINUTES = 10;

        public PatientController(ClinicDbContext context, ILogger<PatientController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Patient>>> Get(int pageNumber = 1, int pageSize = 10)
        {
            _logger.LogInformation($"Fetching patients page {pageNumber} with size {pageSize}");
            
            var cacheKey = $"patients_page_{pageNumber}_size_{pageSize}";
           
            var patients = await _context.Patients
                .AsNoTracking()
                .Where(p => p.IsActive ==1)
                .OrderBy(p => p.ID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync()
                .ConfigureAwait(false);
           
            return patients;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Patient>> Get(int id)
        {
            _logger.LogInformation($"Fetching patient with ID: {id}");
            
            var cacheKey = $"patient_{id}";

            // Use Include to solve N+1 problem with single query
            var entity = await _context.Patients
                .AsNoTracking()
                .AsSplitQuery() // Use AsSplitQuery to optimize loading related entities
                .Include(p => p.PatientAppointments)
                .Include(p => p.PatientReports)
                .Include(p => p.PatientTreatment)
                    .ThenInclude(pt => pt!.PatientTreatmentDetails)
                .FirstOrDefaultAsync(p => p.ID == id && p.IsActive == 1);

            if (entity == null)
            {
                _logger.LogWarning($"Patient with ID: {id} not found");
                return NotFound();
            }
            _logger.LogInformation($"Fetched patient with ID: {id}");
            return entity;
        }

        [HttpGet("Complete/{id}")]
        public async Task<ActionResult<User>> GetComplete(int id)
        {
            _logger.LogInformation($"Fetching complete patient data with ID: {id}");

            var cacheKey = $"patient_complete_{id}";
           

            // Optimize with single query using projection to avoid loading unnecessary data
            var userData = await (from _patient in _context.Patients
                                  join _user in _context.Users on _patient.UserID equals _user.ID
                                  where _patient.ID == id && _patient.IsActive ==1 && _user.IsActive ==1
                                  select new
                                  {
                                      User = _user,
                                      Patient = _patient,
                                      Address = _context.Addresses
                                          .Where(a => a.UserID == _user.ID && a.IsActive == 1)
                                          .FirstOrDefault(),
                                      Contact = _context.Contacts
                                          .Where(c => c.UserID == _user.ID && c.IsActive == 1)
                                          .FirstOrDefault(),
                                      PatientAppointments = _context.PatientAppointments
                                          .Where(pa => pa.PatientID == id)
                                          .ToList(),
                                      PatientReports = _context.PatientReports
                                          .Where(pr => pr.PatientID == id)
                                          .ToList(),
                                      PatientTreatment = _context.PatientTreatments
                                          .Where(pt => pt.PatientID == id)
                                          .FirstOrDefault(),
                                      PatientTreatmentDetails = _context.PatientTreatmentDetails
                                          .Where(ptd => ptd.PatientID == id)
                                          .ToList()
                                  })
                                 .AsNoTracking()
                                 .FirstOrDefaultAsync();

            if (userData == null)
            {
                _logger.LogWarning($"Patient with ID: {id} not found");
                return NotFound();
            }

            // Construct the result
            var user = userData.User;
            user.Address = userData.Address;
            user.Contact = userData.Contact;
            
            var patient = userData.Patient;
            patient.PatientAppointments = userData.PatientAppointments;
            patient.PatientReports = userData.PatientReports;
            patient.PatientTreatment = userData.PatientTreatment;
            
            if (patient.PatientTreatment != null)
            {
                patient.PatientTreatment.PatientTreatmentDetails = userData.PatientTreatmentDetails;
            }

            user.Patients = new List<Patient> { patient };
           
            _logger.LogInformation($"Fetched complete patient data with ID: {id}");

            return user;
        }

        [HttpPost]
        public async Task<ActionResult<Patient>> Post(Patient patient)
        {
            using var dbContextTransaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Set timestamps and IsActive for the main patient entity
                patient.CreatedDate = DateTime.UtcNow;
                patient.ModifiedDate = DateTime.UtcNow;
                patient.IsActive = 1;

                // Reset IDs and set properties for all related entities to ensure they are treated as new.
                // EF Core will handle setting the foreign keys automatically.
                if (patient.PatientReports?.Any() == true)
                {
                    foreach (var report in patient.PatientReports)
                    {
                        report.ID = 0;
                        report.UserID = patient.UserID;
                        report.CreatedDate = DateTime.UtcNow;
                        report.ModifiedDate = DateTime.UtcNow;
                    }
                }

                if (patient.PatientAppointments?.Any() == true)
                {
                    foreach (var appointment in patient.PatientAppointments)
                    {
                        appointment.ID = 0;
                        appointment.UserID = patient.UserID;
                        appointment.CreatedDate = DateTime.UtcNow;
                        appointment.ModifiedDate = DateTime.UtcNow;
                    }
                }

                if (patient.PatientTreatment != null)
                {
                    patient.PatientTreatment.ID = 0;
                    patient.PatientTreatment.UserID = patient.UserID;
                    patient.PatientTreatment.CreatedDate = DateTime.UtcNow;
                    patient.PatientTreatment.ModifiedDate = DateTime.UtcNow;

                    if (patient.PatientTreatment.PatientTreatmentDetails?.Any() == true)
                    {
                        foreach (var detail in patient.PatientTreatment.PatientTreatmentDetails)
                        {
                            detail.ID = 0;
                            detail.UserID = patient.UserID;
                            detail.CreatedDate = DateTime.UtcNow;
                            detail.ModifiedDate = DateTime.UtcNow;
                        }
                    }
                }

                // Add only the top-level patient object to the context.
                // EF Core will automatically detect and add all related child entities.
                _context.Patients.Add(patient);

                // Save all changes in a single transaction.
                await _context.SaveChangesAsync();

                await dbContextTransaction.CommitAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating patient");
                await dbContextTransaction.RollbackAsync();
                return StatusCode(500, "Internal server error");
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

            // Update timestamp
            patient.ModifiedDate = DateTime.UtcNow;
            if (patient.PatientAppointments?.Any() == true)
            {
                foreach (var appointment in patient.PatientAppointments)
                {
                    appointment.PatientID = id; // Ensure the appointment is linked to the correct patient
                    appointment.UserID = patient.UserID;
                    appointment.CreatedDate = appointment.CreatedDate ?? DateTime.UtcNow;
                    appointment.ModifiedDate = DateTime.UtcNow;
                    _context.Entry(appointment).State = appointment.ID < 1 ? EntityState.Added : EntityState.Modified;
                }
            }
            if(patient.PatientReports?.Any() == true)
            {
                foreach (var report in patient.PatientReports)
                {
                    report.PatientID = id; // Ensure the report is linked to the correct patient
                    report.UserID = patient.UserID;
                    report.CreatedDate = report.CreatedDate ?? DateTime.UtcNow;
                    report.ModifiedDate = DateTime.UtcNow;
                    _context.Entry(report).State = report.ID < 1 ? EntityState.Added : EntityState.Modified;
                }
            }
            if(patient.PatientTreatment != null)
            {
                patient.PatientTreatment.PatientID = id; // Ensure the treatment is linked to the correct patient
                patient.PatientTreatment.UserID = patient.UserID;
                patient.PatientTreatment.CreatedDate = patient.PatientTreatment.CreatedDate ?? DateTime.UtcNow;
                patient.PatientTreatment.ModifiedDate = DateTime.UtcNow;
                _context.Entry(patient.PatientTreatment).State = patient.PatientTreatment.ID < 1 ? EntityState.Added : EntityState.Modified;
                if (patient.PatientTreatment.PatientTreatmentDetails?.Any() == true)
                {
                    foreach (var detail in patient.PatientTreatment.PatientTreatmentDetails)
                    {
                        detail.UserID = patient.UserID;
                        detail.PatientID = id; // Ensure the detail is linked to the correct patient
                        detail.CreatedDate = detail.CreatedDate ?? DateTime.UtcNow;
                        detail.ModifiedDate = DateTime.UtcNow;
                        _context.Entry(detail).State = detail.ID < 1 ? EntityState.Added : EntityState.Modified;
                    }
                }
            }

            _context.Entry(patient).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            
           _logger  .LogInformation($"Updated patient with ID: {id}");
            patient = Get(id).Result.Value!; // Refresh patient to get full details including related entities
            return Ok(patient);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, JsonPatchDocument<Patient> patchDoc)
        {
            var entity = await _context.Patients
                .FirstOrDefaultAsync(p => p.ID == id);
                
            if (entity == null)
            {
                _logger.LogWarning($"Patient with ID: {id} not found for patch");
                return NotFound();
            }

            patchDoc.ApplyTo(entity);
            entity.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            
            _logger.LogInformation($"Patched patient with ID: {id}");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Patients
                .FirstOrDefaultAsync(p => p.ID == id);
                
            if (entity == null)
            {
                _logger.LogWarning($"Patient with ID: {id} not found for deletion");
                return NotFound();
            }

            // Soft delete instead of hard delete for better performance and data integrity
            entity.IsActive = 0;
            entity.ModifiedDate = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Soft deleted patient with ID: {id}");
            return NoContent();
        }
    }
}
