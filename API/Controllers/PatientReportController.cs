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
    public class PatientReportController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<PatientReportController> _logger;
        public PatientReportController(ClinicDbContext context, ILogger<PatientReportController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientReport>>> Get(int pageNumber = 1, int pageSize = 10)
        {
            _logger.LogInformation($"Fetching patient reports page {pageNumber} with size {pageSize}");
            var reports = await _context.PatientReports
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return reports;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientReport>> Get(int id)
        {
            _logger.LogInformation($"Fetching patient report with ID: {id}");
            var entity = await _context.PatientReports.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient report with ID: {id} not found");
                return NotFound();
            }
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<PatientReport>> Post(PatientReport report)
        {
            _context.PatientReports.Add(report);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created new patient report with ID: {report.ID}");
            return CreatedAtAction(nameof(Get), new { id = report.ID }, report);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, PatientReport report)
        {
            if (id != report.ID)
            {
                _logger.LogWarning($"Patient report ID mismatch: {id} != {report.ID}");
                return BadRequest();
            }
            _context.Entry(report).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Updated patient report with ID: {id}");
            return NoContent();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, JsonPatchDocument<PatientReport> patchDoc)
        {
            var entity = await _context.PatientReports.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient report with ID: {id} not found for patch");
                return NotFound();
            }
            patchDoc.ApplyTo(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Patched patient report with ID: {id}");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.PatientReports.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient report with ID: {id} not found for deletion");
                return NotFound();
            }
            _context.PatientReports.Remove(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted patient report with ID: {id}");
            return NoContent();
        }

        [HttpGet("download")]
        public async Task<IActionResult> DownloadReport(string filePath)
        {
            if(string.IsNullOrEmpty(filePath) || !System.IO.File.Exists(filePath))
            {
                _logger.LogWarning($"File not found: {filePath}");
                return NotFound();
            }
            return File(System.IO.File.ReadAllBytes(filePath), "application/octet-stream", Path.GetFileName(filePath));

        }
    }
}
