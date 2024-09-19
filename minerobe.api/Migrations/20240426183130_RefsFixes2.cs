using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class RefsFixes2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Layers_Packages_OutfitPackageId",
                table: "Layers");

            migrationBuilder.DropIndex(
                name: "IX_Layers_OutfitPackageId",
                table: "Layers");

            migrationBuilder.DropColumn(
                name: "OutfitPackageId",
                table: "Layers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OutfitPackageId",
                table: "Layers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Layers_OutfitPackageId",
                table: "Layers",
                column: "OutfitPackageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Layers_Packages_OutfitPackageId",
                table: "Layers",
                column: "OutfitPackageId",
                principalTable: "Packages",
                principalColumn: "Id");
        }
    }
}
