using AutoMapper;
using Moq;
using WMS.Application.DTOs;
using WMS.Application.Mappings;
using WMS.Application.Services;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using Xunit;

namespace WMS.Tests;

public class EmployeeServiceTests
{
    private readonly Mock<IEmployeeRepository> _mockRepo;
    private readonly IMapper _mapper;
    private readonly EmployeeService _service;

    public EmployeeServiceTests()
    {
        _mockRepo = new Mock<IEmployeeRepository>();
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
        _service = new EmployeeService(_mockRepo.Object, _mapper);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllEmployees()
    {
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Employee>
        {
            new Employee { EmployeeId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com" }
        });

        var result = await _service.GetAllAsync();

        Assert.Single(result);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Employee?)null);

        var result = await _service.GetByIdAsync(99);

        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_ReturnsCreatedEmployee()
    {
        var dto = new EmployeeCreateDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane@test.com",
            PhoneNumber = "9999999999",
            DOB = DateTime.UtcNow.AddYears(-25),
            DOJ = DateTime.UtcNow
        };

        _mockRepo.Setup(r => r.AddAsync(It.IsAny<Employee>()))
            .ReturnsAsync((Employee e) => { e.EmployeeId = 1; return e; });

        var result = await _service.CreateAsync(dto);

        Assert.Equal("Jane", result.FirstName);
        Assert.Equal(1, result.EmployeeId);
    }
}

public class LeaveServiceTests
{
    private readonly Mock<ILeaveRepository> _mockRepo;
    private readonly IMapper _mapper;
    private readonly LeaveService _service;

    public LeaveServiceTests()
    {
        _mockRepo = new Mock<ILeaveRepository>();
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
        _service = new LeaveService(_mockRepo.Object, _mapper);
    }

    [Fact]
    public async Task ApplyAsync_ThrowsException_WhenFromDateAfterToDate()
    {
        var dto = new LeaveCreateDto
        {
            EmpId = 1,
            LeaveType = "Sick",
            FromDate = DateTime.UtcNow.AddDays(5),
            ToDate = DateTime.UtcNow
        };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.ApplyAsync(dto));
    }

    [Fact]
    public async Task CancelAsync_ReturnsFalse_WhenLeaveNotFound()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Leave?)null);

        var result = await _service.CancelAsync(99);

        Assert.False(result);
    }
}