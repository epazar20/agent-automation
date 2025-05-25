package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailDto {
    private String to;
    private List<String> cc;
    private List<String> bcc;
    private String subject;
    private String body;
    private boolean isHtml;
    private String template;
    private Map<String, Object> templateVariables;
    private List<EmailAttachmentDto> attachments;
} 