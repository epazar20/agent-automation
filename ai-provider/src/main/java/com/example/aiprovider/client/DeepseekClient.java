package com.example.aiprovider.client;

import com.example.aiprovider.model.AiRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DeepseekClient extends BaseClient implements AiClient {
    
    private static final String API_URL = "https://api.deepseek.com/v1/chat/completions";
    
    @Value("${deepseek.api.key:${DEEPSEEK_API_KEY:}}")
    private String apiKey;
    
    @Override
    public String callAPI(AiRequest request) throws Exception {
        String requestBody = String.format("""
            {
                "model": "deepseek-chat",
                "messages": [
                    {
                        "role": "user",
                        "content": "%s"
                    }
                ],
                "max_tokens": %d,
                "temperature": %f
            }
            """, request.getPrompt(), request.getMaxTokens(), request.getTemperature());
            
        String jsonResponse = sendRequest(API_URL, apiKey, requestBody);
        
        // In a real implementation, parse the JSON response
        // This is a simplified version that extracts text from Deepseek's response format
        if (jsonResponse.contains("\"content\":")) {
            int startIndex = jsonResponse.indexOf("\"content\":") + 11;
            int endIndex = jsonResponse.indexOf("\"", startIndex);
            return jsonResponse.substring(startIndex, endIndex);
        }
        
        return "Response from Deepseek: " + jsonResponse;
    }
} 