package com.example.agentprovider.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiRequest {
    private String content;
    private String specialPrompt;
    private String model;
    private int maxTokens;
    private double temperature;

    public AiRequest() {
    }

    public AiRequest(String content, String specialPrompt, String model, int maxTokens, double temperature) {
        this.content = content;
        this.specialPrompt = specialPrompt;
        this.model = model;
        this.maxTokens = maxTokens;
        this.temperature = temperature;
    }
} 