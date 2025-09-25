// Package oadr3client provides a Go client for OpenADR 3.1.0 API
package oadr3client

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"golang.org/x/oauth2/clientcredentials"
)

// OADR3Config holds configuration for the OpenADR 3 client
type OADR3Config struct {
	BaseURL      string
	ClientID     string
	ClientSecret string
	Scope        string
}

// OADR3 represents the OpenADR 3 client
type OADR3 struct {
	config     OADR3Config
	httpClient *http.Client
	oauth2Cfg  clientcredentials.Config
}

// APIResponse represents a standardized API response
type APIResponse[T any] struct {
	Status   int    `json:"status"`
	Response *T     `json:"response,omitempty"`
	Problem  *Error `json:"problem,omitempty"`
}

// Error represents an API error
type Error struct {
	Type   string `json:"type,omitempty"`
	Title  string `json:"title,omitempty"`
	Status int    `json:"status,omitempty"`
	Detail string `json:"detail,omitempty"`
}

// NewOADR3 creates a new OpenADR 3 client instance
func NewOADR3(config OADR3Config) *OADR3 {
	// Clean baseURL - remove trailing slash
	if strings.HasSuffix(config.BaseURL, "/") {
		config.BaseURL = strings.TrimSuffix(config.BaseURL, "/")
	}

	// Set up OAuth2 client credentials configuration
	oauth2Cfg := clientcredentials.Config{
		ClientID:     config.ClientID,
		ClientSecret: config.ClientSecret,
		TokenURL:     config.BaseURL + "/auth/token",
	}

	if config.Scope != "" {
		oauth2Cfg.Scopes = []string{config.Scope}
	}

	// Create HTTP client with OAuth2 transport
	ctx := context.Background()
	httpClient := oauth2Cfg.Client(ctx)

	return &OADR3{
		config:     config,
		httpClient: httpClient,
		oauth2Cfg:  oauth2Cfg,
	}
}

// makeRequest makes an HTTP request with proper error handling and validation
func (c *OADR3) makeRequest(ctx context.Context, method, path string, queryParams map[string]interface{}, body interface{}) (*http.Response, error) {
	// Build URL with query parameters
	reqURL := c.config.BaseURL + path
	if len(queryParams) > 0 {
		params := url.Values{}
		for key, value := range queryParams {
			if value != nil {
				switch v := value.(type) {
				case []string:
					for _, item := range v {
						params.Add(key, item)
					}
				case *int:
					if v != nil {
						params.Add(key, strconv.Itoa(*v))
					}
				case *string:
					if v != nil {
						params.Add(key, *v)
					}
				case string:
					params.Add(key, v)
				case int:
					params.Add(key, strconv.Itoa(v))
				default:
					params.Add(key, fmt.Sprintf("%v", value))
				}
			}
		}
		if len(params) > 0 {
			reqURL += "?" + params.Encode()
		}
	}

	// Prepare request body
	var reqBody *bytes.Buffer
	if body != nil {
		bodyBytes, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(bodyBytes)
	}

	// Create request
	var req *http.Request
	var err error
	if reqBody != nil {
		req, err = http.NewRequestWithContext(ctx, method, reqURL, reqBody)
	} else {
		req, err = http.NewRequestWithContext(ctx, method, reqURL, nil)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Accept", "application/json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	// Make request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}

	return resp, nil
}

// handleResponse processes HTTP response and returns APIResponse
func handleResponse[T any](resp *http.Response) (*APIResponse[T], error) {
	defer resp.Body.Close()

	result := &APIResponse[T]{
		Status: resp.StatusCode,
	}

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		// Success response
		var responseData T
		if err := json.NewDecoder(resp.Body).Decode(&responseData); err != nil {
			return nil, fmt.Errorf("failed to decode response: %w", err)
		}
		result.Response = &responseData
	} else {
		// Error response
		var problemData Error
		if err := json.NewDecoder(resp.Body).Decode(&problemData); err != nil {
			// If we can't decode the error, create a generic one
			problemData = Error{
				Status: resp.StatusCode,
				Title:  resp.Status,
				Detail: "HTTP error occurred",
			}
		}
		result.Problem = &problemData
	}

	return result, nil
}

// Programs API

// SearchAllPrograms searches all programs
func (c *OADR3) SearchAllPrograms(ctx context.Context, targets []string, skip *int, limit *int) (*APIResponse[[]Program], error) {
	// Validate inputs
	params := SearchAllProgramsParams{
		Targets: targets,
		Skip:    skip,
		Limit:   limit,
	}

	if validationResult := ValidateSearchAllProgramsParams(&params); !validationResult.Valid {
		return nil, fmt.Errorf("invalid parameters: %v", validationResult.Errors)
	}

	// Build query parameters
	queryParams := make(map[string]interface{})
	if targets != nil {
		queryParams["targets"] = targets
	}
	if skip != nil {
		queryParams["skip"] = skip
	}
	if limit != nil {
		queryParams["limit"] = limit
	}

	// Make request
	resp, err := c.makeRequest(ctx, "GET", "/programs", queryParams, nil)
	if err != nil {
		return nil, err
	}

	// Handle response
	result, err := handleResponse[[]Program](resp)
	if err != nil {
		return nil, err
	}

	// Validate response data
	if result.Response != nil {
		for _, program := range *result.Response {
			if validationResult := ValidateProgram(&program); !validationResult.Valid {
				return nil, fmt.Errorf("invalid program in response: %v", validationResult.Errors)
			}
		}
	}

	return result, nil
}

// CreateProgram creates a new program
func (c *OADR3) CreateProgram(ctx context.Context, program *Program) (*APIResponse[Program], error) {
	// Validate input
	if program == nil {
		return nil, fmt.Errorf("program cannot be nil")
	}

	if validationResult := ValidateProgram(program); !validationResult.Valid {
		return nil, fmt.Errorf("invalid program: %v", validationResult.Errors)
	}

	// Make request
	resp, err := c.makeRequest(ctx, "POST", "/programs", nil, program)
	if err != nil {
		return nil, err
	}

	// Handle response
	result, err := handleResponse[Program](resp)
	if err != nil {
		return nil, err
	}

	// Validate response data
	if result.Response != nil {
		if validationResult := ValidateProgram(result.Response); !validationResult.Valid {
			return nil, fmt.Errorf("invalid program in response: %v", validationResult.Errors)
		}
	}

	return result, nil
}

// SearchProgramByProgramID searches for a specific program by ID
func (c *OADR3) SearchProgramByProgramID(ctx context.Context, programID string) (*APIResponse[Program], error) {
	// Validate input
	if programID == "" {
		return nil, fmt.Errorf("programID cannot be empty")
	}

	params := SearchProgramByProgramIdParams{
		ProgramID: programID,
	}

	if validationResult := ValidateSearchProgramByProgramIdParams(&params); !validationResult.Valid {
		return nil, fmt.Errorf("invalid programID: %v", validationResult.Errors)
	}

	// Make request
	resp, err := c.makeRequest(ctx, "GET", "/programs/"+programID, nil, nil)
	if err != nil {
		return nil, err
	}

	// Handle response
	result, err := handleResponse[Program](resp)
	if err != nil {
		return nil, err
	}

	// Validate response data
	if result.Response != nil {
		if validationResult := ValidateProgram(result.Response); !validationResult.Valid {
			return nil, fmt.Errorf("invalid program in response: %v", validationResult.Errors)
		}
	}

	return result, nil
}

// UpdateProgram updates an existing program
func (c *OADR3) UpdateProgram(ctx context.Context, programID string, program *Program) (*APIResponse[Program], error) {
	// Validate input
	if programID == "" {
		return nil, fmt.Errorf("programID cannot be empty")
	}
	if program == nil {
		return nil, fmt.Errorf("program cannot be nil")
	}

	if validationResult := ValidateProgram(program); !validationResult.Valid {
		return nil, fmt.Errorf("invalid program: %v", validationResult.Errors)
	}

	// Make request
	resp, err := c.makeRequest(ctx, "PUT", "/programs/"+programID, nil, program)
	if err != nil {
		return nil, err
	}

	// Handle response
	result, err := handleResponse[Program](resp)
	if err != nil {
		return nil, err
	}

	// Validate response data
	if result.Response != nil {
		if validationResult := ValidateProgram(result.Response); !validationResult.Valid {
			return nil, fmt.Errorf("invalid program in response: %v", validationResult.Errors)
		}
	}

	return result, nil
}

// DeleteProgram deletes a program
func (c *OADR3) DeleteProgram(ctx context.Context, programID string) (*APIResponse[interface{}], error) {
	// Validate input
	if programID == "" {
		return nil, fmt.Errorf("programID cannot be empty")
	}

	params := SearchProgramByProgramIdParams{
		ProgramID: programID,
	}

	if validationResult := ValidateSearchProgramByProgramIdParams(&params); !validationResult.Valid {
		return nil, fmt.Errorf("invalid programID: %v", validationResult.Errors)
	}

	// Make request
	resp, err := c.makeRequest(ctx, "DELETE", "/programs/"+programID, nil, nil)
	if err != nil {
		return nil, err
	}

	// Handle response
	return handleResponse[interface{}](resp)
}

// Events API

// SearchAllEvents searches all events
func (c *OADR3) SearchAllEvents(ctx context.Context, programID *string, skip *int, limit *int) (*APIResponse[[]Event], error) {
	// Validate inputs
	params := SearchAllEventsParams{
		ProgramID: programID,
		Skip:      skip,
		Limit:     limit,
	}

	if validationResult := ValidateSearchAllEventsParams(&params); !validationResult.Valid {
		return nil, fmt.Errorf("invalid parameters: %v", validationResult.Errors)
	}

	// Build query parameters
	queryParams := make(map[string]interface{})
	if programID != nil {
		queryParams["programID"] = programID
	}
	if skip != nil {
		queryParams["skip"] = skip
	}
	if limit != nil {
		queryParams["limit"] = limit
	}

	// Make request
	resp, err := c.makeRequest(ctx, "GET", "/events", queryParams, nil)
	if err != nil {
		return nil, err
	}

	// Handle response
	result, err := handleResponse[[]Event](resp)
	if err != nil {
		return nil, err
	}

	// Validate response data
	if result.Response != nil {
		for _, event := range *result.Response {
			if validationResult := ValidateEvent(&event); !validationResult.Valid {
				return nil, fmt.Errorf("invalid event in response: %v", validationResult.Errors)
			}
		}
	}

	return result, nil
}

// CreateEvent creates a new event
func (c *OADR3) CreateEvent(ctx context.Context, event *Event) (*APIResponse[Event], error) {
	// Validate input
	if event == nil {
		return nil, fmt.Errorf("event cannot be nil")
	}

	if validationResult := ValidateEvent(event); !validationResult.Valid {
		return nil, fmt.Errorf("invalid event: %v", validationResult.Errors)
	}

	// Make request
	resp, err := c.makeRequest(ctx, "POST", "/events", nil, event)
	if err != nil {
		return nil, err
	}

	// Handle response
	result, err := handleResponse[Event](resp)
	if err != nil {
		return nil, err
	}

	// Validate response data
	if result.Response != nil {
		if validationResult := ValidateEvent(result.Response); !validationResult.Valid {
			return nil, fmt.Errorf("invalid event in response: %v", validationResult.Errors)
		}
	}

	return result, nil
}

// Reports API

// SearchAllReports searches all reports
func (c *OADR3) SearchAllReports(ctx context.Context, programID *string, clientName *string, skip *int, limit *int) (*APIResponse[[]Report], error) {
	// Build query parameters
	queryParams := make(map[string]interface{})
	if programID != nil {
		queryParams["programID"] = programID
	}
	if clientName != nil {
		queryParams["clientName"] = clientName
	}
	if skip != nil {
		queryParams["skip"] = skip
	}
	if limit != nil {
		queryParams["limit"] = limit
	}

	// Make request
	resp, err := c.makeRequest(ctx, "GET", "/reports", queryParams, nil)
	if err != nil {
		return nil, err
	}

	// Handle response
	result, err := handleResponse[[]Report](resp)
	if err != nil {
		return nil, err
	}

	// Validate response data
	if result.Response != nil {
		for _, report := range *result.Response {
			if validationResult := ValidateReport(&report); !validationResult.Valid {
				return nil, fmt.Errorf("invalid report in response: %v", validationResult.Errors)
			}
		}
	}

	return result, nil
}

// CreateReport creates a new report
func (c *OADR3) CreateReport(ctx context.Context, report *Report) (*APIResponse[Report], error) {
	// Validate input
	if report == nil {
		return nil, fmt.Errorf("report cannot be nil")
	}

	if validationResult := ValidateReport(report); !validationResult.Valid {
		return nil, fmt.Errorf("invalid report: %v", validationResult.Errors)
	}

	// Make request
	resp, err := c.makeRequest(ctx, "POST", "/reports", nil, report)
	if err != nil {
		return nil, err
	}

	// Handle response
	result, err := handleResponse[Report](resp)
	if err != nil {
		return nil, err
	}

	// Validate response data
	if result.Response != nil {
		if validationResult := ValidateReport(result.Response); !validationResult.Valid {
			return nil, fmt.Errorf("invalid report in response: %v", validationResult.Errors)
		}
	}

	return result, nil
}

// VENs API

// SearchVens searches VENs
func (c *OADR3) SearchVens(ctx context.Context, venName *string, skip *int, limit *int) (*APIResponse[[]Ven], error) {
	// Build query parameters
	queryParams := make(map[string]interface{})
	if venName != nil {
		queryParams["venName"] = venName
	}
	if skip != nil {
		queryParams["skip"] = skip
	}
	if limit != nil {
		queryParams["limit"] = limit
	}

	// Make request
	resp, err := c.makeRequest(ctx, "GET", "/vens", queryParams, nil)
	if err != nil {
		return nil, err
	}

	// Handle response
	result, err := handleResponse[[]Ven](resp)
	if err != nil {
		return nil, err
	}

	// Validate response data
	if result.Response != nil {
		for _, ven := range *result.Response {
			if validationResult := ValidateVen(&ven); !validationResult.Valid {
				return nil, fmt.Errorf("invalid ven in response: %v", validationResult.Errors)
			}
		}
	}

	return result, nil
}

// CreateVen creates a new VEN
func (c *OADR3) CreateVen(ctx context.Context, ven *Ven) (*APIResponse[Ven], error) {
	// Validate input
	if ven == nil {
		return nil, fmt.Errorf("ven cannot be nil")
	}

	if validationResult := ValidateVen(ven); !validationResult.Valid {
		return nil, fmt.Errorf("invalid ven: %v", validationResult.Errors)
	}

	// Make request
	resp, err := c.makeRequest(ctx, "POST", "/vens", nil, ven)
	if err != nil {
		return nil, err
	}

	// Handle response
	result, err := handleResponse[Ven](resp)
	if err != nil {
		return nil, err
	}

	// Validate response data
	if result.Response != nil {
		if validationResult := ValidateVen(result.Response); !validationResult.Valid {
			return nil, fmt.Errorf("invalid ven in response: %v", validationResult.Errors)
		}
	}

	return result, nil
}
