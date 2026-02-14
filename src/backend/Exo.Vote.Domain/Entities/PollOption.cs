using Exo.Vote.Domain.Common;

namespace Exo.Vote.Domain.Entities;

public class PollOption : BaseEntity
{
    public Guid PollId { get; set; }
    public string Text { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public Poll Poll { get; set; } = null!;
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
