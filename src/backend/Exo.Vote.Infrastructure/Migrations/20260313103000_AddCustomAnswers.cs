using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Exo.Vote.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomAnswers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "allow_custom_answers",
                table: "polls",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "custom_answer_text",
                table: "votes",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "allow_custom_answers",
                table: "polls");

            migrationBuilder.DropColumn(
                name: "custom_answer_text",
                table: "votes");
        }
    }
}
