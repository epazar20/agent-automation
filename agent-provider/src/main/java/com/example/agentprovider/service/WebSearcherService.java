package com.example.agentprovider.service;

import com.example.agentprovider.model.WebSearcherRequest;
import com.example.agentprovider.model.WebSearcherResponse;

public interface WebSearcherService {
    WebSearcherResponse search(WebSearcherRequest request);
} 