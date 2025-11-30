package server

import (
	"context"
	"fmt"
	"time"
	"tingly-box/internal/config"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
)

// forwardOpenAIRequest forwards the request to the selected provider using OpenAI library
func (s *Server) forwardOpenAIRequest(provider *config.Provider, req *RequestWrapper) (*openai.ChatCompletion, error) {
	// Create OpenAI client with provider configuration
	client := openai.NewClient(
		option.WithAPIKey(provider.Token),
		option.WithBaseURL(provider.APIBase),
	)

	// Since RequestWrapper is a type alias to openai.ChatCompletionNewParams,
	// we can directly use it as the request parameters
	chatReq := *req

	// Make the request using OpenAI library
	chatCompletion, err := client.Chat.Completions.New(context.Background(), chatReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create chat completion: %w", err)
	}

	return chatCompletion, nil
}

// Helper functions to convert between formats
func (s *Server) convertAnthropicToOpenAI(anthropicReq *AnthropicMessagesRequest) *RequestWrapper {
	openaiReq := &RequestWrapper{
		Model: anthropicReq.Model,
	}

	// Convert MaxTokens - use option helper functions if available, otherwise skip
	// We'll handle these parameters in the forwardOpenAIRequest function
	s.setRequestParams(openaiReq, anthropicReq)

	// Convert messages
	for _, msg := range anthropicReq.Messages {
		if msg.Role == "user" {
			openaiMsg := openai.UserMessage(msg.Content)
			openaiReq.Messages = append(openaiReq.Messages, openaiMsg)
		} else if msg.Role == "assistant" {
			openaiMsg := openai.AssistantMessage(msg.Content)
			openaiReq.Messages = append(openaiReq.Messages, openaiMsg)
		}
	}

	// Convert system message
	if anthropicReq.System != "" {
		systemMsg := openai.SystemMessage(anthropicReq.System)
		// Add system message at the beginning
		openaiReq.Messages = append([]openai.ChatCompletionMessageParamUnion{systemMsg}, openaiReq.Messages...)
	}

	// We'll handle stop sequences in the forwardOpenAIRequest function

	return openaiReq
}

// setRequestParams handles the optional parameters that need special handling
func (s *Server) setRequestParams(openaiReq *RequestWrapper, anthropicReq *AnthropicMessagesRequest) {
	// Note: This is a placeholder for setting optional parameters
	// In practice, you might need to use the OpenAI SDK's option helpers
	// For now, we'll skip optional parameters and focus on the core functionality
}

func (s *Server) convertOpenAIToAnthropic(openaiResp *openai.ChatCompletion, model string) AnthropicMessagesResponse {
	response := AnthropicMessagesResponse{
		ID:           fmt.Sprintf("msg_%d", time.Now().Unix()),
		Type:         "message",
		Role:         "assistant",
		Model:        model,
		StopReason:   "end_turn",
		StopSequence: "",
		Usage: AnthropicUsage{
			InputTokens:  int(openaiResp.Usage.PromptTokens),
			OutputTokens: int(openaiResp.Usage.CompletionTokens),
		},
	}

	// Convert choices to content
	for _, choice := range openaiResp.Choices {
		content := choice.Message.Content
		if content != "" {
			anthropicContent := AnthropicContent{
				Type: "text",
				Text: content,
			}
			response.Content = append(response.Content, anthropicContent)
		}
	}

	return response
}
