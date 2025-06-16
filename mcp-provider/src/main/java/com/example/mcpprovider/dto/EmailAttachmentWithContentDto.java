package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailAttachmentWithContentDto {
    private Long id;
    private String filename;
    private String contentType;
    private Long fileSize;
    private String actionType;
    private Long customerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String base64Content; // Base64 encoded file content
} 