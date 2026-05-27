using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;

    public AuthController(IAuthService service) => _service = service;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _service.LoginAsync(dto);
        if (result == null) return Unauthorized(new { error = "Invalid credentials." });
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _service.RegisterAsync(dto);

        if (result == RegisterUserResult.UsernameExists)
            return Conflict(new { error = "Username already exists." });

        if (result == RegisterUserResult.RoleNotFound)
            return BadRequest(new { error = "Invalid roleId." });

        return Ok(new { message = "User registered successfully." });
    }

    [Authorize]
    [HttpGet("me/employee-id")]
    public async Task<IActionResult> GetEmployeeId()
    {
        var employeeId = await ResolveCurrentEmployeeIdAsync();
        if (employeeId == null || employeeId <= 0)
            return Unauthorized(new { error = "Unable to resolve employee profile." });

        return Ok(new { employeeId });
    }

    private async Task<int?> ResolveCurrentEmployeeIdAsync()
    {
        var claimEmployeeId = User.FindFirstValue("employeeId");
        if (int.TryParse(claimEmployeeId, out var parsedEmployeeId) && parsedEmployeeId > 0)
            return parsedEmployeeId;

        var username = User.FindFirstValue(ClaimTypes.Name) ?? User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username))
            return null;

        return await _service.ResolveEmployeeIdAsync(username);
    }
}