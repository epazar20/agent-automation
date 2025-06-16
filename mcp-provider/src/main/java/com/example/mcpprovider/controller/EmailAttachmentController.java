package com.example.mcpprovider.controller;

import com.example.mcpprovider.dto.EmailAttachmentResponseDto;
import com.example.mcpprovider.dto.EmailAttachmentWithContentDto;
import com.example.mcpprovider.service.EmailAttachmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/email-attachments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EmailAttachmentController {
    
    private final EmailAttachmentService emailAttachmentService;
    
    @GetMapping
    public ResponseEntity<List<EmailAttachmentResponseDto>> getAllEmailAttachments() {
        log.info("GET /api/email-attachments - Getting all email attachments");
        List<EmailAttachmentResponseDto> attachments = emailAttachmentService.getAllEmailAttachments();
        return ResponseEntity.ok(attachments);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmailAttachmentResponseDto> getEmailAttachmentById(@PathVariable Long id) {
        log.info("GET /api/email-attachments/{} - Getting email attachment by id", id);
        Optional<EmailAttachmentResponseDto> attachment = emailAttachmentService.getEmailAttachmentById(id);
        return attachment.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/with-content")
    public ResponseEntity<EmailAttachmentWithContentDto> getEmailAttachmentWithContentById(@PathVariable Long id) {
        log.info("GET /api/email-attachments/{}/with-content - Getting email attachment with content by id", id);
        Optional<EmailAttachmentWithContentDto> attachment = emailAttachmentService.getEmailAttachmentWithContentById(id);
        return attachment.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/by-ids")
    public ResponseEntity<List<EmailAttachmentResponseDto>> getEmailAttachmentsByIds(@RequestBody List<Long> ids) {
        log.info("POST /api/email-attachments/by-ids - Getting email attachments by ids: {}", ids);
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<EmailAttachmentResponseDto> attachments = emailAttachmentService.getEmailAttachmentsByIds(ids);
        return ResponseEntity.ok(attachments);
    }
    
    @PostMapping("/by-ids/with-content")
    public ResponseEntity<List<EmailAttachmentWithContentDto>> getEmailAttachmentsWithContentByIds(@RequestBody List<Long> ids) {
        log.info("POST /api/email-attachments/by-ids/with-content - Getting email attachments with content by ids: {}", ids);
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<EmailAttachmentWithContentDto> attachments = emailAttachmentService.getEmailAttachmentsWithContentByIds(ids);
        return ResponseEntity.ok(attachments);
    }
    
    @GetMapping("/action-type/{actionType}")
    public ResponseEntity<List<EmailAttachmentResponseDto>> getEmailAttachmentsByActionType(@PathVariable String actionType) {
        log.info("GET /api/email-attachments/action-type/{} - Getting email attachments by action type", actionType);
        List<EmailAttachmentResponseDto> attachments = emailAttachmentService.getEmailAttachmentsByActionType(actionType);
        return ResponseEntity.ok(attachments);
    }
    
    @GetMapping("/action-type/{actionType}/with-content")
    public ResponseEntity<List<EmailAttachmentWithContentDto>> getEmailAttachmentsWithContentByActionType(@PathVariable String actionType) {
        log.info("GET /api/email-attachments/action-type/{}/with-content - Getting email attachments with content by action type", actionType);
        List<EmailAttachmentWithContentDto> attachments = emailAttachmentService.getEmailAttachmentsWithContentByActionType(actionType);
        return ResponseEntity.ok(attachments);
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<EmailAttachmentResponseDto>> getEmailAttachmentsByCustomerId(@PathVariable Long customerId) {
        log.info("GET /api/email-attachments/customer/{} - Getting email attachments by customer id", customerId);
        List<EmailAttachmentResponseDto> attachments = emailAttachmentService.getEmailAttachmentsByCustomerId(customerId);
        return ResponseEntity.ok(attachments);
    }
    
    @GetMapping("/customer/{customerId}/with-content")
    public ResponseEntity<List<EmailAttachmentWithContentDto>> getEmailAttachmentsWithContentByCustomerId(@PathVariable Long customerId) {
        log.info("GET /api/email-attachments/customer/{}/with-content - Getting email attachments with content by customer id", customerId);
        List<EmailAttachmentWithContentDto> attachments = emailAttachmentService.getEmailAttachmentsWithContentByCustomerId(customerId);
        return ResponseEntity.ok(attachments);
    }
    
    @GetMapping("/action-type/{actionType}/customer/{customerId}")
    public ResponseEntity<List<EmailAttachmentResponseDto>> getEmailAttachmentsByActionTypeAndCustomerId(
            @PathVariable String actionType, 
            @PathVariable Long customerId) {
        log.info("GET /api/email-attachments/action-type/{}/customer/{} - Getting email attachments by action type and customer id", actionType, customerId);
        List<EmailAttachmentResponseDto> attachments = emailAttachmentService.getEmailAttachmentsByActionTypeAndCustomerId(actionType, customerId);
        return ResponseEntity.ok(attachments);
    }
    
    @GetMapping("/action-type/{actionType}/customer/{customerId}/with-content")
    public ResponseEntity<List<EmailAttachmentWithContentDto>> getEmailAttachmentsWithContentByActionTypeAndCustomerId(
            @PathVariable String actionType, 
            @PathVariable Long customerId) {
        log.info("GET /api/email-attachments/action-type/{}/customer/{}/with-content - Getting email attachments with content by action type and customer id", actionType, customerId);
        List<EmailAttachmentWithContentDto> attachments = emailAttachmentService.getEmailAttachmentsWithContentByActionTypeAndCustomerId(actionType, customerId);
        return ResponseEntity.ok(attachments);
    }
    
    @GetMapping("/{id}/content")
    public ResponseEntity<String> getEmailAttachmentContent(@PathVariable Long id) {
        log.info("GET /api/email-attachments/{}/content - Getting email attachment content", id);
        Optional<String> content = emailAttachmentService.getEmailAttachmentContent(id);
        return content.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadEmailAttachment(@PathVariable Long id) {
        log.info("GET /api/email-attachments/{}/download - Downloading email attachment", id);
        
        Optional<EmailAttachmentResponseDto> attachmentDto = emailAttachmentService.getEmailAttachmentById(id);
        Optional<String> content = emailAttachmentService.getEmailAttachmentContent(id);
        
        if (attachmentDto.isPresent() && content.isPresent()) {
            try {
                byte[] fileContent = Base64.getDecoder().decode(content.get());
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(attachmentDto.get().getContentType()));
                headers.setContentDispositionFormData("attachment", attachmentDto.get().getFilename());
                headers.setContentLength(fileContent.length);
                
                return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
            } catch (Exception e) {
                log.error("Error decoding attachment content for id: {}", id, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmailAttachment(@PathVariable Long id) {
        log.info("DELETE /api/email-attachments/{} - Deleting email attachment", id);
        
        if (!emailAttachmentService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        emailAttachmentService.deleteEmailAttachment(id);
        return ResponseEntity.noContent().build();
    }
} 