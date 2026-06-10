using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using NotaryOS.Backend.Controllers;
using NotaryOS.Backend.Data;
using NotaryOS.Backend.Hubs;
using NotaryOS.Backend.Models;
using NotaryOS.Backend.Services;

namespace NotaryOS.Backend.Tests;

public class InvoicesControllerTests
{
    [Fact]
    public async Task PostInvoice_AutoGeneratesInvoiceNumber_WhenInvoicesAlreadyExist()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_AutoGeneratesInvoiceNumber_WhenInvoicesAlreadyExist));
        SeedDefaults(dbContext);

        var currentYear = DateTime.Now.Year;
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"CC-{currentYear}-000001",
            ClientName = "Existing Client",
            Amount = 100000,
            ServiceTypeId = 1,
            CreatedBy = 2,
            NotaryDate = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        var result = await controller.PostInvoice(new CreateInvoiceRequest
        {
            InvoiceNumber = "HD-001",
            ClientName = "New Client",
            Amount = 200000,
            ServiceTypeId = 1,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        Assert.Equal($"CC-{currentYear}-000002", returnedInvoice.InvoiceNumber);
    }

    [Fact]
    public async Task PostInvoice_AutoGeneratesCcInvoiceNumber_IncrementingCorrectly()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_AutoGeneratesCcInvoiceNumber_IncrementingCorrectly));
        SeedDefaults(dbContext); // ServiceTypeId = 1 has default Category => CC

        var currentYear = DateTime.Now.Year;
        dbContext.Invoices.AddRange(
            new Invoice { InvoiceNumber = $"CC-{currentYear}-000001", ClientName = "A", ServiceTypeId = 1, CreatedBy = 2, NotaryDate = DateTime.UtcNow },
            new Invoice { InvoiceNumber = $"CC-{currentYear}-000002", ClientName = "B", ServiceTypeId = 1, CreatedBy = 2, NotaryDate = DateTime.UtcNow }
        );
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        var result = await controller.PostInvoice(new CreateInvoiceRequest
        {
            ClientName = "C",
            Amount = 150000,
            ServiceTypeId = 1,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        Assert.Equal($"CC-{currentYear}-000003", returnedInvoice.InvoiceNumber);
    }

    [Fact]
    public async Task PostInvoice_AutoGeneratesCtInvoiceNumber_IncrementingCorrectly()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_AutoGeneratesCtInvoiceNumber_IncrementingCorrectly));
        dbContext.ServiceTypes.Add(new ServiceType
        {
            Id = 2,
            Category = "ChungThuc",
            TypeName = "Chứng thực bản sao"
        });
        
        var currentYear = DateTime.Now.Year;
        dbContext.Invoices.AddRange(
            new Invoice { InvoiceNumber = $"CT-{currentYear}-000001", ClientName = "A", ServiceTypeId = 2, CreatedBy = 2, NotaryDate = DateTime.UtcNow },
            new Invoice { InvoiceNumber = $"CT-{currentYear}-000002", ClientName = "B", ServiceTypeId = 2, CreatedBy = 2, NotaryDate = DateTime.UtcNow }
        );
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        var result = await controller.PostInvoice(new CreateInvoiceRequest
        {
            ClientName = "C",
            Amount = 150000,
            ServiceTypeId = 2,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        Assert.Equal($"CT-{currentYear}-000003", returnedInvoice.InvoiceNumber);
    }

    [Fact]
    public async Task PostInvoice_GeneratesSaoYInvoiceNumber_WhenCategoryIsSaoY()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_GeneratesSaoYInvoiceNumber_WhenCategoryIsSaoY));
        
        var currentYear = DateTime.Now.Year;
        dbContext.ServiceTypes.Add(new ServiceType
        {
            Id = 99,
            Category = "SaoY",
            TypeName = "Sao y bản chính"
        });
        
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"SY-{currentYear}-{DateTime.Now:ddMM}-001",
            ClientName = "First Client",
            Amount = 10000,
            ServiceTypeId = 99,
            CreatedBy = 2,
            NotaryDate = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        var result = await controller.PostInvoice(new CreateInvoiceRequest
        {
            InvoiceNumber = "",
            ClientName = "Sao Y Client",
            Amount = 50000,
            ServiceTypeId = 99,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        Assert.Equal($"SY-{currentYear}-{DateTime.Now:ddMM}-002", returnedInvoice.InvoiceNumber);
    }

    [Fact]
    public async Task PostInvoice_FillsGapsAndReusesDeletedNumbers()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_FillsGapsAndReusesDeletedNumbers));
        
        var currentYear = DateTime.Now.Year;
        dbContext.ServiceTypes.Add(new ServiceType
        {
            Id = 99,
            Category = "SaoY",
            TypeName = "Sao y bản chính"
        });
        
        // Chèn số 1 và số 3 (active), số 2 (deleted)
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"SY-{currentYear}-{DateTime.Now:ddMM}-001",
            ClientName = "Client 1",
            Amount = 10000,
            ServiceTypeId = 99,
            CreatedBy = 2,
            NotaryDate = DateTime.UtcNow
        });
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"SY-{currentYear}-{DateTime.Now:ddMM}-002",
            ClientName = "Client 2 Deleted",
            Amount = 10000,
            ServiceTypeId = 99,
            CreatedBy = 2,
            NotaryDate = DateTime.UtcNow,
            IsDeleted = true
        });
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"SY-{currentYear}-{DateTime.Now:ddMM}-003",
            ClientName = "Client 3",
            Amount = 10000,
            ServiceTypeId = 99,
            CreatedBy = 2,
            NotaryDate = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        var result = await controller.PostInvoice(new CreateInvoiceRequest
        {
            InvoiceNumber = "",
            ClientName = "Gap Client",
            Amount = 50000,
            ServiceTypeId = 99,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        // Kiểm tra xem thuật toán có lấp vào số 2 bị xoá hay không
        Assert.Equal($"SY-{currentYear}-{DateTime.Now:ddMM}-002", returnedInvoice.InvoiceNumber);
    }

    [Fact]
    public async Task PostInvoice_DoesNotReuseMissingNumbersIfNotDeleted()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_DoesNotReuseMissingNumbersIfNotDeleted));
        
        var currentYear = DateTime.Now.Year;
        dbContext.ServiceTypes.Add(new ServiceType
        {
            Id = 99,
            Category = "SaoY",
            TypeName = "Sao y bản chính"
        });
        
        // Chèn số 1 và số 3 (active), khuyết số 2 (chưa từng được đánh hoặc bị xoá)
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"SY-{currentYear}-{DateTime.Now:ddMM}-001",
            ClientName = "Client 1",
            Amount = 10000,
            ServiceTypeId = 99,
            CreatedBy = 2,
            NotaryDate = DateTime.UtcNow
        });
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"SY-{currentYear}-{DateTime.Now:ddMM}-003",
            ClientName = "Client 3",
            Amount = 10000,
            ServiceTypeId = 99,
            CreatedBy = 2,
            NotaryDate = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        var result = await controller.PostInvoice(new CreateInvoiceRequest
        {
            InvoiceNumber = "",
            ClientName = "Max Client",
            Amount = 50000,
            ServiceTypeId = 99,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        // Khi không có số 2 bị xoá, thuật toán phải lấy Max + 1 = 4
        Assert.Equal($"SY-{currentYear}-{DateTime.Now:ddMM}-004", returnedInvoice.InvoiceNumber);
    }

    [Fact]
    public async Task PostInvoice_UsesProvidedInvoiceNumber_WhenFirstInvoiceForCategory()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_UsesProvidedInvoiceNumber_WhenFirstInvoiceForCategory));
        
        var currentYear = DateTime.Now.Year;
        dbContext.ServiceTypes.Add(new ServiceType
        {
            Id = 100,
            Category = "SaoY",
            TypeName = "Sao y test"
        });
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        var customNumber = $"SY-{currentYear}-{DateTime.Now:ddMM}-999";
        var result = await controller.PostInvoice(new CreateInvoiceRequest
        {
            InvoiceNumber = customNumber,
            ClientName = "Custom Client",
            Amount = 50000,
            ServiceTypeId = 100,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        Assert.Equal(customNumber, returnedInvoice.InvoiceNumber);
    }

    [Fact]
    public async Task PostInvoice_UsesProvidedInvoiceNumber_EvenWhenInvoicesAlreadyExist_IfNumberIsNotDuplicated()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_UsesProvidedInvoiceNumber_EvenWhenInvoicesAlreadyExist_IfNumberIsNotDuplicated));
        SeedDefaults(dbContext);

        var currentYear = DateTime.Now.Year;
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"CC-{currentYear}-000001",
            ClientName = "Client 1",
            Amount = 100000,
            ServiceTypeId = 1,
            CreatedBy = 2,
            NotaryDate = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        var customNumber = $"CC-{currentYear}-000500";
        var result = await controller.PostInvoice(new CreateInvoiceRequest
        {
            InvoiceNumber = customNumber,
            ClientName = "Jump Client",
            Amount = 200000,
            ServiceTypeId = 1,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        Assert.Equal(customNumber, returnedInvoice.InvoiceNumber);
    }

    [Fact]
    public async Task PostInvoice_SaoY_ResetsSequenceForNewDay()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_SaoY_ResetsSequenceForNewDay));
        
        var currentYear = DateTime.Now.Year;
        dbContext.ServiceTypes.Add(new ServiceType
        {
            Id = 101,
            Category = "SaoY",
            TypeName = "Sao y test day rollover"
        });
        
        // Hóa đơn hôm qua
        var yesterday = DateTime.Now.AddDays(-1);
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"SY-{currentYear}-{yesterday:ddMM}-001",
            ClientName = "Yesterday Client",
            Amount = 10000,
            ServiceTypeId = 101,
            CreatedBy = 2,
            NotaryDate = yesterday
        });
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        // Tạo cho hôm nay
        var today = DateTime.Now;
        var result = await controller.PostInvoice(new CreateInvoiceRequest
        {
            InvoiceNumber = "",
            ClientName = "Today Client",
            Amount = 20000,
            ServiceTypeId = 101,
            NotaryDate = today
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        
        // Hôm nay phải bắt đầu lại từ 001
        Assert.Equal($"SY-{currentYear}-{today:ddMM}-001", returnedInvoice.InvoiceNumber);
    }

    [Fact]
    public async Task PostInvoice_SaoY_GapFillingIsIsolatedByDay()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_SaoY_GapFillingIsIsolatedByDay));
        
        var currentYear = DateTime.Now.Year;
        dbContext.ServiceTypes.Add(new ServiceType
        {
            Id = 102,
            Category = "SaoY",
            TypeName = "Sao y test gap isolation"
        });
        
        // Hóa đơn hôm qua bị hụt mất số 002
        var yesterday = DateTime.Now.AddDays(-1);
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"SY-{currentYear}-{yesterday:ddMM}-001",
            ClientName = "Client 1",
            Amount = 10000,
            ServiceTypeId = 102,
            CreatedBy = 2,
            NotaryDate = yesterday
        });
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"SY-{currentYear}-{yesterday:ddMM}-003",
            ClientName = "Client 3",
            Amount = 10000,
            ServiceTypeId = 102,
            CreatedBy = 2,
            NotaryDate = yesterday
        });
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        // Tạo cho hôm nay, không được lấp vào số 002 của ngày hôm qua
        var today = DateTime.Now;
        var result = await controller.PostInvoice(new CreateInvoiceRequest
        {
            InvoiceNumber = "",
            ClientName = "Today Client",
            Amount = 20000,
            ServiceTypeId = 102,
            NotaryDate = today
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        
        // Hôm nay phải bắt đầu lại từ 001, thay vì lấp 002 của ngày hôm qua
        Assert.Equal($"SY-{currentYear}-{today:ddMM}-001", returnedInvoice.InvoiceNumber);
    }

    [Fact]
    public async Task PutInvoice_ReturnsForbid_WhenStaffUpdatesOtherUsersInvoice()
    {
        await using var dbContext = BuildContext(nameof(PutInvoice_ReturnsForbid_WhenStaffUpdatesOtherUsersInvoice));
        SeedDefaults(dbContext);

        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = "HD-OWNER",
            ClientName = "Owner",
            Amount = 500000,
            ServiceTypeId = 1,
            CreatedBy = 10,
            NotaryDate = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var invoiceId = await dbContext.Invoices.Select(x => x.Id).FirstAsync();
        var controller = BuildController(dbContext, userId: 20, role: "Staff");

        var result = await controller.PutInvoice(invoiceId, new UpdateInvoiceRequest
        {
            InvoiceNumber = "HD-UPDATED",
            ClientName = "Changed",
            Amount = 600000,
            ServiceTypeId = 1,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        Assert.IsType<ForbidResult>(result.Result);
    }

    [Fact]
    public async Task DeleteInvoice_ReturnsNoContent_WhenOwnerDeletesOwnInvoice()
    {
        await using var dbContext = BuildContext(nameof(DeleteInvoice_ReturnsNoContent_WhenOwnerDeletesOwnInvoice));
        SeedDefaults(dbContext);

        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = "HD-DEL",
            ClientName = "Delete Me",
            Amount = 700000,
            ServiceTypeId = 1,
            CreatedBy = 5,
            NotaryDate = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var invoiceId = await dbContext.Invoices.Select(x => x.Id).FirstAsync();
        var controller = BuildController(dbContext, userId: 5, role: "Staff");

        var result = await controller.DeleteInvoice(invoiceId);

        Assert.IsType<NoContentResult>(result);

        // Verify soft delete occurred
        var deletedInvoice = await dbContext.Invoices.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == invoiceId);
        Assert.NotNull(deletedInvoice);
        Assert.True(deletedInvoice.IsDeleted);
        Assert.Null(deletedInvoice.ClientName);
        Assert.Null(deletedInvoice.ClientIdNumber);
        Assert.Null(deletedInvoice.ClientEmail);
        Assert.Equal(0, deletedInvoice.Amount);
    }

    [Fact]
    public async Task PutInvoice_OnSoftDeletedInvoice_RestoresActiveStatus()
    {
        await using var dbContext = BuildContext(nameof(PutInvoice_OnSoftDeletedInvoice_RestoresActiveStatus));
        SeedDefaults(dbContext);

        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = "HD-RESTORE",
            ClientName = null,
            Amount = 0,
            ServiceTypeId = 1,
            CreatedBy = 5,
            NotaryDate = DateTime.UtcNow,
            IsDeleted = true
        });
        await dbContext.SaveChangesAsync();

        var invoiceId = await dbContext.Invoices.Select(x => x.Id).FirstAsync();
        var controller = BuildController(dbContext, userId: 5, role: "Staff");

        var result = await controller.PutInvoice(invoiceId, new UpdateInvoiceRequest
        {
            InvoiceNumber = "HD-RESTORE",
            ClientName = "Restored Client",
            Amount = 500000,
            ServiceTypeId = 1,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var restored = Assert.IsType<Invoice>(okResult.Value);
        Assert.False(restored.IsDeleted);
        Assert.Equal("Restored Client", restored.ClientName);
        Assert.Equal(500000, restored.Amount);
    }

    [Fact]
    public async Task PutInvoice_OnSoftDeletedInvoice_AllowsOtherUsersToEdit()
    {
        await using var dbContext = BuildContext(nameof(PutInvoice_OnSoftDeletedInvoice_AllowsOtherUsersToEdit));
        SeedDefaults(dbContext);

        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = "HD-RESTORE-OTHER",
            ClientName = null,
            Amount = 0,
            ServiceTypeId = 1,
            CreatedBy = 5,
            NotaryDate = DateTime.UtcNow,
            IsDeleted = true
        });
        await dbContext.SaveChangesAsync();

        var invoiceId = await dbContext.Invoices.Select(x => x.Id).FirstAsync();
        var controller = BuildController(dbContext, userId: 20, role: "Staff"); // Different user (20 != 5)

        var result = await controller.PutInvoice(invoiceId, new UpdateInvoiceRequest
        {
            InvoiceNumber = "HD-RESTORE-OTHER",
            ClientName = "Restored By Other Client",
            Amount = 500000,
            ServiceTypeId = 1,
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var restored = Assert.IsType<Invoice>(okResult.Value);
        Assert.False(restored.IsDeleted);
        Assert.Equal("Restored By Other Client", restored.ClientName);
        Assert.Equal(500000, restored.Amount);
        Assert.Equal(20, restored.CreatedBy);
    }

    [Fact]
    public async Task PutInvoice_WithDifferentServiceCategory_ReturnsBadRequest()
    {
        await using var dbContext = BuildContext(nameof(PutInvoice_WithDifferentServiceCategory_ReturnsBadRequest));
        SeedDefaults(dbContext);

        // Add an extra service type with a different category
        dbContext.ServiceTypes.Add(new ServiceType { Id = 2, TypeName = "Test CC", Category = "CongChung" });
        dbContext.ServiceTypes.Add(new ServiceType { Id = 3, TypeName = "Test CT", Category = "ChungThuc" });
        
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = "HD-CAT",
            ClientName = "Category Test",
            Amount = 100000,
            ServiceTypeId = 2, // Category = CongChung
            CreatedBy = 5,
            NotaryDate = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var invoiceId = await dbContext.Invoices.Select(x => x.Id).FirstAsync();
        var controller = BuildController(dbContext, userId: 5, role: "Staff");

        var result = await controller.PutInvoice(invoiceId, new UpdateInvoiceRequest
        {
            InvoiceNumber = "HD-CAT",
            ClientName = "Category Test",
            Amount = 100000,
            ServiceTypeId = 3, // Category = ChungThuc (Different!)
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Không thể thay đổi loại dịch vụ (nhóm dịch vụ)", badRequestResult.Value?.ToString());
    }

    [Fact]
    public async Task PutInvoice_WithSameServiceCategory_ReturnsOk()
    {
        await using var dbContext = BuildContext(nameof(PutInvoice_WithSameServiceCategory_ReturnsOk));
        SeedDefaults(dbContext);

        // Add extra service types with the SAME category
        dbContext.ServiceTypes.Add(new ServiceType { Id = 2, TypeName = "Test CC 1", Category = "CongChung" });
        dbContext.ServiceTypes.Add(new ServiceType { Id = 3, TypeName = "Test CC 2", Category = "CongChung" });
        
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = "HD-CAT-SAME",
            ClientName = "Category Test Same",
            Amount = 100000,
            ServiceTypeId = 2, // Category = CongChung
            CreatedBy = 5,
            NotaryDate = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var invoiceId = await dbContext.Invoices.Select(x => x.Id).FirstAsync();
        var controller = BuildController(dbContext, userId: 5, role: "Staff");

        var result = await controller.PutInvoice(invoiceId, new UpdateInvoiceRequest
        {
            InvoiceNumber = "HD-CAT-SAME",
            ClientName = "Category Test Same",
            Amount = 200000,
            ServiceTypeId = 3, // Category = CongChung (Same!)
            NotaryDate = DateTime.UtcNow
        }, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedInvoice = Assert.IsType<Invoice>(okResult.Value);
        Assert.Equal(3, returnedInvoice.ServiceTypeId);
        Assert.Equal(200000, returnedInvoice.Amount);
    }

    [Fact]
    public async Task PostInvoice_IgnoresSoftDeletedInvoices_WhenGeneratingNextNumber()
    {
        await using var dbContext = BuildContext(nameof(PostInvoice_IgnoresSoftDeletedInvoices_WhenGeneratingNextNumber));
        SeedDefaults(dbContext);

        var currentYear = DateTime.Now.Year;

        // Add active invoice CC-2026-000001
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"CC-{currentYear}-000001",
            ClientName = "Client 1",
            Amount = 100000,
            ServiceTypeId = 1,
            CreatedBy = 2,
            NotaryDate = DateTime.UtcNow,
            IsDeleted = false
        });

        // Add soft-deleted invoice CC-2026-000002 (IsDeleted = true)
        dbContext.Invoices.Add(new Invoice
        {
            InvoiceNumber = $"CC-{currentYear}-000002",
            ClientName = "Client 2",
            Amount = 100000,
            ServiceTypeId = 1,
            CreatedBy = 2,
            NotaryDate = DateTime.UtcNow,
            IsDeleted = true
        });
        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        // Ask for the next number (for CC)
        var result = await controller.GetNextNumber(1);
        var okResult = Assert.IsType<OkObjectResult>(result);
        
        // Use reflection to get the property 'nextNumber'
        var nextNumberProp = okResult.Value?.GetType().GetProperty("nextNumber");
        var nextNumber = nextNumberProp?.GetValue(okResult.Value) as string;

        // Since 2 is soft-deleted, the next generated number should reuse 2 (CC-2026-000002)
        Assert.Equal($"CC-{currentYear}-000002", nextNumber);
    }

    [Fact]
    public async Task GetInvoices_StaffCanViewOwnActiveInvoicesAndAllDeletedInvoices()
    {
        await using var dbContext = BuildContext(nameof(GetInvoices_StaffCanViewOwnActiveInvoicesAndAllDeletedInvoices));
        SeedDefaults(dbContext);

        // Invoice 1: Active, created by staff (userId = 2)
        dbContext.Invoices.Add(new Invoice
        {
            Id = 101,
            InvoiceNumber = "CC-2026-000001",
            ClientName = "Own Client",
            CreatedBy = 2,
            IsDeleted = false
        });

        // Invoice 2: Active, created by another user (userId = 3)
        dbContext.Invoices.Add(new Invoice
        {
            Id = 102,
            InvoiceNumber = "CC-2026-000002",
            ClientName = "Other Client Active",
            CreatedBy = 3,
            IsDeleted = false
        });

        // Invoice 3: Deleted, created by another user (userId = 3)
        dbContext.Invoices.Add(new Invoice
        {
            Id = 103,
            InvoiceNumber = "CC-2026-000003",
            ClientName = "Other Client Deleted",
            CreatedBy = 3,
            IsDeleted = true
        });

        await dbContext.SaveChangesAsync();

        var controller = BuildController(dbContext, userId: 2, role: "Staff");

        var result = await controller.GetInvoices(null, null);
        var invoices = Assert.IsAssignableFrom<IEnumerable<Invoice>>(result.Value);
        var invoiceList = invoices.ToList();

        // Should return 2 invoices: own active (101) and other's deleted (103)
        Assert.Equal(2, invoiceList.Count);
        Assert.Contains(invoiceList, i => i.Id == 101);
        Assert.Contains(invoiceList, i => i.Id == 103);
        Assert.DoesNotContain(invoiceList, i => i.Id == 102);
    }

    private static AppDbContext BuildContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        return new AppDbContext(options);
    }

    private static InvoicesController BuildController(AppDbContext dbContext, int userId, string role)
    {
        var controller = new InvoicesController(
            dbContext,
            new FakeHubContext(),
            NullLogger<InvoicesController>.Instance,
            new FakeAuditService(),
            new FakePdfReportService());

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role)
        }, "test-auth");

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };

        return controller;
    }

    private static void SeedDefaults(AppDbContext dbContext)
    {
        dbContext.ServiceTypes.Add(new ServiceType
        {
            Id = 1,
            TypeName = "Mua bán"
        });

        dbContext.SaveChanges();
    }

    private sealed class FakeHubContext : IHubContext<InvoiceHub>
    {
        public IHubClients Clients { get; } = new FakeHubClients();

        public IGroupManager Groups { get; } = new FakeGroupManager();
    }

    private sealed class FakeHubClients : IHubClients
    {
        private static readonly IClientProxy Proxy = new FakeClientProxy();

        public IClientProxy All => Proxy;
        public IClientProxy AllExcept(IReadOnlyList<string> excludedConnectionIds) => Proxy;
        public IClientProxy Client(string connectionId) => Proxy;
        public IClientProxy Clients(IReadOnlyList<string> connectionIds) => Proxy;
        public IClientProxy Group(string groupName) => Proxy;
        public IClientProxy GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds) => Proxy;
        public IClientProxy Groups(IReadOnlyList<string> groupNames) => Proxy;
        public IClientProxy User(string userId) => Proxy;
        public IClientProxy Users(IReadOnlyList<string> userIds) => Proxy;
    }

    private sealed class FakeClientProxy : IClientProxy
    {
        public Task SendCoreAsync(string method, object?[] args, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }

    private sealed class FakeGroupManager : IGroupManager
    {
        public Task AddToGroupAsync(string connectionId, string groupName, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task RemoveFromGroupAsync(string connectionId, string groupName, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }

    private sealed class FakeAuditService : IAuditService
    {
        public Task LogAsync(int? userId, string action, string entityType, int? entityId, object? oldValue = null, object? newValue = null)
        {
            return Task.CompletedTask;
        }
    }

    private sealed class FakePdfReportService : IPdfReportService
    {
        public byte[] GenerateInvoiceReport(List<Invoice> invoices, string title, DateTime? startDate, DateTime? endDate)
        {
            return Array.Empty<byte>();
        }
    }
}
