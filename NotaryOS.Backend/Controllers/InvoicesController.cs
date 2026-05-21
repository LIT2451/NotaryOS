using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using NotaryOS.Backend.Data;
using NotaryOS.Backend.Hubs;
using NotaryOS.Backend.Models;
using NotaryOS.Backend.Services;
using NotaryOS.Backend.Filters;

namespace NotaryOS.Backend.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class InvoicesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<InvoiceHub> _hubContext;
    private readonly ILogger<InvoicesController> _logger;
    private readonly IAuditService _auditService;
    private readonly IPdfReportService _pdfService;

    public InvoicesController(
        AppDbContext context,
        IHubContext<InvoiceHub> hubContext,
        ILogger<InvoicesController> logger,
        IAuditService auditService,
        IPdfReportService pdfService)
    {
        _context = context;
        _hubContext = hubContext;
        _logger = logger;
        _auditService = auditService;
        _pdfService = pdfService;
    }

    [HttpGet("next-number")]
    public async Task<ActionResult> GetNextNumber([FromQuery] int serviceTypeId)
    {
        var serviceType = await _context.ServiceTypes.FindAsync(serviceTypeId);
        if (serviceType == null) return BadRequest("Loại dịch vụ không tồn tại.");

        var prefix = serviceType.Category switch
        {
            "ChungThuc" => "CT",
            "SaoY" => "SY",
            _ => "CC"
        };
        var currentDate = DateTime.Now;
        var currentYear = currentDate.Year;
        
        string yearPrefix;
        int digitCount = 6;

        if (prefix == "SY")
        {
            yearPrefix = $"{prefix}-{currentYear}-{currentDate:ddMM}-";
            digitCount = 3;
        }
        else
        {
            yearPrefix = $"{prefix}-{currentYear}-";
        }

        var hasAny = await _context.Invoices.AnyAsync(i => i.InvoiceNumber.StartsWith(yearPrefix) && !i.IsDeleted);
        var nextNumber = await GenerateInvoiceNumberAsync(yearPrefix, digitCount);

        return Ok(new { nextNumber, isFirst = !hasAny });
    }

    // Kiểm tra số hợp đồng có tồn tại trong DB chưa
    [HttpGet("check-number")]
    public async Task<ActionResult> CheckInvoiceNumber([FromQuery] string invoiceNumber)
    {
        if (string.IsNullOrWhiteSpace(invoiceNumber))
            return BadRequest("Số hợp đồng không được để trống.");

        var exists = await _context.Invoices
            .AnyAsync(i => i.InvoiceNumber == invoiceNumber.Trim() && !i.IsDeleted);

        return Ok(new { exists, invoiceNumber = invoiceNumber.Trim() });
    }

    [HttpGet("export")]
    [HasPermission("Invoices.Export")]
    public async Task<IActionResult> ExportToExcel([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var query = _context.Invoices
            .Include(i => i.ServiceType)
            .Include(i => i.User)
            .Where(i => !i.IsDeleted)
            .AsQueryable();

        if (startDate.HasValue)
        {
            var start = startDate.Value.Date;
            query = query.Where(i => i.NotaryDate >= start);
        }

        if (endDate.HasValue)
        {
            var end = endDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(i => i.NotaryDate <= end);
        }

        var invoices = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();

        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("Báo cáo Hóa đơn");
            var currentRow = 1;

            worksheet.Cell(currentRow, 1).Value = "STT";
            worksheet.Cell(currentRow, 2).Value = "Số Hóa đơn";
            worksheet.Cell(currentRow, 3).Value = "Khách hàng";
            worksheet.Cell(currentRow, 4).Value = "CCCD/CMND";
            worksheet.Cell(currentRow, 5).Value = "Email";
            worksheet.Cell(currentRow, 6).Value = "Số tiền (VNĐ)";
            worksheet.Cell(currentRow, 7).Value = "Ngân hàng";
            worksheet.Cell(currentRow, 8).Value = "Số tài khoản/Thẻ";
            worksheet.Cell(currentRow, 9).Value = "Loại Dịch vụ";
            worksheet.Cell(currentRow, 10).Value = "Người nhập";
            worksheet.Cell(currentRow, 11).Value = "Ngày công chứng";
            worksheet.Cell(currentRow, 12).Value = "Ngày tạo hệ thống";

            var headerRange = worksheet.Range(1, 1, 1, 12);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

            foreach (var inv in invoices)
            {
                currentRow++;
                worksheet.Cell(currentRow, 1).Value = currentRow - 1;
                worksheet.Cell(currentRow, 2).Value = inv.InvoiceNumber;
                worksheet.Cell(currentRow, 3).Value = inv.ClientName;
                worksheet.Cell(currentRow, 4).Value = inv.ClientIdNumber;
                worksheet.Cell(currentRow, 5).Value = inv.ClientEmail;
                worksheet.Cell(currentRow, 6).Value = inv.Amount;
                worksheet.Cell(currentRow, 7).Value = inv.BankName;
                worksheet.Cell(currentRow, 8).Value = inv.BankAccount;
                worksheet.Cell(currentRow, 9).Value = inv.ServiceType?.TypeName;
                worksheet.Cell(currentRow, 10).Value = inv.User?.FullName;
                worksheet.Cell(currentRow, 11).Value = inv.NotaryDate.ToString("dd/MM/yyyy");
                worksheet.Cell(currentRow, 12).Value = inv.CreatedAt.ToString("dd/MM/yyyy HH:mm");
            }

            worksheet.Columns().AdjustToContents();

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                var content = stream.ToArray();

                return File(
                    content,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"Bao-cao-NOTARYOS-{DateTime.Now:yyyyMMddHHmm}.xlsx");
            }
        }
    }

    [HttpGet("export-pdf")]
    [HasPermission("Invoices.Export")]
    public async Task<IActionResult> ExportToPdf([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var query = _context.Invoices
            .Include(i => i.ServiceType)
            .Include(i => i.User)
            .Where(i => !i.IsDeleted)
            .AsQueryable();

        if (startDate.HasValue)
        {
            var start = startDate.Value.Date;
            query = query.Where(i => i.NotaryDate >= start);
        }

        if (endDate.HasValue)
        {
            var end = endDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(i => i.NotaryDate <= end);
        }

        var invoices = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        
        var title = "BÁO CÁO DANH SÁCH HÓA ĐƠN";
        var pdfContent = _pdfService.GenerateInvoiceReport(invoices, title, startDate, endDate);

        return File(
            pdfContent,
            "application/pdf",
            $"Bao-cao-NOTARYOS-{DateTime.Now:yyyyMMddHHmm}.pdf");
    }

    [HttpGet]
    [HasPermission("Invoices.View")]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var canViewAll = User.IsInRole("Admin") || User.Claims.Any(c => c.Type == "Permission" && (c.Value == "Invoices.ViewAll" || c.Value == "Invoices.FullControl"));

        var query = _context.Invoices.Include(i => i.ServiceType).AsQueryable();

        if (!canViewAll)
        {
            query = query.Where(i => i.CreatedBy == userId);
        }

        if (startDate.HasValue)
        {
            var start = startDate.Value.Date;
            query = query.Where(i => i.NotaryDate >= start);
        }

        if (endDate.HasValue)
        {
            var end = endDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(i => i.NotaryDate <= end);
        }

        return await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
    }

    [HttpPost]
    [HasPermission("Invoices.Create")]
    public async Task<ActionResult<Invoice>> PostInvoice([FromForm] CreateInvoiceRequest request, IFormFile? idCardFront, IFormFile? idCardBack)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var serviceType = await _context.ServiceTypes.FindAsync(request.ServiceTypeId);
        if (serviceType == null) return BadRequest("Loại dịch vụ không tồn tại.");

        var prefix = serviceType.Category switch
        {
            "ChungThuc" => "CT",
            "SaoY" => "SY",
            _ => "CC"
        };
        
        var notaryDate = request.NotaryDate ?? DateTime.Now;
        var currentYear = notaryDate.Year;
        
        string yearPrefix;
        int digitCount = 6;

        if (prefix == "SY")
        {
            yearPrefix = $"{prefix}-{currentYear}-{notaryDate:ddMM}-";
            digitCount = 3;
        }
        else
        {
            yearPrefix = $"{prefix}-{currentYear}-";
        }

        string invoiceNumber;
        if (!string.IsNullOrWhiteSpace(request.InvoiceNumber))
        {
            var requestedNum = request.InvoiceNumber.Trim();
            var existingInvoice = await _context.Invoices
                .FirstOrDefaultAsync(i => i.InvoiceNumber == requestedNum);

            if (existingInvoice == null)
            {
                invoiceNumber = requestedNum;
            }
            else
            {
                if (existingInvoice.IsDeleted)
                {
                    _context.Invoices.Remove(existingInvoice);
                    await _context.SaveChangesAsync();
                    invoiceNumber = requestedNum;
                }
                else
                {
                    invoiceNumber = await GenerateInvoiceNumberAsync(yearPrefix, digitCount);
                }
            }
        }
        else
        {
            invoiceNumber = await GenerateInvoiceNumberAsync(yearPrefix, digitCount);
        }

        var invoice = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            ClientName = request.ClientName,
            ClientIdNumber = request.ClientIdNumber,
            ClientEmail = request.ClientEmail,
            Amount = request.Amount,
            ServiceTypeId = request.ServiceTypeId,
            NotaryDate = request.NotaryDate ?? DateTime.Now,
            BankName = request.BankName,
            BankAccount = request.BankAccount,
            CreatedBy = userId
        };

        // Xử lý upload ảnh
        if (idCardFront != null) invoice.IdCardFrontPath = await SaveFileAsync(idCardFront);
        if (idCardBack != null) invoice.IdCardBackPath = await SaveFileAsync(idCardBack);

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Invoice created: id={InvoiceId}, number={InvoiceNumber}, by={UserId}",
            invoice.Id,
            invoice.InvoiceNumber,
            userId);

        await BroadcastInvoiceChanged("created", invoice.Id);

        return Ok(invoice);
    }

    [HttpPut("{id:int}")]
    [HasPermission("Invoices.Edit")]
    public async Task<ActionResult<Invoice>> PutInvoice(int id, [FromForm] UpdateInvoiceRequest request, IFormFile? idCardFront, IFormFile? idCardBack)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var canEditAll = User.IsInRole("Admin") || User.Claims.Any(c => c.Type == "Permission" && (c.Value == "Invoices.FullControl" || c.Value == "Invoices.EditAll"));

        var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id);
        if (invoice == null)
        {
            return NotFound("Không tìm thấy hóa đơn.");
        }

        if (!canEditAll && invoice.CreatedBy != userId)
        {
            return Forbid();
        }

        var newServiceType = await _context.ServiceTypes.FirstOrDefaultAsync(s => s.Id == request.ServiceTypeId);
        if (newServiceType == null)
        {
            return BadRequest("Loại dịch vụ không hợp lệ.");
        }

        var oldServiceType = await _context.ServiceTypes.FirstOrDefaultAsync(s => s.Id == invoice.ServiceTypeId);
        if (oldServiceType != null && newServiceType.Category != oldServiceType.Category)
        {
            return BadRequest("Không thể thay đổi loại dịch vụ (nhóm dịch vụ) của hóa đơn đã được tạo để đảm bảo tính nhất quán của mã hợp đồng.");
        }

        var duplicated = await _context.Invoices.AnyAsync(i => i.InvoiceNumber == request.InvoiceNumber && i.Id != id);
        if (duplicated)
        {
            return BadRequest("Số hóa đơn này đã tồn tại trong hệ thống.");
        }

        var oldValues = new { invoice.InvoiceNumber, invoice.ClientName, invoice.ClientIdNumber, invoice.ClientEmail, invoice.Amount, invoice.ServiceTypeId, invoice.NotaryDate };

        invoice.InvoiceNumber = request.InvoiceNumber?.Trim() ?? string.Empty;
        invoice.ClientName = request.ClientName?.Trim();
        invoice.ClientIdNumber = request.ClientIdNumber?.Trim();
        invoice.ClientEmail = request.ClientEmail?.Trim();
        invoice.Amount = request.Amount;
        invoice.ServiceTypeId = request.ServiceTypeId;
        invoice.BankName = request.BankName?.Trim();
        invoice.BankAccount = request.BankAccount?.Trim();
        invoice.NotaryDate = request.NotaryDate ?? invoice.NotaryDate;
        invoice.IsDeleted = false;
        invoice.UpdatedAt = DateTime.Now;

        if (idCardFront != null) invoice.IdCardFrontPath = await SaveFileAsync(idCardFront);
        if (idCardBack != null) invoice.IdCardBackPath = await SaveFileAsync(idCardBack);

        await _context.SaveChangesAsync();
        await _auditService.LogAsync(userId, "Updated", "Invoice", invoice.Id, oldValues, invoice);

        _logger.LogInformation(
            "Invoice updated: id={InvoiceId}, by={UserId}, oldNumber={OldNumber}, newNumber={NewNumber}, oldAmount={OldAmount}, newAmount={NewAmount}",
            invoice.Id,
            userId,
            oldValues.InvoiceNumber,
            invoice.InvoiceNumber,
            oldValues.Amount,
            invoice.Amount);

        await BroadcastInvoiceChanged("updated", invoice.Id);

        return Ok(invoice);
    }

    [HttpDelete("{id:int}")]
    [HasPermission("Invoices.Delete")]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var canDeleteAll = User.IsInRole("Admin") || User.Claims.Any(c => c.Type == "Permission" && (c.Value == "Invoices.FullControl" || c.Value == "Invoices.DeleteAll"));

        var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id);
        if (invoice == null)
        {
            return NotFound("Không tìm thấy hóa đơn.");
        }

        if (!canDeleteAll && invoice.CreatedBy != userId)
        {
            return Forbid("Bạn không có quyền xóa hóa đơn của người khác.");
        }

        var oldValues = new { invoice.InvoiceNumber, invoice.ClientName, invoice.ClientIdNumber, invoice.ClientEmail, invoice.Amount, invoice.ServiceTypeId, invoice.NotaryDate };
        
        invoice.ClientName = null;
        invoice.ClientIdNumber = null;
        invoice.ClientEmail = null;
        invoice.Amount = 0;
        invoice.BankName = null;
        invoice.BankAccount = null;
        invoice.IdCardFrontPath = null;
        invoice.IdCardBackPath = null;
        invoice.IsDeleted = true;
        invoice.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();
        await _auditService.LogAsync(userId, "Deleted", "Invoice", id, oldValues, null);

        _logger.LogInformation(
            "Invoice deleted: id={InvoiceId}, number={InvoiceNumber}, by={UserId}",
            invoice.Id,
            invoice.InvoiceNumber,
            userId);

        await BroadcastInvoiceChanged("deleted", invoice.Id);

        return NoContent();
    }

    [HttpGet("stats")]
    [HasPermission("Stats.View")]
    public async Task<IActionResult> GetStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var canViewAll = User.IsInRole("Admin") || User.Claims.Any(c => c.Type == "Permission" && c.Value == "Invoices.ViewAll");

        var query = _context.Invoices.Include(i => i.ServiceType).Where(i => !i.IsDeleted).AsQueryable();

        if (!canViewAll)
        {
            query = query.Where(i => i.CreatedBy == userId);
        }

        if (startDate.HasValue)
        {
            var start = startDate.Value.Date;
            query = query.Where(i => i.NotaryDate >= start);
        }

        if (endDate.HasValue)
        {
            var end = endDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(i => i.NotaryDate <= end);
        }

        var invoices = await query.ToListAsync();
        
        var totalAmount = invoices.Sum(i => i.Amount);
        var totalCount = invoices.Count;
        var uniqueClients = invoices.Select(i => i.ClientIdNumber).Distinct().Count();

        var countByService = invoices
            .Where(i => i.ServiceType != null)
            .GroupBy(i => i.ServiceType!.TypeName)
            .Select(g => new { ServiceType = g.Key, Count = g.Count() })
            .ToList();

        return Ok(new
        {
            TotalAmount = totalAmount,
            TotalCount = totalCount,
            UniqueClients = uniqueClients,
            CountByService = countByService
        });
    }

    private Task BroadcastInvoiceChanged(string action, int invoiceId)
    {
        return _hubContext.Clients.All.SendAsync("ReceiveInvoiceUpdate", action, invoiceId);
    }

    private async Task<string> SaveFileAsync(IFormFile file)
    {
        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "idcards");
        if (!Directory.Exists(uploadsRoot)) Directory.CreateDirectory(uploadsRoot);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsRoot, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/uploads/idcards/{fileName}";
    }

    private async Task<string> GenerateInvoiceNumberAsync(string yearPrefix, int digitCount)
    {
        var existingNumbers = await _context.Invoices
            .Where(i => i.InvoiceNumber.StartsWith(yearPrefix) && !i.IsDeleted)
            .Select(i => i.InvoiceNumber)
            .ToListAsync();

        var usedNumbers = existingNumbers
            .Select(n => {
                var parts = n.Split('-');
                var lastPart = parts.LastOrDefault();
                if (lastPart != null && int.TryParse(lastPart, out int num))
                    return num;
                return 0;
            })
            .Where(n => n > 0)
            .ToList();

        int maxNumber = usedNumbers.Any() ? usedNumbers.Max() : 0;
        int nextNumber = maxNumber + 1;

        string format = new string('0', digitCount);
        return $"{yearPrefix}{nextNumber.ToString(format)}";
    }
}

public class CreateInvoiceRequest
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public string? ClientIdNumber { get; set; }
    public string? ClientEmail { get; set; }
    public decimal Amount { get; set; }
    public int ServiceTypeId { get; set; }
    public DateTime? NotaryDate { get; set; }
    public string? BankName { get; set; }
    public string? BankAccount { get; set; }
}

public class UpdateInvoiceRequest
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public string? ClientIdNumber { get; set; }
    public string? ClientEmail { get; set; }
    public decimal Amount { get; set; }
    public int ServiceTypeId { get; set; }
    public DateTime? NotaryDate { get; set; }
    public string? BankName { get; set; }
    public string? BankAccount { get; set; }
}
