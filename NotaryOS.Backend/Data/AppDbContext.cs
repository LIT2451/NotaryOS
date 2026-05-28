using Microsoft.EntityFrameworkCore;
using NotaryOS.Backend.Models;

namespace NotaryOS.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Role> Roles { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<ServiceType> ServiceTypes { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<Bank> Banks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Cấu hình InvoiceNumber là Unique
        modelBuilder.Entity<Invoice>()
            .HasIndex(i => i.InvoiceNumber)
            .IsUnique();

        // Cấu hình quan hệ
        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.ServiceType)
            .WithMany(s => s.Invoices)
            .HasForeignKey(i => i.ServiceTypeId);

        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.User)
            .WithMany(u => u.Invoices)
            .HasForeignKey(i => i.CreatedBy);

        // Cấu hình RolePermission
        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId);

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId);
    }
}
