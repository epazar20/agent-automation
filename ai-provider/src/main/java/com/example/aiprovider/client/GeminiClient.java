package com.example.aiprovider.client;

import com.example.aiprovider.model.AiRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GeminiClient extends BaseClient implements AiClient {
    
    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    
    @Value("${gemini.api.key:${GEMINI_API_KEY:}}")
    private String apiKey;
    
    @Override
    public String callAPI(AiRequest request) throws Exception {
        String requestBody = String.format("""
            {
                "contents": [{
                    "parts": [{
                        "text": "%s"
                    }]
                }],
                "generationConfig": {
                    "maxOutputTokens": %d,
                    "temperature": %f
                }
            }
            """, request.getContent(), request.getMaxTokens(), request.getTemperature());
            
        String jsonResponse = sendRequest(API_URL + "?key=" + apiKey, null, requestBody);
        
        // In a real implementation, parse the JSON response
        // This is a simplified version that extracts text from Gemini's response format
        if (jsonResponse.contains("\"text\":")) {
            int startIndex = jsonResponse.indexOf("\"text\":") + 8;
            int endIndex = jsonResponse.indexOf("\"", startIndex);
            return jsonResponse.substring(startIndex, endIndex);
        }
        
        return "Response from Gemini: " + jsonResponse;
    }
} 