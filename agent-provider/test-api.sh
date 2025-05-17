#!/bin/bash

curl -X POST \
  http://localhost:8081/agent-provider/api/agent/youtube-summarize \
  -H 'Content-Type: application/json' \
  -d '{
  "url": "https://www.youtube.com/watch?v=88rupEYdQmo",
  "prompt": "",
  "specialPrompt": "Sen bir transkript özetleyicisin. Verilen metni özetleyeceksin.",
  "model": "huggingface/deepseek/deepseek-v3-0324",
  "maxTokens": 1000,
  "temperature": 0.7
}' 