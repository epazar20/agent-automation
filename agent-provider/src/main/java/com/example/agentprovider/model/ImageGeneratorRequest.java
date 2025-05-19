package com.example.agentprovider.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ImageGeneratorRequest extends AiRequest {
    private int width = 320;
    private int height = 320;
} 