using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CodingAssessment.Api.DTOs;
using CodingAssessment.Api.Models;
using CodingAssessment.Api.Services;

namespace CodingAssessment.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssessmentsController : ControllerBase
    {
        private readonly IAssessmentService _assessmentService;

        public AssessmentsController(IAssessmentService assessmentService)
        {
            _assessmentService = assessmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var isUserAdmin = User.IsInRole(AppRoles.Administrator);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

            if (isUserAdmin)
            {
                var adminList = await _assessmentService.GetAllForAdminAsync();
                return Ok(adminList);
            }
            else
            {
                var candidateList = await _assessmentService.GetAvailableForCandidateAsync(userId);
                return Ok(candidateList);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var isUserAdmin = User.IsInRole(AppRoles.Administrator);

            if (isUserAdmin)
            {
                var adminData = await _assessmentService.GetByIdForAdminAsync(id);
                if (adminData == null) return NotFound(new { message = "Assessment not found." });
                return Ok(adminData);
            }
            else
            {
                var candidateData = await _assessmentService.GetByIdForCandidateAsync(id);
                if (candidateData == null) return NotFound(new { message = "Assessment not found or not published." });
                return Ok(candidateData);
            }
        }

        [HttpPost]
        [Authorize(Roles = AppRoles.Administrator)]
        public async Task<IActionResult> Create([FromBody] CreateAssessmentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(adminUserId))
            {
                return Unauthorized();
            }

            var (success, message, id) = await _assessmentService.CreateAssessmentAsync(dto, adminUserId);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return CreatedAtAction(nameof(GetById), new { id }, new { id, message });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = AppRoles.Administrator)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAssessmentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (success, message) = await _assessmentService.UpdateAssessmentAsync(id, dto);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = AppRoles.Administrator)]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, message) = await _assessmentService.DeleteAssessmentAsync(id);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }
    }
}
