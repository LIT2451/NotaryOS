using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebCC.Backend.Controllers;
using WebCC.Backend.Data;
using WebCC.Backend.Models;
using WebCC.Backend.Services;
using Xunit;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace WebCC.Backend.Tests
{
    public class DummyAuditService : IAuditService
    {
        public Task LogAsync(int? userId, string action, string entityType, int? entityId, object? oldValues, object? newValues)
        {
            return Task.CompletedTask;
        }
    }

    public class UsersControllerTests
    {
        private AppDbContext BuildContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            
            if (!context.Roles.Any())
            {
                context.Roles.Add(new Role { Id = 1, RoleName = "Admin" });
                context.Roles.Add(new Role { Id = 2, RoleName = "Staff" });
                context.SaveChanges();
            }

            return context;
        }

        private UsersController BuildController(AppDbContext context, int adminId = 1)
        {
            var controller = new UsersController(context, new DummyAuditService());

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, adminId.ToString()),
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            return controller;
        }

        [Fact]
        public async Task GetUsers_ReturnsAllUsers()
        {
            await using var context = BuildContext(nameof(GetUsers_ReturnsAllUsers));
            context.Users.Add(new User { Id = 1, Username = "admin", FullName = "Admin", RoleId = 1, PasswordHash = "hash" });
            context.Users.Add(new User { Id = 2, Username = "staff", FullName = "Staff", RoleId = 2, PasswordHash = "hash" });
            await context.SaveChangesAsync();

            var controller = BuildController(context);
            var result = await controller.GetUsers();

            var users = Assert.IsAssignableFrom<IEnumerable<object>>(result.Value);
            Assert.Equal(2, users.Count());
        }

        [Fact]
        public async Task ToggleLock_LocksAndUnlocksUser()
        {
            await using var context = BuildContext(nameof(ToggleLock_LocksAndUnlocksUser));
            context.Users.Add(new User { Id = 2, Username = "staff", IsLocked = false, PasswordHash = "hash" });
            await context.SaveChangesAsync();

            var controller = BuildController(context, adminId: 1);

            // Lock
            var result1 = await controller.ToggleLock(2);
            Assert.IsType<OkObjectResult>(result1);
            
            var user = await context.Users.FindAsync(2);
            Assert.True(user.IsLocked);

            // Unlock
            var result2 = await controller.ToggleLock(2);
            Assert.IsType<OkObjectResult>(result2);
            Assert.False(user.IsLocked);
        }

        [Fact]
        public async Task ToggleLock_ReturnsBadRequest_WhenLockingSelf()
        {
            await using var context = BuildContext(nameof(ToggleLock_ReturnsBadRequest_WhenLockingSelf));
            context.Users.Add(new User { Id = 1, Username = "admin", IsLocked = false, PasswordHash = "hash" });
            await context.SaveChangesAsync();

            var controller = BuildController(context, adminId: 1);

            var result = await controller.ToggleLock(1);
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Bạn không thể tự khóa chính mình.", badRequest.Value);
        }

        [Fact]
        public async Task DeleteUser_DeletesUser_WhenNoInvoices()
        {
            await using var context = BuildContext(nameof(DeleteUser_DeletesUser_WhenNoInvoices));
            context.Users.Add(new User { Id = 2, Username = "staff", PasswordHash = "hash" });
            await context.SaveChangesAsync();

            var controller = BuildController(context, adminId: 1);

            var result = await controller.DeleteUser(2);
            Assert.IsType<OkObjectResult>(result);

            var user = await context.Users.FindAsync(2);
            Assert.Null(user);
        }

        [Fact]
        public async Task DeleteUser_ReturnsBadRequest_WhenUserHasInvoices()
        {
            await using var context = BuildContext(nameof(DeleteUser_ReturnsBadRequest_WhenUserHasInvoices));
            context.Users.Add(new User { Id = 2, Username = "staff", PasswordHash = "hash" });
            context.Invoices.Add(new Invoice { Id = 1, InvoiceNumber = "123", CreatedBy = 2, ClientName = "A" });
            await context.SaveChangesAsync();

            var controller = BuildController(context, adminId: 1);

            var result = await controller.DeleteUser(2);
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Không thể xóa người dùng này vì họ đã có dữ liệu hóa đơn trên hệ thống.", badRequest.Value);

            var user = await context.Users.FindAsync(2);
            Assert.NotNull(user); // Still exists
        }

        [Fact]
        public async Task UpdateUser_UpdatesFullNameAndRole()
        {
            await using var context = BuildContext(nameof(UpdateUser_UpdatesFullNameAndRole));
            context.Users.Add(new User { Id = 2, Username = "staff", FullName = "Old Name", RoleId = 2, PasswordHash = "hash" });
            await context.SaveChangesAsync();

            var controller = BuildController(context, adminId: 1);

            var result = await controller.UpdateUser(2, new UpdateUserRequest { FullName = "New Name", RoleId = 1 });
            Assert.IsType<OkObjectResult>(result);

            var user = await context.Users.FindAsync(2);
            Assert.Equal("New Name", user.FullName);
            Assert.Equal(1, user.RoleId);
        }
    }
}
