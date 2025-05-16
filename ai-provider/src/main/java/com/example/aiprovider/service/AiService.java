package com.example.aiprovider.service;

import com.example.aiprovider.model.AiRequest;
import com.example.aiprovider.model.AiResponse;

public interface AiService {
    
    AiResponse processRequest(AiRequest request);
    
    String[] listAvailableModels();
} 