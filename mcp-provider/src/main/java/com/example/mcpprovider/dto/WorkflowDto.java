package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDto {
    
    private Long id;
    
    @NotBlank(message = "Workflow name is required")
    @Size(max = 200, message = "Workflow name cannot exceed 200 characters")
    private String name;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @NotBlank(message = "Nodes data is required")
    private String nodesData;
    
    @NotBlank(message = "Edges data is required")
    private String edgesData;
    
    @NotNull(message = "Version is required")
    private Integer version;
    
    @NotNull(message = "Active status is required")
    private Boolean isActive;
    
    @Size(max = 500, message = "Tags cannot exceed 500 characters")
    private String tags;
    
    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;
    
    @Size(max = 100, message = "Created by cannot exceed 100 characters")
    private String createdBy;
    
    @Size(max = 100, message = "Last modified by cannot exceed 100 characters")
    private String lastModifiedBy;
    
    private Long executionCount;
    
    private LocalDateTime lastExecutedAt;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 