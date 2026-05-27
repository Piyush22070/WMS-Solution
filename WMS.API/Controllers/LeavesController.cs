using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeavesController : ControllerBase
{
    private readonly ILeaveService _service;
    private readonly IAuthService _authService;

    public LeavesController(ILeaveService service, IAuthService authService)
    {
        _service = service;
        _authService = authService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPending() => Ok(await _service.GetPendingAsync());

    [HttpGet("employee/{empId}")]
    public async Task<IActionResult> GetByEmployee(int empId) => Ok(await _service.GetByEmployeeAsync(empId));

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var empId = await ResolveCurrentEmployeeIdAsync();
        if (empId == null) return Unauthorized(new { error = "Unable to resolve employee profile." });

        return Ok(await _service.GetByEmployeeAsync(empId.Value));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Apply([FromBody] LeaveCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        dto.EmpId ??= await ResolveCurrentEmployeeIdAsync();
        if (dto.EmpId == null || dto.EmpId <= 0)
            return Unauthorized(new { error = "Unable to resolve employee profile." });

        var result = await _service.ApplyAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.LeaveId }, result);
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveReject(int id, [FromBody] LeaveApprovalDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _service.ApproveRejectAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var success = await _service.CancelAsync(id);
        return success ? Ok(new { message = "Leave cancelled." }) : NotFound();
    }

    private async Task<int?> ResolveCurrentEmployeeIdAsync()
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return null;

        return await _authService.ResolveEmployeeIdAsync(username);
    }
}