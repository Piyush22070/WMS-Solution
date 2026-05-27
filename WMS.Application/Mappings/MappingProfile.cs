using AutoMapper;
using WMS.Application.DTOs;
using WMS.Domain.Entities;

namespace WMS.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Employee, EmployeeResponseDto>()
            .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Department != null ? s.Department.DepartmentName : null))
            .ForMember(d => d.RoleName, o => o.MapFrom(s => s.Role != null ? s.Role.RoleName : null));
        CreateMap<EmployeeCreateDto, Employee>();
        CreateMap<EmployeeUpdateDto, Employee>();

        CreateMap<Department, DepartmentResponseDto>();
        CreateMap<DepartmentDto, Department>();

        CreateMap<Role, RoleResponseDto>();
        CreateMap<RoleDto, Role>();

        CreateMap<Attendance, AttendanceResponseDto>();

        CreateMap<Leave, LeaveResponseDto>();
        CreateMap<LeaveCreateDto, Leave>();

        CreateMap<Announcement, AnnouncementResponseDto>();
        CreateMap<AnnouncementCreateDto, Announcement>();

        CreateMap<Client, ClientResponseDto>();
        CreateMap<ClientCreateDto, Client>();

        CreateMap<Project, ProjectResponseDto>()
            .ForMember(d => d.ClientName, o => o.MapFrom(s => s.Client != null ? s.Client.ClientName : null));
        CreateMap<ProjectCreateDto, Project>();

        CreateMap<EmployeeProjectAllocation, AllocationResponseDto>()
            .ForMember(d => d.EmployeeName, o => o.MapFrom(s => s.Employee != null ? s.Employee.FirstName + " " + s.Employee.LastName : null))
            .ForMember(d => d.ProjectName, o => o.MapFrom(s => s.Project != null ? s.Project.ProjectName : null));
        CreateMap<AllocationCreateDto, EmployeeProjectAllocation>();
    }
}