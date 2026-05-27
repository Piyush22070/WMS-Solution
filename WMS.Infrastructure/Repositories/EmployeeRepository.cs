using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories;

public class EmployeeRepository : Repository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(AppDbContext context) : base(context) { }

    public override async Task<IEnumerable<Employee>> GetAllAsync()
        => await _context.Employees.Include(e => e.Department).Include(e => e.Role).Include(e => e.UserLogin).ToListAsync();

    public override async Task<Employee?> GetByIdAsync(int id)
        => await _context.Employees.Include(e => e.Department).Include(e => e.Role).Include(e => e.UserLogin).FirstOrDefaultAsync(e => e.EmployeeId == id);

    public async Task<IEnumerable<Employee>> SearchAsync(string? name, int? departmentId, int? roleId)
    {
        var query = _context.Employees.Include(e => e.Department).Include(e => e.Role).Include(e => e.UserLogin).AsQueryable();
        if (!string.IsNullOrEmpty(name))
            query = query.Where(e => e.FirstName.Contains(name) || e.LastName.Contains(name));
        if (departmentId.HasValue)
            query = query.Where(e => e.DepartmentId == departmentId);
        if (roleId.HasValue)
            query = query.Where(e => e.RoleId == roleId);
        return await query.ToListAsync();
    }

    public async Task<Employee?> GetByEmailAsync(string email)
        => await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);
}