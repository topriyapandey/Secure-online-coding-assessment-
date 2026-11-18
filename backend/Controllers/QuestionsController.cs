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
    public class QuestionsController : ControllerBase
    {
        private readonly IQuestionService _questionService;

        public QuestionsController(IQuestionService questionService)
        {
            _questionService = questionService;
        }

        [HttpGet("assessment/{assessmentId}")]
        public async Task<IActionResult> GetByAssessment(int assessmentId)
        {
            var isUserAdmin = User.IsInRole(AppRoles.Administrator);

            if (isUserAdmin)
            {
                var questions = await _questionService.GetQuestionsByAssessmentIdForAdminAsync(assessmentId);
                return Ok(questions);
            }
            else
            {
                var questions = await _questionService.GetQuestionsByAssessmentIdForCandidateAsync(assessmentId);
                return Ok(questions);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var isUserAdmin = User.IsInRole(AppRoles.Administrator);

            if (isUserAdmin)
            {
                var question = await _questionService.GetQuestionByIdForAdminAsync(id);
                if (question == null) return NotFound(new { message = "Question not found." });
                return Ok(question);
            }
            else
            {
                var question = await _questionService.GetQuestionByIdForCandidateAsync(id);
                if (question == null) return NotFound(new { message = "Question not found." });
                return Ok(question);
            }
        }

        [HttpPost]
        [Authorize(Roles = AppRoles.Administrator)]
        public async Task<IActionResult> Create([FromBody] CreateQuestionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (success, message, id) = await _questionService.CreateQuestionAsync(dto);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return CreatedAtAction(nameof(GetById), new { id }, new { id, message });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = AppRoles.Administrator)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateQuestionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (success, message) = await _questionService.UpdateQuestionAsync(id, dto);
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
            var (success, message) = await _questionService.DeleteQuestionAsync(id);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }
    }
}
