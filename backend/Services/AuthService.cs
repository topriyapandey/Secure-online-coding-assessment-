using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using CodingAssessment.Api.DTOs;
using CodingAssessment.Api.Helpers;
using CodingAssessment.Api.Models;

namespace CodingAssessment.Api.Services
{
    public interface IAuthService
    {
        Task<(bool Success, string Message, AuthResponseDto? Data)> RegisterCandidateAsync(RegisterRequestDto dto);
        Task<(bool Success, string Message, AuthResponseDto? Data)> LoginAsync(LoginRequestDto dto);
        Task<ApplicationUser?> GetCurrentUserAsync(ClaimsPrincipal principal);
    }

    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtSettings _jwtSettings;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            IOptions<JwtSettings> jwtOptions)
        {
            _userManager = userManager;
            _jwtSettings = jwtOptions.Value;
        }

        public async Task<(bool Success, string Message, AuthResponseDto? Data)> RegisterCandidateAsync(RegisterRequestDto dto)
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return (false, "A user with this email address already exists.", null);
            }

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName.Trim(),
                Role = AppRoles.Candidate,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return (false, errors, null);
            }

            await _userManager.AddToRoleAsync(user, AppRoles.Candidate);

            var token = GenerateJwtToken(user, AppRoles.Candidate, out var expiresAt);

            var authResponse = new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                FullName = user.FullName,
                Role = AppRoles.Candidate,
                ExpiresAt = expiresAt
            };

            return (true, "Registration successful.", authResponse);
        }

        public async Task<(bool Success, string Message, AuthResponseDto? Data)> LoginAsync(LoginRequestDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return (false, "Invalid email or password.", null);
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!isPasswordValid)
            {
                return (false, "Invalid email or password.", null);
            }

            var roles = await _userManager.GetRolesAsync(user);
            var primaryRole = roles.FirstOrDefault() ?? user.Role ?? AppRoles.Candidate;

            var token = GenerateJwtToken(user, primaryRole, out var expiresAt);

            var authResponse = new AuthResponseDto
            {
                Token = token,
                Email = user.Email!,
                FullName = user.FullName,
                Role = primaryRole,
                ExpiresAt = expiresAt
            };

            return (true, "Login successful.", authResponse);
        }

        public async Task<ApplicationUser?> GetCurrentUserAsync(ClaimsPrincipal principal)
        {
            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return null;
            }

            return await _userManager.FindByIdAsync(userId);
        }

        private string GenerateJwtToken(ApplicationUser user, string role, out DateTime expiresAt)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);
            expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, role)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expiresAt,
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
