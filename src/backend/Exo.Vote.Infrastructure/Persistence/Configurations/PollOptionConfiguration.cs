using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Exo.Vote.Infrastructure.Persistence.Configurations;

public class PollOptionConfiguration : IEntityTypeConfiguration<PollOptionEntity>
{
    public void Configure(EntityTypeBuilder<PollOptionEntity> builder)
    {
        builder.ToTable("poll_options");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(o => o.PollId)
            .HasColumnName("poll_id")
            .IsRequired();

        builder.Property(o => o.Text)
            .HasColumnName("text")
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(o => o.SortOrder)
            .HasColumnName("sort_order")
            .HasDefaultValue(0);

        builder.Property(o => o.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(o => o.UpdatedAt)
            .HasColumnName("updated_at");

        builder.HasMany(o => o.Votes)
            .WithOne(v => v.PollOption)
            .HasForeignKey(v => v.PollOptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
