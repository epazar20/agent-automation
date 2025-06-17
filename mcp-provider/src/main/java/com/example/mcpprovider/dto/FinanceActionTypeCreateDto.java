package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinanceActionTypeCreateDto {
    
    @NotBlank(message = "Type code is required")
    @Size(max = 50, message = "Type code must not exceed 50 characters")
    private String typeCode;
    
    @NotBlank(message = "Type name is required")
    @Size(max = 100, message = "Type name must not exceed 100 characters")
    private String typeName;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Sample prompt is required")
    private String samplePrompt;
    
    @NotBlank(message = "Endpoint path is required")
    @Size(max = 200, message = "Endpoint path must not exceed 200 characters")
    private String endpointPath;
    
    private String jsonSchema;
    
    @NotNull(message = "Is active status is required")
    @Builder.Default
    private Boolean isActive = true;
    
    private Integer sortOrder;
} 