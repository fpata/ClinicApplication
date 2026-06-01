using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClinicManager.DAL;
using Castle.Core.Smtp;
using ClinicManager.Models.Enums;

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
            _logger.LogInformation("Login attempt for user: {UserName}", request.UserName);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.UserName);
            if (user == null)
            {
                _logger.LogWarning("Login failed: User not found: {UserName}", request.UserName);
                return Unauthorized("Invalid username or password.");
            }

            if (user.Password != request.Password)
            {
                _logger.LogWarning("Login failed: Incorrect password for user: {UserName}", request.UserName);
                return Unauthorized("Invalid username or password.");
            }

            if (string.IsNullOrWhiteSpace(user.UserName))
            {
                _logger.LogError("User record has null/empty UserName. User ID: {UserId}", user.ID);
                return StatusCode(500, "User record invalid.");
            }

            _logger.LogInformation("Login successful for user: {UserName}", request.UserName);

            var userRole = user?.UserType?.ToString() ?? UserType.Patient.ToString();
            var roleAccess = await _context.RoleAccesses.AsNoTracking().FirstOrDefaultAsync(ra => ra.RoleName == userRole);
            
            bool canAccessPatient = roleAccess?.CanAccessPatient ?? (userRole == "Administrator" || userRole == "Doctor" || userRole == "Nurse" || userRole == "Accountant" || userRole == "Patient");
            bool canAccessDashboard = roleAccess?.CanAccessDashboard ?? (userRole == "Administrator" || userRole == "Doctor" || userRole == "Nurse");
            bool canAccessBilling = roleAccess?.CanAccessBilling ?? (userRole == "Administrator" || userRole == "Doctor" || userRole == "Accountant");
            bool canAccessConfig = roleAccess?.CanAccessConfig ?? (userRole == "Administrator" || userRole == "Doctor");

            var configuration = HttpContext.RequestServices.GetService<IConfiguration>();
            var jwtKey = configuration?["Jwt:Key"] ?? "ClinicManagerJwtTokenForEncryption";
            var jwtIssuer = configuration?["Jwt:Issuer"] ?? "ClinicManagerIssuer";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user!.UserName!), // userName validated above
                new Claim("userid", user.ID.ToString()),
                new Claim("usertype", userRole),
                new Claim(ClaimTypes.Role, userRole),
                new Claim("canAccessPatient", canAccessPatient.ToString().ToLower()),
                new Claim("canAccessDashboard", canAccessDashboard.ToString().ToLower()),
                new Claim("canAccessBilling", canAccessBilling.ToString().ToLower()),
                new Claim("canAccessConfig", canAccessConfig.ToString().ToLower()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                user = new
                {
                    ID=user?.ID,
                    UserName=user?.UserName,
                    UserType=user?.UserType,
                    FirstName=user?.FirstName,
                    LastName=user?.LastName,
                    Gender=user?.Gender,
                    Age=user?.Age,
                    LastLoginDate=user?.LastLoginDate
                },
                allowedAccess = new
                {
                    canAccessPatient = canAccessPatient,
                    canAccessDashboard = canAccessDashboard,
                    canAccessBilling = canAccessBilling,
                    canAccessConfig = canAccessConfig
                }
            });
        }

        [HttpGet]
        [Route("forgotpassword")]
        public string  forgotpassword(string sendTo,bool isMobile=false )
        {

            if(isMobile)
            {
                return "OTP sent to mobile number "+sendTo;
            }
            else
            {
               
                return "Reset link sent to email "+sendTo;
            }
        }
    }
}
