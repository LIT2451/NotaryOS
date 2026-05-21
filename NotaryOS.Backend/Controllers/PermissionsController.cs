using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotaryOS.Backend.Data;
using NotaryOS.Backend.Models;
using NotaryOS.Backend.Filters;

namespace NotaryOS.Backend.Controllers;

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
