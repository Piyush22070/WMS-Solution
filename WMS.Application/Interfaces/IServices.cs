using WMS.Application.DTOs;

namespace WMS.Application.Interfaces;

public interface IEmployeeService
{
    Task<IEnumerable<EmployeeResponseDto>> GetAllAsync();
    Task<EmployeeResponseDto?> GetByIdAsync(int id);
    Task<IEnumerable<EmployeeResponseDto>> SearchAsync(string? name, int? departmentId, int? roleId);
    Task<EmployeeResponseDto> CreateAsync(EmployeeCreateDto dto);
    Task<EmployeeResponseDto?> UpdateAsync(int id, EmployeeUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IDepartmentService
{
    Task<IEnumerable<DepartmentResponseDto>> GetAllAsync();
    Task<DepartmentResponseDto?> GetByIdAsync(int id);
    Task<DepartmentResponseDto> CreateAsync(DepartmentDto dto);
    Task<DepartmentResponseDto?> UpdateAsync(int id, DepartmentDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IRoleService
{
    Task<IEnumerable<RoleResponseDto>> GetAllAsync();
    Task<RoleResponseDto?> GetByIdAsync(int id);
    Task<RoleResponseDto> CreateAsync(RoleDto dto);
    Task<RoleResponseDto?> UpdateAsync(int id, RoleDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IAttendanceService
{
    Task<AttendanceResponseDto> CheckInAsync(AttendanceCheckInDto dto);
    Task<AttendanceResponseDto?> CheckOutAsync(AttendanceCheckOutDto dto);
    Task<IEnumerable<AttendanceResponseDto>> GetMonthlyAsync(int empId, int month, int year);
}

public interface ILeaveService
{
    Task<IEnumerable<LeaveResponseDto>> GetAllAsync();
    Task<IEnumerable<LeaveResponseDto>> GetByEmployeeAsync(int empId);
    Task<IEnumerable<LeaveResponseDto>> GetPendingAsync();
    Task<LeaveResponseDto?> GetByIdAsync(int id);
    Task<LeaveResponseDto> ApplyAsync(LeaveCreateDto dto);
    Task<LeaveResponseDto?> ApproveRejectAsync(int id, LeaveApprovalDto dto);
    Task<bool> CancelAsync(int id);
}

public interface IProjectService
{
    Task<IEnumerable<ProjectResponseDto>> GetAllAsync();
    Task<ProjectResponseDto?> GetByIdAsync(int id);
    Task<ProjectResponseDto> CreateAsync(ProjectCreateDto dto);
    Task<ProjectResponseDto?> UpdateAsync(int id, ProjectCreateDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IClientService
{
    Task<IEnumerable<ClientResponseDto>> GetAllAsync();
    Task<ClientResponseDto?> GetByIdAsync(int id);
    Task<ClientResponseDto> CreateAsync(ClientCreateDto dto);
    Task<ClientResponseDto?> UpdateAsync(int id, ClientCreateDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IAllocationService
{
    Task<IEnumerable<AllocationResponseDto>> GetAllAsync();
    Task<IEnumerable<AllocationResponseDto>> GetByEmployeeAsync(int empId);
    Task<IEnumerable<AllocationResponseDto>> GetByProjectAsync(int projectId);
    Task<AllocationResponseDto> AllocateAsync(AllocationCreateDto dto);
    Task<bool> DeactivateAsync(int allocationId, string updatedBy);
}

public interface IAnnouncementService
{
    Task<IEnumerable<AnnouncementResponseDto>> GetAllAsync();
    Task<IEnumerable<AnnouncementResponseDto>> GetActiveAsync();
    Task<AnnouncementResponseDto?> GetByIdAsync(int id);
    Task<AnnouncementResponseDto> CreateAsync(AnnouncementCreateDto dto);
    Task<bool> DeactivateAsync(int id);
}

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<RegisterUserResult> RegisterAsync(RegisterDto dto);
    Task<int?> ResolveEmployeeIdAsync(string username);
}

public interface IDashboardService
{
    Task<DashboardDto> GetSummaryAsync();
}