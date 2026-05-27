using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _service;
    private readonly IAuthService _authService;

    public AttendanceController(IAttendanceService service, IAuthService authService)
    {
        _service = service;
        _authService = authService;
    }

    [HttpPost("checkin")]
    public async Task<IActionResult> CheckIn([FromBody] AttendanceCheckInDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        dto.EmpId ??= await ResolveCurrentEmployeeIdAsync();
        if (dto.EmpId == null || dto.EmpId <= 0)
            return Unauthorized(new { error = "Unable to resolve employee profile." });

        var result = await _service.CheckInAsync(dto);
        return Ok(result);
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> CheckOut([FromBody] AttendanceCheckOutDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        dto.EmpId ??= await ResolveCurrentEmployeeIdAsync();
        if (dto.EmpId == null || dto.EmpId <= 0)
            return Unauthorized(new { error = "Unable to resolve employee profile." });

        try
        {
            var result = await _service.CheckOutAsync(dto);
            return result == null ? BadRequest(new { error = "No open check-in found for today." }) : Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("monthly/{empId}")]
    public async Task<IActionResult> GetMonthly(int empId, [FromQuery] int month, [FromQuery] int year)
        => Ok(await _service.GetMonthlyAsync(empId, month, year));

    [HttpGet("mine/monthly")]
    public async Task<IActionResult> GetMyMonthly([FromQuery] int month, [FromQuery] int year)
    {
        var empId = await ResolveCurrentEmployeeIdAsync();
        if (empId == null || empId <= 0)
            return Unauthorized(new { error = "Unable to resolve employee profile." });

        return Ok(await _service.GetMonthlyAsync(empId.Value, month, year));
    }

    private async Task<int?> ResolveCurrentEmployeeIdAsync()
    {
        var claimEmployeeId = User.FindFirstValue("employeeId");
        if (int.TryParse(claimEmployeeId, out var parsedEmployeeId) && parsedEmployeeId > 0)
            return parsedEmployeeId;

        var username = User.FindFirstValue(ClaimTypes.Name) ?? User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return null;

        return await _authService.ResolveEmployeeIdAsync(username);
    }
}