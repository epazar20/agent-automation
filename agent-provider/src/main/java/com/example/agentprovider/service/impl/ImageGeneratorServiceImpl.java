package com.example.agentprovider.service.impl;

import com.example.agentprovider.model.ImageGeneratorRequest;
import com.example.agentprovider.model.ImageGeneratorResponse;
import com.example.agentprovider.model.stability.StabilityAiResponse;
import com.example.agentprovider.service.ImageGeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;

@Service
public class ImageGeneratorServiceImpl implements ImageGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(ImageGeneratorServiceImpl.class);
    private final WebClient webClient;
    private final String apiKey;

    public ImageGeneratorServiceImpl(@Value("${stability.ai.key}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
            .baseUrl("https://api.stability.ai")
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();
    }

    @Override
    public ImageGeneratorResponse generateImage(ImageGeneratorRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be null or empty");
        }

        // Ensure minimum dimensions
        int width = Math.max(320, request.getWidth());
        int height = Math.max(320, request.getHeight());

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> textPrompt = new HashMap<>();
        textPrompt.put("text", request.getContent());
        textPrompt.put("weight", 1);
        
        requestBody.put("text_prompts", Collections.singletonList(textPrompt));
        requestBody.put("width", width);
        requestBody.put("height", height);
        requestBody.put("samples", 1);
        requestBody.put("steps", 30);
        requestBody.put("cfg_scale", 7);

        logger.debug("Sending request to Stability AI: {}", requestBody);

        try {
            StabilityAiResponse response = webClient.post()
                .uri("/v1/generation/stable-diffusion-v1-6/text-to-image")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(StabilityAiResponse.class)
                .block();

            return ImageGeneratorResponse.builder()
                .base64Image(response != null && response.getArtifacts() != null && !response.getArtifacts().isEmpty() 
                    ? response.getArtifacts().get(0).getBase64() 
                    : null)
                .success(true)
                .build();
        } catch (Exception e) {
            logger.error("Error from Stability AI: {}", e.getMessage());
            throw new RuntimeException("Failed to generate image: " + e.getMessage());
        }
    }
} 