package com.example.agentprovider.model;

import lombok.Data;

@Data
public class TranslatorRequest extends AiRequest {
    private String targetLanguage;
    private String specialPrompt;
} 