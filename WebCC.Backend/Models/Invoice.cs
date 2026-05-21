namespace WebCC.Backend.Models;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public string? ClientIdNumber { get; set; }
    public string? ClientEmail { get; set; }
    public decimal Amount { get; set; }
    public int? ServiceTypeId { get; set; }
    public ServiceType? ServiceType { get; set; }
    public DateTime NotaryDate { get; set; }
    public string? BankName { get; set; }
    public string? BankAccount { get; set; }
    public int? CreatedBy { get; set; }
    public User? User { get; set; }
    public string? IdCardFrontPath { get; set; }
    public string? IdCardBackPath { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}
