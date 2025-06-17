package com.example.mcpprovider.service;

import com.example.mcpprovider.dto.StatementResponseDto;
import com.example.mcpprovider.dto.TransactionResponseDto;
import com.example.mcpprovider.dto.CustomerDto;
import com.example.mcpprovider.dto.OverduePaymentStatementDto;
import com.example.mcpprovider.dto.OverduePaymentResponseDto;
import com.example.mcpprovider.entity.EmailAttachment;
import com.example.mcpprovider.repository.EmailAttachmentRepository;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentGenerationService {

    private final EmailAttachmentRepository emailAttachmentRepository;

    public Long generateStatementDocument(StatementResponseDto statementData) {
        try {
            log.info("Generating statement document for customer: {}", 
                statementData.getCustomer() != null ? statementData.getCustomer().getId() : "unknown");

            // HTML içeriğini oluştur
            String htmlContent = generateStatementPdfContent(statementData);
            log.info("Generated HTML content length: {} characters", htmlContent.length());
            
            // HTML'i PDF'e çevir
            byte[] pdfBytes = convertHtmlToPdf(htmlContent);
            log.info("Generated PDF size: {} bytes", pdfBytes.length);
            
            // PDF'i base64'e çevir
            String base64Content = Base64.getEncoder().encodeToString(pdfBytes);
            log.info("Generated base64 content length: {} characters", base64Content.length());
            
            // Dosya adını oluştur
            String filename = generateStatementFilename(statementData.getCustomer());
            
            // EmailAttachment entity'sini oluştur ve kaydet
            EmailAttachment attachment = new EmailAttachment();
            attachment.setFilename(filename);
            attachment.setContentType("application/pdf");
            attachment.setFileSize((long) pdfBytes.length);
            attachment.setBase64Content(base64Content);
            attachment.setActionType("GENERATE_STATEMENT");
            attachment.setCustomerId(statementData.getCustomer() != null ? statementData.getCustomer().getId() : null);
            
            EmailAttachment savedAttachment = emailAttachmentRepository.save(attachment);
            log.info("Saved attachment with ID: {}, filename: {}, size: {}", 
                savedAttachment.getId(), savedAttachment.getFilename(), savedAttachment.getFileSize());
            
            return savedAttachment.getId();
            
        } catch (Exception e) {
            log.error("Error generating statement document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate statement document", e);
        }
    }
    
    public Long generateOverduePaymentStatementDocument(OverduePaymentStatementDto statementData) {
        try {
            log.info("Generating overdue payment statement document for customer: {}", 
                statementData.getCustomer() != null ? statementData.getCustomer().getId() : "unknown");

            // HTML içeriğini oluştur
            String htmlContent = generateOverduePaymentPdfContent(statementData);
            log.info("Generated overdue payment HTML content length: {} characters", htmlContent.length());
            
            // HTML'i PDF'e çevir
            byte[] pdfBytes = convertHtmlToPdf(htmlContent);
            log.info("Generated overdue payment PDF size: {} bytes", pdfBytes.length);
            
            // PDF'i base64'e çevir
            String base64Content = Base64.getEncoder().encodeToString(pdfBytes);
            log.info("Generated overdue payment base64 content length: {} characters", base64Content.length());
            
            // Dosya adını oluştur
            String filename = generateOverduePaymentFilename(statementData.getCustomer());
            
            // EmailAttachment entity'sini oluştur ve kaydet
            EmailAttachment attachment = new EmailAttachment();
            attachment.setFilename(filename);
            attachment.setContentType("application/pdf");
            attachment.setFileSize((long) pdfBytes.length);
            attachment.setBase64Content(base64Content);
            attachment.setActionType("OVERDUE_PAYMENT_STATEMENT");
            attachment.setCustomerId(statementData.getCustomer() != null ? statementData.getCustomer().getId() : null);
            
            EmailAttachment savedAttachment = emailAttachmentRepository.save(attachment);
            log.info("Saved overdue payment attachment with ID: {}, filename: {}, size: {}", 
                savedAttachment.getId(), savedAttachment.getFilename(), savedAttachment.getFileSize());
            
            return savedAttachment.getId();
            
        } catch (Exception e) {
            log.error("Error generating overdue payment statement document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate overdue payment statement document", e);
        }
    }

    private byte[] convertHtmlToPdf(String htmlContent) {
        try {
            ByteArrayOutputStream pdfStream = new ByteArrayOutputStream();
            ConverterProperties converterProperties = new ConverterProperties();
            
            // PDF'i oluştur
            HtmlConverter.convertToPdf(htmlContent, pdfStream, converterProperties);
            
            return pdfStream.toByteArray();
        } catch (Exception e) {
            log.error("Error converting HTML to PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to convert HTML to PDF", e);
        }
    }

    private String generateStatementPdfContent(StatementResponseDto statementData) {
        StringBuilder content = new StringBuilder();
        
        // PDF Header (HTML formatında)
        content.append("<!DOCTYPE html>\n");
        content.append("<html>\n<head>\n");
        content.append("<meta charset='UTF-8'>\n");
        content.append("<title>Hesap Ekstresi</title>\n");
        content.append("<style>\n");
        content.append("@page { size: A4; margin: 2cm; }\n");
        content.append("body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }\n");
        content.append("table { width: 100%; border-collapse: collapse; margin-top: 20px; page-break-inside: auto; }\n");
        content.append("tr { page-break-inside: avoid; page-break-after: auto; }\n");
        content.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n");
        content.append("th { background-color: #f2f2f2; }\n");
        content.append(".header { text-align: center; margin-bottom: 30px; }\n");
        content.append(".customer-info { margin-bottom: 20px; }\n");
        content.append(".amount { text-align: right; }\n");
        content.append(".footer { position: running(footer); text-align: center; font-size: 10px; }\n");
        content.append("@page { @bottom-center { content: element(footer); } }\n");
        content.append("</style>\n");
        content.append("</head>\n<body>\n");
        
        // Başlık
        content.append("<div class='header'>\n");
        content.append("<h1>HESAP EKSTRESİ</h1>\n");
        content.append("<p>Tarih: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"))).append("</p>\n");
        content.append("</div>\n");
        
        // Müşteri bilgileri
        if (statementData.getCustomer() != null) {
            CustomerDto customer = statementData.getCustomer();
            content.append("<div class='customer-info'>\n");
            content.append("<h3>Müşteri Bilgileri</h3>\n");
            content.append("<p><strong>Müşteri No:</strong> ").append(customer.getId()).append("</p>\n");
            content.append("<p><strong>Ad Soyad:</strong> ").append(customer.getFullName()).append("</p>\n");
            content.append("<p><strong>E-posta:</strong> ").append(customer.getEmail()).append("</p>\n");
            content.append("<p><strong>Telefon:</strong> ").append(customer.getPhone()).append("</p>\n");
            content.append("</div>\n");
        }
        
        // İşlem tablosu
        content.append("<h3>İşlem Detayları</h3>\n");
        content.append("<table>\n");
        content.append("<thead>\n");
        content.append("<tr>\n");
        content.append("<th>Tarih</th>\n");
        content.append("<th>Açıklama</th>\n");
        content.append("<th>Kategori</th>\n");
        content.append("<th>Yön</th>\n");
        content.append("<th>Tutar</th>\n");
        content.append("<th>Para Birimi</th>\n");
        content.append("<th>Karşı Taraf</th>\n");
        content.append("</tr>\n");
        content.append("</thead>\n");
        content.append("<tbody>\n");
        
        // İşlemleri ekle
        if (statementData.getTransactions() != null) {
            for (TransactionResponseDto transaction : statementData.getTransactions()) {
                content.append("<tr>\n");
                content.append("<td>").append(formatTransactionDate(transaction.getTransactionDate())).append("</td>\n");
                content.append("<td>").append(transaction.getDescription() != null ? transaction.getDescription() : "").append("</td>\n");
                content.append("<td>").append(transaction.getCategory() != null ? transaction.getCategory() : "").append("</td>\n");
                content.append("<td>").append(transaction.getDirection() != null ? transaction.getDirection() : "").append("</td>\n");
                content.append("<td class='amount'>").append(transaction.getAmount() != null ? String.format("%,.2f", transaction.getAmount()) : "0.00").append("</td>\n");
                content.append("<td>").append(transaction.getCurrency() != null ? transaction.getCurrency() : "").append("</td>\n");
                content.append("<td>").append(transaction.getCounterpartyName() != null ? transaction.getCounterpartyName() : "").append("</td>\n");
                content.append("</tr>\n");
            }
        }
        
        content.append("</tbody>\n");
        content.append("</table>\n");
        
        // Özet bilgiler
        content.append("<div style='margin-top: 30px;'>\n");
        content.append("<h3>Özet</h3>\n");
        content.append("<p><strong>Toplam İşlem Sayısı:</strong> ").append(statementData.getTransactions() != null ? statementData.getTransactions().size() : 0).append("</p>\n");
        content.append("</div>\n");
        
        // Footer
        content.append("<div class='footer'>\n");
        content.append("Bu belge ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")))
            .append(" tarihinde otomatik olarak oluşturulmuştur.\n");
        content.append("</div>\n");
        
        content.append("</body>\n</html>");
        
        return content.toString();
    }

    private String formatTransactionDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"));
    }

    private String generateStatementFilename(CustomerDto customer) {
        String customerName = customer != null ? customer.getFirstName() + "_" + customer.getLastName() : "Unknown";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return String.format("Hesap_Ekstresi_%s_%s.pdf", customerName, timestamp);
    }

    private String generateOverduePaymentPdfContent(OverduePaymentStatementDto statementData) {
        StringBuilder content = new StringBuilder();
        
        // PDF Header (HTML formatında)
        content.append("<!DOCTYPE html>\n");
        content.append("<html>\n<head>\n");
        content.append("<meta charset='UTF-8'>\n");
        content.append("<title>Geciken Ödeme Bildirimi</title>\n");
        content.append("<style>\n");
        content.append("@page { size: A4; margin: 2cm; }\n");
        content.append("body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }\n");
        content.append("table { width: 100%; border-collapse: collapse; margin-top: 20px; page-break-inside: auto; }\n");
        content.append("tr { page-break-inside: avoid; page-break-after: auto; }\n");
        content.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n");
        content.append("th { background-color: #f2f2f2; }\n");
        content.append(".header { text-align: center; margin-bottom: 30px; color: #d9534f; }\n");
        content.append(".customer-info { margin-bottom: 20px; background-color: #f8f9fa; padding: 15px; border-radius: 5px; }\n");
        content.append(".summary { margin-bottom: 20px; background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 5px solid #ffc107; }\n");
        content.append(".amount { text-align: right; }\n");
        content.append(".overdue { color: #d9534f; font-weight: bold; }\n");
        content.append(".penalty { color: #ff6b35; }\n");
        content.append(".footer { position: running(footer); text-align: center; font-size: 10px; }\n");
        content.append("@page { @bottom-center { content: element(footer); } }\n");
        content.append(".warning { background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #dc3545; }\n");
        content.append("</style>\n");
        content.append("</head>\n<body>\n");
        
        // Başlık
        content.append("<div class='header'>\n");
        content.append("<h1>⚠️ GECİKEN ÖDEME BİLDİRİMİ</h1>\n");
        content.append("<p>Tarih: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"))).append("</p>\n");
        content.append("</div>\n");
        
        // Müşteri bilgileri
        if (statementData.getCustomer() != null) {
            CustomerDto customer = statementData.getCustomer();
            content.append("<div class='customer-info'>\n");
            content.append("<h3>Müşteri Bilgileri</h3>\n");
            content.append("<p><strong>Müşteri No:</strong> ").append(customer.getId()).append("</p>\n");
            content.append("<p><strong>Ad Soyad:</strong> ").append(customer.getFullName()).append("</p>\n");
            content.append("<p><strong>E-posta:</strong> ").append(customer.getEmail()).append("</p>\n");
            content.append("<p><strong>Telefon:</strong> ").append(customer.getPhone()).append("</p>\n");
            content.append("</div>\n");
        }
        
        // Özet bilgiler
        if (statementData.getSummary() != null) {
            var summary = statementData.getSummary();
            content.append("<div class='summary'>\n");
            content.append("<h3>Geciken Ödeme Özeti</h3>\n");
            content.append("<div style='display: flex; justify-content: space-between; flex-wrap: wrap;'>\n");
            content.append("<div style='min-width: 200px; margin-bottom: 10px;'>\n");
            content.append("<p><strong>Toplam Geciken Ödeme:</strong> <span class='overdue'>").append(summary.getTotalOverdueCount()).append(" adet</span></p>\n");
            content.append("<p><strong>Toplam Tutar:</strong> <span class='overdue'>").append(String.format("%,.2f %s", summary.getTotalAmount(), summary.getCurrency())).append("</span></p>\n");
            content.append("</div>\n");
            content.append("<div style='min-width: 200px; margin-bottom: 10px;'>\n");
            content.append("<p><strong>Ana Tutar:</strong> ").append(String.format("%,.2f %s", summary.getTotalOriginalAmount(), summary.getCurrency())).append("</p>\n");
            content.append("<p><strong>Gecikme Cezası:</strong> <span class='penalty'>").append(String.format("%,.2f %s", summary.getTotalPenaltyAmount(), summary.getCurrency())).append("</span></p>\n");
            content.append("</div>\n");
            content.append("<div style='min-width: 200px; margin-bottom: 10px;'>\n");
            content.append("<p><strong>Ortalama Gecikme:</strong> ").append(summary.getAverageDaysOverdue()).append(" gün</p>\n");
            content.append("<p><strong>En Uzun Gecikme:</strong> ").append(summary.getMaxDaysOverdue()).append(" gün</p>\n");
            content.append("</div>\n");
            content.append("</div>\n");
            content.append("</div>\n");
        }
        
        // Uyarı mesajı
        content.append("<div class='warning'>\n");
        content.append("<h4>🚨 URGENT - ACİL ÖDEME GEREKLİ</h4>\n");
        content.append("<p>Sayın müşterimiz, aşağıda listelenen ödemeleriniz gecikmiş durumdadır. ");
        content.append("Lütfen en kısa sürede ödemelerinizi gerçekleştirerek ek gecikme cezalarından kaçının.</p>\n");
        content.append("</div>\n");
        
        // Geciken ödemeler tablosu
        content.append("<h3>Geciken Ödeme Detayları</h3>\n");
        content.append("<table>\n");
        content.append("<thead>\n");
        content.append("<tr>\n");
        content.append("<th>Ödeme Türü</th>\n");
        content.append("<th>Alacaklı</th>\n");
        content.append("<th>Vade Tarihi</th>\n");
        content.append("<th>Gecikme (Gün)</th>\n");
        content.append("<th>Ana Tutar</th>\n");
        content.append("<th>Gecikme Cezası</th>\n");
        content.append("<th>Toplam Tutar</th>\n");
        content.append("<th>Referans No</th>\n");
        content.append("<th>Hatırlatma</th>\n");
        content.append("</tr>\n");
        content.append("</thead>\n");
        content.append("<tbody>\n");
        
        // Geciken ödemeleri ekle
        if (statementData.getOverduePayments() != null) {
            for (OverduePaymentResponseDto payment : statementData.getOverduePayments()) {
                content.append("<tr>\n");
                content.append("<td>").append(payment.getPaymentTypeName() != null ? payment.getPaymentTypeName() : "").append("</td>\n");
                content.append("<td>").append(payment.getPayeeName() != null ? payment.getPayeeName() : "").append("</td>\n");
                content.append("<td>").append(payment.getOriginalDueDate() != null ? payment.getOriginalDueDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")) : "").append("</td>\n");
                content.append("<td class='overdue'>").append(payment.getDaysOverdue() != null ? payment.getDaysOverdue() : 0).append("</td>\n");
                content.append("<td class='amount'>").append(payment.getOriginalAmount() != null ? String.format("%,.2f", payment.getOriginalAmount()) : "0.00").append("</td>\n");
                content.append("<td class='amount penalty'>").append(payment.getPenaltyAmount() != null ? String.format("%,.2f", payment.getPenaltyAmount()) : "0.00").append("</td>\n");
                content.append("<td class='amount overdue'>").append(payment.getTotalAmount() != null ? String.format("%,.2f", payment.getTotalAmount()) : "0.00").append("</td>\n");
                content.append("<td>").append(payment.getPaymentReference() != null ? payment.getPaymentReference() : "").append("</td>\n");
                content.append("<td class='amount'>").append(payment.getReminderCount() != null ? payment.getReminderCount() : 0).append("</td>\n");
                content.append("</tr>\n");
            }
        }
        
        content.append("</tbody>\n");
        content.append("</table>\n");
        
        // Ödeme türü özeti
        if (statementData.getSummary() != null && statementData.getSummary().getPaymentTypeSummaries() != null && !statementData.getSummary().getPaymentTypeSummaries().isEmpty()) {
            content.append("<h3>Ödeme Türü Bazında Özet</h3>\n");
            content.append("<table>\n");
            content.append("<thead>\n");
            content.append("<tr>\n");
            content.append("<th>Ödeme Türü</th>\n");
            content.append("<th>Adet</th>\n");
            content.append("<th>Toplam Tutar</th>\n");
            content.append("<th>Ortalama Gecikme</th>\n");
            content.append("</tr>\n");
            content.append("</thead>\n");
            content.append("<tbody>\n");
            
            for (var typeSummary : statementData.getSummary().getPaymentTypeSummaries()) {
                content.append("<tr>\n");
                content.append("<td>").append(typeSummary.getPaymentTypeName()).append("</td>\n");
                content.append("<td>").append(typeSummary.getCount()).append("</td>\n");
                content.append("<td class='amount'>").append(String.format("%,.2f", typeSummary.getTotalAmount())).append("</td>\n");
                content.append("<td>").append(typeSummary.getAverageDaysOverdue()).append(" gün</td>\n");
                content.append("</tr>\n");
            }
            
            content.append("</tbody>\n");
            content.append("</table>\n");
        }
        
        // Önemli notlar
        content.append("<div style='margin-top: 30px; border: 2px solid #dc3545; padding: 20px; border-radius: 5px;'>\n");
        content.append("<h3 style='color: #dc3545;'>📋 ÖNEMLİ NOTLAR</h3>\n");
        content.append("<ul>\n");
        content.append("<li><strong>Ödeme Süresi:</strong> Bu bildirimi aldıktan sonra 7 gün içinde ödemelerinizi gerçekleştirmeniz gerekmektedir.</li>\n");
        content.append("<li><strong>Gecikme Cezası:</strong> Her geçen gün için ek gecikme cezası uygulanacaktır.</li>\n");
        content.append("<li><strong>İletişim:</strong> Ödeme planı yapmak için 0850 XXX XX XX numaralı telefondan bizimle iletişime geçebilirsiniz.</li>\n");
        content.append("<li><strong>Online Ödeme:</strong> Ödemelerinizi internet bankacılığından veya mobil uygulamadan gerçekleştirebilirsiniz.</li>\n");
        content.append("</ul>\n");
        content.append("</div>\n");
        
        // Footer
        content.append("<div class='footer'>\n");
        content.append("Bu belge ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")))
            .append(" tarihinde otomatik olarak oluşturulmuştur. Geciken Ödeme Hatırlatma Sistemi.\n");
        content.append("</div>\n");
        
        content.append("</body>\n</html>");
        
        return content.toString();
    }

    private String generateOverduePaymentFilename(CustomerDto customer) {
        String customerName = customer != null ? customer.getFirstName() + "_" + customer.getLastName() : "Unknown";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return String.format("Geciken_Odeme_Bildirimi_%s_%s.pdf", customerName, timestamp);
    }

    // Gelecekte diğer action tipleri için genişletilebilir
    public Long generateDocument(String actionType, Object data) {
        switch (actionType) {
            case "GENERATE_STATEMENT":
                return generateStatementDocument((StatementResponseDto) data);
            case "OVERDUE_PAYMENT_STATEMENT":
                return generateOverduePaymentStatementDocument((OverduePaymentStatementDto) data);
            // Diğer action tipleri buraya eklenebilir
            default:
                throw new UnsupportedOperationException("Document generation not supported for action type: " + actionType);
        }
    }
} 