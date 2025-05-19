package com.example.agentprovider.service;

import com.example.agentprovider.model.ImageGeneratorRequest;
import com.example.agentprovider.model.ImageGeneratorResponse;

public interface ImageGeneratorService {
    ImageGeneratorResponse generateImage(ImageGeneratorRequest request);
} 