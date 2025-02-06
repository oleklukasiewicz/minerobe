using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class fixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.Sql(@"CREATE OR ALTER         VIEW [dbo].[vPackagesView] AS
                SELECT 
                    p.Name,
                    p.Id Id,
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
					MAX(p.Id) VariantId,
                    STRING_AGG(
                        l.ColorName,
                        ', '
                    ) WITHIN GROUP (ORDER BY l.ColorName) AS Colors
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

 CREATE OR ALTER             FUNCTION [dbo].[fGetWardrobeOutfits](@wardrobeId uniqueidentifier)
            RETURNS TABLE AS
            return (
            SELECT p.* FROM vPackagesView p
            join WardrobeMatching wm on  p.Id=wm.OutfitPackageId 
			WHERE wm.WardrobeId=@wardrobeId
			)
GO");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
