using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CodingAssessment.Api.DTOs;
using CodingAssessment.Api.Services;

namespace CodingAssessment.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (success, message, data) = await _authService.RegisterCandidateAsync(dto);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(data);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (success, message, data) = await _authService.LoginAsync(dto);
            if (!success)
            {
                return Unauthorized(new { message });
            }

            return Ok(data);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _authService.GetCurrentUserAsync(User);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var role = User.FindFirstValue(ClaimTypes.Role) ?? user.Role;

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                role = role
            });
        }
    }
}
