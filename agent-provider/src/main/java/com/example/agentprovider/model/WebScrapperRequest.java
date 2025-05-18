package com.example.agentprovider.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WebScrapperRequest extends AiRequest {
    private int maxLink;
    private int maxDepth;
} 