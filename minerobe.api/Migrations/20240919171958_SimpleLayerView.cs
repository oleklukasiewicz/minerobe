using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class SimpleLayerView : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE OR ALTER       VIEW [dbo].[vPackageLayersSimpleView] AS
            SELECT
            l.Id,
            plm.PackageId PackageId,
            ColorName,
            OutfitType,
            plm.[Order],
            plm.IsMergedLayer
            FROM Layers l
            JOIN PackageLayerMatching plm on plm.LayerId=l.Id
            GO");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
