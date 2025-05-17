package com.example.agentprovider.client;

import com.example.agentprovider.model.AiRequest;
import com.example.agentprovider.model.AiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Component
public class AiProviderClient {

    private static final Logger logger = LoggerFactory.getLogger(AiProviderClient.class);
    private final WebClient webClient;
    private final String baseUrl;
    
    @Autowired
    public AiProviderClient(
            WebClient.Builder webClientBuilder,
            @Value("${ai-provider.url:http://localhost:8082/ai-provider}") String baseUrl) {
        
        // Trim the base URL to avoid whitespace issues
        this.baseUrl = baseUrl.trim();
        logger.info("AI Provider URL configured as: '{}'", this.baseUrl);
        
        this.webClient = webClientBuilder
                .baseUrl("http://localhost:8082") // Use generic base without context path
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
    
    /**
     * Calls the AI Provider service to generate content based on the provided request
     * @param request The AI request
     * @return The AI response
     */
    public AiResponse generateContent(AiRequest request) {
        // Construct the complete URL explicitly
        String fullUrl = baseUrl + "/api/ai/generate";
        logger.info("Calling AI Provider with URL: '{}'", fullUrl);
        
        return webClient.post()
                .uri(fullUrl)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AiResponse.class)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                    .maxBackoff(Duration.ofSeconds(5)))
                .block();
    }
} 