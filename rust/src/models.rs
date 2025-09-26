//! Data models for OpenADR 3 client responses

use serde::{Deserialize, Serialize};

/// Generic API response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct APIResponse<T> {
    /// HTTP status code
    pub status: u16,
    /// Response data if successful
    pub response: Option<T>,
    /// Error information if failed
    pub problem: Option<APIError>,
}

impl<T> APIResponse<T> {
    /// Create a successful response
    pub fn success(status: u16, data: T) -> Self {
        Self {
            status,
            response: Some(data),
            problem: None,
        }
    }

    /// Create an error response
    pub fn error(status: u16, error: APIError) -> Self {
        Self {
            status,
            response: None,
            problem: Some(error),
        }
    }

    /// Check if response was successful
    pub fn is_success(&self) -> bool {
        (200..300).contains(&self.status) && self.problem.is_none()
    }

    /// Check if response was an error
    pub fn is_error(&self) -> bool {
        !self.is_success()
    }

    /// Get response data if successful, or None if error
    pub fn response(&self) -> Option<&T> {
        self.response.as_ref()
    }

    /// Get error information if failed, or None if successful
    pub fn problem(&self) -> Option<&APIError> {
        self.problem.as_ref()
    }

    /// Consume the response and return the data or error
    pub fn into_result(self) -> Result<T, APIError> {
        if let Some(data) = self.response {
            Ok(data)
        } else if let Some(error) = self.problem {
            Err(error)
        } else {
            Err(APIError {
                error_type: Some("unknown".to_string()),
                title: Some("Unknown error".to_string()),
                status: Some(self.status as i32),
                detail: Some("No response data or error information".to_string()),
            })
        }
    }
}

/// API error response model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct APIError {
    /// Error type
    #[serde(rename = "type")]
    pub error_type: Option<String>,
    /// Error title
    pub title: Option<String>,
    /// HTTP status code
    pub status: Option<i32>,
    /// Error detail message
    pub detail: Option<String>,
}

impl std::fmt::Display for APIError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if let Some(title) = &self.title {
            write!(f, "{}", title)?;
        } else if let Some(error_type) = &self.error_type {
            write!(f, "{}", error_type)?;
        } else {
            write!(f, "API Error")?;
        }

        if let Some(detail) = &self.detail {
            write!(f, ": {}", detail)?;
        }

        Ok(())
    }
}

impl std::error::Error for APIError {}

/// OAuth2 token response model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuth2Token {
    /// Access token
    pub access_token: String,
    /// Token type (usually "Bearer")
    pub token_type: String,
    /// Token expiration time in seconds
    pub expires_in: u64,
    /// Optional scope
    pub scope: Option<String>,
}

impl OAuth2Token {
    /// Check if token is expired (with optional buffer)
    pub fn is_expired(&self, buffer_seconds: u64) -> bool {
        // Since we don't store creation time, we'll let the client handle expiration
        // This is a placeholder for when we implement token storage with timestamps
        false
    }
}