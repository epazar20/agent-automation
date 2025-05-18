package com.example.agentprovider.model;

import lombok.Data;
import lombok.experimental.SuperBuilder;
import lombok.EqualsAndHashCode;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class TranslatorResponse extends AiResponse {
    private String translatedContent;
    private String detectedSourceLanguage;
} 