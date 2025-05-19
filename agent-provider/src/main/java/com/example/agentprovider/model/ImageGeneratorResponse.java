package com.example.agentprovider.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ImageGeneratorResponse extends AiResponse {
    private String base64Image;
} 