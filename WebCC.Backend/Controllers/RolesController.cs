using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebCC.Backend.Data;
using WebCC.Backend.Models;
using WebCC.Backend.Filters;
using WebCC.Backend.Services;

namespace WebCC.Backend.Controllers;

[Authorize]
[HasPermission("Roles.Manage")]
[Route("api/[controller]")]
[ApiController]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuditService _auditService;

    public RolesController(AppDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetRoles()
    {
        var roles = await _context.Roles
            .Include(r => r.RolePermissions)
            .ToListAsync();

        return Ok(roles.Select(r => new
        {
            r.Id,
            r.RoleName,
            Permissions = r.RolePermissions.Select(rp => rp.PermissionId).ToList()
        }));
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateRole(RoleRequest request)
    {
        var adminId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

        if (string.IsNullOrWhiteSpace(request.RoleName))
        {
            return BadRequest("Tên vai trò không được để trống.");
        }

        if (await _context.Roles.AnyAsync(r => r.RoleName == request.RoleName))
        {
            return BadRequest("Tên vai trò đã tồn tại.");
        }

        var role = new Role { RoleName = request.RoleName.Trim() };
        
        if (request.Permissions != null)
        {
            foreach (var perm in request.Permissions)
            {
                role.RolePermissions.Add(new RolePermission { PermissionId = perm });
            }
        }

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(adminId, "Created", "Role", role.Id, null, new { role.RoleName, request.Permissions });

        return Ok(new
        {
            role.Id,
            role.RoleName,
            Permissions = role.RolePermissions.Select(rp => rp.PermissionId).ToList()
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRole(int id, RoleRequest request)
    {
        var adminId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

        if (id == 1) // Ngăn cấm sửa role Admin mặc định nếu muốn
        {
            return BadRequest("Không thể sửa vai trò Admin hệ thống.");
        }

        var role = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return NotFound("Không tìm thấy vai trò.");

        if (string.IsNullOrWhiteSpace(request.RoleName))
        {
            return BadRequest("Tên vai trò không được để trống.");
        }

        var oldValues = new { role.RoleName, Permissions = role.RolePermissions.Select(rp => rp.PermissionId).ToList() };

        role.RoleName = request.RoleName.Trim();
        
        // Cập nhật permissions
        _context.RolePermissions.RemoveRange(role.RolePermissions);
        
        if (request.Permissions != null)
        {
            foreach (var perm in request.Permissions)
            {
                role.RolePermissions.Add(new RolePermission { PermissionId = perm });
            }
        }

        await _context.SaveChangesAsync();
        await _auditService.LogAsync(adminId, "Updated", "Role", id, oldValues, new { role.RoleName, request.Permissions });

        return Ok(new
        {
            role.Id,
            role.RoleName,
            Permissions = role.RolePermissions.Select(rp => rp.PermissionId).ToList()
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var adminId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

        if (id == 1 || id == 2)
        {
            return BadRequest("Không thể xóa vai trò mặc định của hệ thống.");
        }

        var role = await _context.Roles.FindAsync(id);
        if (role == null) return NotFound("Không tìm thấy vai trò.");

        var isUsed = await _context.Users.AnyAsync(u => u.RoleId == id);
        if (isUsed) return BadRequest("Không thể xóa vai trò này vì đang có người dùng sử dụng.");

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(adminId, "Deleted", "Role", id, role, null);

        return Ok("Đã xóa vai trò thành công.");
    }
}

public class RoleRequest
{
    public string RoleName { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new List<string>();
}
