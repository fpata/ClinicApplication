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
    public class UserController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<UserController> _logger;
        public UserController(ClinicDbContext context, ILogger<UserController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> Get()
        {
            _logger.LogInformation("Fetching all users");
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(int id)
        {
            _logger.LogInformation($"Fetching user with ID: {id}");
            User entity = await _context.Users.FindAsync(id);

            if (entity == null)
            {
                _logger.LogWarning($"User with ID: {id} not found");
                return NotFound();
            }
            else
            {
                entity.Address = await _context.Addresses.FirstOrDefaultAsync(a => a.UserID == entity.ID);
                entity.Contact = await _context.Contacts.FirstOrDefaultAsync(c => c.UserID == entity.ID);
            }
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<User>> Post(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            if (user.Address != null)
            {
                user.Address.UserID = user.ID;
                _context.Addresses.Add(user.Address);
                await _context.SaveChangesAsync();
            }
            if (user.Contact != null)
            {
                user.Contact.UserID = user.ID;
                _context.Contacts.Add(user.Contact);
                await _context.SaveChangesAsync();
            }
            _logger.LogInformation($"Created new user with ID: {user.ID}");
            return CreatedAtAction(nameof(Get), new { id = user.ID }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, User user)
        {
            if (id != user.ID)
            {
                _logger.LogWarning($"User ID mismatch: {id} != {user.ID}");
                return BadRequest();
            }
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            if(user.Address != null)
            {
                _context.Entry(user.Address).State = EntityState.Modified;
            }
            if(user.Contact != null)
            {
                _context.Entry(user.Contact).State = EntityState.Modified;
            }
            _logger.LogInformation($"Updated user with ID: {id}");
            return NoContent();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, JsonPatchDocument<User> patchDoc)
        {
            var entity = await _context.Users.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"User with ID: {id} not found for patch");
                return NotFound();
            }
            patchDoc.ApplyTo(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Patched user with ID: {id}");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Users.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning($"User with ID: {id} not found for deletion");
                return NotFound();
            }
            _context.Users.Remove(entity);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted user with ID: {id}");
            return NoContent();
        }
    }
}
