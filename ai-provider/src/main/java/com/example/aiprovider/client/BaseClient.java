package com.example.aiprovider.client;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public abstract class BaseClient {
    
    protected final HttpClient httpClient;
    
    protected BaseClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }
    
    protected String sendRequest(String url, String apiKey, String requestBody) throws IOException, InterruptedException {
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody));
        
        if (apiKey != null && !apiKey.isEmpty()) {
            // Always use Bearer token format for authorization
            requestBuilder.header("Authorization", "Bearer " + apiKey);
        }
        
        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        } else {
            throw new IOException("API request failed with status code: " + response.statusCode() + ", response: " + response.body());
        }
    }
} 