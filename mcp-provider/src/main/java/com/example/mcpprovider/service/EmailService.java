package com.example.mcpprovider.service;

import com.example.mcpprovider.dto.EmailAttachmentDto;
import com.example.mcpprovider.dto.EmailDto;
import com.example.mcpprovider.dto.EmailResponseDto;
import com.example.mcpprovider.dto.CustomerDto;
import com.example.mcpprovider.entity.EmailAttachment;
import com.example.mcpprovider.repository.EmailAttachmentRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender emailSender;
    private final SpringTemplateEngine templateEngine;
    private final EmailAttachmentRepository emailAttachmentRepository;
    private final CustomerService customerService;

    public EmailResponseDto sendSimpleEmail(EmailDto emailDto) {
        try {
            // Get customer information
            CustomerDto customer = getCustomerInfo(emailDto.getCustomerId());
            
            // Müşteri numarasını mesajın başına ekle
            String updatedBody = String.format("Müşteri numaranız: %s\n\n%s", 
                emailDto.getCustomerId(), emailDto.getBody());
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("esrefpazar@gmail.com"); // Test için tüm mailleri bu adrese yönlendir
            if (emailDto.getCc() != null && !emailDto.getCc().isEmpty()) {
                message.setCc(emailDto.getCc().toArray(new String[0]));
            }
            if (emailDto.getBcc() != null && !emailDto.getBcc().isEmpty()) {
                message.setBcc(emailDto.getBcc().toArray(new String[0]));
            }
            message.setSubject(emailDto.getSubject());
            message.setText(updatedBody);
            
            emailSender.send(message);
            log.info("Simple email sent successfully to: esrefpazar@gmail.com");
            
            return EmailResponseDto.builder()
                .success(true)
                .message("Email sent successfully")
                .attachmentIds(emailDto.getAttachmentIds())
                .customer(customer)
                .emailSentTo("esrefpazar@gmail.com")
                .subject(emailDto.getSubject())
                .build();
                
        } catch (Exception e) {
            log.error("Failed to send simple email to: {}", emailDto.getTo(), e);
            return EmailResponseDto.builder()
                .success(false)
                .message("Failed to send email: " + e.getMessage())
                .attachmentIds(emailDto.getAttachmentIds())
                .customer(getCustomerInfo(emailDto.getCustomerId()))
                .emailSentTo(emailDto.getTo())
                .subject(emailDto.getSubject())
                .build();
        }
    }

    public EmailResponseDto sendHtmlEmail(EmailDto emailDto) {
        try {
            // Get customer information
            CustomerDto customer = getCustomerInfo(emailDto.getCustomerId());
            
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            helper.setTo("esrefpazar@gmail.com"); // Test için tüm mailleri bu adrese yönlendir
            if (emailDto.getCc() != null && !emailDto.getCc().isEmpty()) {
                helper.setCc(emailDto.getCc().toArray(new String[0]));
            }
            if (emailDto.getBcc() != null && !emailDto.getBcc().isEmpty()) {
                helper.setBcc(emailDto.getBcc().toArray(new String[0]));
            }
            helper.setSubject(emailDto.getSubject());

            String content;
            if (emailDto.getTemplate() != null) {
                content = processTemplate(emailDto);
            } else {
                // Müşteri numarasını HTML mesajın başına ekle
                content = String.format("<p><strong>Müşteri numaranız: %s</strong></p><br>%s", 
                    emailDto.getCustomerId(), emailDto.getBody());
            }
            helper.setText(content, true);

            // Add attachments if any
            if (emailDto.getAttachments() != null) {
                for (EmailAttachmentDto attachment : emailDto.getAttachments()) {
                    helper.addAttachment(
                        attachment.getFilename(),
                        new ByteArrayResource(attachment.getContent()),
                        attachment.getContentType()
                    );
                }
            }

            emailSender.send(message);
            log.info("HTML email sent successfully to: esrefpazar@gmail.com");
            
            return EmailResponseDto.builder()
                .success(true)
                .message("HTML email sent successfully")
                .attachmentIds(emailDto.getAttachmentIds())
                .customer(customer)
                .emailSentTo("esrefpazar@gmail.com")
                .subject(emailDto.getSubject())
                .build();
                
        } catch (Exception e) {
            log.error("Failed to send HTML email to: {}", emailDto.getTo(), e);
            return EmailResponseDto.builder()
                .success(false)
                .message("Failed to send HTML email: " + e.getMessage())
                .attachmentIds(emailDto.getAttachmentIds())
                .customer(getCustomerInfo(emailDto.getCustomerId()))
                .emailSentTo(emailDto.getTo())
                .subject(emailDto.getSubject())
                .build();
        }
    }

    public EmailResponseDto sendEmailWithAttachmentIds(EmailDto emailDto, List<Long> attachmentIds) {
        try {
            log.info("Sending email with attachment IDs: {}", attachmentIds);
            
            // Get customer information
            CustomerDto customer = getCustomerInfo(emailDto.getCustomerId());
            
            // Attachment ID'lerden dosyaları yükle
            List<EmailAttachmentDto> attachments = new ArrayList<>();
            List<Long> successfulAttachmentIds = new ArrayList<>();
            
            if (attachmentIds != null && !attachmentIds.isEmpty()) {
                for (Long attachmentId : attachmentIds) {
                    EmailAttachment dbAttachment = emailAttachmentRepository.findById(attachmentId)
                        .orElse(null);
                    if (dbAttachment != null) {
                        EmailAttachmentDto attachmentDto = EmailAttachmentDto.builder()
                            .filename(dbAttachment.getFilename())
                            .contentType(dbAttachment.getContentType())
                            .content(Base64.getDecoder().decode(dbAttachment.getBase64Content()))
                            .build();
                        attachments.add(attachmentDto);
                        successfulAttachmentIds.add(attachmentId);
                        log.info("Added attachment: {} (size: {} bytes)", 
                            dbAttachment.getFilename(), dbAttachment.getFileSize());
                    } else {
                        log.warn("Attachment not found with ID: {}", attachmentId);
                    }
                }
            }
            
            // EmailDto'ya attachment'ları ekle
            emailDto.setAttachments(attachments);
            
            // HTML email gönder (attachment'lar için)
            EmailResponseDto response = sendHtmlEmail(emailDto);
            
            // Update response with successful attachment IDs
            response.setAttachmentIds(successfulAttachmentIds);
            
            return response;
            
        } catch (Exception e) {
            log.error("Failed to send email with attachments: {}", e.getMessage(), e);
            return EmailResponseDto.builder()
                .success(false)
                .message("Failed to send email with attachments: " + e.getMessage())
                .attachmentIds(attachmentIds)
                .customer(getCustomerInfo(emailDto.getCustomerId()))
                .emailSentTo(emailDto.getTo())
                .subject(emailDto.getSubject())
                .build();
        }
    }

    private String processTemplate(EmailDto emailDto) {
        Context context = new Context();
        if (emailDto.getTemplateVariables() != null) {
            emailDto.getTemplateVariables().forEach(context::setVariable);
        }
        return templateEngine.process(emailDto.getTemplate(), context);
    }

    public EmailResponseDto sendWelcomeEmail(String to, String customerName, String accountNumber) {
        try {
            EmailDto emailDto = EmailDto.builder()
                    .to("esrefpazar@gmail.com") // Test için tüm mailleri bu adrese yönlendir
                    .subject("Welcome to Our Financial Services")
                    .template("welcome-email")
                    .templateVariables(Map.of(
                        "customerName", customerName,
                        "accountNumber", accountNumber,
                        "registrationDate", LocalDateTime.now(),
                        "dashboardUrl", "https://your-domain.com/dashboard",
                        "profileUrl", "https://your-domain.com/profile"
                    ))
                    .isHtml(true)
                    .build();

            EmailResponseDto response = sendHtmlEmail(emailDto);
            return response;
            
        } catch (Exception e) {
            log.error("Failed to send welcome email", e);
            return EmailResponseDto.builder()
                .success(false)
                .message("Failed to send welcome email: " + e.getMessage())
                .emailSentTo(to)
                .subject("Welcome to Our Financial Services")
                .build();
        }
    }
    
    private CustomerDto getCustomerInfo(String customerId) {
        if (customerId == null || customerId.trim().isEmpty()) {
            return null;
        }
        
        try {
            Long id = Long.parseLong(customerId);
            return customerService.getCustomerById(id).orElse(null);
        } catch (NumberFormatException e) {
            log.warn("Invalid customer ID format: {}", customerId);
            return null;
        }
    }
} 