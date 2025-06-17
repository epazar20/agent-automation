package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailResponseDto {
    private boolean success;
    private String message;
    private List<Long> attachmentIds;
    private CustomerDto customer;
    private String emailSentTo;
    private String subject;
} 