package com.example.aiprovider.service.impl;

import com.example.aiprovider.client.ClaudeClient;
import com.example.aiprovider.client.DeepseekClient;
import com.example.aiprovider.client.GeminiClient;
import com.example.aiprovider.client.HuggingFaceClient;
import com.example.aiprovider.client.OpenAiClient;
import com.example.aiprovider.model.AiRequest;
import com.example.aiprovider.model.AiResponse;
import com.example.aiprovider.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DefaultAiService implements AiService {

    private static final String[] SUPPORTED_MODELS = {
        "huggingface/deepseek/deepseek-v3-0324",
        "mistralai/Mistral-7B-Instruct-v0.2",
        "meta-llama/Llama-2-70b-chat-hf",
        "gpt-3.5-turbo", 
        "gpt-4", 
        "claude-3-opus", 
        "claude-3-sonnet"
    };
    
    private final DeepseekClient deepseekClient;
    private final OpenAiClient openAiClient;
    private final GeminiClient geminiClient;
    private final ClaudeClient claudeClient;
    private final HuggingFaceClient huggingFaceClient;
    
    @Autowired
    public DefaultAiService(DeepseekClient deepseekClient, OpenAiClient openAiClient, 
                          GeminiClient geminiClient, ClaudeClient claudeClient,
                          HuggingFaceClient huggingFaceClient) {
        this.deepseekClient = deepseekClient;
        this.openAiClient = openAiClient;
        this.geminiClient = geminiClient;
        this.claudeClient = claudeClient;
        this.huggingFaceClient = huggingFaceClient;
    }
    
    @Override
    public AiResponse processRequest(AiRequest request) {
        long startTime = System.currentTimeMillis();
        AiResponse response = new AiResponse();
        response.setModel(request.getModel());
        
        try {
            String aiResponse;
            String modelType = determineModelType(request.getModel());
            
            switch (modelType) {
                case "huggingface":
                    aiResponse = huggingFaceClient.callAPI(request);
                    break;
                case "deepseek":
                    aiResponse = deepseekClient.callAPI(request);
                    break;
                case "openai":
                    aiResponse = openAiClient.callAPI(request);
                    break;
                case "gemini":
                    aiResponse = geminiClient.callAPI(request);
                    break;
                case "claude":
                    aiResponse = claudeClient.callAPI(request);
                    break;
                default:
                    // Default to Hugging Face if model is not recognized
                    aiResponse = huggingFaceClient.callAPI(request);
                    break;
            }
            
            response.setResponse(aiResponse);
            response.setSuccess(true);
        } catch (Exception e) {
            response.setSuccess(false);
            response.setErrorMessage(e.getMessage());
        }
        
        response.setProcessingTimeMs(System.currentTimeMillis() - startTime);
        return response;
    }
    
    private String determineModelType(String model) {
        String modelLower = model.toLowerCase();
        
        if (modelLower.contains("huggingface") || modelLower.contains("/") || 
            modelLower.contains("mistral") || modelLower.contains("llama") || 
            modelLower.contains("deepseek-v3")) {
            return "huggingface";
        } else if (modelLower.contains("gpt")) {
            return "openai";
        } else if (modelLower.contains("claude")) {
            return "claude";
        } else if (modelLower.contains("gemini")) {
            return "gemini";
        } else if (modelLower.contains("deepseek") && !modelLower.contains("deepseek-v3")) {
            return "deepseek";
        }
        
        // Default to Hugging Face
        return "huggingface";
    }
    
    @Override
    public String[] listAvailableModels() {
        return SUPPORTED_MODELS;
    }
} 