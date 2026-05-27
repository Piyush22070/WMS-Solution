using AutoMapper;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public EmployeeService(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EmployeeResponseDto>> GetAllAsync()
        => _mapper.Map<IEnumerable<EmployeeResponseDto>>(await _repo.GetAllAsync());

    public async Task<EmployeeResponseDto?> GetByIdAsync(int id)
    {
        var emp = await _repo.GetByIdAsync(id);
        return emp == null ? null : _mapper.Map<EmployeeResponseDto>(emp);
    }

    public async Task<IEnumerable<EmployeeResponseDto>> SearchAsync(string? name, int? departmentId, int? roleId)
        => _mapper.Map<IEnumerable<EmployeeResponseDto>>(await _repo.SearchAsync(name, departmentId, roleId));

    public async Task<EmployeeResponseDto> CreateAsync(EmployeeCreateDto dto)
    {
        var entity = _mapper.Map<Employee>(dto);
        entity.CreatedOn = DateTime.UtcNow;
        return _mapper.Map<EmployeeResponseDto>(await _repo.AddAsync(entity));
    }

    public async Task<EmployeeResponseDto?> UpdateAsync(int id, EmployeeUpdateDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return null;
        _mapper.Map(dto, existing);
        existing.UpdatedOn = DateTime.UtcNow;
        return _mapper.Map<EmployeeResponseDto>(await _repo.UpdateAsync(existing));
    }

    public async Task<bool> DeleteAsync(int id) => await _repo.DeleteAsync(id);
}

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _repo;
    private readonly IMapper _mapper;

    public DepartmentService(IDepartmentRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<DepartmentResponseDto>> GetAllAsync()
        => _mapper.Map<IEnumerable<DepartmentResponseDto>>(await _repo.GetAllAsync());

    public async Task<DepartmentResponseDto?> GetByIdAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<DepartmentResponseDto>(entity);
    }

    public async Task<DepartmentResponseDto> CreateAsync(DepartmentDto dto)
    {
        var entity = _mapper.Map<Department>(dto);
        entity.CreatedOn = DateTime.UtcNow;
        return _mapper.Map<DepartmentResponseDto>(await _repo.AddAsync(entity));
    }

    public async Task<DepartmentResponseDto?> UpdateAsync(int id, DepartmentDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return null;
        _mapper.Map(dto, existing);
        return _mapper.Map<DepartmentResponseDto>(await _repo.UpdateAsync(existing));
    }

    public async Task<bool> DeleteAsync(int id) => await _repo.DeleteAsync(id);
}

public class RoleService : IRoleService
{
    private readonly IRoleRepository _repo;
    private readonly IMapper _mapper;

    public RoleService(IRoleRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<RoleResponseDto>> GetAllAsync()
        => _mapper.Map<IEnumerable<RoleResponseDto>>(await _repo.GetAllAsync());

    public async Task<RoleResponseDto?> GetByIdAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<RoleResponseDto>(entity);
    }

    public async Task<RoleResponseDto> CreateAsync(RoleDto dto)
        => _mapper.Map<RoleResponseDto>(await _repo.AddAsync(_mapper.Map<Role>(dto)));

    public async Task<RoleResponseDto?> UpdateAsync(int id, RoleDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return null;
        _mapper.Map(dto, existing);
        return _mapper.Map<RoleResponseDto>(await _repo.UpdateAsync(existing));
    }

    public async Task<bool> DeleteAsync(int id) => await _repo.DeleteAsync(id);
}