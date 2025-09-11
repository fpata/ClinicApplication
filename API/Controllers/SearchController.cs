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
        private const int CACHE_EXPIRY_MINUTES = 5;

        public SearchController(ClinicDbContext context, ILogger<SearchController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // PSEUDOCODE:
        // 1. Build base query joining users with optional patient, address, contact.
        // 2. Ensure active status filters.
        // 3. Apply conditional filters only when corresponding SearchModel properties have values.
        //    - For UserName filter, avoid CS8602 by adding null check (user.UserName != null && ...)
        // 4. Group results to consolidate duplicates and project to SearchModel.
        // 5. Execute with AsNoTracking and Take(100).
        // 6. Handle exceptions with logging.
        [HttpPost("user")]
        public async Task<ActionResult<IEnumerable<SearchModel>>> SearchUser([FromBody] SearchModel model)
        {
            _logger.LogInformation("Searching users by fields");
            try
            {
                var query = from user in _context.Users
                            join patient in _context.Patients on user.ID equals patient.UserID into patientGroup
                            from patient in patientGroup.DefaultIfEmpty()
                            join address in _context.Addresses on user.ID equals address.UserID into addressGroup
                            from address in addressGroup.DefaultIfEmpty()
                            join contact in _context.Contacts on user.ID equals contact.UserID into contactGroup
                            from contact in contactGroup.DefaultIfEmpty()
                            where user.IsActive == 1 &&
                                  (address == null || address.IsActive == 1) &&
                                  (contact == null || contact.IsActive == 1)
                            select new { user, patient, address, contact };

                if (!string.IsNullOrWhiteSpace(model.FirstName))
                    query = query.Where(x => x.user.FirstName != null && x.user.FirstName.Contains(model.FirstName));

                if (!string.IsNullOrWhiteSpace(model.LastName))
                    query = query.Where(x => x.user.LastName != null && x.user.LastName.Contains(model.LastName));

                if (!string.IsNullOrWhiteSpace(model.PrimaryEmail))
                    query = query.Where(x => x.contact != null && x.contact.PrimaryEmail != null && x.contact.PrimaryEmail.Contains(model.PrimaryEmail));

                if (!string.IsNullOrWhiteSpace(model.PrimaryPhone))
                    query = query.Where(x => x.contact != null && x.contact.PrimaryPhone != null && x.contact.PrimaryPhone.Contains(model.PrimaryPhone));

                if (!string.IsNullOrWhiteSpace(model.PermCity))
                    query = query.Where(x => x.address != null && x.address.PermCity != null && x.address.PermCity.Contains(model.PermCity));

                if (!string.IsNullOrWhiteSpace(model.UserName))
                    // FIX: Added null check to avoid CS8602 (possible null dereference)
                    query = query.Where(x => x.user.UserName != null && x.user.UserName.Contains(model.UserName));

                if (model.UserType.HasValue && model.UserType.Value > 0)
                    query = query.Where(x => x.user.UserType == model.UserType);

                if (model.StartDate.HasValue && model.StartDate.Value < DateTime.Now.Date.AddDays(-10))
                    query = query.Where(x => x.user.CreatedDate >= model.StartDate.Value);

                if (model.PatientID.HasValue && model.PatientID.Value > 0)
                    query = query.Where(x => x.patient != null && x.patient.ID == model.PatientID.Value);

                var groupedQuery = query
                    .GroupBy(x => new
                    {
                        x.user.ID,
                        x.user.FirstName,
                        x.user.LastName,
                        x.user.UserName,
                        x.user.UserType,
                        x.user.CreatedDate,
                        x.user.ModifiedDate,
                        PermCity = x.address != null ? x.address.PermCity : null,
                        PrimaryEmail = x.contact != null ? x.contact.PrimaryEmail : null,
                        PrimaryPhone = x.contact != null ? x.contact.PrimaryPhone : null
                    })
                    .Select(g => new SearchModel
                    {
                        UserID = g.Key.ID,
                        FirstName = g.Key.FirstName,
                        LastName = g.Key.LastName,
                        UserName = g.Key.UserName,
                        UserType = g.Key.UserType,
                        PatientID = g.Max(x => x.patient != null ? (int?)x.patient.ID : null),
                        PermCity = g.Key.PermCity,
                        PrimaryEmail = g.Key.PrimaryEmail,
                        PrimaryPhone = g.Key.PrimaryPhone,
                        DoctorID = 0,
                        DoctorName = string.Empty,
                        StartDate = g.Key.CreatedDate,
                        EndDate = g.Key.ModifiedDate
                    }).Distinct();

                var results = await groupedQuery
                    .AsNoTracking()
                    .Take(100)
                    .ToListAsync()
                    .ConfigureAwait(false);

                _logger.LogInformation($"Found {results.Count} users matching search criteria");
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing user search");
                return StatusCode(500, "An error occurred while searching users");
            }
        }

        // PSEUDOCODE:
        // 1. Start from Users AsNoTracking.
        // 2. Apply filters when model properties have values.
        // 3. For UserName filter add null check to prevent CS8602.
        // 4. Ensure active users only.
        // 5. Project to SearchModel, order, limit, execute.
        // 6. Handle exceptions with logging.
        [HttpPost("advanced")]
        public async Task<ActionResult<IEnumerable<SearchModel>>> AdvancedSearch([FromBody] SearchModel model)
        {
            _logger.LogInformation("Performing advanced search");

            try
            {
                var query = _context.Users.AsNoTracking();

                if (!string.IsNullOrEmpty(model.UserName))
                    // FIX: Added null check to avoid CS8602
                    query = query.Where(u => u.UserName != null && u.UserName.Contains(model.UserName));

                if (!string.IsNullOrEmpty(model.FirstName))
                    query = query.Where(u => u.FirstName != null && u.FirstName.Contains(model.FirstName));

                if (!string.IsNullOrEmpty(model.LastName))
                    query = query.Where(u => u.LastName != null && u.LastName.Contains(model.LastName));

                if (model.UserType.HasValue && model.UserType.Value > 0)
                    query = query.Where(u => u.UserType == model.UserType);

                query = query.Where(u => u.IsActive == 1);

                var results = await query
                    .Select(u => new SearchModel
                    {
                        UserID = u.ID,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        UserName = u.UserName,
                        UserType = u.UserType,
                        StartDate = u.CreatedDate,
                        EndDate = u.ModifiedDate
                    })
                    .OrderBy(u => u.FirstName)
                    .ThenBy(u => u.LastName)
                    .Take(100)
                    .ToListAsync()
                    .ConfigureAwait(false);

                _logger.LogInformation($"Advanced search found {results.Count} results");
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing advanced search");
                return StatusCode(500, "An error occurred while performing advanced search");
            }
        }
    }
}
