using NotaryOS.Backend.Data;
using NotaryOS.Backend.Models;

namespace NotaryOS.Backend.Services;

public interface IAuditService
{
    Task LogAsync(int? userId, string action, string entityType, int? entityId, object? oldValue = null, object? newValue = null);
}

public class AuditService : IAuditService
{
    private readonly AppDbContext _context;

    public AuditService(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(int? userId, string action, string entityType, int? entityId, object? oldValue = null, object? newValue = null)
    {
        var options = new System.Text.Json.JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles,
            WriteIndented = false
        };

        var log = new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValue != null ? System.Text.Json.JsonSerializer.Serialize(oldValue, options) : null,
            NewValues = newValue != null ? System.Text.Json.JsonSerializer.Serialize(newValue, options) : null,
            Timestamp = DateTime.Now
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
