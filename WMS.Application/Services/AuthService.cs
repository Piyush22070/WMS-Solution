using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserLoginRepository _repo;
    private readonly IEmployeeRepository _employeeRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly IConfiguration _config;

    public AuthService(IUserLoginRepository repo, IEmployeeRepository employeeRepo, IRoleRepository roleRepo, IConfiguration config)
    {
        _repo = repo;
        _employeeRepo = employeeRepo;
        _roleRepo = roleRepo;
        _config = config;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _repo.GetByUsernameAsync(dto.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        if (!user.EmployeeId.HasValue)
        {
            var resolvedEmployeeId = await ResolveEmployeeIdAsync(dto.Username);
            if (resolvedEmployeeId.HasValue)
            {
                user.EmployeeId = resolvedEmployeeId;
                await _repo.UpdateEmployeeIdAsync(user.UserId, resolvedEmployeeId.Value);
            }
        }

        await _repo.UpdateLastLoginAsync(user.UserId);
        var token = GenerateToken(user);
        return new AuthResponseDto
        {
            Token = token.Token,
            Username = user.Username,
            Role = user.Role?.RoleName ?? "Employee",
            EmployeeId = user.EmployeeId,
            Expiry = token.Expiry
        };
    }

    public async Task<RegisterUserResult> RegisterAsync(RegisterDto dto)
    {
        var existing = await _repo.GetByUsernameAsync(dto.Username);
        if (existing != null) return RegisterUserResult.UsernameExists;

        if (!dto.RoleId.HasValue)
            return RegisterUserResult.RoleNotFound;

        var role = await _roleRepo.GetByIdAsync(dto.RoleId.Value);
        if (role == null) return RegisterUserResult.RoleNotFound;

        await _repo.AddAsync(new UserLogin
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            EmployeeId = dto.EmployeeId,
            RoleId = role.RoleId
        });
        return RegisterUserResult.Success;
    }

    public async Task<int?> ResolveEmployeeIdAsync(string username)
    {
        var login = await _repo.GetByUsernameAsync(username);
        if (login?.EmployeeId.HasValue == true)
            return login.EmployeeId;

        var normalizedUsername = Normalize(username);
        var employees = await _employeeRepo.GetAllAsync();

        var match = employees.FirstOrDefault(employee =>
            Normalize(employee.Email) == normalizedUsername ||
            Normalize(employee.FirstName) == normalizedUsername ||
            Normalize(employee.LastName) == normalizedUsername ||
            Normalize($"{employee.FirstName} {employee.LastName}") == normalizedUsername ||
            Normalize($"{employee.FirstName}.{employee.LastName}") == normalizedUsername);

        if (match != null)
            return match.EmployeeId;

        var fallbackEmployees = employees
            .Where(employee =>
                employee.UserLogin == null &&
                employee.Role?.RoleName == "Employee" &&
                string.Equals(employee.Status, "Active", StringComparison.OrdinalIgnoreCase))
            .ToList();

        return fallbackEmployees.Count == 1 ? fallbackEmployees[0].EmployeeId : null;
    }

    private static string Normalize(string? value)
        => (value ?? string.Empty).Trim().ToLowerInvariant();

    private (string Token, DateTime Expiry) GenerateToken(UserLogin user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddHours(8);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim("employeeId", user.EmployeeId?.ToString() ?? string.Empty),
            new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "Employee")
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiry);
    }
}