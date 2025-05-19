package com.example.agentprovider.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class DataAnalyserResponse extends AiResponse {
    private String base64Image;
} 