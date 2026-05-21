using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebCC.Backend.Data;
using WebCC.Backend.Models;
using WebCC.Backend.Filters;

namespace WebCC.Backend.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class PermissionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PermissionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [HasPermission("Roles.Manage")]
    public async Task<ActionResult<IEnumerable<Permission>>> GetPermissions()
    {
        return await _context.Permissions.OrderBy(p => p.Id).ToListAsync();
    }
}
