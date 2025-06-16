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
public class EmailAttachmentResponseDto {
    private Long id;
    private String filename;
    private String contentType;
    private Long fileSize;
    private String actionType;
    private Long customerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Note: base64Content is excluded from response for performance reasons
    // It can be retrieved separately if needed
} 