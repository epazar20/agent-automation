package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowCreateDto {
    
    @NotBlank(message = "Workflow name is required")
    @Size(max = 200, message = "Workflow name cannot exceed 200 characters")
    private String name;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @NotBlank(message = "Nodes data is required")
    private String nodesData;
    
    @NotBlank(message = "Edges data is required")
    private String edgesData;
    
    @Size(max = 500, message = "Tags cannot exceed 500 characters")
    private String tags;
    
    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;
    
    @Size(max = 100, message = "Created by cannot exceed 100 characters")
    private String createdBy;
} 