package com.example.mcpprovider.controller;

import com.example.mcpprovider.dto.EmailDto;
import com.example.mcpprovider.dto.EmailResponseDto;
import com.example.mcpprovider.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/simple")
    public ResponseEntity<EmailResponseDto> sendSimpleEmail(@RequestBody EmailDto emailDto) {
        log.info("Sending simple email to: {} with attachmentIds: {}", emailDto.getTo(), emailDto.getAttachmentIds());
        
        EmailResponseDto response;
        // Eğer attachment ID'leri varsa, onları kullanarak gönder
        if (emailDto.getAttachmentIds() != null && !emailDto.getAttachmentIds().isEmpty()) {
            response = emailService.sendEmailWithAttachmentIds(emailDto, emailDto.getAttachmentIds());
        } else {
            response = emailService.sendSimpleEmail(emailDto);
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/html")
    public ResponseEntity<EmailResponseDto> sendHtmlEmail(@RequestBody EmailDto emailDto) {
        log.info("Sending HTML email to: {} with attachmentIds: {}", emailDto.getTo(), emailDto.getAttachmentIds());
        
        EmailResponseDto response;
        // Eğer attachment ID'leri varsa, onları kullanarak gönder
        if (emailDto.getAttachmentIds() != null && !emailDto.getAttachmentIds().isEmpty()) {
            response = emailService.sendEmailWithAttachmentIds(emailDto, emailDto.getAttachmentIds());
        } else {
            response = emailService.sendHtmlEmail(emailDto);
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/welcome")
    public ResponseEntity<EmailResponseDto> sendWelcomeEmail(
            @RequestParam String to,
            @RequestParam String customerName,
            @RequestParam String accountNumber) {
        log.info("Sending welcome email to: {}", to);
        EmailResponseDto response = emailService.sendWelcomeEmail(to, customerName, accountNumber);
        return ResponseEntity.ok(response);
    }
} 