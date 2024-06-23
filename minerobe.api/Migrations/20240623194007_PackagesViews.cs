using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class PackagesViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE OR ALTER VIEW vPackagesView AS
            SELECT 
            p.Id PackageId,
            p.ModifiedAt,
            p.CreatedAt,
            u.Name Publisher,
            p.Type,
            p.OutfitType,
            COUNT(plm.PackageId) LayersCount,
            sd.Id SocialDataId
            ,sd.Downloads,sd.IsFeatured,sd.Likes,sd.IsShared
             FROM Packages p
            JOIN SocialData sd on sd.Id=p.SocialDataId
            JOIN Users u on u.Id=p.PublisherId
            LEFT JOIN PackageLayerMatching plm on plm.PackageId=p.Id
            GROUP BY plm.PackageId,p.Id,p.ModifiedAt,p.CreatedAt,u.Name,p.Type,p.OutfitType,sd.Id,sd.Downloads,sd.IsFeatured,sd.Likes,sd.IsShared
            GO");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
