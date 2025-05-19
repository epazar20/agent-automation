package com.example.agentprovider.service.impl;

import com.example.agentprovider.client.AiProviderClient;
import com.example.agentprovider.model.AiRequest;
import com.example.agentprovider.model.AiResponse;
import com.example.agentprovider.model.WebScrapperRequest;
import com.example.agentprovider.model.WebScrapperResponse;
import com.example.agentprovider.service.WebScrapperService;
import org.apache.commons.text.StringEscapeUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class WebScrapperServiceImpl implements WebScrapperService {
    private static final Logger logger = LoggerFactory.getLogger(WebScrapperServiceImpl.class);
    private final AiProviderClient aiProviderClient;

    @Autowired
    public WebScrapperServiceImpl(AiProviderClient aiProviderClient) {
        this.aiProviderClient = aiProviderClient;
    }

    @Override
    public WebScrapperResponse processWebScrapper(WebScrapperRequest request) {
        long startTime = System.currentTimeMillis();
        WebScrapperResponse response = new WebScrapperResponse();
        try {
            // 1. İçerikten başlangıç linklerini bul
            List<String> initialLinks = extractLinks(request.getContent(), request.getMaxLink());
            logger.info("Extracted {} initial links", initialLinks.size());

            // 2. Recursive olarak içerikleri topla
            Set<String> visited = new HashSet<>();
            List<String> contents = new ArrayList<>();
            int maxLink = request.getMaxLink();
            int maxDepth = request.getMaxDepth();
            for (String link : initialLinks) {
                extractLinksRecursive(link, 0, maxDepth, maxLink, visited, contents);
                if (contents.size() >= maxLink) break;
            }

            // 3. İçerikleri birleştir
            String mergedContent = String.join("\n\n", contents);

            // 4. AI servisine gönder
            String content = request.getContent();
            if (content == null || content.trim().isEmpty()) {
                content = mergedContent;
            }
            AiRequest aiRequest = new AiRequest(
                content,
                request.getSpecialPrompt(),
                request.getModel(),
                request.getMaxTokens(),
                request.getTemperature()
            );
            logger.info("AI Provider'a gönderilen istek: {}", aiRequest);
            logger.info("AI Provider content length: {}", content != null ? content.length() : 0);
            AiResponse aiResponse = aiProviderClient.generateContent(aiRequest);

            // 5. Response'u doldur
            response.setContent(aiResponse.getContent());
            response.setModel(aiResponse.getModel());
            response.setProcessingTimeMs(System.currentTimeMillis() - startTime);
            response.setSuccess(aiResponse.isSuccess());
            response.setErrorMessage(aiResponse.getErrorMessage());
        } catch (Exception e) {
            logger.error("Error in web scrapper process: {}", e.getMessage(), e);
            response.setSuccess(false);
            response.setErrorMessage("Error processing request: " + e.getMessage());
            response.setProcessingTimeMs(System.currentTimeMillis() - startTime);
        }
        return response;
    }

    private List<String> extractLinks(String content, int maxLinks) {
        // JSON string içindeki escape karakterleri temizle
        String unescapedContent = StringEscapeUtils.unescapeJson(content);
        Set<String> links = new HashSet<>();
        // Öncelikle JSON içindeki '"link":"https?..."' alanlarını çek
        Pattern jsonLinkPattern = Pattern.compile("\\\"link\\\"\\s*:\\s*\\\"(https?://.*?)(\\\"|,)");
        Matcher jsonLinkMatcher = jsonLinkPattern.matcher(unescapedContent);
        while (jsonLinkMatcher.find() && links.size() < maxLinks) {
            String link = jsonLinkMatcher.group(1).trim();
            // Sonunda tırnak, virgül, boşluk varsa temizle
            link = link.replaceAll("[\\\"',\s]+$", "");
            if (link.startsWith("http")) {
                links.add(link);
            }
        }
        // Eğer hala maxLink'e ulaşmadıysak, kalanları eski regex ile ekle
        if (links.size() < maxLinks) {
            Pattern pattern = Pattern.compile("https?://\\S+");
            Matcher matcher = pattern.matcher(unescapedContent);
            while (matcher.find() && links.size() < maxLinks) {
                String link = matcher.group().trim();
                link = link.replaceAll("[\\\"',\s]+$", "");
                if (link.startsWith("http")) {
                    links.add(link);
                }
            }
        }
        return new ArrayList<>(links);
    }

    // Recursive link ve içerik toplama
    private void extractLinksRecursive(String url, int currentDepth, int maxDepth, int maxLink, Set<String> visited, List<String> contents) {
        if (currentDepth > maxDepth || visited.size() >= maxLink || visited.contains(url)) {
            return;
        }
        visited.add(url);
        try {
            Document doc = Jsoup.connect(url).get();
            doc.select("script, style").remove();
            String text = doc.body().text();
            contents.add(text);
        } catch (Exception e) {
            logger.warn("Failed to fetch or parse link: {} - {}", url, e.getMessage());
            return;
        }
        if (currentDepth < maxDepth && contents.size() < maxLink) {
            Elements links = null;
            try {
                Document doc = Jsoup.connect(url).get();
                links = doc.select("a[href]");
            } catch (Exception e) {
                logger.warn("Failed to fetch links from: {} - {}", url, e.getMessage());
                return;
            }
            for (Element link : links) {
                String absUrl = link.absUrl("href");
                if (absUrl.startsWith("http") && !visited.contains(absUrl)) {
                    extractLinksRecursive(absUrl, currentDepth + 1, maxDepth, maxLink, visited, contents);
                    if (contents.size() >= maxLink) break;
                }
            }
        }
    }
} 