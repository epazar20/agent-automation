# AI Provider Service

A Spring Boot REST service that provides AI content generation capabilities.

## Requirements

- Java 17 or higher
- Maven 3.6+ or Gradle 7.0+

## Building the Application

To build the application, run:

```bash
mvn clean package
```

## API Key Setup

This application requires API keys to connect to various AI providers. For security reasons, API keys should never be committed to version control.

### Option 1: Environment Variables (Recommended for Production)

Set the following environment variables:

```bash
export HUGGINGFACE_API_KEY=your_key_here
export OPENAI_API_KEY=your_key_here
export CLAUDE_API_KEY=your_key_here
export GEMINI_API_KEY=your_key_here
export DEEPSEEK_API_KEY=your_key_here
```

### Option 2: Properties File (For Local Development)

1. Copy the example secrets file:
   ```bash
   cp src/main/resources/application-secrets.properties.example src/main/resources/application-secrets.properties
   ```

2. Edit `application-secrets.properties` and add your API keys:
   ```properties
   huggingface.api.key=your_key_here
   openai.api.key=your_key_here
   claude.api.key=your_key_here
   gemini.api.key=your_key_here
   deepseek.api.key=your_key_here
   ```

This file is excluded from Git via `.gitignore` to prevent accidental commits of sensitive information.

## Running the Application

To run the application, use:

```bash
mvn spring-boot:run
```

Or after building:

```bash
java -jar target/ai-provider-0.0.1-SNAPSHOT.jar
```

The application will start on port 8080 with context path `/ai-provider`.

## API Endpoints

### List Available Models

```
GET /ai-provider/api/ai/models
```

Returns a list of available AI models.

### Generate Content

```
POST /ai-provider/api/ai/generate
```

Request body:

```json
{
  "prompt": "Your prompt text here",
  "specialPrompt": "Optional system prompt for context",
  "model": "huggingface/deepseek/deepseek-v3-0324",
  "maxTokens": 1000,
  "temperature": 0.7
}
```

Only the `prompt` field is required. Other fields have these default values:
- `model`: "huggingface/deepseek/deepseek-v3-0324"
- `specialPrompt`: null (optional system context for models that support role-based prompting)
- `maxTokens`: 1000
- `temperature`: 0.7

Response:

```json
{
  "model": "huggingface/deepseek/deepseek-v3-0324",
  "response": "Generated AI content will appear here...",
  "processingTimeMs": 125,
  "success": true,
  "errorMessage": null
}
```

## Supported AI Providers

The service supports the following AI providers:

1. **HuggingFace** (Default): Access to various models
   - deepseek-v3-0324 (default)
   - Mistral
   - Llama
   - Any model available through HuggingFace inference API

2. **OpenAI**: GPT-3.5, GPT-4
3. **Claude**: Claude-3-Opus, Claude-3-Sonnet
4. **Gemini**: Google's Gemini model
5. **Deepseek**: Deepseek models

## Using System Prompts

For models that support role-based prompting (like the default deepseek-v3), you can provide a `specialPrompt` which will be sent as a system message. For example:

```json
{
  "prompt": "Tell me a short story about robots",
  "specialPrompt": "You are a creative storyteller who specializes in science fiction."
}
```

The `specialPrompt` provides context or instructions to the AI, while the `prompt` is the actual user query.

## Sample Usage

Using curl:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"prompt":"Tell me a short story about a robot", "specialPrompt":"You are a creative storyteller"}' \
  http://localhost:8080/ai-provider/api/ai/generate
```

## Project Structure

```
ai-provider/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── aiprovider/
│   │   │               ├── controller/
│   │   │               ├── model/
│   │   │               ├── service/
│   │   │               ├── exception/
│   │   │               └── AiProviderApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-secrets.properties (not committed)
│   │       └── application-secrets.properties.example
│   └── test/
│       └── java/
└── pom.xml
``` 