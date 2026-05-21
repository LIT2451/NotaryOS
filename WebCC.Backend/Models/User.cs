namespace WebCC.Backend.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public int? RoleId { get; set; }
    public Role? Role { get; set; }
    public bool IsLocked { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}
