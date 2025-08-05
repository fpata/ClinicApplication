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

        [HttpPost("doctor/search")]
        public async Task<IActionResult> SearchAppointments([FromBody] SearchModel model)
        {
            _logger.LogInformation($"Searching appointments with criteria: {model}");

            string query = "Select patientappointment.* from patientappointment  " +
                " Inner join User on patientappointment.UserID = user.ID " +
                " Inner join Address on address.UserID = user.ID " +
                " Inner Join Contact on contact.UserID = user.ID " +
                " Where user.IsActive=1 And address.IsActive=1 and contact.IsActive=1 ";
            if (!string.IsNullOrWhiteSpace(model.FirstName))
                query = query + " And user.FirstName like '%" + model.FirstName + "%' ";
            if (!string.IsNullOrWhiteSpace(model.LastName))
                query = query + " And user.LastName like '%" + model.LastName + "%' ";
            if (!string.IsNullOrWhiteSpace(model.PrimaryEmail))
                query = query + " And contact.PrimaryEmail like '%" + model.PrimaryEmail + "%' ";
            if (!string.IsNullOrWhiteSpace(model.PrimaryPhone))
                query = query + " And contact.PrimaryPhone like '%" + model.PrimaryPhone + "%' ";
            if (!string.IsNullOrWhiteSpace(model.PermCity))
                query = query + " And address.PermCity like '%" + model.PermCity + "%' ";
            if(model.DoctorID > 0)  
                query = query + " And patientappointment.DoctorID = " + model.DoctorID + " ";
            if (model.PatientID > 0)
                query = query + " And patientappointment.PatientID = " + model.PatientID + " ";
            if (!string.IsNullOrWhiteSpace(model.DoctorName))
                query = query + " And patientappointment.DoctorName like '%" + model.DoctorName + "%' ";

                query = query + " And patientappointment.StartApptDate >= '" + model.StartDate?.ToString("yyyy-MM-dd") ;
            

                query = query + "' order by patientappointment.StartApptDate desc";

            Console.WriteLine(query);

            var results = await _context.Database.SqlQueryRaw<PatientAppointment>(query).ToListAsync();

            return Ok(results);
          
        }
    }


}
