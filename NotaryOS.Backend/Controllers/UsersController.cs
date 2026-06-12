using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotaryOS.Backend.Data;
using NotaryOS.Backend.Models;
using NotaryOS.Backend.Services;
using NotaryOS.Backend.Filters;

namespace NotaryOS.Backend.Controllers;

[HasPermission("Users.Manage")]
[Route("[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuditService _auditService;

    public UsersController(AppDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetUsers()
    {
        return await _context.Users
            .Include(u => u.Role)
            .Select(u => new {
                u.Id,
                u.Username,
                u.FullName,
                u.RoleId,
                RoleName = u.Role != null ? u.Role.RoleName : "Staff",
                u.IsLocked,
                u.CreatedAt
            })
            .OrderBy(u => u.Username)
            .ToListAsync();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, UpdateUserRequest request)
    {
        var adminId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("Không tìm thấy người dùng.");

        var oldValues = new { user.FullName, user.RoleId };
        
        // Kiểm tra xem RoleId có hợp lệ không
        if (!await _context.Roles.AnyAsync(r => r.Id == request.RoleId))
        {
            return BadRequest("Vai trò (Role) không tồn tại hoặc không hợp lệ.");
        }

        user.FullName = request.FullName?.Trim() ?? user.FullName;
        user.RoleId = request.RoleId;

        await _context.SaveChangesAsync();
        
        var newValues = new { user.FullName, user.RoleId };
        await _auditService.LogAsync(adminId, "Updated", "User", id, oldValues, newValues);

        return Ok(user);
    }

    [HttpPut("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id)
    {
        var adminId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("Không tìm thấy người dùng.");

        // Mật khẩu mặc định sau khi reset là "123456"
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");
        
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(adminId, "ResetPassword", "User", id, null, null);

        return Ok("Mật khẩu đã được đặt lại thành 123456.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var adminId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        if (adminId == id) return BadRequest("Bạn không thể tự xóa chính mình.");

        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("Không tìm thấy người dùng.");

        // Kiểm tra xem user có hóa đơn nào không (nếu có thì không cho xóa hoặc xóa hết hóa đơn?)
        var hasInvoices = await _context.Invoices.AnyAsync(i => i.CreatedBy == id);
        if (hasInvoices) return BadRequest("Không thể xóa người dùng này vì họ đã có dữ liệu hóa đơn trên hệ thống.");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(adminId, "Deleted", "User", id, user, null);

        return Ok("Đã xóa người dùng thành công.");
    }

    [HttpPut("{id}/toggle-lock")]
    public async Task<IActionResult> ToggleLock(int id)
    {
        var adminId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("Không tìm thấy người dùng.");
        
        if (adminId == id) return BadRequest("Bạn không thể tự khóa chính mình.");

        user.IsLocked = !user.IsLocked;
        await _context.SaveChangesAsync();
        
        await _auditService.LogAsync(adminId, user.IsLocked ? "Locked" : "Unlocked", "User", id, null, null);

        return Ok(new { user.Id, user.IsLocked });
    }
}

public class UpdateUserRequest
{
    public string? FullName { get; set; }
    public int RoleId { get; set; }
}
