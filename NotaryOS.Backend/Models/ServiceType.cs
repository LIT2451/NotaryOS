namespace NotaryOS.Backend.Models;

public class ServiceType
{
    public int Id { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public string? Description { get; set; }
    // "CongChung" hoặc "ChungThuc"
    public string Category { get; set; } = "CongChung";
    [System.Text.Json.Serialization.JsonIgnore]
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}
