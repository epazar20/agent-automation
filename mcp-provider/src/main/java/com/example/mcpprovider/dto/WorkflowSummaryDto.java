package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowSummaryDto {
    
    private Long id;
    private String name;
    private String description;
    private Integer version;
    private Boolean isActive;
    private String tags;
    private String category;
    private String createdBy;
    private Long executionCount;
    private LocalDateTime lastExecutedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 