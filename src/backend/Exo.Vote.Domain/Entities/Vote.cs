using Exo.Vote.Domain.Common;

namespace Exo.Vote.Domain.Entities;

public class Vote : BaseEntity
{
    public Guid PollId { get; set; }
    public Guid PollOptionId { get; set; }
    public string VoterId { get; set; } = string.Empty;
    public string VoterName { get; set; } = string.Empty;
    public int? Rank { get; set; }
    public DateTime VotedAt { get; set; } = DateTime.UtcNow;

    public Poll Poll { get; set; } = null!;
    public PollOption PollOption { get; set; } = null!;
}
