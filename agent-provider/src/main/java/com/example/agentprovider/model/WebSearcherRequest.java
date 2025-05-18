package com.example.agentprovider.model;

import lombok.Data;

@Data
public class WebSearcherRequest {
    private String content;
    private String language;
    private int maxResult;
} 