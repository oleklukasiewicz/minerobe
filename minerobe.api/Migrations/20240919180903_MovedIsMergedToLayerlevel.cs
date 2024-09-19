using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class MovedIsMergedToLayerlevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsMergedLayer",
                table: "PackageLayerMatching");

            migrationBuilder.AddColumn<bool>(
                name: "IsMerged",
                table: "Layers",
                type: "bit",
                nullable: false,
                defaultValue: false);
            migrationBuilder.Sql(@"CREATE OR ALTER       VIEW [dbo].[vPackageLayersSimpleView] AS
            SELECT
            l.Id,
            plm.PackageId PackageId,
            ColorName,
            OutfitType,
            plm.[Order],
            l.IsMerged
            FROM Layers l
            JOIN PackageLayerMatching plm on plm.LayerId=l.Id
            GO");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsMerged",
                table: "Layers");

            migrationBuilder.AddColumn<bool>(
                name: "IsMergedLayer",
                table: "PackageLayerMatching",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
