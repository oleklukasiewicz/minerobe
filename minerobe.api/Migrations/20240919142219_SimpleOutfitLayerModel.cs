using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class SimpleOutfitLayerModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE OR ALTER FUNCTION fGetOutfitLayersSimple(@outfitPackageId uniqueidentifier)
RETURNS TABLE AS 
return (
SELECT
l.Id,
SourcePackageId,
ColorName,
OutfitType,
plm.[Order],
plm.IsMergedLayer
FROM Layers l
JOIN PackageLayerMatching plm on plm.LayerId=l.Id
WHERE plm.PackageId=@outfitPackageId
)
GO");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
