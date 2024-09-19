using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace minerobe.api.Migrations
{
    /// <inheritdoc />
    public partial class Integrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "integration");

            migrationBuilder.CreateTable(
                name: "JavaXboxProfile",
                schema: "integration",
                columns: table => new
                {
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "newsequentialid()"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Skins = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Capes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CurrentSkinId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CurrentCapeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JavaXboxProfile", x => x.AccountId);
                });

            migrationBuilder.CreateTable(
                name: "UserXboxAccountMatching",
                schema: "integration",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "newsequentialid()"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    XboxUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserXboxAccountMatching", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JavaXboxProfile",
                schema: "integration");

            migrationBuilder.DropTable(
                name: "UserXboxAccountMatching",
                schema: "integration");
        }
    }
}
