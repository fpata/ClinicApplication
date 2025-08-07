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
            _logger.LogInformation($"Created new patient treatment with ID: {treatment.ID}");
            return CreatedAtAction(nameof(Get), new { id = treatment.ID }, treatment);
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
