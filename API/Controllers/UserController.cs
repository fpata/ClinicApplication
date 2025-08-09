using ClinicManager.DAL;
using ClinicManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http.HttpResults;

namespace ClinicManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<UserController> _logger;
       
        private const int CACHE_EXPIRY_MINUTES = 10;

        public UserController(ClinicDbContext context, ILogger<UserController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> Get(int pageNumber = 1, int pageSize = 20)
        {
            _logger.LogInformation($"Fetching users page {pageNumber} with size {pageSize}");
            var users = await _context.Users
                .AsNoTracking()
                .Where(u => u.IsActive)
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync()
                .ConfigureAwait(false);

            return users;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(int id)
        {
            _logger.LogInformation($"Fetching user with ID: {id}");
         

            // Use single query with Include to solve N+1 problem
           var entity = await _context.Users
                .AsNoTracking()
                .Where(u => u.ID == id && u.IsActive)
                .Select(u => new User
                {
                    ID = u.ID,
                    FirstName = u.FirstName,
                    MiddleName = u.MiddleName,
                    LastName = u.LastName,
                    UserName = u.UserName,
                    Password = u.Password,
                    UserType = u.UserType,
                    Gender = u.Gender,
                    DOB = u.DOB,
                    Age = u.Age,
                    LastLoginDate = u.LastLoginDate,
                    CreatedDate = u.CreatedDate,
                    ModifiedDate = u.ModifiedDate,
                    CreatedBy = u.CreatedBy,
                    ModifiedBy = u.ModifiedBy,
                    IsActive = u.IsActive,
                    Address = _context.Addresses
                        .Where(a => a.UserID == u.ID && a.IsActive)
                        .FirstOrDefault(),
                    Contact = _context.Contacts
                        .Where(c => c.UserID == u.ID && c.IsActive)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync()
                .ConfigureAwait(false);
            
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<User>> Post(User user)
        {
            using var dbTransaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Set timestamps
                user.CreatedDate = DateTime.UtcNow;
                user.ModifiedDate = DateTime.UtcNow;
                user.IsActive = true;

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Process related entities in batch
                var entitiesToAdd = new List<object>();

                if (user.Address != null)
                {
                    user.Address.ID = 0; // Reset ID to ensure new record is created
                    user.Address.UserID = user.ID;
                    user.Address.CreatedDate = DateTime.UtcNow;
                    user.Address.ModifiedDate = DateTime.UtcNow;
                    user.Address.IsActive = true;
                    entitiesToAdd.Add(user.Address);
                }

                if (user.Contact != null)
                {
                    user.Contact.ID = 0; // Reset ID to ensure new record is created
                    user.Contact.UserID = user.ID;
                    user.Contact.CreatedDate = DateTime.UtcNow;
                    user.Contact.ModifiedDate = DateTime.UtcNow;
                    user.Contact.IsActive = true;
                    entitiesToAdd.Add(user.Contact);
                }

                // Add all related entities in batch
                if (entitiesToAdd.Any())
                {
                    _context.AddRange(entitiesToAdd);
                    await _context.SaveChangesAsync();
                }

                await dbTransaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, "Internal server error while creating user");
            }

            _logger.LogInformation($"Created new user with ID: {user.ID}");
            // Clear cache for all users
           
            user =  Get(user.ID).Result.Value!; // Refresh user to get full details including related entities

            return Created("Get",user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, User user)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            if (id != user.ID)
            {
                _logger.LogWarning($"User ID mismatch: {id} != {user.ID}");
                return BadRequest();
            }


            try
            {
                user.ModifiedDate = DateTime.UtcNow;

                // Update user
                _context.Entry(user).State = EntityState.Modified;

                // Update related entities if they exist
                if (user.Address != null)
                {
                    user.Address.ModifiedDate = DateTime.UtcNow;
                    if (user.Address.ID > 0)
                    {
                        _context.Entry(user.Address).State = EntityState.Modified;
                    }
                    else
                    {
                        user.Address.UserID = user.ID;
                        user.Address.CreatedDate = DateTime.UtcNow;
                        user.Address.IsActive = true;
                        _context.Addresses.Add(user.Address);
                    }
                }

                if (user.Contact != null)
                {
                    user.Contact.ModifiedDate = DateTime.UtcNow;
                    if (user.Contact.ID > 0)
                    {
                        _context.Entry(user.Contact).State = EntityState.Modified;
                    }
                    else
                    {
                        user.Contact.UserID = user.ID;
                        user.Contact.CreatedDate = DateTime.UtcNow;
                        user.Contact.IsActive = true;
                        _context.Contacts.Add(user.Contact);
                    }
                }
              
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                _logger.LogInformation($"Updated user with ID: {id}");
                user = Get(id).Result?.Value;
                return Ok(user);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error updating user with ID: {id}");
                return StatusCode(500, "Internal server error while updating user");
            }

        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, JsonPatchDocument<User> patchDoc)
        {
            var entity = await _context.Users
                .FirstOrDefaultAsync(u => u.ID == id && u.IsActive)
                .ConfigureAwait(false);
                
            if (entity == null)
            {
                _logger.LogWarning($"User with ID: {id} not found for patch");
                return NotFound();
            }

            patchDoc.ApplyTo(entity);
            entity.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
                       
            _logger.LogInformation($"Patched user with ID: {id}");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Users
                .FirstOrDefaultAsync(u => u.ID == id && u.IsActive);
                
            if (entity == null)
            {
                _logger.LogWarning($"User with ID: {id} not found for deletion");
                return NotFound();
            }

            // Soft delete instead of hard delete
            entity.IsActive = false;
            entity.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
                        
            _logger.LogInformation($"Soft deleted user with ID: {id}");
            return NoContent();
        }
    }
}
