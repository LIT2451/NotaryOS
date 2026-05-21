using Microsoft.EntityFrameworkCore;
using NotaryOS.Backend.Models;

namespace NotaryOS.Backend.Data;

public static class DbSeeder
{
    public static async Task SeedRbacAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var permissions = new List<Permission>
        {
            new Permission { Id = "Invoices.View", PermissionName = "Xem hóa đơn của mình", Description = "Xem danh sách hóa đơn do mình tạo." },
            new Permission { Id = "Invoices.ViewAll", PermissionName = "Xem tất cả hóa đơn", Description = "Xem danh sách toàn bộ hóa đơn trên hệ thống." },
            new Permission { Id = "Invoices.Create", PermissionName = "Tạo hóa đơn", Description = "Thêm mới hóa đơn." },
            new Permission { Id = "Invoices.Edit", PermissionName = "Sửa hóa đơn của mình", Description = "Chỉnh sửa hóa đơn do mình tạo." },
            new Permission { Id = "Invoices.EditAll", PermissionName = "Sửa tất cả hóa đơn", Description = "Chỉnh sửa hóa đơn của người khác." },
            new Permission { Id = "Invoices.Delete", PermissionName = "Xóa hóa đơn của mình", Description = "Xóa hóa đơn do mình tạo." },
            new Permission { Id = "Invoices.DeleteAll", PermissionName = "Xóa tất cả hóa đơn", Description = "Xóa hóa đơn của người khác." },
            new Permission { Id = "Invoices.Export", PermissionName = "Xuất file hóa đơn", Description = "Xuất Excel và PDF hóa đơn." },
            new Permission { Id = "Stats.View", PermissionName = "Xem thống kê", Description = "Xem dashboard thống kê doanh thu." },
            new Permission { Id = "Users.Manage", PermissionName = "Quản lý nhân viên", Description = "Thêm, sửa, xóa, đặt lại mật khẩu nhân viên." },
            new Permission { Id = "Roles.Manage", PermissionName = "Quản lý vai trò", Description = "Quản lý Role và gán quyền." },
            new Permission { Id = "ServiceTypes.Manage", PermissionName = "Quản lý loại dịch vụ", Description = "Thêm, sửa, xóa loại dịch vụ." }
        };

        // 1. Dọn dẹp: Xóa các quyền cũ không còn trong danh sách mới
        var newPermissionIds = permissions.Select(p => p.Id).ToList();
        var oldPermissions = await context.Permissions
            .Where(p => !newPermissionIds.Contains(p.Id))
            .ToListAsync();
        
        if (oldPermissions.Any())
        {
            context.Permissions.RemoveRange(oldPermissions);
            await context.SaveChangesAsync();
            Console.WriteLine($"[SEEDER] Removed {oldPermissions.Count} legacy permissions.");
        }

        // 2. Cập nhật hoặc thêm mới các quyền trong danh sách
        foreach (var p in permissions)
        {
            var existing = await context.Permissions.FindAsync(p.Id);
            if (existing == null)
            {
                context.Permissions.Add(p);
            }
            else
            {
                existing.PermissionName = p.PermissionName;
                existing.Description = p.Description;
            }
        }
        await context.SaveChangesAsync();

        // Ensure roles exist
        var adminRole = await context.Roles.Include(r => r.RolePermissions).FirstOrDefaultAsync(r => r.Id == 1 || r.RoleName == "Admin");
        if (adminRole == null)
        {
            adminRole = new Role { Id = 1, RoleName = "Admin" };
            context.Roles.Add(adminRole);
            await context.SaveChangesAsync();
        }

        var staffRole = await context.Roles.Include(r => r.RolePermissions).FirstOrDefaultAsync(r => r.Id == 2 || r.RoleName == "Staff");
        if (staffRole == null)
        {
            staffRole = new Role { Id = 2, RoleName = "Staff" };
            context.Roles.Add(staffRole);
            await context.SaveChangesAsync();
        }

        var managerRole = await context.Roles.Include(r => r.RolePermissions).FirstOrDefaultAsync(r => r.Id == 3 || r.RoleName == "Manager");
        if (managerRole == null)
        {
            managerRole = new Role { Id = 3, RoleName = "Manager" };
            context.Roles.Add(managerRole);
            await context.SaveChangesAsync();
        }

        // 3. Tự động "vá" quyền cho tất cả các vai trò hiện có
        var allRoles = await context.Roles.Include(r => r.RolePermissions).ToListAsync();
        foreach (var role in allRoles)
        {
            // Nếu là Admin, gán tất cả các quyền
            if (role.Id == 1 || role.RoleName == "Admin")
            {
                foreach (var p in permissions)
                {
                    if (!role.RolePermissions.Any(rp => rp.PermissionId == p.Id))
                    {
                        role.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = p.Id });
                    }
                }
            }
            // Nếu vai trò khác (như Staff, Manager) và đang trống quyền, gán các quyền cơ bản
            else if (!role.RolePermissions.Any())
            {
                var staffPermissions = new List<string> { "Invoices.View", "Invoices.Create", "Invoices.Edit", "Invoices.Export", "Stats.View" };
                
                if (role.Id == 3 || role.RoleName == "Manager")
                {
                    staffPermissions.Add("ServiceTypes.Manage");
                }

                foreach (var sp in staffPermissions)
                {
                    role.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = sp });
                }
                Console.WriteLine($"[SEEDER] Automatically assigned basic permissions to Role: {role.RoleName}");
            }
        }

        await context.SaveChangesAsync();
        
        // 4. Seed Service Types if empty
        await SeedServiceTypesAsync(context);

        Console.WriteLine("[SEEDER] RBAC Seed completed successfully.");
    }

    private static async Task SeedServiceTypesAsync(AppDbContext context)
    {
        if (await context.ServiceTypes.AnyAsync()) return;

        var serviceTypes = new List<ServiceType>
        {
            // Công chứng
            new ServiceType { Category = "CongChung", TypeName = "Hợp đồng Mua bán", Description = "Công chứng hợp đồng mua bán tài sản, bất động sản." },
            new ServiceType { Category = "CongChung", TypeName = "Hợp đồng Tặng cho", Description = "Công chứng hợp đồng tặng cho tài sản." },
            new ServiceType { Category = "CongChung", TypeName = "Hợp đồng Thế chấp", Description = "Công chứng hợp đồng thế chấp tài sản." },
            new ServiceType { Category = "CongChung", TypeName = "Văn bản Khai nhận di sản", Description = "Công chứng văn bản khai nhận, thỏa thuận phân chia di sản." },
            new ServiceType { Category = "CongChung", TypeName = "Hợp đồng Ủy quyền", Description = "Công chứng hợp đồng, giấy ủy quyền." },
            new ServiceType { Category = "CongChung", TypeName = "Công chứng Di chúc", Description = "Công chứng bản di chúc." },
            
            // Chứng thực
            new ServiceType { Category = "SaoY", TypeName = "Chứng thực Bản sao (Sao y)", Description = "Chứng thực bản sao từ bản chính." },
            new ServiceType { Category = "ChungThuc", TypeName = "Chứng thực Chữ ký", Description = "Chứng thực chữ ký trong các giấy tờ, văn bản." },
            new ServiceType { Category = "ChungThuc", TypeName = "Chứng thực Hợp đồng thuê nhà", Description = "Chứng thực hợp đồng thuê nhà, mượn tài sản." },
            new ServiceType { Category = "ChungThuc", TypeName = "Chứng thực Sơ yếu lý lịch", Description = "Chứng thực chữ ký trên sơ yếu lý lịch." }
        };

        context.ServiceTypes.AddRange(serviceTypes);
        await context.SaveChangesAsync();
        Console.WriteLine($"[SEEDER] Added {serviceTypes.Count} sample service types.");
    }
}
