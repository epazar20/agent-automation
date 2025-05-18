package com.example.aiprovider.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiResponse {
    
    private String model;
    
    private String content;
    
    private long processingTimeMs;
    
    private boolean success = true;
    
    private String errorMessage;
} 