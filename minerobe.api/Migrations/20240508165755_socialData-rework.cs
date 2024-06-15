using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class socialDatarework : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsShared",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "Social",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "IsShared",
                table: "OutfitPackageCollection");

            migrationBuilder.DropColumn(
                name: "Social",
                table: "OutfitPackageCollection");

            migrationBuilder.AddColumn<Guid>(
                name: "SocialDataId",
                table: "Packages",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "SocialDataId",
                table: "OutfitPackageCollection",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "SocialData",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "newsequentialid()"),
                    IsShared = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Likes = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Downloads = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialData", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SocialData");

            migrationBuilder.DropColumn(
                name: "SocialDataId",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "SocialDataId",
                table: "OutfitPackageCollection");

            migrationBuilder.AddColumn<bool>(
                name: "IsShared",
                table: "Packages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Social",
                table: "Packages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsShared",
                table: "OutfitPackageCollection",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Social",
                table: "OutfitPackageCollection",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
