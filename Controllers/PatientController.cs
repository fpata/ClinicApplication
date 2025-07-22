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
