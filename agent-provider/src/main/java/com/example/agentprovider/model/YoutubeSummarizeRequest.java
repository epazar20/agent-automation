package com.example.agentprovider.model;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
public class YoutubeSummarizeRequest {
    
    @NotBlank(message = "YouTube URL is required")
    private String url; // YouTube URL
    
    private String content = "";
    
    private String specialPrompt = "Sen bir transkript özetleyicisin. Verilen metni özetleyeceksin.";
    
    private String model = "huggingface/deepseek/deepseek-v3-0324";
    
    private int maxTokens = 1000;
    
    private double temperature = 0.7;
} 