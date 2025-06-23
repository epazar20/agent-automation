package com.example.mcpprovider.client;

import com.example.mcpprovider.dto.AiProviderRequest;
import com.example.mcpprovider.dto.AiProviderResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class AiProviderClient {

    private static final Logger logger = LoggerFactory.getLogger(AiProviderClient.class);

    private final String baseUrl;
    private final RestTemplate restTemplate;
    private final Environment environment;

    @Autowired
    public AiProviderClient(
            @Value("${ai.provider.base.url:}") String configuredUrl,
            RestTemplate restTemplate,
            Environment environment) {

        this.restTemplate = restTemplate;
        this.environment = environment;

        // Determine if we're in production
        boolean isProduction = isProductionEnvironment();

        if (isProduction) {
            // Force production URL in production environment
            this.baseUrl = "https://agent-automation-ai-provider.fly.dev";
            logger.info("Production environment detected. Using production AI Provider URL: {}", this.baseUrl);
        } else {
            // Use configured URL or localhost for development
            this.baseUrl = !configuredUrl.isEmpty() ? configuredUrl : "http://localhost:8082";
            logger.info("Development environment detected. Using AI Provider URL: {}", this.baseUrl);
        }

        // Security check: Never allow localhost in production
        if (isProduction && this.baseUrl.contains("localhost")) {
            throw new IllegalStateException("🚨 SECURITY ERROR: Localhost URL detected in production environment! URL: " + this.baseUrl);
        }
    }

    /**
     * Determine if we're running in production environment
     */
    private boolean isProductionEnvironment() {
        String activeProfile = environment.getProperty("spring.profiles.active", "");
        String serverPort = environment.getProperty("server.port", "");

        // Check for production indicators
        return activeProfile.contains("production") || "8080".equals(serverPort);
    }

    public AiProviderResponse generateContent(AiProviderRequest request) {
        try {
            String url = baseUrl + "/ai-provider/api/ai/generate";

            logger.debug("Calling AI Provider at: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<AiProviderRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<AiProviderResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                AiProviderResponse.class
            );

            AiProviderResponse responseBody = response.getBody();
            if (responseBody != null) {
                logger.debug("AI Provider response received successfully");
            }

            return responseBody;
        } catch (Exception e) {
            logger.error("Error calling AI Provider at {}: {}", baseUrl, e.getMessage(), e);

            // Return error response
            AiProviderResponse errorResponse = new AiProviderResponse();
            errorResponse.setSuccess(false);
            errorResponse.setErrorMessage("Error calling AI Provider: " + e.getMessage());
            return errorResponse;
        }
    }
}
