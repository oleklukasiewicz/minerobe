using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class ColorOnLayers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ColorName",
                table: "Layers",
                type: "nvarchar(max)",
                nullable: true);
            migrationBuilder.Sql(@"CREATE OR ALTER     VIEW [dbo].[vPackagesView] AS
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

CREATE OR ALTER       FUNCTION [dbo].[fGetWardrobeOutfitsSingleLayer](@wardrobeId uniqueidentifier)
            RETURNS TABLE AS
            return (
            SELECT 
                    p.Name,
                    p.Id PackageId,
                    p.ModifiedAt,
                    p.CreatedAt,
                    u.Name Publisher,
                    p.Type,
                    p.OutfitType,
                    1 LayersCount,
                    sd.Id SocialDataId,
                    sd.Downloads,
                    sd.IsFeatured,
                    sd.Likes,
                    sd.IsShared,
					l.Id VariantId,
                    l.ColorName Colors
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
            join WardrobeMatching wm on  p.Id=wm.OutfitPackageId 
			WHERE wm.WardrobeId=@wardrobeId
			)
GO
CREATE OR ALTER       FUNCTION [dbo].[fGetWardrobeOutfits](@wardrobeId uniqueidentifier)
            RETURNS TABLE AS
            return (
            SELECT p.* FROM vPackagesView p
            join WardrobeMatching wm on  p.PackageId=wm.OutfitPackageId 
			WHERE wm.WardrobeId=@wardrobeId)
GO
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ColorName",
                table: "Layers");
        }
    }
}
