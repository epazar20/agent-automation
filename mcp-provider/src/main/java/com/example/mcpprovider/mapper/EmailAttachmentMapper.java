package com.example.mcpprovider.mapper;

import com.example.mcpprovider.dto.EmailAttachmentResponseDto;
import com.example.mcpprovider.dto.EmailAttachmentWithContentDto;
import com.example.mcpprovider.entity.EmailAttachment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EmailAttachmentMapper {
    
    public EmailAttachmentResponseDto toDto(EmailAttachment emailAttachment) {
        if (emailAttachment == null) {
            return null;
        }
        
        return EmailAttachmentResponseDto.builder()
                .id(emailAttachment.getId())
                .filename(emailAttachment.getFilename())
                .contentType(emailAttachment.getContentType())
                .fileSize(emailAttachment.getFileSize())
                .actionType(emailAttachment.getActionType())
                .customerId(emailAttachment.getCustomerId())
                .createdAt(emailAttachment.getCreatedAt())
                .updatedAt(emailAttachment.getUpdatedAt())
                .build();
    }
    
    public EmailAttachmentWithContentDto toDtoWithContent(EmailAttachment emailAttachment) {
        if (emailAttachment == null) {
            return null;
        }
        
        return EmailAttachmentWithContentDto.builder()
                .id(emailAttachment.getId())
                .filename(emailAttachment.getFilename())
                .contentType(emailAttachment.getContentType())
                .fileSize(emailAttachment.getFileSize())
                .actionType(emailAttachment.getActionType())
                .customerId(emailAttachment.getCustomerId())
                .createdAt(emailAttachment.getCreatedAt())
                .updatedAt(emailAttachment.getUpdatedAt())
                .base64Content(emailAttachment.getBase64Content())
                .build();
    }
    
    public List<EmailAttachmentResponseDto> toDtoList(List<EmailAttachment> emailAttachments) {
        return emailAttachments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public List<EmailAttachmentWithContentDto> toDtoWithContentList(List<EmailAttachment> emailAttachments) {
        return emailAttachments.stream()
                .map(this::toDtoWithContent)
                .collect(Collectors.toList());
    }
} 