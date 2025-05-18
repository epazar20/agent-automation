package com.example.agentprovider.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
public class AiResponse {
    private String content;
    private String model;
    private long processingTimeMs;
    private boolean success;
    private String errorMessage;
} 