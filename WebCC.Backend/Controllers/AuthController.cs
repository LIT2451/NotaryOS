using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebCC.Backend.Data;
using WebCC.Backend.Models;

namespace WebCC.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UserDto request)
    {
        try 
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest("Tên đăng nhập đã tồn tại.");

            var passwordError = ValidatePassword(request.Password);
            if (passwordError != null)
                return BadRequest(passwordError);

            var user = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                RoleId = request.RoleId ?? 2 // Mặc định là Staff
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok("Đăng ký thành công.");
        }
        catch (Exception ex) 
        {
            return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UserDto request)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .ThenInclude(r => r!.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return BadRequest("Sai tên đăng nhập hoặc mật khẩu.");

            if (user.IsLocked)
                return BadRequest("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.");

            var token = CreateToken(user);
            var permissions = user.Role?.RolePermissions.Select(rp => rp.PermissionId).ToList() ?? new List<string>();

            return Ok(new { 
                Token = token, 
                User = new { user.Id, user.Username, user.FullName, Role = user.Role?.RoleName, Permissions = permissions } 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi trong quá trình đăng nhập");
            return StatusCode(500, $"Lỗi đăng nhập: {ex.Message}");
        }
    }

    [HttpGet("me"), Authorize]
    public async Task<IActionResult> GetMe()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null) return NotFound();

        return Ok(new {
            user.Id,
            user.Username,
            user.FullName,
            Role = user.Role?.RoleName,
            user.CreatedAt
        });
    }

    [HttpPut("profile"), Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.FullName = request.FullName?.Trim() ?? user.FullName;
        await _context.SaveChangesAsync();

        return Ok(new { user.Id, user.FullName });
    }

    [HttpPut("change-password"), Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
        {
            return BadRequest("Mật khẩu cũ không chính xác.");
        }

        var passwordError = ValidatePassword(request.NewPassword);
        if (passwordError != null)
            return BadRequest(passwordError);

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok("Đổi mật khẩu thành công.");
    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim> {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "Staff")
        };

        var permissions = user.Role?.RolePermissions.Select(rp => rp.PermissionId).ToList() ?? new List<string>();
        foreach (var perm in permissions)
        {
            claims.Add(new Claim("Permission", perm));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration.GetSection("AppSettings:Token").Value!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string? ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return "Mật khẩu phải có ít nhất 8 ký tự.";

        if (!System.Text.RegularExpressions.Regex.IsMatch(password, @"[A-Z]"))
            return "Mật khẩu phải chứa ít nhất một chữ cái viết hoa.";

        if (!System.Text.RegularExpressions.Regex.IsMatch(password, @"[a-z]"))
            return "Mật khẩu phải chứa ít nhất một chữ cái viết thường.";

        if (!System.Text.RegularExpressions.Regex.IsMatch(password, @"[0-9]"))
            return "Mật khẩu phải chứa ít nhất một chữ số.";

        if (!System.Text.RegularExpressions.Regex.IsMatch(password, @"[\W_]"))
            return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@, #, $, %, ...).";

        return null;
    }
}

public class UserDto {
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public int? RoleId { get; set; }
}

public class UpdateProfileRequest
{
    public string? FullName { get; set; }
}

public class ChangePasswordRequest
{
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
