namespace WebCC.Backend.Models;

public class Permission
{
    public string Id { get; set; } = string.Empty; // e.g. "Invoices.View"
    public string PermissionName { get; set; } = string.Empty; // e.g. "Xem hóa đơn"
    public string? Description { get; set; }
    
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
