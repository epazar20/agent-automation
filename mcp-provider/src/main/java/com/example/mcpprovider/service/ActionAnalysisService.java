package com.example.mcpprovider.service;

import com.example.mcpprovider.client.AiProviderClient;
import com.example.mcpprovider.dto.ActionAnalysisRequest;
import com.example.mcpprovider.dto.ActionAnalysisResponse;
import com.example.mcpprovider.dto.AiProviderRequest;
import com.example.mcpprovider.dto.AiProviderResponse;
import com.example.mcpprovider.dto.CustomerDto;
import com.example.mcpprovider.enums.FinanceActionType;
import com.example.mcpprovider.model.Customer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
public class ActionAnalysisService {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private AiProviderClient aiProviderClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ActionAnalysisResponse analyzeAction(ActionAnalysisRequest request) {
        try {
            // 1. Get customer data if customerNo is provided
            Customer customer = null;
            String enhancedContent = request.getContent();
            
            if (request.getCustomerNo() != null && !request.getCustomerNo().trim().isEmpty()) {
                // Try to find customer by ID first, then create a dummy if not found
                CustomerDto customerDto = null;
                try {
                    Long customerId = Long.parseLong(request.getCustomerNo());
                    customerDto = customerService.getCustomerById(customerId).orElse(null);
                } catch (NumberFormatException e) {
                    // If customerNo is not a number, try to find by name or create dummy
                    customerDto = null;
                }
                
                // Convert DTO to model or create dummy
                if (customerDto != null) {
                    customer = convertDtoToModel(customerDto);
                } else {
                    customer = createDummyCustomer(request.getCustomerNo());
                }
                
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
            }

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

            // 4. Analyze which FinanceActionTypes are relevant
            List<FinanceActionType> relevantActions = extractSelectedActions(aiResponse.getContent());

            // 5. Create response
            ActionAnalysisResponse response = new ActionAnalysisResponse();
            response.setContent(aiResponse != null ? aiResponse.getContent() : "");
            response.setExtraContent(request.getContent());
            response.setFinanceActionTypes(relevantActions);
            response.setCustomer(customer);

            return response;

        } catch (Exception e) {
            ActionAnalysisResponse errorResponse = new ActionAnalysisResponse();
            errorResponse.setContent("Error during analysis: " + e.getMessage());
            errorResponse.setExtraContent(request.getContent());
            errorResponse.setFinanceActionTypes(new ArrayList<>());
            return errorResponse;
        }
    }

    private String createAnalysisPrompt() {
        return "Lütfen aşağıdaki bilgileri kullanarak detaylı bir analiz yap:\n\n" +
               "1. Müşteri JSON verisini inceleyin ve ilgili alanları belirleyin\n" +
               "2. Verilen finansal işlem tiplerini ve açıklamalarını dikkate alın\n" +
               "3. Müşteri talebini analiz edin\n" +
               "4. Uygun finansal işlem tiplerini seçin ve JSON formatında döndürün\n" +
               "5. Her seçilen işlem tipi için gerekli parametreleri JSON şemasına uygun şekilde doldurun\n" +
               "6. Müşteri bilgilerini ilgili alanlara yerleştirin\n\n" +
               "Lütfen yanıtınızı aşağıdaki JSON formatında döndürün:\n" +
               "{\n" +
               "  \"selectedActions\": [\"ACTION_TYPE1\", \"ACTION_TYPE2\"],\n" +
               "  \"parameters\": {\n" +
               "    \"actionType1\": { /* ilgili parametreler */ },\n" +
               "    \"actionType2\": { /* ilgili parametreler */ }\n" +
               "  },\n" +
               "  \"customerData\": { /* müşteri verilerinden ilgili alanlar */ }\n" +
               "}";
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

    private List<FinanceActionType> extractSelectedActions(String aiResponse) {
        List<FinanceActionType> selectedActions = new ArrayList<>();
        
        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            selectedActions.add(FinanceActionType.LOG_CUSTOMER_INTERACTION);
            return selectedActions;
        }

        try {
            // First, try to extract JSON from markdown code blocks
            String cleanedResponse = extractAndCleanJson(aiResponse);
            
            if (cleanedResponse != null) {
                JsonNode rootNode = objectMapper.readTree(cleanedResponse);
                JsonNode selectedActionsNode = rootNode.get("selectedActions");
                
                if (selectedActionsNode != null && selectedActionsNode.isArray()) {
                    for (JsonNode actionNode : selectedActionsNode) {
                        try {
                            String actionTypeStr = actionNode.asText();
                            FinanceActionType actionType = FinanceActionType.valueOf(actionTypeStr);
                            selectedActions.add(actionType);
                        } catch (IllegalArgumentException e) {
                            // Log invalid action type and continue
                            System.out.println("Invalid action type found: " + actionNode.asText());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Failed to parse AI response: " + e.getMessage());
            // Fallback: try to find selectedActions array directly in text
            selectedActions = fallbackExtractActions(aiResponse);
        }
        
        // If no valid actions were found, add default action
        if (selectedActions.isEmpty()) {
            selectedActions.add(FinanceActionType.LOG_CUSTOMER_INTERACTION);
        }
        
        return selectedActions;
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
            System.out.println("Error extracting JSON: " + e.getMessage());
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
                        System.out.println("Invalid action type in fallback: " + cleanAction);
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Fallback extraction failed: " + e.getMessage());
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