using ClinicManager.DAL;
using ClinicManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace ClinicManager.Controllers
{
    internal class PatientVitalsController: ControllerBase
    {
        private ClinicDbContext _context;
        private ILogger<PatientController> _logger;

        public PatientVitalsController(ClinicDbContext context, ILogger<PatientController> logger)
        {
            this._context = context;
            this._logger = logger;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientVitals>>> Get(int pageNumber = 1, int pageSize = 10)
        {
            _logger.LogInformation($"Fetching addresses page {pageNumber} with size {pageSize}");
            var vitals = await _context.PatientVitals
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return vitals;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientVitals>> Get(int id)
        {
            _logger.LogInformation($"Fetching address with ID: {id}");
            var entity = await _context.PatientVitals.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Address with ID: {id} not found");
                return NotFound();
            }
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<PatientVitals>> Post(PatientVitals vitals)
        {
            _context.PatientVitals.Add(vitals);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created new address with ID: {vitals.ID}");
            return CreatedAtAction(nameof(Get), new { id = vitals.ID }, vitals);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, PatientVitals vitals)
        {
            if (id != vitals.ID)
            {
                _logger.LogWarning($"Address ID mismatch: {id} != {vitals.ID}");
                return BadRequest();
            }
            _context.Entry(vitals).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Updated address with ID: {id}");
            return NoContent();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, JsonPatchDocument<PatientVitals> patchDoc)
        {
            var entity = await _context.PatientVitals.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Address with ID: {id} not found for patch");
                return NotFound();
            }
            patchDoc.ApplyTo(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Patched address with ID: {id}");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.PatientVitals.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Address with ID: {id} not found for deletion");
                return NotFound();
            }
            _context.PatientVitals.Remove(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted address with ID: {id}");
            return NoContent();
        }
    }
}