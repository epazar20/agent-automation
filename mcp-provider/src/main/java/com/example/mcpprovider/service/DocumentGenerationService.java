package com.example.mcpprovider.service;

import com.example.mcpprovider.dto.StatementResponseDto;
import com.example.mcpprovider.dto.TransactionResponseDto;
import com.example.mcpprovider.dto.CustomerDto;
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

    // Gelecekte diğer action tipleri için genişletilebilir
    public Long generateDocument(String actionType, Object data) {
        switch (actionType) {
            case "GENERATE_STATEMENT":
                return generateStatementDocument((StatementResponseDto) data);
            // Diğer action tipleri buraya eklenebilir
            default:
                throw new UnsupportedOperationException("Document generation not supported for action type: " + actionType);
        }
    }
} 