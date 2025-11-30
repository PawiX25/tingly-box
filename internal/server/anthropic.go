package server

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// AnthropicMessages handles Anthropic v1 messages API requests
func (s *Server) AnthropicMessages(c *gin.Context) {
	var anthropicReq AnthropicMessagesRequest

	// Parse request body
	if err := c.ShouldBindJSON(&anthropicReq); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: "Invalid request body: " + err.Error(),
				Type:    "invalid_request_error",
			},
		})
		return
	}

	// Validate required fields
	if anthropicReq.Model == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: "Model is required",
				Type:    "invalid_request_error",
			},
		})
		return
	}

	if len(anthropicReq.Messages) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: "At least one message is required",
				Type:    "invalid_request_error",
			},
		})
		return
	}

	// Convert Anthropic request to OpenAI format for internal processing
	openaiReq := s.convertAnthropicToOpenAI(&anthropicReq)

	// Determine provider and model based on request
	provider, modelDef, err := s.DetermineProviderAndModel(openaiReq.Model)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: err.Error(),
				Type:    "invalid_request_error",
			},
		})
		return
	}

	// Update request with actual model name if we have model definition
	if modelDef != nil {
		openaiReq.Model = modelDef.Model
	}

	// Forward request to provider
	response, err := s.forwardOpenAIRequest(provider, openaiReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: ErrorDetail{
				Message: "Failed to forward request: " + err.Error(),
				Type:    "api_error",
			},
		})
		return
	}

	// Convert OpenAI response back to Anthropic format
	anthropicResp := s.convertOpenAIToAnthropic(response, anthropicReq.Model)

	c.JSON(http.StatusOK, anthropicResp)
}

// AnthropicModels handles Anthropic v1 models endpoint
func (s *Server) AnthropicModels(c *gin.Context) {
	if s.modelManager == nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: ErrorDetail{
				Message: "Model manager not available",
				Type:    "internal_error",
			},
		})
		return
	}

	models := s.modelManager.GetAllModels()

	// Convert to Anthropic-compatible format
	var anthropicModels []AnthropicModel
	for _, model := range models {
		anthropicModel := AnthropicModel{
			ID:           model.Name,
			Object:       "model",
			Created:      time.Now().Unix(),
			DisplayName:  model.Name,
			Type:         "chat",
			MaxTokens:    100000, // Default value, should be configurable
			Capabilities: []string{"text"},
		}

		anthropicModels = append(anthropicModels, anthropicModel)
	}

	response := AnthropicModelsResponse{
		Data: anthropicModels,
	}

	c.JSON(http.StatusOK, response)
}

// Anthropic request/response structures
type AnthropicMessagesRequest struct {
	Model         string             `json:"model"`
	Messages      []AnthropicMessage `json:"messages"`
	MaxTokens     int                `json:"max_tokens"`
	Temperature   *float64           `json:"temperature,omitempty"`
	TopP          *float64           `json:"top_p,omitempty"`
	TopK          *int               `json:"top_k,omitempty"`
	Stream        bool               `json:"stream,omitempty"`
	StopSequences []string           `json:"stop_sequences,omitempty"`
	System        string             `json:"system,omitempty"`
}

type AnthropicMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type AnthropicMessagesResponse struct {
	ID           string             `json:"id"`
	Type         string             `json:"type"`
	Role         string             `json:"role"`
	Content      []AnthropicContent `json:"content"`
	Model        string             `json:"model"`
	StopReason   string             `json:"stop_reason"`
	StopSequence string             `json:"stop_sequence"`
	Usage        AnthropicUsage     `json:"usage"`
}

type AnthropicContent struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type AnthropicUsage struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
}

type AnthropicModel struct {
	ID           string   `json:"id"`
	Object       string   `json:"object"`
	Created      int64    `json:"created"`
	DisplayName  string   `json:"display_name"`
	Type         string   `json:"type"`
	MaxTokens    int      `json:"max_tokens"`
	Capabilities []string `json:"capabilities"`
}

type AnthropicModelsResponse struct {
	Data []AnthropicModel `json:"data"`
}
