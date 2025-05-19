package com.example.agentprovider.model.stability;

import lombok.Data;
import java.util.List;

@Data
public class StabilityAiResponse {
    private List<StabilityAiArtifact> artifacts;
} 