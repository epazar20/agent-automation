package com.example.agentprovider.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiRequest {
    private String prompt;
    private String specialPrompt;
    private String model;
    private int maxTokens;
    private double temperature;
} 