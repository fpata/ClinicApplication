using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClinicManager.DAL;

namespace ClinicManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<LoginController> _logger;
        public LoginController(ClinicDbContext context, ILogger<LoginController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public class LoginRequest
        {
            public string UserName { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            _logger.LogInformation($"Login attempt for user: {request.UserName}");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.UserName);
            if (user == null)
            {
                _logger.LogWarning($"Login failed: User not found: {request.UserName}");
                return Unauthorized("Invalid username or password.");
            }
            if (user.Password != request.Password)
            {
                _logger.LogWarning($"Login failed: Incorrect password for user: {request.UserName}");
                return Unauthorized("Invalid username or password.");
            }
            _logger.LogInformation($"Login successful for user: {request.UserName}");

            // Generate JWT token
            var jwtKey = HttpContext.RequestServices.GetService<IConfiguration>()?["Jwt:Key"] ?? "ClinicManagerJwtTokenForEncryption";
            var jwtIssuer = HttpContext.RequestServices.GetService<IConfiguration>()?["Jwt:Issuer"] ?? "ClinicManagerIssuer";
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim("userid", user.ID.ToString()),
                new Claim("usertype", user.UserType),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: null,
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new {
                token = tokenString,
                user = new {
                    user.ID,
                    user.UserName,
                    user.UserType,
                    user.FirstName,
                    user.LastName,
                    user.Gender,
                    user.DOB,
                    user.LastLoginDate
                }
            });
        }
    }
}
