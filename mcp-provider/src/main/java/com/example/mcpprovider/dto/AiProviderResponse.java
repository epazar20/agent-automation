package com.example.mcpprovider.dto;

public class AiProviderResponse {
    
    private String model;
    private String content;
    private Long processingTimeMs;
    private Boolean success;
    private String errorMessage;

    // Default constructor
    public AiProviderResponse() {}

    // Constructor with all fields
    public AiProviderResponse(String model, String content, Long processingTimeMs, 
                            Boolean success, String errorMessage) {
        this.model = model;
        this.content = content;
        this.processingTimeMs = processingTimeMs;
        this.success = success;
        this.errorMessage = errorMessage;
    }

    // Getters and Setters
    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(Long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
} 