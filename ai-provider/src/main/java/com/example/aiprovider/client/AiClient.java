package com.example.aiprovider.client;

import com.example.aiprovider.model.AiRequest;
 
public interface AiClient {
    String callAPI(AiRequest request) throws Exception;
} 