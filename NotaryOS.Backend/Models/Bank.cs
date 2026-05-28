namespace NotaryOS.Backend.Models;

public class Bank
{
    public int Id { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
}
