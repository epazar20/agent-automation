package com.example.agentprovider.service;

import com.example.agentprovider.model.TranslatorRequest;
import com.example.agentprovider.model.TranslatorResponse;

public interface TranslatorService {
    TranslatorResponse translate(TranslatorRequest request);
} 