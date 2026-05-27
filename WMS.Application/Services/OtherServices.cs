using AutoMapper;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _repo;
    private readonly IMapper _mapper;

    public ProjectService(IProjectRepository repo, IMapper mapper) { _repo = repo; _mapper = mapper; }

    public async Task<IEnumerable<ProjectResponseDto>> GetAllAsync()
        => _mapper.Map<IEnumerable<ProjectResponseDto>>(await _repo.GetAllAsync());

    public async Task<ProjectResponseDto?> GetByIdAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<ProjectResponseDto>(entity);
    }

    public async Task<ProjectResponseDto> CreateAsync(ProjectCreateDto dto)
        => _mapper.Map<ProjectResponseDto>(await _repo.AddAsync(_mapper.Map<Project>(dto)));

    public async Task<ProjectResponseDto?> UpdateAsync(int id, ProjectCreateDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return null;
        _mapper.Map(dto, existing);
        return _mapper.Map<ProjectResponseDto>(await _repo.UpdateAsync(existing));
    }

    public async Task<bool> DeleteAsync(int id) => await _repo.DeleteAsync(id);
}

public class ClientService : IClientService
{
    private readonly IClientRepository _repo;
    private readonly IMapper _mapper;

    public ClientService(IClientRepository repo, IMapper mapper) { _repo = repo; _mapper = mapper; }

    public async Task<IEnumerable<ClientResponseDto>> GetAllAsync()
        => _mapper.Map<IEnumerable<ClientResponseDto>>(await _repo.GetAllAsync());

    public async Task<ClientResponseDto?> GetByIdAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<ClientResponseDto>(entity);
    }

    public async Task<ClientResponseDto> CreateAsync(ClientCreateDto dto)
        => _mapper.Map<ClientResponseDto>(await _repo.AddAsync(_mapper.Map<Client>(dto)));

    public async Task<ClientResponseDto?> UpdateAsync(int id, ClientCreateDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return null;
        _mapper.Map(dto, existing);
        return _mapper.Map<ClientResponseDto>(await _repo.UpdateAsync(existing));
    }

    public async Task<bool> DeleteAsync(int id) => await _repo.DeleteAsync(id);
}

public class AllocationService : IAllocationService
{
    private readonly IAllocationRepository _repo;
    private readonly IMapper _mapper;

    public AllocationService(IAllocationRepository repo, IMapper mapper) { _repo = repo; _mapper = mapper; }

    public async Task<IEnumerable<AllocationResponseDto>> GetAllAsync()
        => _mapper.Map<IEnumerable<AllocationResponseDto>>(await _repo.GetAllAsync());

    public async Task<IEnumerable<AllocationResponseDto>> GetByEmployeeAsync(int empId)
        => _mapper.Map<IEnumerable<AllocationResponseDto>>(await _repo.GetByEmployeeAsync(empId));

    public async Task<IEnumerable<AllocationResponseDto>> GetByProjectAsync(int projectId)
        => _mapper.Map<IEnumerable<AllocationResponseDto>>(await _repo.GetByProjectAsync(projectId));

    public async Task<AllocationResponseDto> AllocateAsync(AllocationCreateDto dto)
    {
        var entity = _mapper.Map<EmployeeProjectAllocation>(dto);
        entity.CreateDate = DateTime.UtcNow;
        entity.Status = true;
        return _mapper.Map<AllocationResponseDto>(await _repo.AddAsync(entity));
    }

    public async Task<bool> DeactivateAsync(int allocationId, string updatedBy)
    {
        var entity = await _repo.GetByIdAsync(allocationId);
        if (entity == null) return false;
        entity.Status = false;
        entity.UpdatedBy = updatedBy;
        entity.UpdatedDate = DateTime.UtcNow;
        await _repo.UpdateAsync(entity);
        return true;
    }
}

public class AnnouncementService : IAnnouncementService
{
    private readonly IAnnouncementRepository _repo;
    private readonly IMapper _mapper;

    public AnnouncementService(IAnnouncementRepository repo, IMapper mapper) { _repo = repo; _mapper = mapper; }

    public async Task<IEnumerable<AnnouncementResponseDto>> GetAllAsync()
        => _mapper.Map<IEnumerable<AnnouncementResponseDto>>(await _repo.GetAllAsync());

    public async Task<IEnumerable<AnnouncementResponseDto>> GetActiveAsync()
        => _mapper.Map<IEnumerable<AnnouncementResponseDto>>(await _repo.GetActiveAsync());

    public async Task<AnnouncementResponseDto?> GetByIdAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<AnnouncementResponseDto>(entity);
    }

    public async Task<AnnouncementResponseDto> CreateAsync(AnnouncementCreateDto dto)
        => _mapper.Map<AnnouncementResponseDto>(await _repo.AddAsync(_mapper.Map<Announcement>(dto)));

    public async Task<bool> DeactivateAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return false;
        entity.IsActive = false;
        await _repo.UpdateAsync(entity);
        return true;
    }
}

public class DashboardService : IDashboardService
{
    private readonly IEmployeeRepository _empRepo;
    private readonly IProjectRepository _projectRepo;
    private readonly ILeaveRepository _leaveRepo;
    private readonly IAttendanceRepository _attendanceRepo;

    public DashboardService(IEmployeeRepository empRepo, IProjectRepository projectRepo, ILeaveRepository leaveRepo, IAttendanceRepository attendanceRepo)
    {
        _empRepo = empRepo;
        _projectRepo = projectRepo;
        _leaveRepo = leaveRepo;
        _attendanceRepo = attendanceRepo;
    }

    public async Task<DashboardDto> GetSummaryAsync()
    {
        var employees = await _empRepo.GetAllAsync();
        var projects = await _projectRepo.GetAllAsync();
        var leaves = await _leaveRepo.GetPendingAsync();
        var attendances = await _attendanceRepo.GetAllAsync();
        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;

        var monthlyAttendances = attendances
            .Where(a => a.CheckOut != null && a.TotalHours.HasValue && a.AttendanceDate.Month == currentMonth && a.AttendanceDate.Year == currentYear)
            .ToList();

        var totalWorkingHours = monthlyAttendances.Sum(a => a.TotalHours ?? 0m);

        var employeeAttendance = monthlyAttendances
            .GroupBy(a => a.EmpId)
            .Select(group =>
            {
                var employee = employees.FirstOrDefault(e => e.EmployeeId == group.Key);
                return new EmployeeAttendanceSummaryDto
                {
                    EmployeeId = group.Key,
                    EmployeeName = employee == null
                        ? $"Employee #{group.Key}"
                        : $"{employee.FirstName} {employee.LastName}",
                    WorkingDays = group.Select(a => a.AttendanceDate.Date).Distinct().Count(),
                    WorkingHours = Math.Round(group.Sum(a => a.TotalHours ?? 0m), 2)
                };
            })
            .OrderByDescending(x => x.WorkingHours)
            .ThenBy(x => x.EmployeeName)
            .ToList();

        return new DashboardDto
        {
            TotalEmployees = employees.Count(e => e.Status == "Active"),
            ActiveProjects = projects.Count(p => p.Status == "Active"),
            PendingLeaves = leaves.Count(),
            TodayAttendance = attendances.Count(a => a.AttendanceDate.Date == DateTime.UtcNow.Date),
            TotalWorkingHours = Math.Round(totalWorkingHours, 2),
            EmployeeAttendance = employeeAttendance
        };
    }
}