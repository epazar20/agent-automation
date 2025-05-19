package com.example.agentprovider.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import feign.RequestInterceptor;

@Configuration
public class YoutubeTranscriptorClientConfig {
    
    private final RapidApiConfig rapidApiConfig;
    
    public YoutubeTranscriptorClientConfig(RapidApiConfig rapidApiConfig) {
        this.rapidApiConfig = rapidApiConfig;
    }
    
    @Bean
    public RequestInterceptor rapidApiRequestInterceptor() {
        return requestTemplate -> {
            requestTemplate.header("x-rapidapi-key", rapidApiConfig.getApiKey());
            requestTemplate.header("x-rapidapi-host", rapidApiConfig.getApiHost());
        };
    }
} 