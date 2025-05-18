package com.example.agentprovider.model;

import lombok.Data;

@Data
public class WebSearcherResponse {
    private String content;
    private boolean success = true;
    private String errorMessage;
} 