package com.example.aiprovider.client;

import com.example.aiprovider.model.AiRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class OpenAiClient extends BaseClient implements AiClient {
    
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    
    @Value("${openai.api.key:${OPENAI_API_KEY:}}")
    private String apiKey;
    
    @Override
    public String callAPI(AiRequest request) throws Exception {
        String requestBody = String.format("""
            {
                "model": "gpt-4",
                "messages": [{"role": "user", "content": "%s"}],
                "max_tokens": %d,
                "temperature": %f
            }
            """, request.getContent(), request.getMaxTokens(), request.getTemperature());
            
        String jsonResponse = sendRequest(API_URL, apiKey, requestBody);
        
        // In a real implementation, parse the JSON response
        // This is a simplified version that extracts text from OpenAI's response format
        if (jsonResponse.contains("\"content\":")) {
            int startIndex = jsonResponse.indexOf("\"content\":") + 11;
            int endIndex = jsonResponse.indexOf("\"", startIndex);
            return jsonResponse.substring(startIndex, endIndex);
        }
        
        return "Response from OpenAI: " + jsonResponse;
    }
} 