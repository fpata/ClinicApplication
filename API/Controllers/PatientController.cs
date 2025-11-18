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
                .Include(p => p.PatientVitals)
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
                                      PatientVitals = _context.PatientVitals
                                            .Where(pv => pv.PatientID == id)
                                            .ToList(),
                                      PatientTreatmentDetails = _context.PatientTreatmentDetails
                                          .Where(ptd => ptd.PatientID == id)
                                          .ToList()
                                  })
                                 .AsNoTracking()
                                 .AsSplitQuery() // Use AsSplitQuery to optimize loading related entities
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
            patient.PatientVitals = userData.PatientVitals;
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
                patient.ID = 0; // Ensure new patient
                patient.CreatedDate = DateTime.Now;
                patient.ModifiedDate = DateTime.Now;
                patient.CreatedBy = patient.CreatedBy = 1; // Default to 1 if not set
                patient.ModifiedBy = patient.ModifiedBy ?? 1; // Default to 1 if not set
                patient.IsActive = 1;

                // Reset IDs and set properties for all related entities to ensure they are treated as new.
                if (patient.PatientReports?.Any() == true)
                {
                    foreach (var report in patient.PatientReports)
                    {
                        report.ID = 0;
                        report.UserID = patient.UserID;
                        report.CreatedDate = DateTime.Now;
                        report.ModifiedDate = DateTime.Now;
                        report.CreatedBy = report.CreatedBy ?? 1; // Default to 1 if not set
                        report.ModifiedBy = report.ModifiedBy ?? 1; // Default to 1 if not set
                        report.PatientID = null; // Clear foreign key - EF will set it
                        report.IsActive = 1;
                    }
                }

                if (patient.PatientAppointments?.Any() == true)
                {
                    foreach (var appointment in patient.PatientAppointments)
                    {
                        appointment.ID = 0;
                        appointment.UserID = patient.UserID;
                        appointment.CreatedDate = DateTime.Now;
                        appointment.ModifiedDate = DateTime.Now;
                        appointment.CreatedBy = appointment.CreatedBy ?? 1; // Default to 1 if not set
                        appointment.ModifiedBy = appointment.ModifiedBy ?? 1; // Default to 1 if not set
                        appointment.PatientID = null; // Clear foreign key - EF will set it
                        appointment.IsActive = 1;
                    }
                }
                if(patient.PatientVitals?.Any() == true)
                {
                    foreach (var vital in patient.PatientVitals)
                    {
                        vital.ID = 0;
                        vital.UserID = patient.UserID;
                        vital.CreatedDate = DateTime.Now;
                        vital.ModifiedDate = DateTime.Now;
                        vital.CreatedBy = vital.CreatedBy ?? 1; // Default to 1 if not set
                        vital.ModifiedBy = vital.ModifiedBy ?? 1; // Default to 1 if not set
                        vital.PatientID = null; // Clear foreign key - EF will set it
                        vital.IsActive = 1;
                    }
                }

                if (!(patient.PatientTreatment == null || String.IsNullOrWhiteSpace(patient.PatientTreatment.ChiefComplaint)))
                {
                    patient.PatientTreatment.ID = 0;
                    patient.PatientTreatment.UserID = patient.UserID;
                    patient.PatientTreatment.CreatedDate = DateTime.Now;
                    patient.PatientTreatment.ModifiedDate = DateTime.Now;
                    patient.PatientTreatment.CreatedBy = patient.PatientTreatment.CreatedBy ?? 1; // Default to 1 if not set
                    patient.PatientTreatment.ModifiedBy = patient.PatientTreatment.ModifiedBy ?? 1; // Default to 1 if not set
                    patient.PatientTreatment.PatientID = null; // Clear foreign key - EF will set it
                    patient.PatientTreatment.IsActive = 1;

                    if (patient.PatientTreatment.PatientTreatmentDetails?.Any() == true)
                    {
                        foreach (var detail in patient.PatientTreatment.PatientTreatmentDetails)
                        {
                            detail.ID = 0;
                            detail.UserID = patient.UserID;
                            detail.CreatedDate = DateTime.Now;
                            detail.ModifiedDate = DateTime.Now;
                            detail.CreatedBy = detail.CreatedBy ?? 1; // Default to 1 if not set
                            detail.ModifiedBy = detail.ModifiedBy ?? 1; // Default to 1 if not set
                            detail.PatientID = null; // Clear direct patient reference
                            detail.PatientTreatmentID = null; // Clear treatment reference - EF will set it
                            detail.IsActive = 1;
                        }
                    }
                }
                else
                {
                    patient.PatientTreatment = null;
                }

                    // Add only the top-level patient object to the context.
                    // EF Core will automatically detect and add all related child entities.
                    _context.Patients.Add(patient);

                // Save all changes in a single transaction.
                await _context.SaveChangesAsync();

                await dbContextTransaction.CommitAsync();
                _logger.LogInformation($"Created new patient with ID: {patient.ID}");
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

            using var dbContextTransaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Fetch existing tracked entities
                var existingPatient = await _context.Patients
                    .Include(p => p.PatientAppointments)
                    .Include(p => p.PatientReports)
                    .Include(p => p.PatientVitals)
                    .Include(p => p.PatientTreatment)
                        .ThenInclude(pt => pt!.PatientTreatmentDetails)
                    .FirstOrDefaultAsync(p => p.ID == id);

                if (existingPatient == null)
                {
                    _logger.LogWarning($"Patient with ID: {id} not found for update");
                    return NotFound();
                }

                // Update patient scalar properties
                existingPatient.UserID = patient.UserID;
                existingPatient.Allergies = patient.Allergies;
                existingPatient.Medications = patient.Medications;
                existingPatient.FatherMedicalHistory = patient.FatherMedicalHistory;
                existingPatient.MotherMedicalHistory = patient.MotherMedicalHistory;
                existingPatient.PersonalMedicalHistory = patient.PersonalMedicalHistory;
                existingPatient.InsuranceProvider = patient.InsuranceProvider;
                existingPatient.InsurancePolicyNumber = patient.InsurancePolicyNumber;
                existingPatient.ModifiedDate = DateTime.Now;
                existingPatient.ModifiedBy = patient.ModifiedBy ?? 1;

                // Handle PatientAppointments
                if (patient.PatientAppointments?.Any() == true)
                {
                    var incomingIds = patient.PatientAppointments.Select(pa => pa.ID).ToHashSet();
                    var appointmentsToRemove = existingPatient.PatientAppointments
                        .Where(pa => !incomingIds.Contains(pa.ID))
                        .ToList();

                    foreach (var toRemove in appointmentsToRemove)
                    {
                        _context.PatientAppointments.Remove(toRemove);
                    }

                    foreach (var incomingAppointment in patient.PatientAppointments)
                    {
                        var existingAppointment = existingPatient.PatientAppointments
                            .FirstOrDefault(pa => pa.ID == incomingAppointment.ID);

                        if (existingAppointment != null)
                        {
                            // Update existing tracked entity
                            _context.Entry(existingAppointment).CurrentValues.SetValues(incomingAppointment);
                            existingAppointment.PatientID = id;
                            existingAppointment.UserID = patient.UserID;
                            existingAppointment.ModifiedDate = DateTime.Now;
                            existingAppointment.ModifiedBy = incomingAppointment.ModifiedBy ?? 1;
                        }
                        else
                        {
                            // Add new appointment
                            incomingAppointment.ID = 0;
                            incomingAppointment.PatientID = id;
                            incomingAppointment.UserID = patient.UserID;
                            incomingAppointment.CreatedDate = DateTime.Now;
                            incomingAppointment.ModifiedDate = DateTime.Now;
                            incomingAppointment.CreatedBy = incomingAppointment.CreatedBy ?? 1;
                            incomingAppointment.ModifiedBy = incomingAppointment.ModifiedBy ?? 1;
                            incomingAppointment.IsActive = 1;
                            existingPatient.PatientAppointments?.Add(incomingAppointment);
                        }
                    }
                }
                else if (existingPatient.PatientAppointments?.Any() == true)
                {
                    foreach (var appointment in existingPatient.PatientAppointments.ToList())
                    {
                        _context.PatientAppointments.Remove(appointment);
                    }
                }

                // Handle PatientReports
                if (patient.PatientReports?.Any() == true)
                {
                    var incomingIds = patient.PatientReports.Select(pr => pr.ID).ToHashSet();
                    var reportsToRemove = existingPatient.PatientReports
                        .Where(pr => !incomingIds.Contains(pr.ID))
                        .ToList();

                    foreach (var toRemove in reportsToRemove)
                    {
                        _context.PatientReports.Remove(toRemove);
                    }

                    foreach (var incomingReport in patient.PatientReports)
                    {
                        var existingReport = existingPatient.PatientReports
                            .FirstOrDefault(pr => pr.ID == incomingReport.ID);

                        if (existingReport != null)
                        {
                            _context.Entry(existingReport).CurrentValues.SetValues(incomingReport);
                            existingReport.PatientID = id;
                            existingReport.UserID = patient.UserID;
                            existingReport.ModifiedDate = DateTime.Now;
                            existingReport.ModifiedBy = incomingReport.ModifiedBy ?? 1;
                        }
                        else
                        {
                            incomingReport.ID = 0;
                            incomingReport.PatientID = id;
                            incomingReport.UserID = patient.UserID;
                            incomingReport.CreatedDate = DateTime.Now;
                            incomingReport.ModifiedDate = DateTime.Now;
                            incomingReport.CreatedBy = incomingReport.CreatedBy ?? 1;
                            incomingReport.ModifiedBy = incomingReport.ModifiedBy ?? 1;
                            incomingReport.IsActive = 1;
                            existingPatient.PatientReports?.Add(incomingReport);
                        }
                    }
                }
                else if (existingPatient.PatientReports?.Any() == true)
                {
                    foreach (var report in existingPatient.PatientReports.ToList())
                    {
                        _context.PatientReports.Remove(report);
                    }
                }

                // Handle PatientVitals
                if (patient.PatientVitals?.Any() == true)
                {
                    var incomingIds = patient.PatientVitals.Select(pv => pv.ID).ToHashSet();
                    var vitalsToRemove = existingPatient.PatientVitals
                        .Where(pv => !incomingIds.Contains(pv.ID))
                        .ToList();

                    foreach (var toRemove in vitalsToRemove)
                    {
                        _context.PatientVitals.Remove(toRemove);
                    }

                    foreach (var incomingVital in patient.PatientVitals)
                    {
                        var existingVital = existingPatient.PatientVitals
                            .FirstOrDefault(pv => pv.ID == incomingVital.ID);

                        if (existingVital != null)
                        {
                            _context.Entry(existingVital).CurrentValues.SetValues(incomingVital);
                            existingVital.PatientID = id;
                            existingVital.UserID = patient.UserID;
                            existingVital.ModifiedDate = DateTime.Now;
                            existingVital.ModifiedBy = incomingVital.ModifiedBy ?? 1;
                        }
                        else
                        {
                            incomingVital.ID = 0;
                            incomingVital.PatientID = id;
                            incomingVital.UserID = patient.UserID;
                            incomingVital.CreatedDate = DateTime.Now;
                            incomingVital.ModifiedDate = DateTime.Now;
                            incomingVital.CreatedBy = incomingVital.CreatedBy ?? 1;
                            incomingVital.ModifiedBy = incomingVital.ModifiedBy ?? 1;
                            incomingVital.IsActive = 1;
                            existingPatient.PatientVitals?.Add(incomingVital);
                        }
                    }
                }
                else if (existingPatient.PatientVitals?.Any() == true)
                {
                    foreach (var vital in existingPatient.PatientVitals.ToList())
                    {
                        _context.PatientVitals.Remove(vital);
                    }
                }

                // Handle PatientTreatment
                if (!(patient.PatientTreatment == null || string.IsNullOrWhiteSpace(patient.PatientTreatment?.ChiefComplaint)))
                {
                    var incomingTreatment = patient.PatientTreatment;

                    if (existingPatient.PatientTreatment != null && existingPatient.PatientTreatment.ID == incomingTreatment.ID)
                    {
                        // Update existing treatment
                        _context.Entry(existingPatient.PatientTreatment).CurrentValues.SetValues(incomingTreatment);
                        existingPatient.PatientTreatment.PatientID = id;
                        existingPatient.PatientTreatment.UserID = patient.UserID;
                        existingPatient.PatientTreatment.ModifiedDate = DateTime.Now;
                        existingPatient.PatientTreatment.ModifiedBy = incomingTreatment.ModifiedBy ?? 1;
                        existingPatient.PatientTreatment.IsActive = 1;

                        // Handle treatment details
                        if (incomingTreatment.PatientTreatmentDetails?.Any() == true)
                        {
                            var incomingDetailIds = incomingTreatment.PatientTreatmentDetails.Select(ptd => ptd.ID).ToHashSet();
                            var detailsToRemove = existingPatient.PatientTreatment.PatientTreatmentDetails
                                .Where(ptd => !incomingDetailIds.Contains(ptd.ID))
                                .ToList();

                            foreach (var toRemove in detailsToRemove)
                            {
                                _context.PatientTreatmentDetails.Remove(toRemove);
                            }

                            foreach (var incomingDetail in incomingTreatment.PatientTreatmentDetails)
                            {
                                var existingDetail = existingPatient.PatientTreatment.PatientTreatmentDetails
                                    .FirstOrDefault(ptd => ptd.ID == incomingDetail.ID);

                                if (existingDetail != null)
                                {
                                    _context.Entry(existingDetail).CurrentValues.SetValues(incomingDetail);
                                    existingDetail.PatientTreatmentID = existingPatient.PatientTreatment.ID;
                                    existingDetail.PatientID = id;
                                    existingDetail.UserID = patient.UserID;
                                    existingDetail.ModifiedDate = DateTime.Now;
                                    existingDetail.ModifiedBy = incomingDetail.ModifiedBy ?? 1;
                                }
                                else
                                {
                                    incomingDetail.ID = 0;
                                    incomingDetail.PatientTreatmentID = existingPatient.PatientTreatment.ID;
                                    incomingDetail.PatientID = id;
                                    incomingDetail.UserID = patient.UserID;
                                    incomingDetail.CreatedDate = DateTime.Now;
                                    incomingDetail.ModifiedDate = DateTime.Now;
                                    incomingDetail.CreatedBy = incomingDetail.CreatedBy ?? 1;
                                    incomingDetail.ModifiedBy = incomingDetail.ModifiedBy ?? 1;
                                    incomingDetail.IsActive = 1;
                                    existingPatient.PatientTreatment.PatientTreatmentDetails?.Add(incomingDetail);
                                }
                            }
                        }
                        else
                        {
                            foreach (var detail in existingPatient.PatientTreatment.PatientTreatmentDetails?.ToList() ?? new List<PatientTreatmentDetail>())
                            {
                                _context.PatientTreatmentDetails.Remove(detail);
                            }
                        }
                    }
                    else if (existingPatient.PatientTreatment == null)
                    {
                        // Create new treatment
                        var newTreatment = new PatientTreatment
                        {
                            PatientID = id,
                            UserID = patient.UserID,
                            CreatedDate = DateTime.Now,
                            ModifiedDate = DateTime.Now,
                            CreatedBy = incomingTreatment.CreatedBy ?? 1,
                            ModifiedBy = incomingTreatment.ModifiedBy ?? 1,
                            IsActive = 1
                        };

                        // Copy scalar properties from incoming treatment
                        _context.Entry(newTreatment).CurrentValues.SetValues(incomingTreatment);
                        newTreatment.PatientID = id;
                        newTreatment.UserID = patient.UserID;

                        existingPatient.PatientTreatment = newTreatment;

                        if (incomingTreatment.PatientTreatmentDetails?.Any() == true)
                        {
                            foreach (var incomingDetail in incomingTreatment.PatientTreatmentDetails)
                            {
                                var newDetail = new PatientTreatmentDetail
                                {
                                    PatientTreatmentID = newTreatment.ID,
                                    PatientID = id,
                                    UserID = patient.UserID,
                                    CreatedDate = DateTime.Now,
                                    ModifiedDate = DateTime.Now,
                                    CreatedBy = incomingDetail.CreatedBy ?? 1,
                                    ModifiedBy = incomingDetail.ModifiedBy ?? 1,
                                    IsActive = 1
                                };
                                _context.Entry(newDetail).CurrentValues.SetValues(incomingDetail);
                                newTreatment.PatientTreatmentDetails?.Add(newDetail);
                            }
                        }
                    }
                }
                else if (existingPatient.PatientTreatment != null)
                {
                    // Remove existing treatment and details
                    if (existingPatient.PatientTreatment.PatientTreatmentDetails?.Any() == true)
                    {
                        foreach (var detail in existingPatient.PatientTreatment.PatientTreatmentDetails.ToList())
                        {
                            _context.PatientTreatmentDetails.Remove(detail);
                        }
                    }
                    _context.PatientTreatments.Remove(existingPatient.PatientTreatment);
                    existingPatient.PatientTreatment = null;
                }

                await _context.SaveChangesAsync();
                await dbContextTransaction.CommitAsync();

                _logger.LogInformation($"Updated patient with ID: {id}");

                var refreshed = await Get(id);
                return Ok(refreshed.Value!);
            }
            catch (Exception ex)
            {
                await dbContextTransaction.RollbackAsync();
                _logger.LogError(ex, $"Error updating patient with ID: {id}");
                return StatusCode(500, "Internal server error");
            }
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
            entity.ModifiedDate = DateTime.Now;

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
            entity.ModifiedDate = DateTime.Now;
            
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Soft deleted patient with ID: {id}");
            return NoContent();
        }
    }
}
