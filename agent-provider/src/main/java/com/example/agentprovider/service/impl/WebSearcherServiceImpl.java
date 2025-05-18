package com.example.agentprovider.service.impl;

import com.example.agentprovider.model.WebSearcherRequest;
import com.example.agentprovider.model.WebSearcherResponse;
import com.example.agentprovider.service.WebSearcherService;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class WebSearcherServiceImpl implements WebSearcherService {
    private static final String RAPIDAPI_KEY = "c4f24060edmsh76fc4746c8b2926p1ba70bjsneef92076a54b";
    private static final String RAPIDAPI_HOST = "google-search72.p.rapidapi.com";
    private static final String BASE_URL = "https://google-search72.p.rapidapi.com";

    private final WebClient webClient = WebClient.builder()
            .baseUrl(BASE_URL)
            .defaultHeader("x-rapidapi-key", RAPIDAPI_KEY)
            .defaultHeader("x-rapidapi-host", RAPIDAPI_HOST)
            .build();

    @Override
    public WebSearcherResponse search(WebSearcherRequest request) {
        WebSearcherResponse response = new WebSearcherResponse();
        try {
            String result = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", request.getContent())
                            .queryParam("lr", request.getLanguage())
                            .queryParam("num", request.getMaxResult())
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            response.setContent(result);
            response.setSuccess(true);
        } catch (WebClientResponseException e) {
            response.setSuccess(false);
            response.setErrorMessage(e.getResponseBodyAsString());
        } catch (Exception e) {
            response.setSuccess(false);
            response.setErrorMessage(e.getMessage());
        }
        return response;
    }
} 