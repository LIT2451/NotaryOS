using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using WebCC.Backend.Models;

namespace WebCC.Backend.Services;

public interface IPdfReportService
{
    byte[] GenerateInvoiceReport(List<Invoice> invoices, string title, DateTime? startDate, DateTime? endDate);
}

public class PdfReportService : IPdfReportService
{
    public byte[] GenerateInvoiceReport(List<Invoice> invoices, string title, DateTime? startDate, DateTime? endDate)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("VĂN PHÒNG CÔNG CHỨNG").FontSize(16).SemiBold().FontColor(Colors.Blue.Medium);
                        col.Item().Text("Hệ thống Quản lý Hóa đơn WEBCC").FontSize(10).Italic();
                    });

                    row.RelativeItem().AlignRight().Column(col =>
                    {
                        col.Item().Text($"Ngày xuất: {DateTime.Now:dd/MM/yyyy HH:mm}");
                        if (startDate.HasValue || endDate.HasValue)
                        {
                            var period = $"Kỳ báo cáo: {(startDate.HasValue ? startDate.Value.ToString("dd/MM/yyyy") : "...")} - {(endDate.HasValue ? endDate.Value.ToString("dd/MM/yyyy") : "...")}";
                            col.Item().Text(period).FontSize(9);
                        }
                    });
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Column(col =>
                {
                    col.Item().PaddingBottom(0.5f, Unit.Centimetre).AlignCenter().Text(title).FontSize(18).SemiBold();

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(25);  // STT
                            columns.ConstantColumn(60);  // Số HD
                            columns.RelativeColumn(2);   // Khách hàng & Email
                            columns.ConstantColumn(80);  // CCCD
                            columns.RelativeColumn(2);   // Ngân hàng & TK
                            columns.RelativeColumn(2);   // Dịch vụ
                            columns.ConstantColumn(70);  // Số tiền
                            columns.ConstantColumn(65);  // Ngày
                            columns.RelativeColumn();    // Người lập
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(CellStyle).Text("STT");
                            header.Cell().Element(CellStyle).Text("Số HD");
                            header.Cell().Element(CellStyle).Text("Khách hàng / Email");
                            header.Cell().Element(CellStyle).Text("CCCD");
                            header.Cell().Element(CellStyle).Text("Ngân hàng / TK");
                            header.Cell().Element(CellStyle).Text("Dịch vụ");
                            header.Cell().Element(CellStyle).Text("Số tiền");
                            header.Cell().Element(CellStyle).Text("Ngày");
                            header.Cell().Element(CellStyle).Text("Người lập");

                            static IContainer CellStyle(IContainer container)
                            {
                                return container.DefaultTextStyle(x => x.SemiBold())
                                                .PaddingVertical(5)
                                                .BorderBottom(1)
                                                .BorderColor(Colors.Black);
                            }
                        });

                        for (int i = 0; i < invoices.Count; i++)
                        {
                            var inv = invoices[i];
                            table.Cell().Element(ContentCellStyle).Text((i + 1).ToString());
                            table.Cell().Element(ContentCellStyle).Text(inv.InvoiceNumber);
                            table.Cell().Element(ContentCellStyle).Column(c => {
                                c.Item().Text(inv.ClientName ?? "-").SemiBold();
                                if (!string.IsNullOrEmpty(inv.ClientEmail)) 
                                    c.Item().Text(inv.ClientEmail).FontSize(8).FontColor(Colors.Grey.Medium);
                            });
                            table.Cell().Element(ContentCellStyle).Text(inv.ClientIdNumber ?? "-");
                            table.Cell().Element(ContentCellStyle).Column(c => {
                                if (!string.IsNullOrEmpty(inv.BankName))
                                    c.Item().Text(inv.BankName).FontSize(9);
                                if (!string.IsNullOrEmpty(inv.BankAccount))
                                    c.Item().Text(inv.BankAccount).FontSize(8).FontColor(Colors.Grey.Medium);
                                if (string.IsNullOrEmpty(inv.BankName) && string.IsNullOrEmpty(inv.BankAccount))
                                    c.Item().Text("-");
                            });
                            table.Cell().Element(ContentCellStyle).Text(inv.ServiceType?.TypeName ?? "-");
                            table.Cell().Element(ContentCellStyle).AlignRight().Text(inv.Amount.ToString("N0") + " đ");
                            table.Cell().Element(ContentCellStyle).AlignCenter().Text(inv.NotaryDate.ToString("dd/MM/yyyy"));
                            table.Cell().Element(ContentCellStyle).Text(inv.User?.FullName ?? "-").FontSize(9);

                            static IContainer ContentCellStyle(IContainer container)
                            {
                                return container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                            }
                        }
                    });

                    col.Item().PaddingTop(1, Unit.Centimetre).AlignRight().Column(c =>
                    {
                        c.Item().Text($"Tổng cộng: {invoices.Sum(x => x.Amount).ToString("N0")} đ").FontSize(12).SemiBold();
                        c.Item().Text($"Tổng số hóa đơn: {invoices.Count}").FontSize(10);
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Trang ");
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }
}
