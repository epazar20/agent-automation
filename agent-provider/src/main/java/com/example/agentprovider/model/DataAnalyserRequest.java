package com.example.agentprovider.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class DataAnalyserRequest extends AiRequest {
    private String xAxis;
    private String yAxis;

    public DataAnalyserRequest() {
        super();
    }

    @Override
    public void setContent(String content) {
        super.setContent(content);
    }

    @Override
    public void setSpecialPrompt(String specialPrompt) {
        super.setSpecialPrompt(specialPrompt);
    }

    @Override
    public void setModel(String model) {
        super.setModel(model);
    }

    @Override
    public void setMaxTokens(int maxTokens) {
        super.setMaxTokens(maxTokens);
    }

    @Override
    public void setTemperature(double temperature) {
        super.setTemperature(temperature);
    }

    @Override
    public String toString() {
        return "DataAnalyserRequest(" +
            "content=" + getContent() +
            ", specialPrompt=" + getSpecialPrompt() +
            ", model=" + getModel() +
            ", maxTokens=" + getMaxTokens() +
            ", temperature=" + getTemperature() +
            ", xAxis=" + xAxis +
            ", yAxis=" + yAxis +
            ")";
    }
} 