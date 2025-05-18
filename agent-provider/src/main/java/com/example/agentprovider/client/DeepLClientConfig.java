package com.example.agentprovider.client;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DeepLClientConfig {

    @Value("${deepl.api.auth.key}")
    private String authKey;

    @Bean
    public RequestInterceptor deeplAuthInterceptor() {
        return requestTemplate -> {
            requestTemplate.header("Authorization", "DeepL-Auth-Key " + authKey);
        };
    }
} 