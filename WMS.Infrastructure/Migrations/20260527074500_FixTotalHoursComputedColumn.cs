using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixTotalHoursComputedColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the computed column constraint
            migrationBuilder.Sql(@"
                ALTER TABLE [Attendances] 
                DROP COLUMN [TotalHours];
            ");

            // Recreate the column as a regular nullable decimal
            migrationBuilder.Sql(@"
                ALTER TABLE [Attendances] 
                ADD [TotalHours] decimal(10,2) NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the regular column
            migrationBuilder.Sql(@"
                ALTER TABLE [Attendances] 
                DROP COLUMN [TotalHours];
            ");

            // Recreate as computed column
            migrationBuilder.Sql(@"
                ALTER TABLE [Attendances] 
                ADD [TotalHours] AS DATEDIFF(MINUTE, [CheckIn], [CheckOut]) / 60.0;
            ");
        }
    }
}
