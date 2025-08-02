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
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created new patient with ID: {patient.ID}");
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
