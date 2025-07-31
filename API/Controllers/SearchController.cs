using ClinicManager.DAL;
using ClinicManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;

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
        public async Task<ActionResult<IEnumerable<SearchModel>>> SearchUser([FromBody] SearchModel model)
        {
            _logger.LogInformation("Searching users by fields");
            string query = "Select user.FirstName as FirstName, user.LastName as LastName, user.ID as UserID," +
                " user.UserName as UserName, user.UserType as UserType, " +
                " MAX(patient.ID) as PatientID, address.PermCity as PermCity, " +
                " contact.PrimaryEmail as PrimaryEmail, contact.PrimaryPhone as PrimaryPhone from User " +
                " Inner join Patient on patient.UserID = user.ID " +
                " Inner join Address on address.UserID = user.ID " +
                " Inner Join Contact on contact.UserID = user.ID " +
                " Where user.IsActive=1 And Address.IsActive=1 and contact.IsActive=1 ";
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
            query = query + " group by user.FirstName, user.LastName,UserID, PermCity, PrimaryEmail, PrimaryPhone";
            Console.WriteLine(query);

            var results = await _context.Database.SqlQueryRaw<SearchModel>(query).ToListAsync();

            return Ok(results);
        }

        //// Advanced search across all models using SearchModel
        //[HttpPost("advanced")]
        //public async Task<ActionResult> AdvancedSearch([FromBody] SearchModel model)
        //{
        //    _logger.LogInformation("Performing advanced search");
        //    var users = _context.Users.AsQueryable();
        //    if (!string.IsNullOrEmpty(model.UserName))
        //        users = users.Where(u => u.UserName.Contains(model.UserName));
        //    if (!string.IsNullOrEmpty(model.FirstName))
        //        users = users.Where(u => u.FirstName.Contains(model.FirstName));
        //    if (!string.IsNullOrEmpty(model.LastName))
        //        users = users.Where(u => u.LastName.Contains(model.LastName));



        //    // Collect results
        //    var result =        
        //        Users = await users.ToListAsync();
        
        //    return Ok(result);
        //}
    }
}
