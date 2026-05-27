using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories;

public class UserLoginRepository : IUserLoginRepository
{
    private readonly AppDbContext _context;

    public UserLoginRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserLogin?> GetByUsernameAsync(string username)
        => await _context.UserLogins.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == username);

    public async Task<UserLogin> AddAsync(UserLogin user)
    {
        await _context.UserLogins.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateLastLoginAsync(int userId)
    {
        var user = await _context.UserLogins.FindAsync(userId);
        if (user != null)
        {
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateEmployeeIdAsync(int userId, int employeeId)
    {
        var user = await _context.UserLogins.FindAsync(userId);
        if (user != null)
        {
            user.EmployeeId = employeeId;
            await _context.SaveChangesAsync();
        }
    }
}

public class AuditLogRepository : IAuditLogRepository
{
    private readonly AppDbContext _context;

    public AuditLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string entityName, int recordId, string action, int createdBy)
    {
        await _context.AuditLogs.AddAsync(new AuditLog
        {
            EntityName = entityName,
            RecordId = recordId,
            Action = action,
            CreatedBy = createdBy,
            CreatedOn = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }
}