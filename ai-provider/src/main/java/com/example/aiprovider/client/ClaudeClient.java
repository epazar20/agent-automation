package com.example.aiprovider.client;

import com.example.aiprovider.model.AiRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ClaudeClient extends BaseClient implements AiClient {
    
    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    
    @Value("${claude.api.key:${CLAUDE_API_KEY:}}")
    private String apiKey;
    
    @Override
    public String callAPI(AiRequest request) throws Exception {
        String model = "claude-3-opus-20240229";
        if (request.getModel().toLowerCase().contains("sonnet")) {
            model = "claude-3-sonnet-20240229";
        }

        String requestBody = String.format("""
            {
                "model": "%s",
                "messages": [
                    {
                        "role": "user",
                        "content": "%s"
                    }
                ],
                "max_tokens": %d,
                "temperature": %f
            }
            """, model, request.getPrompt(), request.getMaxTokens(), request.getTemperature());
            
        String jsonResponse = sendRequest(API_URL, apiKey, requestBody);
        
        // In a real implementation, parse the JSON response
        // This is a simplified version that extracts text from Claude's response format
        if (jsonResponse.contains("\"content\":")) {
            int startIndex = jsonResponse.indexOf("\"content\":") + 11;
            int endIndex = jsonResponse.indexOf("\"", startIndex);
            return jsonResponse.substring(startIndex, endIndex);
        }
        
        return "Response from Claude: " + jsonResponse;
    }
} 