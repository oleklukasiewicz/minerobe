using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class ColornameAtPackageLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ColorName",
                table: "Packages",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ColorName",
                table: "Packages");
        }
    }
}
