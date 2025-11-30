package server

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// OpenAIChatCompletions handles OpenAI v1 chat completion requests
func (s *Server) OpenAIChatCompletions(c *gin.Context) {
	// Use the existing ChatCompletions logic for OpenAI compatibility
	s.ChatCompletions(c)
}

// ChatCompletions handles OpenAI-compatible chat completion requests
func (s *Server) ChatCompletions(c *gin.Context) {
	var req RequestWrapper

	// Parse request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: "Invalid request body: " + err.Error(),
				Type:    "invalid_request_error",
			},
		})
		return
	}

	// Validate required fields
	if req.Model == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: "Model is required",
				Type:    "invalid_request_error",
			},
		})
		return
	}

	if len(req.Messages) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: "At least one message is required",
				Type:    "invalid_request_error",
			},
		})
		return
	}

	// Determine provider and model based on request
	provider, modelDef, err := s.DetermineProviderAndModel(req.Model)
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
		req.Model = modelDef.Model
	}

	// Forward request to provider
	response, err := s.forwardOpenAIRequest(provider, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: ErrorDetail{
				Message: "Failed to forward request: " + err.Error(),
				Type:    "api_error",
			},
		})
		return
	}

	// Handle response model modification at JSON level
	globalConfig := s.config.GetGlobalConfig()
	responseModel := ""
	if globalConfig != nil {
		responseModel = globalConfig.GetResponseModel()
	}

	// Convert response to JSON map for modification
	responseJSON, err := json.Marshal(response)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: ErrorDetail{
				Message: "Failed to marshal response: " + err.Error(),
				Type:    "api_error",
			},
		})
		return
	}

	var responseMap map[string]interface{}
	if err := json.Unmarshal(responseJSON, &responseMap); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: ErrorDetail{
				Message: "Failed to process response: " + err.Error(),
				Type:    "api_error",
			},
		})
		return
	}

	// Update response model if configured and we have model definition
	if responseModel != "" {
		responseMap["model"] = responseModel
	}

	// Return modified response
	c.JSON(http.StatusOK, responseMap)
}

// ListModels handles the /v1/models endpoint (OpenAI compatible)
func (s *Server) ListModels(c *gin.Context) {
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

	// Convert to OpenAI-compatible format
	var openaiModels []map[string]interface{}
	for _, model := range models {
		openaiModel := map[string]interface{}{
			"id":       model.Name,
			"object":   "model",
			"created":  time.Now().Unix(), // In a real implementation, use actual creation date
			"owned_by": "tingly-box",
		}

		// Add permission information
		var permissions []string
		if model.Category == "chat" {
			permissions = append(permissions, "chat.completions")
		}

		openaiModel["permission"] = permissions

		// Add aliases as metadata
		if len(model.Aliases) > 0 {
			openaiModel["metadata"] = map[string]interface{}{
				"provider":     model.Provider,
				"api_base":     model.APIBase,
				"actual_model": model.Model,
				"aliases":      model.Aliases,
				"description":  model.Description,
				"category":     model.Category,
			}
		} else {
			openaiModel["metadata"] = map[string]interface{}{
				"provider":     model.Provider,
				"api_base":     model.APIBase,
				"actual_model": model.Model,
				"description":  model.Description,
				"category":     model.Category,
			}
		}

		openaiModels = append(openaiModels, openaiModel)
	}

	response := map[string]interface{}{
		"object": "list",
		"data":   openaiModels,
	}

	c.JSON(http.StatusOK, response)
}
