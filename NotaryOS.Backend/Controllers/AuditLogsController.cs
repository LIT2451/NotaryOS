using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotaryOS.Backend.Data;
using NotaryOS.Backend.Filters;
using NotaryOS.Backend.Models;

namespace NotaryOS.Backend.Controllers;

[HasPermission("System.Manage")]
[Route("api/[controller]")]
[ApiController]
public class AuditLogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditLogsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuditLog>>> GetLogs()
    {
        return await _context.AuditLogs
            .Include(a => a.User)
            .OrderByDescending(a => a.Timestamp)
            .Take(100) // Giới hạn 100 log gần nhất
            .ToListAsync();
    }
}
