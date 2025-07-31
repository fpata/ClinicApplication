using ClinicManager.DAL;
using ClinicManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClinicManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<SearchController> _logger;
        public SearchController(ClinicDbContext context, ILogger<SearchController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Basic search for users by fields using SearchModel
        [HttpPost("user")]
        public async Task<ActionResult<IEnumerable<User>>> SearchUser([FromBody] SearchModel model)
        {
            _logger.LogInformation("Searching users by fields");
            var query = _context.Users.AsQueryable();
            if (!string.IsNullOrEmpty(model.FirstName))
                query = query.Where(u => u.FirstName.Contains(model.FirstName));
            if (!string.IsNullOrEmpty(model.LastName))
                query = query.Where(u => u.LastName.Contains(model.LastName));
            if (!string.IsNullOrEmpty(model.UserName))
                query = query.Where(u => u.UserName.Contains(model.UserName));
            if (!string.IsNullOrEmpty(model.UserType))
                query = query.Where(u => u.UserType.Contains(model.UserType));
            if (!string.IsNullOrEmpty(model.Gender))
                query = query.Where(u => u.Gender != null && u.Gender.Contains(model.Gender));
            return await query.ToListAsync();
        }

        // Advanced search across all models using SearchModel
        [HttpPost("advanced")]
        public async Task<ActionResult> AdvancedSearch([FromBody] SearchModel model)
        {
            _logger.LogInformation("Performing advanced search");
            var users = _context.Users.AsQueryable();
            if (!string.IsNullOrEmpty(model.UserName))
                users = users.Where(u => u.UserName.Contains(model.UserName));
            if (!string.IsNullOrEmpty(model.FirstName))
                users = users.Where(u => u.FirstName.Contains(model.FirstName));
            if (!string.IsNullOrEmpty(model.LastName))
                users = users.Where(u => u.LastName.Contains(model.LastName));

            var addresses = _context.Addresses.AsQueryable();
            if (!string.IsNullOrEmpty(model.Address))
                addresses = addresses.Where(a => (a.PermAddress1 != null && a.PermAddress1.Contains(model.Address)) ||
                                                (a.CorrAddress1 != null && a.CorrAddress1.Contains(model.Address)));

            var contacts = _context.Contacts.AsQueryable();
            if (!string.IsNullOrEmpty(model.Phone))
                contacts = contacts.Where(c => (c.PrimaryPhone != null && c.PrimaryPhone.Contains(model.Phone)) ||
                                               (c.SecondaryPhone != null && c.SecondaryPhone.Contains(model.Phone)));
            if (!string.IsNullOrEmpty(model.Email))
                contacts = contacts.Where(c => (c.PrimaryEmail != null && c.PrimaryEmail.Contains(model.Email)) ||
                                               (c.SecondaryEmail != null && c.SecondaryEmail.Contains(model.Email)));

            var patients = _context.Patients.AsQueryable();
            if (!string.IsNullOrEmpty(model.Allergies))
                patients = patients.Where(p => p.Allergies != null && p.Allergies.Contains(model.Allergies));
            if (!string.IsNullOrEmpty(model.Medications))
                patients = patients.Where(p => p.Medications != null && p.Medications.Contains(model.Medications));

            // Collect results
            var result = new
            {
                Users = await users.ToListAsync(),
                Addresses = await addresses.ToListAsync(),
                Contacts = await contacts.ToListAsync(),
                Patients = await patients.ToListAsync()
            };
            return Ok(result);
        }
    }
}
