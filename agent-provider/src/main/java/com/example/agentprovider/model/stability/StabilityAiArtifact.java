package com.example.agentprovider.model.stability;

import lombok.Data;

@Data
public class StabilityAiArtifact {
    private String base64;
    private long seed;
    private String finishReason;
} 