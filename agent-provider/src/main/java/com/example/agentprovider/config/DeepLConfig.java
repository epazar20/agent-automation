package com.example.agentprovider.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "deepl.api")
public class DeepLConfig {
    private String url;
    private String authKey;
} 