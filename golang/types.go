// Package oadr3client provides basic OpenADR 3 types
package oadr3client

import (
	"time"
)

// Basic OpenADR 3 types for the client implementation

// Program represents an OpenADR program
type Program struct {
	ID                   string    `json:"id"`
	CreatedDateTime      time.Time `json:"createdDateTime"`
	ModificationDateTime time.Time `json:"modificationDateTime"`
	ProgramName          string    `json:"programName"`
	ProgramLongName      *string   `json:"programLongName,omitempty"`
	RetailerName         string    `json:"retailerName"`
	RetailerLongName     *string   `json:"retailerLongName,omitempty"`
	ProgramType          string    `json:"programType"`
	Country              string    `json:"country"`
	PrincipalSubdivision *string   `json:"principalSubdivision,omitempty"`
	TimeZoneOffset       *string   `json:"timeZoneOffset,omitempty"`
	BindingEvents        *bool     `json:"bindingEvents,omitempty"`
	LocalPrice           *bool     `json:"localPrice,omitempty"`
}

// Event represents an OpenADR event
type Event struct {
	ID                   string    `json:"id"`
	CreatedDateTime      time.Time `json:"createdDateTime"`
	ModificationDateTime time.Time `json:"modificationDateTime"`
	ProgramID            string    `json:"programId"`
	EventName            string    `json:"eventName"`
	Priority             int       `json:"priority"`
	IntervalPeriod       Interval  `json:"intervalPeriod"`
}

// Interval represents a time interval
type Interval struct {
	Start    time.Time `json:"start"`
	Duration *string   `json:"duration,omitempty"`
}

// Report represents an OpenADR report
type Report struct {
	ID                   string    `json:"id"`
	CreatedDateTime      time.Time `json:"createdDateTime"`
	ModificationDateTime time.Time `json:"modificationDateTime"`
	ProgramID            string    `json:"programId"`
	EventID              *string   `json:"eventId,omitempty"`
	ClientName           string    `json:"clientName"`
	ReportName           string    `json:"reportName"`
}

// Ven represents an OpenADR VEN (Virtual End Node)
type Ven struct {
	ID                   string    `json:"id"`
	CreatedDateTime      time.Time `json:"createdDateTime"`
	ModificationDateTime time.Time `json:"modificationDateTime"`
	VenName              string    `json:"venName"`
}

// ValidationResult represents the result of validation
type ValidationResult struct {
	Valid  bool     `json:"valid"`
	Errors []string `json:"errors,omitempty"`
}

// API parameter types

// SearchAllProgramsParams represents parameters for searching all programs
type SearchAllProgramsParams struct {
	Targets []string `json:"targets,omitempty"`
	Skip    *int     `json:"skip,omitempty"`
	Limit   *int     `json:"limit,omitempty"`
}

// SearchProgramByProgramIdParams represents parameters for searching a program by ID
type SearchProgramByProgramIdParams struct {
	ProgramID string `json:"programId"`
}

// SearchAllEventsParams represents parameters for searching all events
type SearchAllEventsParams struct {
	ProgramID *string `json:"programId,omitempty"`
	Skip      *int    `json:"skip,omitempty"`
	Limit     *int    `json:"limit,omitempty"`
}

// Simple validation functions
func ValidateProgram(program *Program) ValidationResult {
	var errors []string

	if program == nil {
		errors = append(errors, "program cannot be nil")
		return ValidationResult{Valid: false, Errors: errors}
	}

	if program.ProgramName == "" {
		errors = append(errors, "programName is required")
	}

	if program.RetailerName == "" {
		errors = append(errors, "retailerName is required")
	}

	if program.ProgramType == "" {
		errors = append(errors, "programType is required")
	}

	return ValidationResult{Valid: len(errors) == 0, Errors: errors}
}

func ValidateEvent(event *Event) ValidationResult {
	var errors []string

	if event == nil {
		errors = append(errors, "event cannot be nil")
		return ValidationResult{Valid: false, Errors: errors}
	}

	if event.ProgramID == "" {
		errors = append(errors, "programId is required")
	}

	if event.EventName == "" {
		errors = append(errors, "eventName is required")
	}

	return ValidationResult{Valid: len(errors) == 0, Errors: errors}
}

func ValidateReport(report *Report) ValidationResult {
	var errors []string

	if report == nil {
		errors = append(errors, "report cannot be nil")
		return ValidationResult{Valid: false, Errors: errors}
	}

	if report.ProgramID == "" {
		errors = append(errors, "programId is required")
	}

	if report.ClientName == "" {
		errors = append(errors, "clientName is required")
	}

	if report.ReportName == "" {
		errors = append(errors, "reportName is required")
	}

	return ValidationResult{Valid: len(errors) == 0, Errors: errors}
}

func ValidateVen(ven *Ven) ValidationResult {
	var errors []string

	if ven == nil {
		errors = append(errors, "ven cannot be nil")
		return ValidationResult{Valid: false, Errors: errors}
	}

	if ven.VenName == "" {
		errors = append(errors, "venName is required")
	}

	return ValidationResult{Valid: len(errors) == 0, Errors: errors}
}

// Parameter validation functions
func ValidateSearchAllProgramsParams(params *SearchAllProgramsParams) ValidationResult {
	var errors []string

	if params == nil {
		return ValidationResult{Valid: true} // nil params are OK for optional parameters
	}

	if params.Skip != nil && *params.Skip < 0 {
		errors = append(errors, "skip must be non-negative")
	}

	if params.Limit != nil && (*params.Limit < 0 || *params.Limit > 50) {
		errors = append(errors, "limit must be between 0 and 50")
	}

	return ValidationResult{Valid: len(errors) == 0, Errors: errors}
}

func ValidateSearchProgramByProgramIdParams(params *SearchProgramByProgramIdParams) ValidationResult {
	var errors []string

	if params == nil {
		errors = append(errors, "params cannot be nil")
		return ValidationResult{Valid: false, Errors: errors}
	}

	if params.ProgramID == "" {
		errors = append(errors, "programId is required")
	}

	return ValidationResult{Valid: len(errors) == 0, Errors: errors}
}

func ValidateSearchAllEventsParams(params *SearchAllEventsParams) ValidationResult {
	var errors []string

	if params == nil {
		return ValidationResult{Valid: true} // nil params are OK for optional parameters
	}

	if params.Skip != nil && *params.Skip < 0 {
		errors = append(errors, "skip must be non-negative")
	}

	if params.Limit != nil && (*params.Limit < 0 || *params.Limit > 50) {
		errors = append(errors, "limit must be between 0 and 50")
	}

	return ValidationResult{Valid: len(errors) == 0, Errors: errors}
}
