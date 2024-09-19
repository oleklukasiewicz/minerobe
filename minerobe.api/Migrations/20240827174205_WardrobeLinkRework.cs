using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class WardrobeLinkRework : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Wardrobes");

            migrationBuilder.AddColumn<Guid>(
                name: "WardrobeId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
            migrationBuilder.Sql(@" CREATE OR ALTER   FUNCTION [dbo].[fGetWardrobeOutfits](@wardrobeId uniqueidentifier)
            RETURNS TABLE AS
            return (
            SELECT p.* FROM vPackagesView p
            join WardrobeMatching wm on  p.PackageId=wm.OutfitPackageId 
			WHERE wm.WardrobeId=@wardrobeId)
			GO");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WardrobeId",
                table: "Users");

            migrationBuilder.AddColumn<Guid>(
                name: "OwnerId",
                table: "Wardrobes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }
    }
}
