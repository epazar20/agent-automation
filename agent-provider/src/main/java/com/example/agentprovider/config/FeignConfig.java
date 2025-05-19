package com.example.agentprovider.config;

import feign.Logger;
import feign.RequestInterceptor;
import feign.codec.ErrorDecoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;

@Configuration
public class FeignConfig {
    
    @Value("${stability.ai.key}")
    private String stabilityAiKey;
    
    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
    
    @Bean
    public ErrorDecoder errorDecoder() {
        return new ErrorDecoder.Default();
    }

    @Bean
    public RequestInterceptor stabilityAiRequestInterceptor() {
        return template -> {
            if (template.url().contains("stability.ai")) {
                // Clear any existing headers to prevent interference
                template.headers().clear();
                
                // Add only the required headers for Stability AI
                template.header("Authorization", "Bearer " + stabilityAiKey);
                template.header("Content-Type", MediaType.APPLICATION_JSON_VALUE);
                template.header("Accept", MediaType.APPLICATION_JSON_VALUE);
            }
        };
    }
} 