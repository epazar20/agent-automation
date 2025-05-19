package com.example.agentprovider.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "rapidapi.youtube")
public class RapidApiConfig {
    private String url;
    private String apiKey;
    private String apiHost;
} 