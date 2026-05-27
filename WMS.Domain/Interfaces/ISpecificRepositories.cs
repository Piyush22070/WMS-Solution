using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface IEmployeeRepository : IRepository<Employee>
{
    Task<IEnumerable<Employee>> SearchAsync(string? name, int? departmentId, int? roleId);
    Task<Employee?> GetByEmailAsync(string email);
}

public interface IDepartmentRepository : IRepository<Department> { }

public interface IRoleRepository : IRepository<Role> { }

public interface IAttendanceRepository : IRepository<Attendance>
{
    Task<IEnumerable<Attendance>> GetByEmployeeAsync(int empId, int month, int year);
    Task<Attendance?> GetOpenCheckInAsync(int empId, DateTime date);
    Task<Attendance?> GetLatestOpenCheckInAsync(int empId);
}

public interface ILeaveRepository : IRepository<Leave>
{
    Task<IEnumerable<Leave>> GetByEmployeeAsync(int empId);
    Task<IEnumerable<Leave>> GetPendingAsync();
}

public interface IProjectRepository : IRepository<Project> { }

public interface IClientRepository : IRepository<Client> { }

public interface IAllocationRepository : IRepository<EmployeeProjectAllocation>
{
    Task<IEnumerable<EmployeeProjectAllocation>> GetByEmployeeAsync(int empId);
    Task<IEnumerable<EmployeeProjectAllocation>> GetByProjectAsync(int projectId);
}

public interface IAnnouncementRepository : IRepository<Announcement>
{
    Task<IEnumerable<Announcement>> GetActiveAsync();
}

public interface IUserLoginRepository
{
    Task<UserLogin?> GetByUsernameAsync(string username);
    Task<UserLogin> AddAsync(UserLogin user);
    Task UpdateLastLoginAsync(int userId);
    Task UpdateEmployeeIdAsync(int userId, int employeeId);
}

public interface IAuditLogRepository
{
    Task LogAsync(string entityName, int recordId, string action, int createdBy);
}