using Exo.Vote.Domain.Common;
using Exo.Vote.Domain.Enums;

namespace Exo.Vote.Domain.Entities;

public class Poll : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CreatorId { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public PollStatus Status { get; set; } = PollStatus.Draft;
    public PollType Type { get; set; } = PollType.SingleChoice;

    public ICollection<PollOption> Options { get; set; } = new List<PollOption>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
