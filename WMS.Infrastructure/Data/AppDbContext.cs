using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;

namespace WMS.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Leave> Leaves => Set<Leave>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<EmployeeProjectAllocation> EmployeeProjectAllocations => Set<EmployeeProjectAllocation>();
    public DbSet<UserLogin> UserLogins => Set<UserLogin>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Employee>()
            .HasIndex(e => e.Email)
            .IsUnique();

        modelBuilder.Entity<UserLogin>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<UserLogin>()
            .HasIndex(u => u.EmployeeId)
            .IsUnique();

        modelBuilder.Entity<UserLogin>()
            .HasOne(u => u.Employee)
            .WithOne(e => e.UserLogin)
            .HasForeignKey<UserLogin>(u => u.EmployeeId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Attendance>()
            .Property(a => a.TotalHours)
            .HasColumnType("decimal(10,2)");

        modelBuilder.Entity<Employee>()
            .HasCheckConstraint("CK_Employee_Gender", "[Gender] IN ('M', 'F', 'O')");

        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "Admin", Description = "System Administrator" },
            new Role { RoleId = 2, RoleName = "Manager", Description = "Team Manager" },
            new Role { RoleId = 3, RoleName = "Employee", Description = "Regular Employee" }
        );

        modelBuilder.Entity<Department>().HasData(
            new Department { DepartmentId = 1, DepartmentName = "HR", Description = "Human Resources", CreatedOn = DateTime.UtcNow },
            new Department { DepartmentId = 2, DepartmentName = "Engineering", Description = "Software Engineering", CreatedOn = DateTime.UtcNow },
            new Department { DepartmentId = 3, DepartmentName = "Finance", Description = "Finance & Accounts", CreatedOn = DateTime.UtcNow }
        );

        modelBuilder.Entity<UserLogin>().HasData(
            new UserLogin
            {
                UserId = 1,
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                RoleId = 1
            }
        );
    }
}