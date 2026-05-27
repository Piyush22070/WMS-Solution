using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories;

public class AttendanceRepository : Repository<Attendance>, IAttendanceRepository
{
    public AttendanceRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Attendance>> GetByEmployeeAsync(int empId, int month, int year)
        => await _context.Attendances
            .Where(a => a.EmpId == empId && a.AttendanceDate.Month == month && a.AttendanceDate.Year == year)
            .ToListAsync();

    public async Task<Attendance?> GetOpenCheckInAsync(int empId, DateTime date)
        => await _context.Attendances
            .FirstOrDefaultAsync(a => a.EmpId == empId && a.AttendanceDate.Date == date.Date && a.CheckOut == null);

    public async Task<Attendance?> GetLatestOpenCheckInAsync(int empId)
        => await _context.Attendances
            .Where(a => a.EmpId == empId && a.CheckOut == null)
            .OrderByDescending(a => a.CheckIn)
            .FirstOrDefaultAsync();
}