using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using WebCC.Backend.Controllers;
using WebCC.Backend.Data;
using WebCC.Backend.Models;
using Xunit;

namespace WebCC.Backend.Tests
{
    // Dummy Logger
    public class DummyLogger<T> : ILogger<T>
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(LogLevel logLevel) => true;
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter) { }
    }

    public class AuthControllerTests
    {
        private AppDbContext BuildContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        private AuthController BuildController(AppDbContext context, int userId = 1)
        {
            var configBuilder = new ConfigurationBuilder();
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "AppSettings:Token", "super-secret-key-that-is-at-least-256-bits-long-1234567890" }
            });
            var configuration = configBuilder.Build();

            var controller = new AuthController(context, configuration, new DummyLogger<AuthController>());

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            return controller;
        }

        [Fact]
        public async Task Register_FailsWithWeakPassword()
        {
            await using var context = BuildContext(nameof(Register_FailsWithWeakPassword));
            var controller = BuildController(context);

            var request = new UserDto { Username = "test1", Password = "weakpassword", FullName = "Test" };
            var result = await controller.Register(request);
            
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Mật khẩu phải", badRequest.Value?.ToString() ?? "");
        }

        [Fact]
        public async Task Register_SucceedsWithStrongPassword()
        {
            await using var context = BuildContext(nameof(Register_SucceedsWithStrongPassword));
            var controller = BuildController(context);

            var request = new UserDto { Username = "test2", Password = "StrongPassword123!", FullName = "Test" };
            var result = await controller.Register(request);
            
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Đăng ký thành công.", okResult.Value);

            var user = await context.Users.FirstOrDefaultAsync(u => u.Username == "test2");
            Assert.NotNull(user);
        }

        [Fact]
        public async Task ChangePassword_FailsWithWeakPassword()
        {
            await using var context = BuildContext(nameof(ChangePassword_FailsWithWeakPassword));
            context.Users.Add(new User 
            { 
                Id = 1, 
                Username = "admin", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPassword123!") 
            });
            await context.SaveChangesAsync();

            var controller = BuildController(context, userId: 1);

            // Change to a weak password - should now fail due to our fix
            var request = new ChangePasswordRequest { OldPassword = "OldPassword123!", NewPassword = "1" };
            var result = await controller.ChangePassword(request);
            
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Mật khẩu phải", badRequest.Value?.ToString() ?? "");
        }
    }
}
