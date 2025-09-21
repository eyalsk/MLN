using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnetbackend.Migrations
{
    /// <inheritdoc />
    public partial class ConsolidatedMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Ensure schema creation for MLN
            migrationBuilder.Sql("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'MLN') EXEC('CREATE SCHEMA MLN')");

            // InitialCreate
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            // AddProductsTable
            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            // Seed Data for Categories
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[] { 1, "חלב וגבינות" });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[] { 2, "טואלטיקה" });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[] { 3, "בשר" });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[] { 4, "ירקות ופירות" });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[] { 5, "תבלינים" });

            // Seed Data for Products
            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 1, "יוגורט", 1 });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 2, "חלב", 1 });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 3, "שמנת", 1 });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 4, "ניקוי קרח", 3 });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 5, "שוקיים", 3 });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 6, "סבון", 2 });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 7, "נייר טואלט", 2 });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 8, "מגבונים", 2 });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 9, "סבון", 2 });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 10, "תפוח", 4 });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "CategoryId" },
                values: new object[] { 11, "מלפפון", 4 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse AddProductsTable
            migrationBuilder.DropTable(
                name: "Products");

            // Reverse InitialCreate
            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}