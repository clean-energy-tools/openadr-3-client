//! Configuration for OpenADR 3 client

use crate::error::{Error, Result};

/// Configuration for OpenADR 3 client
#[derive(Debug, Clone)]
pub struct OADR3Config {
    /// The VTN server base URL
    pub base_url: String,
    /// OAuth2 client ID
    pub client_id: String,
    /// OAuth2 client secret
    pub client_secret: String,
    /// Optional OAuth2 scope
    pub scope: Option<String>,
    /// Request timeout in seconds
    pub timeout: u64,
}

impl OADR3Config {
    /// Create a new configuration
    pub fn new(base_url: String, client_id: String, client_secret: String) -> Result<Self> {
        if base_url.trim().is_empty() {
            return Err(Error::config("base_url cannot be empty"));
        }
        
        if client_id.trim().is_empty() {
            return Err(Error::config("client_id cannot be empty"));
        }
        
        if client_secret.trim().is_empty() {
            return Err(Error::config("client_secret cannot be empty"));
        }

        let base_url = base_url.trim_end_matches('/').to_string();

        Ok(Self {
            base_url,
            client_id,
            client_secret,
            scope: None,
            timeout: 30,
        })
    }

    /// Set the OAuth2 scope
    pub fn with_scope<S: Into<String>>(mut self, scope: S) -> Self {
        self.scope = Some(scope.into());
        self
    }

    /// Set the request timeout in seconds
    pub fn with_timeout(mut self, timeout: u64) -> Self {
        self.timeout = timeout;
        self
    }

    /// Get the token endpoint URL
    pub fn token_url(&self) -> String {
        format!("{}/auth/token", self.base_url)
    }

    /// Get the API base URL
    pub fn api_url(&self, path: &str) -> String {
        if path.starts_with('/') {
            format!("{}{}", self.base_url, path)
        } else {
            format!("{}/{}", self.base_url, path)
        }
    }
}