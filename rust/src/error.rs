//! Error types for OpenADR 3 client

use thiserror::Error;

/// Result type alias for OpenADR 3 client operations
pub type Result<T> = std::result::Result<T, Error>;

/// Main error type for OpenADR 3 client
#[derive(Error, Debug)]
pub enum Error {
    /// JSON serialization/deserialization error
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    /// Validation error
    #[error("Validation error: {0}")]
    Validation(String),

    /// API error response
    #[error("API error {status}: {message}")]
    Api { status: u16, message: String },

    /// Configuration error
    #[error("Configuration error: {0}")]
    Config(String),

    /// Generic error
    #[error("OpenADR 3 client error: {0}")]
    Other(String),
}

impl Error {
    /// Create a validation error
    pub fn validation<S: Into<String>>(message: S) -> Self {
        Error::Validation(message.into())
    }

    /// Create an API error
    pub fn api<S: Into<String>>(status: u16, message: S) -> Self {
        Error::Api {
            status,
            message: message.into(),
        }
    }

    /// Create a configuration error
    pub fn config<S: Into<String>>(message: S) -> Self {
        Error::Config(message.into())
    }

    /// Create a generic error
    pub fn other<S: Into<String>>(message: S) -> Self {
        Error::Other(message.into())
    }
}