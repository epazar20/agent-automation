package com.example.agentprovider.model.deepl;

import lombok.Data;
import lombok.Builder;
import java.util.List;

@Data
@Builder
public class DeepLRequest {
    private List<String> text;
    private String target_lang;
} 