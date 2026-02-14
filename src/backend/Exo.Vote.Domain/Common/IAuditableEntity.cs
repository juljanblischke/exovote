namespace Exo.Vote.Domain.Common;

public interface IAuditableEntity
{
    string? CreatedBy { get; set; }
    DateTime CreatedAt { get; set; }
    string? LastModifiedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
}
