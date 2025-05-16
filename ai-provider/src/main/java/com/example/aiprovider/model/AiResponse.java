package com.example.aiprovider.model;

import lombok.Data;

@Data
public class AiResponse {
    
    private String model;
    
    private String response;
    
    private long processingTimeMs;
    
    private boolean success = true;
    
    private String errorMessage;
} 