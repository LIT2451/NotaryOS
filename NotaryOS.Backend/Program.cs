using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using NotaryOS.Backend.Data;
using NotaryOS.Backend.Services;
using NotaryOS.Backend.Hubs;
using QuestPDF.Infrastructure;

using System.IdentityModel.Tokens.Jwt;

QuestPDF.Settings.License = LicenseType.Community;
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình DbContext
var connectionString = Environment.GetEnvironmentVariable("NOTARYOS_DB_CONNECTION")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Missing database connection string. Set NOTARYOS_DB_CONNECTION or ConnectionStrings:DefaultConnection.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 0))));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();

// Đăng ký Services
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IPdfReportService, PdfReportService>();

// 2. Cấu hình Swagger hỗ trợ JWT
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "NOTARYOS API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// 3. Cấu hình Authentication JWT
var jwtToken = Environment.GetEnvironmentVariable("NOTARYOS_JWT_TOKEN")
    ?? builder.Configuration.GetSection("AppSettings:Token").Value;

if (string.IsNullOrWhiteSpace(jwtToken))
{
    throw new InvalidOperationException("Missing JWT token secret. Set NOTARYOS_JWT_TOKEN or AppSettings:Token.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtToken)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var dbContext = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var userIdClaim = context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out int userId))
                {
                    // Lấy user trực tiếp không cần Include để tối ưu tốc độ
                    var user = await dbContext.Users.FindAsync(userId);
                    // Nếu user bị xóa hoặc bị khóa -> từ chối token ngay lập tức
                    if (user == null || user.IsLocked)
                    {
                        context.Fail("Tài khoản đã bị khóa hoặc không tồn tại.");
                    }
                }
            }
        };
    });

builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? new[] { "http://localhost:5173", "http://localhost:5174", "http://118.69.191.133", "http://congchungtanmai.io.vn", "https://congchungtanmai.io.vn" };

    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UsePathBase("/api");

// Middleware thứ tự cực kỳ quan trọng
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();
        var ex = exceptionHandlerFeature?.Error;
        if (ex != null) Console.WriteLine($"[ERROR] {DateTime.Now}: {ex}");

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            message = "Lỗi hệ thống nội bộ.",
            detail = app.Environment.IsDevelopment() ? ex?.Message : null
        });
    });
});

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<InvoiceHub>("/invoiceHub");

// Thực thi DbSeeder
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Tạm tắt Migrate tự động khi start để tránh xung đột bảng vật lý gây crash 500.30 trên VPS
    // await dbContext.Database.MigrateAsync();
    await NotaryOS.Backend.Data.DbSeeder.SeedRbacAsync(scope.ServiceProvider);
}

app.Run();
