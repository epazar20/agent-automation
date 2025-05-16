package com.example.aiprovider.controller;

import com.example.aiprovider.model.AiRequest;
import com.example.aiprovider.model.AiResponse;
import com.example.aiprovider.service.AiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiController.class)
public class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiService aiService;

    @Test
    public void testListModels() throws Exception {
        String[] models = {"huggingface/deepseek/deepseek-v3-0324", "mistralai/Mistral-7B-Instruct-v0.2", "openai"};
        when(aiService.listAvailableModels()).thenReturn(models);

        mockMvc.perform(get("/api/ai/models"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("huggingface/deepseek/deepseek-v3-0324"))
                .andExpect(jsonPath("$[1]").value("mistralai/Mistral-7B-Instruct-v0.2"))
                .andExpect(jsonPath("$[2]").value("openai"));
    }

    @Test
    public void testGenerateContent() throws Exception {
        AiResponse mockResponse = new AiResponse();
        mockResponse.setModel("huggingface/deepseek/deepseek-v3-0324");
        mockResponse.setResponse("Generated content from HuggingFace model");
        mockResponse.setProcessingTimeMs(150);
        mockResponse.setSuccess(true);

        when(aiService.processRequest(any(AiRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/ai/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"prompt\":\"Test prompt\",\"specialPrompt\":\"You are a helpful assistant\",\"model\":\"huggingface/deepseek/deepseek-v3-0324\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").value("Generated content from HuggingFace model"))
                .andExpect(jsonPath("$.model").value("huggingface/deepseek/deepseek-v3-0324"))
                .andExpect(jsonPath("$.success").value(true));
    }
} 