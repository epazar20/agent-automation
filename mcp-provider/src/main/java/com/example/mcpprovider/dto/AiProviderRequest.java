package com.example.mcpprovider.dto;

public class AiProviderRequest {
    
    private String content;
    private String specialPrompt;
    private String model;
    private Integer maxTokens;
    private Double temperature;

    // Default constructor
    public AiProviderRequest() {}

    // Constructor with all fields
    public AiProviderRequest(String content, String specialPrompt, String model, 
                           Integer maxTokens, Double temperature) {
        this.content = content;
        this.specialPrompt = specialPrompt;
        this.model = model;
        this.maxTokens = maxTokens;
        this.temperature = temperature;
    }

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSpecialPrompt() {
        return specialPrompt;
    }

    public void setSpecialPrompt(String specialPrompt) {
        this.specialPrompt = specialPrompt;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(Integer maxTokens) {
        this.maxTokens = maxTokens;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }
} 