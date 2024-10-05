using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SourceUserPropAddedToNotification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SourceUserId",
                table: "Notifications",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_SourceUserId",
                table: "Notifications",
                column: "SourceUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_AspNetUsers_SourceUserId",
                table: "Notifications",
                column: "SourceUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_AspNetUsers_SourceUserId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_SourceUserId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "SourceUserId",
                table: "Notifications");
        }
    }
}
