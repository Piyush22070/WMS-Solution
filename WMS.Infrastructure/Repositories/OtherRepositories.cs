using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories;

public class LeaveRepository : Repository<Leave>, ILeaveRepository
{
    public LeaveRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Leave>> GetByEmployeeAsync(int empId)
        => await _context.Leaves.Where(l => l.EmpId == empId).ToListAsync();

    public async Task<IEnumerable<Leave>> GetPendingAsync()
        => await _context.Leaves.Include(l => l.Employee).Where(l => l.Status == "Pending").ToListAsync();
}

public class ProjectRepository : Repository<Project>, IProjectRepository
{
    public ProjectRepository(AppDbContext context) : base(context) { }

    public override async Task<IEnumerable<Project>> GetAllAsync()
        => await _context.Projects.Include(p => p.Client).ToListAsync();

    public override async Task<Project?> GetByIdAsync(int id)
        => await _context.Projects.Include(p => p.Client).FirstOrDefaultAsync(p => p.ProjectId == id);
}

public class ClientRepository : Repository<Client>, IClientRepository
{
    public ClientRepository(AppDbContext context) : base(context) { }
}

public class AllocationRepository : Repository<EmployeeProjectAllocation>, IAllocationRepository
{
    public AllocationRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<EmployeeProjectAllocation>> GetByEmployeeAsync(int empId)
        => await _context.EmployeeProjectAllocations.Include(a => a.Project).Where(a => a.EmpId == empId).ToListAsync();

    public async Task<IEnumerable<EmployeeProjectAllocation>> GetByProjectAsync(int projectId)
        => await _context.EmployeeProjectAllocations.Include(a => a.Employee).Where(a => a.ProjectId == projectId).ToListAsync();
}

public class AnnouncementRepository : Repository<Announcement>, IAnnouncementRepository
{
    public AnnouncementRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Announcement>> GetActiveAsync()
        => await _context.Announcements.Where(a => a.IsActive).OrderByDescending(a => a.CreatedOn).ToListAsync();
}

public class DepartmentRepository : Repository<Department>, IDepartmentRepository
{
    public DepartmentRepository(AppDbContext context) : base(context) { }
}

public class RoleRepository : Repository<Role>, IRoleRepository
{
    public RoleRepository(AppDbContext context) : base(context) { }
}