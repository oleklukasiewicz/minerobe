using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class GlobalLayerMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Title",
                table: "OutfitPackageCollection",
                newName: "Name");

            migrationBuilder.AddColumn<bool>(
                name: "IsGlobalLayer",
                table: "PackageLayerMatching",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsGlobalLayer",
                table: "PackageLayerMatching");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "OutfitPackageCollection",
                newName: "Title");
        }
    }
}
