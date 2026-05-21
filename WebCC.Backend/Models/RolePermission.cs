namespace WebCC.Backend.Models;

public class RolePermission
{
    public int RoleId { get; set; }
    public Role? Role { get; set; }

    public string PermissionId { get; set; } = string.Empty;
    public Permission? Permission { get; set; }
}
