package com.example.agentprovider.model.deepl;

import lombok.Data;
import java.util.List;

@Data
public class DeepLResponse {
    private List<Translation> translations;

    @Data
    public static class Translation {
        private String detected_source_language;
        private String text;
    }
} 