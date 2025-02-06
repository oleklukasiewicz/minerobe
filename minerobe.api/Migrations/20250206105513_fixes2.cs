using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class fixes2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE OR ALTER           FUNCTION [dbo].[fGetWardrobeOutfitsSingleLayer](@wardrobeId uniqueidentifier)
            RETURNS TABLE AS
            return (
            SELECT 
                    p.Name,
                    p.Id Id,
                    p.ModifiedAt,
                    p.CreatedAt,
                    u.Name Publisher,
                    p.Type,
                    p.OutfitType,
                    case when l.Id IS NULL then 0 else 1 end LayersCount,
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
GO");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
