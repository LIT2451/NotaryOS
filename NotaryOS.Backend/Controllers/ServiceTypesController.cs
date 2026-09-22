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
public class ServiceTypesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuditService _auditService;

    public ServiceTypesController(AppDbContext context, IAuditService auditService)
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
    public async Task<ActionResult<IEnumerable<ServiceType>>> GetServiceTypes()
    {
        return await _context.ServiceTypes
            .OrderBy(s => s.Id)
            .ToListAsync();
    }

    [HasPermission("ServiceTypes.Manage")]
    [HttpPost]
    public async Task<ActionResult<ServiceType>> CreateServiceType(ServiceTypeRequest request)
    {
        var adminId = GetCurrentUserId();
        
        var serviceType = new ServiceType
        {
            TypeName = request.TypeName.Trim(),
            Description = request.Description?.Trim(),
            Category = request.Category ?? "CongChung"
        };

        _context.ServiceTypes.Add(serviceType);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(adminId, "Created", "ServiceType", serviceType.Id, null, serviceType);

        return Ok(serviceType);
    }

    [HasPermission("ServiceTypes.Manage")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateServiceType(int id, ServiceTypeRequest request)
    {
        var adminId = GetCurrentUserId();
        
        var serviceType = await _context.ServiceTypes.FindAsync(id);
        if (serviceType == null) return NotFound("Không tìm thấy loại dịch vụ.");

        var oldValues = new { serviceType.TypeName, serviceType.Description };

        serviceType.TypeName = request.TypeName.Trim();
        serviceType.Description = request.Description?.Trim();
        serviceType.Category = request.Category ?? serviceType.Category;

        await _context.SaveChangesAsync();
        await _auditService.LogAsync(adminId, "Updated", "ServiceType", id, oldValues, serviceType);

        return Ok(serviceType);
    }

    [HasPermission("ServiceTypes.Manage")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServiceType(int id)
    {
        var adminId = GetCurrentUserId();
        
        var serviceType = await _context.ServiceTypes.FindAsync(id);
        if (serviceType == null) return NotFound("Không tìm thấy loại dịch vụ.");

        // Kiểm tra xem dịch vụ này có đang được sử dụng trong hóa đơn nào không
        var isUsed = await _context.Invoices.AnyAsync(i => i.ServiceTypeId == id);
        if (isUsed) return BadRequest("Không thể xóa loại dịch vụ này vì nó đang được sử dụng trong các hóa đơn hiện có.");

        _context.ServiceTypes.Remove(serviceType);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(adminId, "Deleted", "ServiceType", id, serviceType, null);

        return Ok("Đã xóa loại dịch vụ thành công.");
    }
}

public class ServiceTypeRequest
{
    public string TypeName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
}
