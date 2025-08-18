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
    public class BillingController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<BillingController> _logger;
        public BillingController(ClinicDbContext context, ILogger<BillingController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BillingRecord>>> Get(int pageNumber = 1, int pageSize = 10)
        {
            _logger.LogInformation($"Fetching billing records page {pageNumber} with size {pageSize}");
            var records = await _context.BillingRecords
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return records;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BillingRecord>> Get(int id)
        {
            _logger.LogInformation($"Fetching billing record with ID: {id}");
            var entity = await _context.BillingRecords.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Billing record with ID: {id} not found");
                return NotFound();
            }
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<BillingRecord>> Post(BillingRecord billingRecord)
        {
            _context.BillingRecords.Add(billingRecord);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created new billing record with ID: {billingRecord.ID}");
            return CreatedAtAction(nameof(Get), new { id = billingRecord.ID }, billingRecord);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, BillingRecord billingRecord)
        {
            if (id != billingRecord.ID)
            {
                _logger.LogWarning($"Billing record ID mismatch: {id} != {billingRecord.ID}");
                return BadRequest();
            }
            _context.Entry(billingRecord).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Updated billing record with ID: {id}");
            return NoContent();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, JsonPatchDocument<BillingRecord> patchDoc)
        {
            var entity = await _context.BillingRecords.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Billing record with ID: {id} not found for patch");
                return NotFound();
            }
            patchDoc.ApplyTo(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Patched billing record with ID: {id}");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.BillingRecords.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Billing record with ID: {id} not found for delete");
                return NotFound();
            }
            _context.BillingRecords.Remove(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted billing record with ID: {id}");
            return NoContent();
        }
    }
}
