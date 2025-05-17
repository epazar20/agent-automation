package com.example.agentprovider.model;

import lombok.Data;

@Data
public class AiResponse {
    private String model;
    private String response;
    private long processingTimeMs;
    private boolean success;
    private String errorMessage;
} 