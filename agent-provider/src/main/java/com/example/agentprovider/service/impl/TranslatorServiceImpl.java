package com.example.agentprovider.service.impl;

import com.example.agentprovider.client.DeepLClient;
import com.example.agentprovider.config.DeepLConfig;
import com.example.agentprovider.model.TranslatorRequest;
import com.example.agentprovider.model.TranslatorResponse;
import com.example.agentprovider.model.deepl.DeepLRequest;
import com.example.agentprovider.model.deepl.DeepLResponse;
import com.example.agentprovider.service.TranslatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class TranslatorServiceImpl implements TranslatorService {
    private final DeepLClient deeplClient;
    private final DeepLConfig deeplConfig;
    private final RestTemplate restTemplate;

    @Override
    public TranslatorResponse translate(TranslatorRequest request) {
        long startTime = System.currentTimeMillis();
        try {
            // Call DeepL API
            DeepLRequest deeplRequest = DeepLRequest.builder()
                .text(Collections.singletonList(request.getContent()))
                .target_lang(request.getTargetLanguage())
                .build();

            DeepLResponse deeplResponse = deeplClient.translate(
                "DeepL-Auth-Key " + deeplConfig.getAuthKey(),
                deeplRequest
            );

            if (deeplResponse.getTranslations().isEmpty()) {
                throw new RuntimeException("No translation received from DeepL");
            }

            DeepLResponse.Translation translation = deeplResponse.getTranslations().get(0);

            // Call AI Provider API
            String aiContent = String.format("{%s} metnini dil bilgisi ve anlam açısından kontrol et. Gerekirse düzelt. Yalnızca düzeltmeyi döndür, açıklama ekleme",
                translation.getText());

            var aiRequest = new AIProviderRequest(
                aiContent,
                request.getSpecialPrompt(),
                request.getModel(),
                request.getMaxTokens(),
                request.getTemperature()
            );

            var aiResponse = restTemplate.postForObject(
                "http://localhost:8082/ai-provider/api/ai/generate",
                aiRequest,
                AIProviderResponse.class
            );

            if (aiResponse == null || !aiResponse.success()) {
                throw new RuntimeException("AI Provider error: " + (aiResponse != null ? aiResponse.errorMessage() : "No response"));
            }

            return TranslatorResponse.builder()
                .content(aiResponse.content())  // AI-checked translation
                .translatedContent(translation.getText())  // Raw DeepL translation
                .detectedSourceLanguage(translation.getDetected_source_language())
                .model(aiResponse.model())
                .processingTimeMs(System.currentTimeMillis() - startTime)
                .success(true)
                .build();

        } catch (Exception e) {
            return TranslatorResponse.builder()
                .content("")  // No AI-checked content in case of error
                .success(false)
                .errorMessage(e.getMessage())
                .processingTimeMs(System.currentTimeMillis() - startTime)
                .build();
        }
    }

    private record AIProviderRequest(
        String content,
        String specialPrompt,
        String model,
        Integer maxTokens,
        Double temperature
    ) {}

    private record AIProviderResponse(
        String model,
        String content,
        Long processingTimeMs,
        Boolean success,
        String errorMessage
    ) {}
}