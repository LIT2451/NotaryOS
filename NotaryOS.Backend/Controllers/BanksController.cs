using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotaryOS.Backend.Data;
using NotaryOS.Backend.Models;
using NotaryOS.Backend.Services;
using NotaryOS.Backend.Filters;

namespace NotaryOS.Backend.Controllers;

[Authorize]
[Route("[controller]")]
[ApiController]
public class BanksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuditService _auditService;

    public BanksController(AppDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("nameid")?.Value
            ?? User.FindFirst("sub")?.Value;
        return int.TryParse(idClaim, out var id) ? id : 0;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Bank>>> GetBanks()
    {
        return await _context.Banks
            .OrderBy(b => b.BankName)
            .ToListAsync();
    }

    [HasPermission("Banks.Manage")]
    [HttpPost]
    public async Task<ActionResult<Bank>> CreateBank(BankRequest request)
    {
        var adminId = GetCurrentUserId();
        
        if (string.IsNullOrWhiteSpace(request.BankName))
        {
            return BadRequest("Tên ngân hàng không được để trống.");
        }

        var bank = new Bank
        {
            BankName = request.BankName.Trim(),
            Code = request.Code?.Trim(),
            Description = request.Description?.Trim()
        };

        _context.Banks.Add(bank);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(adminId, "Created", "Bank", bank.Id, null, bank);

        return Ok(bank);
    }

    [HasPermission("Banks.Manage")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBank(int id, BankRequest request)
    {
        var adminId = GetCurrentUserId();
        
        if (string.IsNullOrWhiteSpace(request.BankName))
        {
            return BadRequest("Tên ngân hàng không được để trống.");
        }

        var bank = await _context.Banks.FindAsync(id);
        if (bank == null) return NotFound("Không tìm thấy ngân hàng.");

        var oldValues = new { bank.BankName, bank.Code, bank.Description };

        bank.BankName = request.BankName.Trim();
        bank.Code = request.Code?.Trim();
        bank.Description = request.Description?.Trim();

        await _context.SaveChangesAsync();
        await _auditService.LogAsync(adminId, "Updated", "Bank", id, oldValues, bank);

        return Ok(bank);
    }

    [HasPermission("Banks.Manage")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBank(int id)
    {
        var adminId = GetCurrentUserId();
        
        var bank = await _context.Banks.FindAsync(id);
        if (bank == null) return NotFound("Không tìm thấy ngân hàng.");

        // Kiểm tra xem ngân hàng này có đang được sử dụng trong hóa đơn nào không
        var isUsed = await _context.Invoices.AnyAsync(i => i.BankName == bank.BankName);
        if (isUsed)
        {
            return BadRequest("Không thể xóa ngân hàng này vì đang có hóa đơn trong lịch sử sử dụng tên ngân hàng này.");
        }

        _context.Banks.Remove(bank);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(adminId, "Deleted", "Bank", id, bank, null);

        return Ok("Đã xóa ngân hàng thành công.");
    }
}

public class BankRequest
{
    public string BankName { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
}
