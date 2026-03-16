using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Exo.Vote.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVoteGeoLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "country_code",
                table: "votes",
                type: "character varying(2)",
                maxLength: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "region",
                table: "votes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "country_code",
                table: "votes");

            migrationBuilder.DropColumn(
                name: "region",
                table: "votes");
        }
    }
}
