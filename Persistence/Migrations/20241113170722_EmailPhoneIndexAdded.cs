using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EmailPhoneIndexAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // EmailAddresses
            //migrationBuilder.CreateIndex(
            //    name: "IX_EmailAddresses_UserId",
            //    table: "EmailAddresses",
            //    column: "UserId",
            //    unique: true
            //);

            migrationBuilder.Sql($"CREATE UNIQUE INDEX \"IX_EmailAddresses_UserId_IsPrimary\" ON public.\"EmailAddresses\"(\"UserId\") WHERE \"IsPrimary\" = TRUE;");

            // PhoneNumbers
            //migrationBuilder.CreateIndex(
            //    name: "IX_PhoneNumbers_UserId",
            //    table: "PhoneNumbers",
            //    column: "UserId",
            //    unique: true
            //);

            migrationBuilder.Sql($"CREATE UNIQUE INDEX \"IX_PhoneNumbers_UserId_IsPrimary\" ON public.\"PhoneNumbers\"(\"UserId\") WHERE \"IsPrimary\" = TRUE;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the indexes in reverse order
            migrationBuilder.Sql($"DROP INDEX IF EXISTS public.\"IX_PhoneNumbers_UserId_IsPrimary\";");
            //migrationBuilder.DropIndex(
            //    name: "IX_PhoneNumbers_UserId",
            //    table: "PhoneNumbers"
            //);

            migrationBuilder.Sql($"DROP INDEX IF EXISTS public.\"IX_EmailAddresses_UserId_IsPrimary\";");
            //migrationBuilder.DropIndex(
            //    name: "IX_EmailAddresses_UserId",
            //    table: "EmailAddresses"
            //);
        }
    }
}
