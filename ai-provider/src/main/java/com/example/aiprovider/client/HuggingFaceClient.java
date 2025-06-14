package com.example.aiprovider.client;

import com.example.aiprovider.model.AiRequest;
import com.example.aiprovider.model.HuggingFaceRequest;
import com.example.aiprovider.model.HuggingFaceResponse;
import com.example.aiprovider.service.RequestProcessor;
import com.example.aiprovider.utils.JsonEscapeHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class HuggingFaceClient extends BaseClient implements AiClient {
    
    private static final Logger log = LoggerFactory.getLogger(HuggingFaceClient.class);
    private static final String API_URL = "https://router.huggingface.co/novita/v3/openai/chat/completions";
    
    @Value("${huggingface.api.key}")
    private String apiKey;
    
    @Value("${huggingface.default.model:deepseek/deepseek-v3-0324}")
    private String defaultModel;
    
    private final RequestProcessor requestProcessor;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public HuggingFaceClient(RequestProcessor requestProcessor) {
        this.requestProcessor = requestProcessor;
        this.objectMapper = new ObjectMapper();
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
        log.debug("Sending request to HuggingFace API: {}", requestBody);
            
        String jsonResponse = sendRequest(API_URL, apiKey, requestBody);
        log.debug("Received response from HuggingFace API: {}", jsonResponse);
        
        try {
            // Parse response using the model class
            HuggingFaceResponse response = objectMapper.readValue(jsonResponse, HuggingFaceResponse.class);
            
            // Extract content from the first choice's message
            if (response.getChoices() != null && response.getChoices().length > 0) {
                HuggingFaceResponse.Choice firstChoice = response.getChoices()[0];
                if (firstChoice.getMessage() != null) {
                    String content = firstChoice.getMessage().getContent();
                    log.debug("Successfully extracted content from response: {}", content);
                    return content;
                }
            }
            
            // If no valid content found, return the raw response
            log.warn("No valid content found in response, returning raw response");
            return "Response from HuggingFace: " + jsonResponse;
        } catch (Exception e) {
            // Log the error and return the raw response
            log.error("Error parsing HuggingFace response: {}", e.getMessage());
            log.error("Raw response: {}", jsonResponse);
            log.error("Exception details:", e);
            return jsonResponse;
        }
    }
} 