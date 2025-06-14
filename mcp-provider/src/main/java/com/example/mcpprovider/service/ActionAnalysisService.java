package com.example.mcpprovider.service;

import com.example.mcpprovider.client.AiProviderClient;
import com.example.mcpprovider.dto.ActionAnalysisRequest;
import com.example.mcpprovider.dto.ActionAnalysisResponse;
import com.example.mcpprovider.dto.AiProviderRequest;
import com.example.mcpprovider.dto.AiProviderResponse;
import com.example.mcpprovider.dto.CustomerDto;
import com.example.mcpprovider.enums.FinanceActionType;
import com.example.mcpprovider.model.Customer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.Arrays;
import java.util.Set;
import java.util.HashSet;

@Service
@Slf4j
public class ActionAnalysisService {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private AiProviderClient aiProviderClient;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    private static final int DEFAULT_DAYS = 30; // Default to last 30 days

    public ActionAnalysisResponse analyzeAction(ActionAnalysisRequest request) {
        try {
            // Validate customerId
            if (request.getCustomerNo() == null || request.getCustomerNo().trim().isEmpty()) {
                throw new IllegalArgumentException("customerId is required");
            }

            // 1. Get customer data
            Customer customer = null;
            String enhancedContent = request.getContent();
            
            // Try to find customer by ID first, then create a dummy if not found
            CustomerDto customerDto = null;
            try {
                Long customerId = Long.parseLong(request.getCustomerNo());
                customerDto = customerService.getCustomerById(customerId)
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found with ID: " + customerId));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid customer ID format: " + request.getCustomerNo());
            }
            
            // Convert DTO to model
            customer = convertDtoToModel(customerDto);
            
            // Create customer JSON string
            String customerJson = objectMapper.writeValueAsString(customer);
            
            // Get all finance action types and their descriptions
            String financeActionsInfo = createFinanceActionsInfo();
            
            // Enhance content with customer context and finance actions
            enhancedContent = String.format(
                "%s değerli müşteri için aşağıdaki bilgileri kullanarak analiz yap:\n\n" +
                "Müşteri Bilgileri (JSON):\n%s\n\n" +
                "Finansal İşlem Tipleri ve Açıklamaları:\n%s\n\n" +
                "Müşteri Talebi:\n%s",
                request.getCustomerNo(),
                customerJson,
                financeActionsInfo,
                request.getContent()
            );

            // 2. Create enhanced prompt for AI analysis
            String specialPrompt = createAnalysisPrompt();

            // 3. Call AI Provider
            AiProviderRequest aiRequest = new AiProviderRequest(
                enhancedContent,
                specialPrompt,
                request.getModel(),
                request.getMaxTokens(),
                request.getTemperature()
            );

            AiProviderResponse aiResponse = aiProviderClient.generateContent(aiRequest);

            // Add extraContent to AI response
            String aiResponseContent = aiResponse.getContent();
            if (aiResponseContent.contains("```json")) {
                int jsonStart = aiResponseContent.indexOf("```json") + 7;
                int jsonEnd = aiResponseContent.indexOf("```", jsonStart);
                if (jsonEnd != -1) {
                    String jsonContent = aiResponseContent.substring(jsonStart, jsonEnd);
                    JsonNode rootNode = objectMapper.readTree(jsonContent);
                    ((ObjectNode) rootNode).put("extraContent", request.getContent());
                    String modifiedJson = objectMapper.writeValueAsString(rootNode);
                    aiResponseContent = aiResponseContent.substring(0, jsonStart) + "\n" + modifiedJson + "\n" + aiResponseContent.substring(jsonEnd);
                }
            }

            // 4. Process the response and handle dates - this now returns both actions and modified content
            ProcessedResponse processedResponse = processAiResponseWithModifications(aiResponseContent, request.getContent());

            // 5. Create response
            ActionAnalysisResponse response = new ActionAnalysisResponse();
            response.setContent(processedResponse.getModifiedContent() != null ? processedResponse.getModifiedContent() : aiResponseContent);
            response.setOriginalContent(request.getContent());
            response.setFinanceActionTypes(processedResponse.getActions());
            response.setCustomer(customer);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Error during analysis: " + e.getMessage(), e);
        }
    }

    // New class to hold both actions and modified content
    private static class ProcessedResponse {
        private final List<FinanceActionType> actions;
        private final String modifiedContent;
        
        public ProcessedResponse(List<FinanceActionType> actions, String modifiedContent) {
            this.actions = actions;
            this.modifiedContent = modifiedContent;
        }
        
        public List<FinanceActionType> getActions() { return actions; }
        public String getModifiedContent() { return modifiedContent; }
    }

    private String createAnalysisPrompt() {
        // Get current date for the prompt
        ZonedDateTime now = ZonedDateTime.now();
        String currentYear = String.valueOf(now.getYear());
        String currentDate = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("Lütfen aşağıdaki bilgileri kullanarak detaylı bir analiz yap:\n\n");
        prompt.append("ÖNEMLİ: Tüm tarihler için şu anki yıl ").append(currentYear)
              .append(" kullanılmalıdır. Bugünün tarihi: ").append(currentDate).append("\n\n");
        
        prompt.append("1. Müşteri JSON verisini inceleyin ve ilgili alanları belirleyin\n");
        prompt.append("2. Verilen finansal işlem tiplerini ve açıklamalarını dikkate alın\n");
        prompt.append("3. Müşteri talebini analiz edin ve tarih aralığı belirtilmişse (örn: son 3 gün) bunu tespit edin\n");
        prompt.append("4. Her işlem tipi için aşağıdaki JSON şablonlarını kullanın\n\n");

        prompt.append("ÖNEMLİ PARAMETRE KURALLARI:\n");
        prompt.append("- Şablon içinde | karakteri ile ayrılmış değerler (örn: \"in|out\") için:\n");
        prompt.append("  * SADECE belirtilen değerlerden BİRİNİ seçin\n");
        prompt.append("  * Eğer müşteri talebi bu değerlerden hiçbirine uygun değilse NULL kullanın\n");
        prompt.append("  * Asla | karakteri ile ayrılmış değerler dışında bir değer veya kombinasyon kullanmayın\n");
        prompt.append("  * Örnek: direction için \"both\" veya \"in,out\" gibi değerler KULLANILAMAZ\n\n");
        
        prompt.append("- Şablon içinde ? karakteri ile işaretlenmiş alanlar için:\n");
        prompt.append("  * Müşteri talebine göre uygun herhangi bir değer kullanılabilir\n");
        prompt.append("  * Eğer belirtilmemişse NULL kullanın\n\n");

        // Add JSON templates for each action type
        for (FinanceActionType actionType : FinanceActionType.values()) {
            prompt.append(actionType.name()).append(" şablonu:\n");
            prompt.append(actionType.getJsonMap()).append("\n");
            
            // Parse the JSON map to extract and explain enum-like fields
            try {
                JsonNode jsonMapNode = objectMapper.readTree(actionType.getJsonMap());
                jsonMapNode.fields().forEachRemaining(entry -> {
                    String value = entry.getValue().asText();
                    if (value.contains("|")) {
                        prompt.append("- ").append(entry.getKey()).append(" için geçerli değerler: ")
                              .append(value).append("\n");
                        prompt.append("  * Bu değerlerden BİRİNİ seçin veya NULL bırakın\n");
                    }
                });
            } catch (Exception e) {
                log.error("Error parsing JSON map for {}: {}", actionType, e.getMessage());
            }
            prompt.append("\n");
        }

        prompt.append("Önemli Tarih Kuralları:\n");
        prompt.append("- Tarih aralığı belirtilmemişse varsayılan olarak son 1 ay kullanılacak\n");
        prompt.append("- Tüm tarihler ").append(currentYear).append(" yılı içinde olmalıdır\n");
        prompt.append("- Bitiş tarihi (endDate) her zaman bugünün tarihi olmalıdır: ").append(currentDate).append("\n");
        prompt.append("- Başlangıç tarihi (startDate) bitiş tarihinden 1 ay öncesi olmalıdır\n");
        prompt.append("- Tarihler ISO format kullanmalı (YYYY-MM-DDThh:mm:ss)\n\n");

        prompt.append("Lütfen yanıtınızı aşağıdaki JSON formatında döndürün:\n");
        prompt.append("{\n");
        prompt.append("  \"selectedActions\": [\"ACTION_TYPE1\"],\n");
        prompt.append("  \"parameters\": {\n");
        prompt.append("    \"ACTION_TYPE1\": {\n");
        prompt.append("      \"actionType\": \"GENERATE_STATEMENT\",\n");
        prompt.append("      \"customerId\": \"1\",\n");
        prompt.append("      \"startDate\": \"").append(currentYear).append("-MM-DDT00:00:00\",\n");
        prompt.append("      \"endDate\": \"").append(currentDate).append("T23:59:59\",\n");
        prompt.append("      \"direction\": \"in\",  // Sadece 'in' veya 'out' kullanın, başka değer KULLANMAYIN\n");
        prompt.append("      ... diğer parametreler ...\n");
        prompt.append("    }\n");
        prompt.append("  },\n");
        prompt.append("  \"dateRange\": {\n");
        prompt.append("    \"startDate\": \"").append(currentYear).append("-MM-DDT00:00:00\",\n");
        prompt.append("    \"endDate\": \"").append(currentDate).append("T23:59:59\",\n");
        prompt.append("    \"isRelative\": true,\n");
        prompt.append("    \"relativeDays\": 30\n");
        prompt.append("  }\n");
        prompt.append("}\n");

        return prompt.toString();
    }

    private String createFinanceActionsInfo() {
        StringBuilder info = new StringBuilder();
        for (FinanceActionType actionType : FinanceActionType.values()) {
            info.append(actionType.name()).append(": ")
                .append(getActionDescription(actionType))
                .append("\n");
        }
        return info.toString();
    }

    private String getActionDescription(FinanceActionType actionType) {
        switch (actionType) {
            case SEND_EMAIL:
                return "E-posta gönderme işlemi";
            case GENERATE_STATEMENT:
                return "Hesap ekstresi oluşturma";
            case SEND_PAYMENT_REMINDER:
                return "Ödeme hatırlatması gönderme";
            case CREATE_INVOICE:
                return "Fatura oluşturma";
            case PROCESS_PAYMENT:
                return "Ödeme işleme";
            case REQUEST_LOAN_INFO:
                return "Kredi bilgisi talep etme";
            case UPDATE_CONTACT_INFO:
                return "İletişim bilgilerini güncelleme";
            case TRANSFER_FUNDS:
                return "Para transferi";
            case SCHEDULE_MEETING:
                return "Toplantı planlama";
            case BLOCK_CARD:
                return "Kart bloke etme";
            case UNBLOCK_CARD:
                return "Kart blokesini kaldırma";
            default:
                return "Müşteri etkileşimi kaydı";
        }
    }

    private ProcessedResponse processAiResponseWithModifications(String aiResponse, String originalContent) {
        List<FinanceActionType> selectedActions = new ArrayList<>();
        String modifiedContent = aiResponse;
        
        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            selectedActions.add(FinanceActionType.LOG_CUSTOMER_INTERACTION);
            return new ProcessedResponse(selectedActions, modifiedContent);
        }

        try {
            String cleanedResponse = extractAndCleanJson(aiResponse);
            log.info("Extracted JSON from AI response: {}", cleanedResponse);
            
            if (cleanedResponse != null) {
                JsonNode rootNode = objectMapper.readTree(cleanedResponse);
                JsonNode selectedActionsNode = rootNode.get("selectedActions");
                JsonNode parametersNode = rootNode.get("parameters");
                JsonNode dateRangeNode = rootNode.get("dateRange");
                
                // Get current date for validation
                ZonedDateTime nowInTurkey = ZonedDateTime.now();
                int currentYear = nowInTurkey.getYear();
                
                // Check if SEND_EMAIL is in selected actions
                boolean hasSendEmail = false;
                if (selectedActionsNode != null && selectedActionsNode.isArray()) {
                    for (JsonNode actionNode : selectedActionsNode) {
                        if ("SEND_EMAIL".equals(actionNode.asText())) {
                            hasSendEmail = true;
                            log.info("SEND_EMAIL action detected in selected actions");
                            break;
                        }
                    }
                }
                
                boolean jsonModified = false;
                
                if (selectedActionsNode != null && selectedActionsNode.isArray()) {
                    for (JsonNode actionNode : selectedActionsNode) {
                        try {
                            String actionTypeStr = actionNode.asText();
                            FinanceActionType actionType = FinanceActionType.valueOf(actionTypeStr);
                            log.info("Processing action type: {}", actionTypeStr);
                            
                            // Get JSON map for the action type
                            String jsonMap = actionType.getJsonMap();
                            JsonNode jsonMapNode = objectMapper.readTree(jsonMap);
                            
                            // Get parameters for this action
                            JsonNode actionParams = parametersNode != null ? parametersNode.get(actionTypeStr) : null;
                            
                            if (actionParams != null && actionParams instanceof ObjectNode) {
                                log.info("Found parameters for {}: {}", actionTypeStr, actionParams);
                                
                                // Remove content and extraContent fields if they exist
                                ((ObjectNode) actionParams).remove("content");
                                ((ObjectNode) actionParams).remove("extraContent");
                                
                                // Validate and process each parameter based on JSON map
                                actionParams.fields().forEachRemaining(entry -> {
                                    String paramName = entry.getKey();
                                    JsonNode paramValue = entry.getValue();
                                    JsonNode jsonMapParamValue = jsonMapNode.get(paramName);
                                    
                                    if (jsonMapParamValue != null && jsonMapParamValue.isTextual()) {
                                        String jsonMapParamStr = jsonMapParamValue.asText();
                                        
                                        // Handle enum-like values (separated by |)
                                        if (jsonMapParamStr.contains("|")) {
                                            String[] validValues = jsonMapParamStr.split("\\|");
                                            if (paramValue != null && paramValue.isTextual()) {
                                                String actualValue = paramValue.asText();
                                                boolean isValid = false;
                                                for (String validValue : validValues) {
                                                    if (validValue.equals(actualValue)) {
                                                        isValid = true;
                                                        break;
                                                    }
                                                }
                                                if (!isValid) {
                                                    ((ObjectNode) actionParams).putNull(paramName);
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                            
                            if (actionType == FinanceActionType.GENERATE_STATEMENT) {
                                log.info("Handling GENERATE_STATEMENT with hasSendEmail: {}", hasSendEmail);
                                boolean wasModified = handleGenerateStatement(actionParams, nowInTurkey, currentYear, dateRangeNode, hasSendEmail, originalContent);
                                if (wasModified) {
                                    jsonModified = true;
                                    log.info("GENERATE_STATEMENT parameters were modified");
                                }
                            }
                            
                            selectedActions.add(actionType);
                        } catch (IllegalArgumentException e) {
                            log.error("Invalid action type found: {}", actionNode.asText());
                        }
                    }
                }
                
                // Remove extraContent from root node if it exists
                ((ObjectNode) rootNode).remove("extraContent");
                
                // If JSON was modified, reconstruct the response content
                if (jsonModified) {
                    log.info("JSON was modified, reconstructing response content");
                    String modifiedJson = objectMapper.writeValueAsString(rootNode);
                    log.info("Modified JSON: {}", modifiedJson);
                    
                    // Replace the JSON part in the original response
                    if (aiResponse.contains("```json")) {
                        int jsonStart = aiResponse.indexOf("```json") + 7;
                        int jsonEnd = aiResponse.indexOf("```", jsonStart);
                        if (jsonEnd != -1) {
                            String beforeJson = aiResponse.substring(0, jsonStart);
                            String afterJson = aiResponse.substring(jsonEnd);
                            modifiedContent = beforeJson + "\n" + modifiedJson + "\n" + afterJson;
                            log.info("Successfully replaced JSON in markdown format");
                        }
                    } else {
                        modifiedContent = aiResponse.replace(cleanedResponse, modifiedJson);
                        log.info("Successfully replaced JSON in plain format");
                    }
                    log.info("Final modified content: {}", modifiedContent);
                } else {
                    log.info("No JSON modifications were made");
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", e.getMessage());
            selectedActions = fallbackExtractActions(aiResponse);
        }
        
        if (selectedActions.isEmpty()) {
            selectedActions.add(FinanceActionType.LOG_CUSTOMER_INTERACTION);
        }
        
        return new ProcessedResponse(selectedActions, modifiedContent);
    }

    private boolean handleGenerateStatement(JsonNode actionParams, ZonedDateTime nowInTurkey, 
            int currentYear, JsonNode dateRangeNode, boolean hasSendEmail, String originalContent) {
        boolean modified = false;
        log.info("handleGenerateStatement called with hasSendEmail: {}", hasSendEmail);
        
        if (actionParams instanceof ObjectNode) {
            ObjectNode params = (ObjectNode) actionParams;
            log.info("ActionParams before modification: {}", params);
            
            // Prompt'tan tarih aralığı analizi
            String content = originalContent;
            log.info("Analyzing content for date range: {}", content);
            
            // Varsayılan değerler
            int relativeDays = 30; // Varsayılan son 30 gün
            
            // "son X yıl/ay/gün" pattern'ini analiz et
            Pattern pattern = Pattern.compile("son\\s+(\\d+)\\s*(yıl|ay|gün|sene)", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(content);
            
            if (matcher.find()) {
                int value = Integer.parseInt(matcher.group(1));
                String unit = matcher.group(2).toLowerCase();
                log.info("Found date range in content: {} {}", value, unit);
                
                switch (unit) {
                    case "yıl":
                    case "sene":
                        relativeDays = value * 365;
                        break;
                    case "ay":
                        relativeDays = value * 30;
                        break;
                    case "gün":
                        relativeDays = value;
                        break;
                }
                log.info("Calculated relative days: {}", relativeDays);
            }
            
            // Tarihleri hesapla
            ZonedDateTime endDate = nowInTurkey
                .withHour(23)
                .withMinute(59)
                .withSecond(59)
                .withNano(0);
            
            ZonedDateTime startDate = endDate
                .minusDays(relativeDays)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);
            
            // Tarihleri güncelle
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            params.put("startDate", startDate.format(formatter));
            params.put("endDate", endDate.format(formatter));
            log.info("Updated date range - start: {}, end: {}", startDate.format(formatter), endDate.format(formatter));
            
            // emailFlag'i güncelle
            if (hasSendEmail) {
                params.put("emailFlag", true);
                log.info("Set emailFlag to true due to SEND_EMAIL action");
            }
            
            // dateRange'i güncelle
            if (dateRangeNode instanceof ObjectNode) {
                ObjectNode dateRange = (ObjectNode) dateRangeNode;
                dateRange.put("startDate", startDate.format(formatter));
                dateRange.put("endDate", endDate.format(formatter));
                dateRange.put("isRelative", true);
                dateRange.put("relativeDays", relativeDays);
                log.info("Updated dateRange with relativeDays: {}", relativeDays);
            }
            
            modified = true;
        }
        
        return modified;
    }
    
    private String extractAndCleanJson(String aiResponse) {
        try {
            // Look for JSON between ```json and ``` blocks
            int jsonStart = aiResponse.indexOf("```json");
            if (jsonStart != -1) {
                jsonStart += 7; // Move past "```json"
                int jsonEnd = aiResponse.indexOf("```", jsonStart);
                if (jsonEnd != -1) {
                    String jsonContent = aiResponse.substring(jsonStart, jsonEnd);
                    // Clean escape characters
                    jsonContent = jsonContent
                        .replace("\\n", "\n")
                        .replace("\\\"", "\"")
                        .replace("\\t", "\t")
                        .trim();
                    return jsonContent;
                }
            }
            
            // If no markdown blocks, try to find JSON-like structure directly
            int braceStart = aiResponse.indexOf("{");
            int braceEnd = aiResponse.lastIndexOf("}");
            if (braceStart != -1 && braceEnd != -1 && braceEnd > braceStart) {
                String jsonContent = aiResponse.substring(braceStart, braceEnd + 1);
                // Clean escape characters
                jsonContent = jsonContent
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"")
                    .replace("\\t", "\t");
                return jsonContent;
            }
            
        } catch (Exception e) {
            log.error("Error extracting JSON: {}", e.getMessage());
        }
        
        return null;
    }
    
    private List<FinanceActionType> fallbackExtractActions(String aiResponse) {
        List<FinanceActionType> actions = new ArrayList<>();
        
        try {
            // Look for selectedActions pattern
            String pattern = "selectedActions.*?\\[([^\\]]+)\\]";
            Pattern regex = Pattern.compile(pattern, Pattern.DOTALL);
            Matcher matcher = regex.matcher(aiResponse);
            
            if (matcher.find()) {
                String actionsString = matcher.group(1);
                // Split by comma and clean up
                String[] actionStrings = actionsString.split(",");
                
                for (String actionStr : actionStrings) {
                    String cleanAction = actionStr.trim()
                        .replace("\"", "")
                        .replace("\\\"", "")
                        .replace("'", "");
                    
                    try {
                        FinanceActionType actionType = FinanceActionType.valueOf(cleanAction);
                        actions.add(actionType);
                    } catch (IllegalArgumentException e) {
                        log.error("Invalid action type in fallback: {}", cleanAction);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Fallback extraction failed: {}", e.getMessage());
        }
        
        return actions;
    }
    
    private Customer createDummyCustomer(String customerNo) {
        Customer customer = new Customer();
        customer.setCustomerNo(customerNo);
        customer.setName("Müşteri " + customerNo);
        customer.setEmail(customerNo + "@example.com");
        return customer;
    }

    private Customer convertDtoToModel(CustomerDto customerDto) {
        Customer customer = new Customer();
        customer.setCustomerNo(customerDto.getId().toString());
        customer.setName(customerDto.getFirstName());
        customer.setSurname(customerDto.getLastName());
        customer.setEmail(customerDto.getEmail());
        return customer;
    }
}