package com.example.agentprovider.service;

import com.example.agentprovider.model.WebScrapperRequest;
import com.example.agentprovider.model.WebScrapperResponse;

public interface WebScrapperService {
    WebScrapperResponse processWebScrapper(WebScrapperRequest request);
} 