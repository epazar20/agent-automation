package com.example.mcpprovider.service;

import com.example.mcpprovider.client.AiProviderClient;
import com.example.mcpprovider.dto.ActionAnalysisRequest;
import com.example.mcpprovider.dto.ActionAnalysisResponse;
import com.example.mcpprovider.dto.AiProviderRequest;
import com.example.mcpprovider.dto.AiProviderResponse;
import com.example.mcpprovider.dto.CustomerDto;
import com.example.mcpprovider.dto.FinanceActionTypeDto;
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
    private FinanceActionTypeService financeActionTypeService;

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
            
            // Get all finance action types and their descriptions from database
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
            if (aiResponseContent != null && aiResponseContent.contains("```json")) {
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
        private final List<String> actions;
        private final String modifiedContent;
        
        public ProcessedResponse(List<String> actions, String modifiedContent) {
            this.actions = actions;
            this.modifiedContent = modifiedContent;
        }
        
        public List<String> getActions() { return actions; }
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

        // Get active finance action types from database and add JSON templates
        List<FinanceActionTypeDto> actionTypes = financeActionTypeService.getActiveFinanceActionTypes();
        for (FinanceActionTypeDto actionType : actionTypes) {
            prompt.append(actionType.getTypeCode()).append(" şablonu:\n");
            prompt.append(actionType.getJsonSchema()).append("\n");
            
            // Parse the JSON schema to extract and explain enum-like fields
            try {
                JsonNode jsonSchemaNode = objectMapper.readTree(actionType.getJsonSchema());
                jsonSchemaNode.fields().forEachRemaining(entry -> {
                    String value = entry.getValue().asText();
                    if (value.contains("|")) {
                        prompt.append("- ").append(entry.getKey()).append(" için geçerli değerler: ")
                              .append(value).append("\n");
                        prompt.append("  * Bu değerlerden BİRİNİ seçin veya NULL bırakın\n");
                    }
                });
            } catch (Exception e) {
                log.error("Error parsing JSON schema for {}: {}", actionType.getTypeCode(), e.getMessage());
            }
            prompt.append("\n");
        }

        prompt.append("Önemli Tarih Kuralları:\n");
        prompt.append("- Tarih aralığı belirtilmemişse varsayılan olarak son 1 ay kullanılacak\n");
        prompt.append("- Tüm tarihler ").append(currentYear).append(" yılı içinde olmalıdır\n");
        prompt.append("- Bitiş tarihi (endDate) her zaman bugünün tarihi olmalıdır: ").append(currentDate).append("\n");
        prompt.append("- Başlangıç tarihi (startDate) bitiş tarihinden 1 ay öncesi olmalıdır\n");
        prompt.append("- Tarihler ISO format kullanmalı (YYYY-MM-DDThh:mm:ss)\n\n");

        // Create dynamic JSON format example using first available action types
        prompt.append("Lütfen yanıtınızı aşağıdaki JSON formatında döndürün:\n");
        prompt.append("{\n");
        prompt.append("  \"selectedActions\": [");
        
        // Add action type codes dynamically
        if (!actionTypes.isEmpty()) {
            for (int i = 0; i < Math.min(actionTypes.size(), 3); i++) {
                if (i > 0) prompt.append(", ");
                prompt.append("\"").append(actionTypes.get(i).getTypeCode()).append("\"");
            }
        }
        prompt.append("],\n");
        
        prompt.append("  \"parameters\": {\n");
        
        // Add parameter examples dynamically
        if (!actionTypes.isEmpty()) {
            for (int i = 0; i < Math.min(actionTypes.size(), 2); i++) {
                FinanceActionTypeDto actionType = actionTypes.get(i);
                if (i > 0) prompt.append(",\n");
                
                prompt.append("    \"").append(actionType.getTypeCode()).append("\": ");
                prompt.append(actionType.getJsonSchema());
            }
        }
        
        prompt.append("\n  },\n");
        prompt.append("  \"dateRange\": {\n");
        prompt.append("    \"startDate\": \"").append(currentYear).append("-MM-DDT00:00:00\",\n");
        prompt.append("    \"endDate\": \"").append(currentDate).append("T23:59:59\",\n");
        prompt.append("    \"isRelative\": true,\n");
        prompt.append("    \"relativeDays\": 30\n");
        prompt.append("  }\n");
        prompt.append("}\n\n");

        return prompt.toString();
    }

    private String createFinanceActionsInfo() {
        StringBuilder info = new StringBuilder();
        
        // Get active finance action types from database
        List<FinanceActionTypeDto> actionTypes = financeActionTypeService.getActiveFinanceActionTypes();
        
        for (FinanceActionTypeDto actionType : actionTypes) {
            String description = getActionDescription(actionType);
            info.append(actionType.getTypeCode()).append(": ").append(description).append("\n");
        }
        return info.toString();
    }

    private String getActionDescription(FinanceActionTypeDto actionType) {
        return actionType.getDescription() != null ? actionType.getDescription() : "Açıklama mevcut değil";
    }

    private ProcessedResponse processAiResponseWithModifications(String aiResponse, String originalContent) {
        List<String> selectedActions = new ArrayList<>();
        String modifiedContent = aiResponse;
        
        try {
            // Add a default customer interaction log action first
            FinanceActionTypeDto logAction = financeActionTypeService.getFinanceActionTypeByCode("LOG_CUSTOMER_INTERACTION")
                .orElse(null);
            if (logAction != null) {
                selectedActions.add(logAction.getTypeCode());
            }

            // Extract JSON from AI response
            String jsonResponse = extractAndCleanJson(aiResponse);
            if (jsonResponse == null || jsonResponse.trim().isEmpty()) {
                log.warn("No valid JSON found in AI response, using fallback extraction");
                selectedActions.addAll(fallbackExtractActions(aiResponse));
                return new ProcessedResponse(selectedActions, modifiedContent);
            }

            // Parse JSON response
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            log.info("Extracted JSON from AI response: {}", jsonResponse);
            
            // Get current date info for Turkey timezone
            ZonedDateTime nowInTurkey = ZonedDateTime.now(ZoneId.of("Europe/Istanbul"));
            int currentYear = nowInTurkey.getYear();
            
            // Check which actions need special handling
            Set<String> specialHandlingActions = new HashSet<>();
            JsonNode selectedActionsNode = rootNode.get("selectedActions");
            if (selectedActionsNode != null && selectedActionsNode.isArray()) {
                for (JsonNode actionNode : selectedActionsNode) {
                    String actionTypeStr = actionNode.asText();
                    
                    // Get action type from database to check for special handling needs
                    FinanceActionTypeDto actionType = financeActionTypeService.getFinanceActionTypeByCode(actionTypeStr)
                        .orElse(null);
                    
                    if (actionType != null) {
                        // Check if this action type has email-related functionality
                        if (actionType.getTypeCode().contains("EMAIL") || 
                            (actionType.getJsonSchema() != null && actionType.getJsonSchema().contains("emailFlag"))) {
                            specialHandlingActions.add("HAS_EMAIL");
                        }
                        
                        // Check if this action type has statement generation functionality
                        if (actionType.getJsonSchema() != null && 
                            (actionType.getJsonSchema().contains("startDate") || actionType.getJsonSchema().contains("endDate"))) {
                            specialHandlingActions.add("HAS_STATEMENT");
                        }
                    }
                }
            }
            
            JsonNode parametersNode = rootNode.get("parameters");
            JsonNode dateRangeNode = rootNode.get("dateRange");
            
            boolean jsonModified = false;
            
            if (selectedActionsNode != null && selectedActionsNode.isArray()) {
                for (JsonNode actionNode : selectedActionsNode) {
                    try {
                        String actionTypeStr = actionNode.asText();
                        log.info("Processing action type: {}", actionTypeStr);
                        
                        // Get action type from database
                        FinanceActionTypeDto actionType = financeActionTypeService.getFinanceActionTypeByCode(actionTypeStr)
                            .orElse(null);
                        
                        if (actionType != null) {
                            // Get JSON schema for the action type
                            String jsonSchema = actionType.getJsonSchema();
                            JsonNode jsonSchemaNode = objectMapper.readTree(jsonSchema);
                            
                            // Get parameters for this action
                            JsonNode actionParams = parametersNode != null ? parametersNode.get(actionTypeStr) : null;
                            
                            if (actionParams != null && actionParams instanceof ObjectNode) {
                                log.info("Found parameters for {}: {}", actionTypeStr, actionParams);
                                
                                // Remove content and extraContent fields if they exist
                                ((ObjectNode) actionParams).remove("content");
                                ((ObjectNode) actionParams).remove("extraContent");
                                
                                // Validate and process each parameter based on JSON schema
                                actionParams.fields().forEachRemaining(entry -> {
                                    String paramName = entry.getKey();
                                    JsonNode paramValue = entry.getValue();
                                    JsonNode jsonSchemaParamValue = jsonSchemaNode.get(paramName);
                                    
                                    if (jsonSchemaParamValue != null && jsonSchemaParamValue.isTextual()) {
                                        String jsonSchemaParamStr = jsonSchemaParamValue.asText();
                                        
                                        // Handle enum-like values (separated by |)
                                        if (jsonSchemaParamStr.contains("|")) {
                                            String[] validValues = jsonSchemaParamStr.split("\\|");
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
                            
                            // Dynamic special handling based on action type characteristics
                            if (actionType.getJsonSchema() != null && 
                                (actionType.getJsonSchema().contains("startDate") || actionType.getJsonSchema().contains("endDate"))) {
                                log.info("Handling date-based action type {} with specialHandlingActions: {}", actionTypeStr, specialHandlingActions);
                                boolean wasModified = handleDateBasedAction(actionParams, nowInTurkey, currentYear, dateRangeNode, 
                                    specialHandlingActions.contains("HAS_EMAIL"), originalContent);
                                if (wasModified) {
                                    jsonModified = true;
                                    log.info("{} parameters were modified", actionTypeStr);
                                }
                            }
                            
                            selectedActions.add(actionType.getTypeCode());
                        } else {
                            log.warn("Unknown action type: {}", actionTypeStr);
                        }
                    } catch (Exception e) {
                        log.error("Error processing action type {}: {}", actionNode.asText(), e.getMessage());
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
                    modifiedContent = aiResponse.replace(jsonResponse, modifiedJson);
                    log.info("Successfully replaced JSON in plain format");
                }
                log.info("Final modified content: {}", modifiedContent);
            } else {
                log.info("No JSON modifications were made");
            }

            // Add default LOG_CUSTOMER_INTERACTION if no other actions found
            if (selectedActions.size() <= 1) {
                if (logAction != null) {
                    selectedActions.add(logAction.getTypeCode());
                }
            }
        } catch (Exception e) {
            log.error("Error processing AI response: {}", e.getMessage(), e);
            selectedActions.addAll(fallbackExtractActions(aiResponse));
        }
        
        return new ProcessedResponse(selectedActions, modifiedContent);
    }

    private boolean handleDateBasedAction(JsonNode actionParams, ZonedDateTime nowInTurkey, 
            int currentYear, JsonNode dateRangeNode, boolean hasEmailAction, String originalContent) {
        boolean modified = false;
        log.info("handleDateBasedAction called with hasEmailAction: {}", hasEmailAction);
        
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
            
            // Tarihleri güncelle (sadece ilgili alanlar varsa)
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            if (params.has("startDate")) {
                params.put("startDate", startDate.format(formatter));
                log.info("Updated startDate: {}", startDate.format(formatter));
                modified = true;
            }
            if (params.has("endDate")) {
                params.put("endDate", endDate.format(formatter));
                log.info("Updated endDate: {}", endDate.format(formatter));
                modified = true;
            }
            
            // emailFlag'i güncelle (sadece bu alan varsa)
            if (hasEmailAction && params.has("emailFlag")) {
                params.put("emailFlag", true);
                log.info("Set emailFlag to true due to email-related action");
                modified = true;
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
        }
        
        return modified;
    }
    
    private String extractAndCleanJson(String aiResponse) {
        try {
            if (aiResponse == null) {
                return null;
            }
            
            if (aiResponse.contains("```json")) {
                int jsonStart = aiResponse.indexOf("```json") + 7;
                int jsonEnd = aiResponse.indexOf("```", jsonStart);
                if (jsonEnd != -1) {
                    return aiResponse.substring(jsonStart, jsonEnd).trim();
                }
            }
            
            // Try to find JSON object in the response
            int start = aiResponse.indexOf("{");
            int end = aiResponse.lastIndexOf("}");
            if (start != -1 && end != -1 && end > start) {
                return aiResponse.substring(start, end + 1);
            }
            
            return null;
        } catch (Exception e) {
            log.error("Error extracting JSON from response: {}", e.getMessage());
            return null;
        }
    }
    
    private List<String> fallbackExtractActions(String aiResponse) {
        List<String> actions = new ArrayList<>();
        
        try {
            // Handle null response
            if (aiResponse == null) {
                FinanceActionTypeDto logAction = financeActionTypeService.getFinanceActionTypeByCode("LOG_CUSTOMER_INTERACTION")
                    .orElse(null);
                if (logAction != null) {
                    actions.add(logAction.getTypeCode());
                }
                return actions;
            }
            
            // Get all active action types from database
            List<FinanceActionTypeDto> allActionTypes = financeActionTypeService.getActiveFinanceActionTypes();
            
            // Convert response to uppercase for matching
            String upperResponse = aiResponse.toUpperCase();
            
            // Look for action type codes in the response
            for (FinanceActionTypeDto actionType : allActionTypes) {
                if (upperResponse.contains(actionType.getTypeCode().toUpperCase())) {
                    actions.add(actionType.getTypeCode());
                }
            }
            
            // If no actions found, add default
            if (actions.isEmpty()) {
                FinanceActionTypeDto logAction = financeActionTypeService.getFinanceActionTypeByCode("LOG_CUSTOMER_INTERACTION")
                    .orElse(null);
                if (logAction != null) {
                    actions.add(logAction.getTypeCode());
                }
            }
            
        } catch (Exception e) {
            log.error("Error in fallback action extraction: {}", e.getMessage());
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
