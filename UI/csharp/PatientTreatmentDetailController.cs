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
    public class PatientTreatmentDetailController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<PatientTreatmentDetailController> _logger;
        public PatientTreatmentDetailController(ClinicDbContext context, ILogger<PatientTreatmentDetailController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientTreatmentDetail>>> Get(int pageNumber = 1, int pageSize = 10)
        {
            _logger.LogInformation($"Fetching patient treatment details page {pageNumber} with size {pageSize}");
            var details = await _context.PatientTreatmentDetails
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return details;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientTreatmentDetail>> Get(int id)
        {
            _logger.LogInformation($"Fetching patient treatment detail with ID: {id}");
            var entity = await _context.PatientTreatmentDetails.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient treatment detail with ID: {id} not found");
                return NotFound();
            }
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<PatientTreatmentDetail>> Post(PatientTreatmentDetail detail)
        {
            _context.PatientTreatmentDetails.Add(detail);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created new patient treatment detail with ID: {detail.ID}");
            return CreatedAtAction(nameof(Get), new { id = detail.ID }, detail);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, PatientTreatmentDetail detail)
        {
            if (id != detail.ID)
            {
                _logger.LogWarning($"Patient treatment detail ID mismatch: {id} != {detail.ID}");
                return BadRequest();
            }
            _context.Entry(detail).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Updated patient treatment detail with ID: {id}");
            return NoContent();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, JsonPatchDocument<PatientTreatmentDetail> patchDoc)
        {
            var entity = await _context.PatientTreatmentDetails.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient treatment detail with ID: {id} not found for patch");
                return NotFound();
            }
            patchDoc.ApplyTo(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Patched patient treatment detail with ID: {id}");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.PatientTreatmentDetails.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient treatment detail with ID: {id} not found for deletion");
                return NotFound();
            }
            _context.PatientTreatmentDetails.Remove(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted patient treatment detail with ID: {id}");
            return NoContent();
        }
    }
}
