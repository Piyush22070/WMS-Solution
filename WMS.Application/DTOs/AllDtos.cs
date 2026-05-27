using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs;

public class EmployeeCreateDto
{
    [Required][MaxLength(50)] public string FirstName { get; set; } = string.Empty;
    [Required][MaxLength(50)] public string LastName { get; set; } = string.Empty;
    [Required][EmailAddress][MaxLength(80)] public string Email { get; set; } = string.Empty;
    [Required][MaxLength(15)] public string PhoneNumber { get; set; } = string.Empty;
    [MaxLength(1)] public string? Gender { get; set; }
    [Required] public DateTime DOB { get; set; }
    [Required] public DateTime DOJ { get; set; }
    public int? DepartmentId { get; set; }
    public int? RoleId { get; set; }
}

public class EmployeeUpdateDto : EmployeeCreateDto
{
    public string Status { get; set; } = "Active";
}

public class EmployeeResponseDto
{
    public int EmployeeId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public DateTime DOB { get; set; }
    public DateTime DOJ { get; set; }
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int? RoleId { get; set; }
    public string? RoleName { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedOn { get; set; }
}

public class DepartmentDto
{
    [Required][MaxLength(100)] public string DepartmentName { get; set; } = string.Empty;
    [MaxLength(255)] public string? Description { get; set; }
}

public class DepartmentResponseDto
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedOn { get; set; }
}

public class RoleDto
{
    [Required][MaxLength(50)] public string RoleName { get; set; } = string.Empty;
    [MaxLength(150)] public string? Description { get; set; }
}

public class RoleResponseDto
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class AttendanceCheckInDto
{
    public int? EmpId { get; set; }
    [MaxLength(20)] public string? WorkMode { get; set; }
}

public class AttendanceCheckOutDto
{
    public int? EmpId { get; set; }
}

public class AttendanceResponseDto
{
    public int AttendanceId { get; set; }
    public int EmpId { get; set; }
    public DateTime CheckIn { get; set; }
    public DateTime? CheckOut { get; set; }
    public decimal? TotalHours { get; set; }
    public string? WorkMode { get; set; }
    public DateTime AttendanceDate { get; set; }
}

public class LeaveCreateDto
{
    public int? EmpId { get; set; }
    [Required][MaxLength(30)] public string LeaveType { get; set; } = string.Empty;
    [MaxLength(255)] public string? Reason { get; set; }
    [Required] public DateTime FromDate { get; set; }
    [Required] public DateTime ToDate { get; set; }
}

public class LeaveApprovalDto
{
    [Required] public string Status { get; set; } = string.Empty;
    [Required] public int ApprovedBy { get; set; }
}

public class LeaveResponseDto
{
    public int LeaveId { get; set; }
    public int EmpId { get; set; }
    public string LeaveType { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedOn { get; set; }
    public int? ApprovedBy { get; set; }
    public DateTime? ApprovedOn { get; set; }
}

public class AnnouncementCreateDto
{
    [Required][MaxLength(100)] public string Title { get; set; } = string.Empty;
    [Required] public string Message { get; set; } = string.Empty;
    [Required] public int CreatedBy { get; set; }
}

public class AnnouncementResponseDto
{
    public int AnnouncementId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int CreatedBy { get; set; }
    public DateTime CreatedOn { get; set; }
    public bool IsActive { get; set; }
}

public class ClientCreateDto
{
    [Required][MaxLength(100)] public string ClientName { get; set; } = string.Empty;
    public string? ClientAddress { get; set; }
    public decimal? ClientPhoneNumber { get; set; }
    [MaxLength(20)] public string? ClientLocation { get; set; }
}

public class ClientResponseDto
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientAddress { get; set; }
    public decimal? ClientPhoneNumber { get; set; }
    public string? ClientLocation { get; set; }
    public bool Status { get; set; }
}

public class ProjectCreateDto
{
    [Required][MaxLength(100)] public string ProjectName { get; set; } = string.Empty;
    public int? ClientId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class ProjectResponseDto
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int? ClientId { get; set; }
    public string? ClientName { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class AllocationCreateDto
{
    [Required] public int EmpId { get; set; }
    [Required] public int ProjectId { get; set; }
    [Required] public DateTime AssignedOn { get; set; }
    [Required][MaxLength(50)] public string CreatedBy { get; set; } = string.Empty;
}

public class AllocationResponseDto
{
    public int AllocationId { get; set; }
    public int EmpId { get; set; }
    public string? EmployeeName { get; set; }
    public int ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public DateTime AssignedOn { get; set; }
    public bool Status { get; set; }
}

public class LoginDto
{
    [Required] public string Username { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class RegisterDto
{
    [Required][MaxLength(50)] public string Username { get; set; } = string.Empty;
    [Required][MinLength(6)] public string Password { get; set; } = string.Empty;
    [Required] public int? RoleId { get; set; }
    public int? EmployeeId { get; set; }
}

public enum RegisterUserResult
{
    Success,
    UsernameExists,
    RoleNotFound
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? EmployeeId { get; set; }
    public DateTime Expiry { get; set; }
}

public class DashboardDto
{
    public int TotalEmployees { get; set; }
    public int ActiveProjects { get; set; }
    public int PendingLeaves { get; set; }
    public int TodayAttendance { get; set; }
    public decimal TotalWorkingHours { get; set; }
    public List<EmployeeAttendanceSummaryDto> EmployeeAttendance { get; set; } = new();
}

public class EmployeeAttendanceSummaryDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int WorkingDays { get; set; }
    public decimal WorkingHours { get; set; }
}