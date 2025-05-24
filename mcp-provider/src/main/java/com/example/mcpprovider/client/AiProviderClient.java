package com.example.mcpprovider.client;

import com.example.mcpprovider.dto.AiProviderRequest;
import com.example.mcpprovider.dto.AiProviderResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AiProviderClient {

    @Value("${ai.provider.base.url:http://localhost:8082}")
    private String baseUrl;

    @Autowired
    private RestTemplate restTemplate;

    public AiProviderResponse generateContent(AiProviderRequest request) {
        try {
            String url = baseUrl + "/ai-provider/api/ai/generate";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<AiProviderRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<AiProviderResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                AiProviderResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            // Return error response
            AiProviderResponse errorResponse = new AiProviderResponse();
            errorResponse.setSuccess(false);
            errorResponse.setErrorMessage("Error calling AI Provider: " + e.getMessage());
            return errorResponse;
        }
    }
} 