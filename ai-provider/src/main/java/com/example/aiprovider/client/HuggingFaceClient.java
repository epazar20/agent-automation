package com.example.aiprovider.client;

import com.example.aiprovider.model.AiRequest;
import com.example.aiprovider.model.HuggingFaceRequest;
import com.example.aiprovider.service.RequestProcessor;
import com.example.aiprovider.utils.JsonEscapeHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class HuggingFaceClient extends BaseClient implements AiClient {
    
    private static final String API_URL = "https://router.huggingface.co/novita/v3/openai/chat/completions";
    
    @Value("${huggingface.api.key}")
    private String apiKey;
    
    @Value("${huggingface.default.model:deepseek/deepseek-v3-0324}")
    private String defaultModel;
    
    private final RequestProcessor requestProcessor;
    
    @Autowired
    public HuggingFaceClient(RequestProcessor requestProcessor) {
        this.requestProcessor = requestProcessor;
    }
    
    @Override
    public String callAPI(AiRequest request) throws Exception {
        // Determine which model to use (default or specified in request)
        String model = defaultModel;
        if (request.getModel().contains("/")) {
            // If the request has a fully qualified model name 
            String[] parts = request.getModel().split("/", 2);
            if (parts.length > 1) {
                model = parts[1];
            }
        }
        
        // Convert AiRequest to HuggingFaceRequest using the RequestProcessor
        // This ensures all JSON is properly escaped
        HuggingFaceRequest hfRequest = requestProcessor.convertToHuggingFaceRequest(request);
        
        // Override model if needed
        hfRequest.setModel(model);
        
        // Generate properly formatted and escaped JSON
        String requestBody = requestProcessor.generateValidJsonString(hfRequest);
            
        String jsonResponse = sendRequest(API_URL, apiKey, requestBody);
        
        // Parse response for the required fields
        if (jsonResponse.contains("\"content\"")) {
            int startIndex = jsonResponse.indexOf("\"content\":") + 11;
            int endIndex = findClosingQuoteIndex(jsonResponse, startIndex);
            if (endIndex > startIndex) {
                return jsonResponse.substring(startIndex, endIndex);
            }
        }
        
        return "Response from HuggingFace: " + jsonResponse;
    }
    
    // Helper method to find the closing quote of a JSON string value
    private int findClosingQuoteIndex(String json, int startIndex) {
        for (int i = startIndex; i < json.length(); i++) {
            // Skip escaped quotes
            if (json.charAt(i) == '\\') {
                i++;
                continue;
            }
            
            if (json.charAt(i) == '"') {
                return i;
            }
        }
        return -1;
    }
} 