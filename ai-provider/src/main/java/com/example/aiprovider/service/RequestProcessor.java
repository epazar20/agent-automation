package com.example.aiprovider.service;

import com.example.aiprovider.utils.JsonEscapeHelper;
import com.example.aiprovider.model.AiRequest;
import com.example.aiprovider.model.HuggingFaceRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

/**
 * Service for processing and sanitizing AI requests
 */
@Service
public class RequestProcessor {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Sanitizes an AI request by properly escaping special characters in JSON
     * 
     * @param request The original AI request
     * @return Sanitized AI request
     */
    public AiRequest sanitizeRequest(AiRequest request) {
        if (request == null) {
            return null;
        }
        
        // Create a deep copy of the request to avoid modifying the original
        AiRequest sanitizedRequest = new AiRequest();
        
        // Sanitize the prompt text which may contain JSON special characters
        if (request.getPrompt() != null) {
            sanitizedRequest.setPrompt(request.getPrompt());
        }
        
        // Sanitize the special prompt text
        if (request.getSpecialPrompt() != null) {
            sanitizedRequest.setSpecialPrompt(request.getSpecialPrompt());
        }
        
        // Copy other fields that don't need special handling
        sanitizedRequest.setModel(request.getModel());
        sanitizedRequest.setMaxTokens(request.getMaxTokens());
        sanitizedRequest.setTemperature(request.getTemperature());
        
        return sanitizedRequest;
    }
    
    /**
     * Converts an AI request to a HuggingFace compatible request format
     * with proper JSON escaping
     * 
     * @param request The original AI request
     * @return HuggingFace formatted request with escaped strings
     */
    public HuggingFaceRequest convertToHuggingFaceRequest(AiRequest request) {
        HuggingFaceRequest hfRequest = new HuggingFaceRequest();
        
        // Create the messages array with system and user messages
        ArrayNode messages = objectMapper.createArrayNode();
        
        // Add system message if specialPrompt is provided
        if (request.getSpecialPrompt() != null && !request.getSpecialPrompt().isEmpty()) {
            ObjectNode systemMessage = objectMapper.createObjectNode();
            systemMessage.put("role", "system");
            systemMessage.put("content", request.getSpecialPrompt());
            messages.add(systemMessage);
        }
        
        // Add user message with the prompt
        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.put("content", request.getPrompt());
        messages.add(userMessage);
        
        // Set the messages and other parameters
        hfRequest.setMessages(messages);
        hfRequest.setModel(request.getModel());
        hfRequest.setMax_tokens(request.getMaxTokens());
        hfRequest.setTemperature(request.getTemperature());
        
        return hfRequest;
    }
    
    /**
     * Generates a valid JSON string for the request
     * 
     * @param request The request object
     * @return JSON string with properly escaped content
     */
    public String generateValidJsonString(Object request) {
        try {
            return objectMapper.writeValueAsString(request);
        } catch (Exception e) {
            throw new RuntimeException("Error generating JSON", e);
        }
    }
} 