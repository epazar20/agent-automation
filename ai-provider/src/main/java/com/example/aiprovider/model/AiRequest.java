package com.example.aiprovider.model;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
public class AiRequest {
    
    @NotBlank(message = "Prompt is required")
    private String prompt;
    
    private String specialPrompt;
    
    private String model = "huggingface/deepseek/deepseek-v3-0324"; // "huggingface", "deepseek", "openai", "gemini", "claude"
    
    private int maxTokens = 1000;
    
    private double temperature = 0.7;
    
    // Other common parameters
} 