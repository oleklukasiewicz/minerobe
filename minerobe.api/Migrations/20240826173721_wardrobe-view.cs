using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class wardrobeview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE OR ALTER VIEW [dbo].[vPackagesView] AS
                SELECT 
                    p.Name,
                    p.Id PackageId,
                    p.ModifiedAt,
                    p.CreatedAt,
                    u.Name Publisher,
                    p.Type,
                    p.OutfitType,
                    COUNT(plm.PackageId) LayersCount,
                    sd.Id SocialDataId,
                    sd.Downloads,
                    sd.IsFeatured,
                    sd.Likes,
                    sd.IsShared,
                    STRING_AGG(
                        ISNULL(JSON_VALUE(l.Alex, '$.colorName'), JSON_VALUE(l.Steve, '$.colorname')),
                        ', '
                    ) WITHIN GROUP (ORDER BY ISNULL(JSON_VALUE(l.Alex, '$.colorName'), JSON_VALUE(l.Steve, '$.colorname'))) AS Colors
                FROM 
                    Packages p
                JOIN 
                    SocialData sd ON sd.Id = p.SocialDataId
                JOIN 
                    Users u ON u.Id = p.PublisherId
                LEFT JOIN 
                    PackageLayerMatching plm ON plm.PackageId = p.Id
                LEFT JOIN 
                    Layers l ON plm.LayerId = l.Id
                GROUP BY 
                    p.Id, p.Name, p.ModifiedAt, p.CreatedAt, u.Name, p.Type, p.OutfitType, sd.Id, sd.Downloads, sd.IsFeatured, sd.Likes, sd.IsShared
            GO


            CREATE OR ALTER FUNCTION fGetWardrobeOutfits(@userId uniqueidentifier)
            RETURNS TABLE AS
            return (
            SELECT p.* FROM vPackagesView p
            join WardrobeMatching wm on  p.PackageId=wm.OutfitPackageId
            join Wardrobes w on w.Id=wm.WardrobeId
            WHERE w.OwnerId=@userId)
            GO");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
