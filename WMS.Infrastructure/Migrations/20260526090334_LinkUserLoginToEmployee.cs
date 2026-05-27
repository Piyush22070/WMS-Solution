using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LinkUserLoginToEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "UserLogins",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "DepartmentId",
                keyValue: 1,
                column: "CreatedOn",
                value: new DateTime(2026, 5, 26, 9, 3, 33, 844, DateTimeKind.Utc).AddTicks(110));

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "DepartmentId",
                keyValue: 2,
                column: "CreatedOn",
                value: new DateTime(2026, 5, 26, 9, 3, 33, 844, DateTimeKind.Utc).AddTicks(110));

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "DepartmentId",
                keyValue: 3,
                column: "CreatedOn",
                value: new DateTime(2026, 5, 26, 9, 3, 33, 844, DateTimeKind.Utc).AddTicks(110));

            migrationBuilder.UpdateData(
                table: "UserLogins",
                keyColumn: "UserId",
                keyValue: 1,
                columns: new[] { "EmployeeId", "PasswordHash" },
                values: new object[] { null, "$2a$11$4fDQZxeJgoh7qDSnsa8njeLVRDBTlcAC0EfVNMtR.mt1KdsIAosu6" });

            migrationBuilder.CreateIndex(
                name: "IX_UserLogins_EmployeeId",
                table: "UserLogins",
                column: "EmployeeId",
                unique: true,
                filter: "[EmployeeId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_UserLogins_Employees_EmployeeId",
                table: "UserLogins",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserLogins_Employees_EmployeeId",
                table: "UserLogins");

            migrationBuilder.DropIndex(
                name: "IX_UserLogins_EmployeeId",
                table: "UserLogins");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "UserLogins");

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "DepartmentId",
                keyValue: 1,
                column: "CreatedOn",
                value: new DateTime(2026, 5, 25, 7, 56, 12, 581, DateTimeKind.Utc).AddTicks(6820));

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "DepartmentId",
                keyValue: 2,
                column: "CreatedOn",
                value: new DateTime(2026, 5, 25, 7, 56, 12, 581, DateTimeKind.Utc).AddTicks(6820));

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "DepartmentId",
                keyValue: 3,
                column: "CreatedOn",
                value: new DateTime(2026, 5, 25, 7, 56, 12, 581, DateTimeKind.Utc).AddTicks(6820));

            migrationBuilder.UpdateData(
                table: "UserLogins",
                keyColumn: "UserId",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$mYY/ajl.Xk19S4iKxUqoCuXTx1PGpIj2eG42IlPSvU8OZhb.aPI4a");
        }
    }
}
