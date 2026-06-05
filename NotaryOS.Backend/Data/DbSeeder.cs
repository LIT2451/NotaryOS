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
            new Permission { Id = "ServiceTypes.Manage", PermissionName = "Quản lý loại dịch vụ", Description = "Thêm, sửa, xóa loại dịch vụ." },
            new Permission { Id = "Banks.Manage", PermissionName = "Quản lý ngân hàng", Description = "Thêm, sửa, xóa danh sách ngân hàng." }
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
                var staffPermissions = new List<string> { "Invoices.View", "Invoices.Create", "Invoices.Edit", "Invoices.Delete", "Invoices.Export", "Stats.View" };
                
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
        
        // 5. Seed Banks if empty
        await SeedBanksAsync(context);

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

    private static async Task SeedBanksAsync(AppDbContext context)
    {
        if (await context.Banks.AnyAsync()) return;

        var banks = new List<Bank>
        {
            new Bank { BankName = "Vietcombank", Code = "VCB", Description = "Ngân hàng TMCP Ngoại thương Việt Nam" },
            new Bank { BankName = "VietinBank", Code = "CTG", Description = "Ngân hàng TMCP Công thương Việt Nam" },
            new Bank { BankName = "BIDV", Code = "BID", Description = "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam" },
            new Bank { BankName = "Agribank", Code = "AGR", Description = "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam" },
            new Bank { BankName = "Techcombank", Code = "TCB", Description = "Ngân hàng TMCP Kỹ thương Việt Nam" },
            new Bank { BankName = "MB Bank", Code = "MBB", Description = "Ngân hàng TMCP Quân đội" },
            new Bank { BankName = "ACB", Code = "ACB", Description = "Ngân hàng TMCP Á Châu" },
            new Bank { BankName = "VPBank", Code = "VPB", Description = "Ngân hàng TMCP Việt Nam Thịnh Vượng" },
            new Bank { BankName = "Sacombank", Code = "STB", Description = "Ngân hàng TMCP Sài Gòn Thương Tín" },
            new Bank { BankName = "HDBank", Code = "HDB", Description = "Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh" },
            new Bank { BankName = "TPBank", Code = "TPB", Description = "Ngân hàng TMCP Tiên Phong" },
            new Bank { BankName = "SHB", Code = "SHB", Description = "Ngân hàng TMCP Sài Gòn - Hà Nội" },
            new Bank { BankName = "SeABank", Code = "SEAB", Description = "Ngân hàng TMCP Đông Nam Á" },
            new Bank { BankName = "LienVietPostBank", Code = "LPB", Description = "Ngân hàng TMCP Bưu điện Liên Việt" },
            new Bank { BankName = "VIB", Code = "VIB", Description = "Ngân hàng TMCP Quốc tế Việt Nam" },
            new Bank { BankName = "MSB", Code = "MSB", Description = "Ngân hàng TMCP Hàng Hải Việt Nam" },
            new Bank { BankName = "OCB", Code = "OCB", Description = "Ngân hàng TMCP Phương Đông" },
            new Bank { BankName = "Eximbank", Code = "EIB", Description = "Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam" },
            new Bank { BankName = "Nam A Bank", Code = "NAB", Description = "Ngân hàng TMCP Nam Á" },
            new Bank { BankName = "Bac A Bank", Code = "BAB", Description = "Ngân hàng TMCP Bắc Á" },
            new Bank { BankName = "PVcomBank", Code = "PVC", Description = "Ngân hàng TMCP Đại Chúng Việt Nam" },
            new Bank { BankName = "ABBank", Code = "ABB", Description = "Ngân hàng TMCP An Bình" },
            new Bank { BankName = "KienLong Bank", Code = "KLB", Description = "Ngân hàng TMCP Kiên Long" },
            new Bank { BankName = "Saigonbank", Code = "SGB", Description = "Ngân hàng TMCP Sài Gòn Công Thương" },
            new Bank { BankName = "VietABank", Code = "VAB", Description = "Ngân hàng TMCP Việt Á" },
            new Bank { BankName = "NCB", Code = "NCB", Description = "Ngân hàng TMCP Quốc Dân" },
            new Bank { BankName = "PGBank", Code = "PGB", Description = "Ngân hàng TMCP Thịnh vượng và Phát triển" },
            new Bank { BankName = "BaoViet Bank", Code = "BVB", Description = "Ngân hàng TMCP Bảo Việt" },
            new Bank { BankName = "DongA Bank", Code = "DAB", Description = "Ngân hàng TMCP Đông Á" }
        };

        context.Banks.AddRange(banks);
        await context.SaveChangesAsync();
        Console.WriteLine($"[SEEDER] Added {banks.Count} default banks.");
    }
}
