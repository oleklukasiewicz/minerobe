using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class XboxAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_JavaXboxProfile",
                schema: "integration",
                table: "JavaXboxProfile");

            migrationBuilder.AlterColumn<string>(
                name: "AccountId",
                schema: "integration",
                table: "JavaXboxProfile",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValueSql: "newsequentialid()");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                schema: "integration",
                table: "JavaXboxProfile",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "newsequentialid()");

            migrationBuilder.AddPrimaryKey(
                name: "PK_JavaXboxProfile",
                schema: "integration",
                table: "JavaXboxProfile",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_JavaXboxProfile",
                schema: "integration",
                table: "JavaXboxProfile");

            migrationBuilder.DropColumn(
                name: "Id",
                schema: "integration",
                table: "JavaXboxProfile");

            migrationBuilder.AlterColumn<Guid>(
                name: "AccountId",
                schema: "integration",
                table: "JavaXboxProfile",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "newsequentialid()",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_JavaXboxProfile",
                schema: "integration",
                table: "JavaXboxProfile",
                column: "AccountId");
        }
    }
}
