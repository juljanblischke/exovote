using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Exo.Vote.Infrastructure.Persistence.Configurations;

public class VoteConfiguration : IEntityTypeConfiguration<VoteEntity>
{
    public void Configure(EntityTypeBuilder<VoteEntity> builder)
    {
        builder.ToTable("votes");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(v => v.PollId)
            .HasColumnName("poll_id")
            .IsRequired();

        builder.Property(v => v.PollOptionId)
            .HasColumnName("poll_option_id")
            .IsRequired();

        builder.Property(v => v.VoterId)
            .HasColumnName("voter_id")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(v => v.VoterName)
            .HasColumnName("voter_name")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(v => v.Rank)
            .HasColumnName("rank");

        builder.Property(v => v.VotedAt)
            .HasColumnName("voted_at");

        builder.Property(v => v.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(v => v.UpdatedAt)
            .HasColumnName("updated_at");

        // Index for looking up votes by poll and voter
        builder.HasIndex(v => new { v.PollId, v.VoterId })
            .HasDatabaseName("ix_votes_poll_voter");
    }
}
