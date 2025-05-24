package com.example.mcpprovider.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ActionAnalysisRequest {
    
    @NotBlank(message = "Content cannot be blank")
    private String content;
    
    private String specialPrompt;
    
    @NotBlank(message = "Model cannot be blank")
    private String model;
    
    @NotNull(message = "Max tokens cannot be null")
    private Integer maxTokens;
    
    @NotNull(message = "Temperature cannot be null")
    private Double temperature;
    
    private String customerNo;

    // Default constructor
    public ActionAnalysisRequest() {}

    // Constructor with all fields
    public ActionAnalysisRequest(String content, String specialPrompt, String model, 
                               Integer maxTokens, Double temperature, String customerNo) {
        this.content = content;
        this.specialPrompt = specialPrompt;
        this.model = model;
        this.maxTokens = maxTokens;
        this.temperature = temperature;
        this.customerNo = customerNo;
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

    public String getCustomerNo() {
        return customerNo;
    }

    public void setCustomerNo(String customerNo) {
        this.customerNo = customerNo;
    }
} 