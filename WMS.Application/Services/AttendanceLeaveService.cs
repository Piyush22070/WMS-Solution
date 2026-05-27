using AutoMapper;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IAttendanceRepository _repo;
    private readonly IMapper _mapper;

    public AttendanceService(IAttendanceRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<AttendanceResponseDto> CheckInAsync(AttendanceCheckInDto dto)
    {
        if (dto.EmpId == null)
            throw new InvalidOperationException("Unable to resolve employee profile.");

        var today = DateTime.UtcNow.Date;
        var employeeId = dto.EmpId.Value;
        var existing = await _repo.GetOpenCheckInAsync(employeeId, today);
        if (existing != null)
            throw new InvalidOperationException("Already checked in for today.");

        var attendance = new Attendance
        {
            EmpId = employeeId,
            CheckIn = DateTime.UtcNow,
            WorkMode = dto.WorkMode,
            AttendanceDate = today
        };
        return _mapper.Map<AttendanceResponseDto>(await _repo.AddAsync(attendance));
    }

    public async Task<AttendanceResponseDto?> CheckOutAsync(AttendanceCheckOutDto dto)
    {
        if (dto.EmpId == null)
            throw new InvalidOperationException("Unable to resolve employee profile.");

        var attendance = await _repo.GetLatestOpenCheckInAsync(dto.EmpId.Value);
        if (attendance == null) return null;

        attendance.CheckOut = DateTime.UtcNow;
        if (attendance.CheckOut.HasValue)
        {
            var timeDifference = attendance.CheckOut.Value - attendance.CheckIn;
            attendance.TotalHours = Math.Round((decimal)timeDifference.TotalHours, 2);
        }
        return _mapper.Map<AttendanceResponseDto>(await _repo.UpdateAsync(attendance));
    }

    public async Task<IEnumerable<AttendanceResponseDto>> GetMonthlyAsync(int empId, int month, int year)
        => _mapper.Map<IEnumerable<AttendanceResponseDto>>(await _repo.GetByEmployeeAsync(empId, month, year));
}

public class LeaveService : ILeaveService
{
    private readonly ILeaveRepository _repo;
    private readonly IMapper _mapper;

    public LeaveService(ILeaveRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<LeaveResponseDto>> GetAllAsync()
        => _mapper.Map<IEnumerable<LeaveResponseDto>>(await _repo.GetAllAsync());

    public async Task<IEnumerable<LeaveResponseDto>> GetByEmployeeAsync(int empId)
        => _mapper.Map<IEnumerable<LeaveResponseDto>>(await _repo.GetByEmployeeAsync(empId));

    public async Task<IEnumerable<LeaveResponseDto>> GetPendingAsync()
        => _mapper.Map<IEnumerable<LeaveResponseDto>>(await _repo.GetPendingAsync());

    public async Task<LeaveResponseDto?> GetByIdAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<LeaveResponseDto>(entity);
    }

    public async Task<LeaveResponseDto> ApplyAsync(LeaveCreateDto dto)
    {
        if (dto.FromDate > dto.ToDate)
            throw new InvalidOperationException("FromDate cannot be greater than ToDate.");
        var entity = _mapper.Map<Leave>(dto);
        entity.AppliedOn = DateTime.UtcNow;
        return _mapper.Map<LeaveResponseDto>(await _repo.AddAsync(entity));
    }

    public async Task<LeaveResponseDto?> ApproveRejectAsync(int id, LeaveApprovalDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;
        entity.Status = dto.Status;
        entity.ApprovedBy = dto.ApprovedBy;
        entity.ApprovedOn = DateTime.UtcNow;
        return _mapper.Map<LeaveResponseDto>(await _repo.UpdateAsync(entity));
    }

    public async Task<bool> CancelAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return false;
        entity.Status = "Cancelled";
        await _repo.UpdateAsync(entity);
        return true;
    }
}