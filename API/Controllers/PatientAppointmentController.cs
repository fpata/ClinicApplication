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
    public class PatientAppointmentController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<PatientAppointmentController> _logger;
        public PatientAppointmentController(ClinicDbContext context, ILogger<PatientAppointmentController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientAppointment>>> Get(int patientID, int pageNumber = 1, int pageSize = 10)
        {
            _logger.LogInformation($"Fetching patient appointments page {pageNumber} with size {pageSize}");
            var appointments = await _context.PatientAppointments
                .Where(a => a.PatientID == patientID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return appointments;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientAppointment>> Get(int id)
        {
            _logger.LogInformation($"Fetching patient appointment with ID: {id}");
            var entity = await _context.PatientAppointments.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient appointment with ID: {id} not found");
                return NotFound();
            }
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<PatientAppointment>> Post(PatientAppointment appointment)
        {
            _context.PatientAppointments.Add(appointment);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created new patient appointment with ID: {appointment.ID}");
            return CreatedAtAction(nameof(Get), new { id = appointment.ID }, appointment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, PatientAppointment appointment)
        {
            if (id != appointment.ID)
            {
                _logger.LogWarning($"Patient appointment ID mismatch: {id} != {appointment.ID}");
                return BadRequest();
            }
            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Updated patient appointment with ID: {id}");
            return NoContent();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, JsonPatchDocument<PatientAppointment> patchDoc)
        {
            var entity = await _context.PatientAppointments.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient appointment with ID: {id} not found for patch");
                return NotFound();
            }
            patchDoc.ApplyTo(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Patched patient appointment with ID: {id}");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.PatientAppointments.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"Patient appointment with ID: {id} not found for deletion");
                return NotFound();
            }
            _context.PatientAppointments.Remove(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted patient appointment with ID: {id}");
            return NoContent();
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetByDoctor(int doctorID)
        {
            _logger.LogInformation($"Get all appointments for Doctor ID: {doctorID}");
            var appointments = await _context.PatientAppointments
                .Where(a => a.DoctorID == doctorID)
                .ToListAsync();
            if (appointments.Count == 0)
            {
                _logger.LogInformation($"No appointments found for doctor ID: {doctorID}");
                return NotFound();
            }
            return Ok(appointments);
        }
        [HttpGet("patient/{patientID}")]
        public async Task<IActionResult> GetByPatient(int patientID)
        {
            _logger.LogInformation($"Get all appointments for Doctor ID: {patientID}");
            var appointments = await _context.PatientAppointments
                .Where(a => a.PatientID == patientID)
                .ToListAsync();
            if (appointments.Count == 0)
            {
                _logger.LogInformation($"No appointments found for patient ID: {patientID}");
                return NotFound();
            }
            return Ok(appointments);
        }
    }


}
