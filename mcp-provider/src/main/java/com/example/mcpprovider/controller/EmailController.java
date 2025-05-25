package com.example.mcpprovider.controller;

import com.example.mcpprovider.dto.EmailDto;
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
    public ResponseEntity<Void> sendSimpleEmail(@RequestBody EmailDto emailDto) {
        log.info("Sending simple email to: {}", emailDto.getTo());
        emailService.sendSimpleEmail(emailDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/html")
    public ResponseEntity<Void> sendHtmlEmail(@RequestBody EmailDto emailDto) {
        log.info("Sending HTML email to: {}", emailDto.getTo());
        emailService.sendHtmlEmail(emailDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/welcome")
    public ResponseEntity<Void> sendWelcomeEmail(
            @RequestParam String to,
            @RequestParam String customerName,
            @RequestParam String accountNumber) {
        log.info("Sending welcome email to: {}", to);
        emailService.sendWelcomeEmail(to, customerName, accountNumber);
        return ResponseEntity.ok().build();
    }
} 