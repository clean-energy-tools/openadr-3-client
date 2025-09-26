//! Main OpenADR 3 client implementation

use crate::config::OADR3Config;
use crate::error::{Error, Result};
use crate::models::{APIResponse, APIError, OAuth2Token};
use crate::validation::*;

use std::sync::Arc;
use std::time::{Duration, Instant};
use serde_json::Value;
use tokio::sync::RwLock;

/// Main OpenADR 3 client struct
#[derive(Debug, Clone)]
pub struct OADR3 {
    /// Configuration
    config: OADR3Config,
    /// OAuth2 token cache
    token_cache: Arc<RwLock<Option<CachedToken>>>,
}

/// Cached OAuth2 token with expiration tracking
#[derive(Debug, Clone)]
struct CachedToken {
    token: OAuth2Token,
    obtained_at: Instant,
}

impl CachedToken {
    fn is_expired(&self, buffer_seconds: u64) -> bool {
        let elapsed = self.obtained_at.elapsed().as_secs();
        elapsed + buffer_seconds >= self.token.expires_in
    }
}

impl OADR3 {
    /// Create a new OADR3 client
    pub fn new(config: OADR3Config) -> Result<Self> {
        Ok(Self {
            config,
            token_cache: Arc::new(RwLock::new(None)),
        })
    }

    /// Get a valid OAuth2 access token (mock implementation)
    async fn get_access_token(&self) -> Result<String> {
        // Check if we have a cached valid token
        {
            let cache = self.token_cache.read().await;
            if let Some(cached) = cache.as_ref() {
                if !cached.is_expired(30) { // 30 second buffer
                    return Ok(cached.token.access_token.clone());
                }
            }
        }

        // Mock token for demonstration - in real implementation would make HTTP request
        let _token_url = self.config.token_url();
        
        let token = OAuth2Token {
            access_token: "mock-access-token".to_string(),
            token_type: "Bearer".to_string(),
            expires_in: 3600,
            scope: self.config.scope.clone(),
        };

        let token_str = token.access_token.clone();

        // Cache the token
        {
            let mut cache = self.token_cache.write().await;
            *cache = Some(CachedToken {
                token,
                obtained_at: Instant::now(),
            });
        }

        Ok(token_str)
    }

    /// Mock HTTP request implementation
    async fn mock_request<T>(&self, method: &str, path: &str, body: Option<Value>) -> Result<APIResponse<T>>
    where
        T: Default + serde::Serialize + for<'de> serde::de::Deserialize<'de>,
    {
        let _token = self.get_access_token().await?;
        
        // Mock successful response
        let data = T::default();
        Ok(APIResponse::success(200, data))
    }

    // ============================================================================
    // Programs API
    // ============================================================================

    /// Search all programs
    pub async fn search_all_programs(
        &self,
        targets: Option<Vec<DemoTargetType>>,
        skip: Option<i32>,
        limit: Option<i32>,
    ) -> Result<APIResponse<Vec<DemoProgram>>> {
        validate_search_params(skip, limit)?;

        // Mock implementation - would make real HTTP request
        let programs = vec![
            DemoProgram {
                id: "program-1".to_string(),
                program_name: "Peak Demand Response".to_string(),
                retailer_name: "Pacific Gas & Electric".to_string(),
                country: "US".to_string(),
                principal_subdivision: Some("CA".to_string()),
                program_type: DemoProgramType::DemandResponse,
                targets: vec![DemoTargetType::Commercial],
            }
        ];

        Ok(APIResponse::success(200, programs))
    }

    /// Create a program
    pub async fn create_program(&self, program: DemoProgram) -> Result<APIResponse<DemoProgram>> {
        program.validate()?;
        
        // Mock implementation
        Ok(APIResponse::success(201, program))
    }

    /// Get a program by ID
    pub async fn get_program(&self, program_id: &str) -> Result<APIResponse<DemoProgram>> {
        validate_program_id(program_id)?;
        
        // Mock implementation
        let program = DemoProgram {
            id: program_id.to_string(),
            program_name: "Mock Program".to_string(),
            retailer_name: "Mock Retailer".to_string(),
            country: "US".to_string(),
            principal_subdivision: None,
            program_type: DemoProgramType::DemandResponse,
            targets: vec![DemoTargetType::Commercial],
        };

        Ok(APIResponse::success(200, program))
    }

    /// Update a program
    pub async fn update_program(
        &self, 
        program_id: &str, 
        program: DemoProgram
    ) -> Result<APIResponse<DemoProgram>> {
        validate_program_id(program_id)?;
        program.validate()?;
        
        // Mock implementation
        Ok(APIResponse::success(200, program))
    }

    /// Delete a program
    pub async fn delete_program(&self, program_id: &str) -> Result<APIResponse<()>> {
        validate_program_id(program_id)?;
        
        // Mock implementation
        Ok(APIResponse::success(204, ()))
    }

    // ============================================================================
    // Events API  
    // ============================================================================

    /// Search events for a program
    pub async fn search_events(
        &self,
        program_id: &str,
        skip: Option<i32>,
        limit: Option<i32>,
    ) -> Result<APIResponse<Vec<DemoEvent>>> {
        validate_program_id(program_id)?;
        validate_search_params(skip, limit)?;

        // Mock implementation
        let events = vec![
            DemoEvent {
                id: "event-1".to_string(),
                program_id: program_id.to_string(),
                event_name: "Peak Hour Event".to_string(),
                event_type: "demand_response".to_string(),
                start_time: chrono::Utc::now() + chrono::Duration::try_hours(1).unwrap(),
                end_time: chrono::Utc::now() + chrono::Duration::try_hours(3).unwrap(),
            }
        ];

        Ok(APIResponse::success(200, events))
    }

    /// Create an event
    pub async fn create_event(
        &self, 
        program_id: &str, 
        event: DemoEvent
    ) -> Result<APIResponse<DemoEvent>> {
        validate_program_id(program_id)?;
        event.validate()?;
        
        // Mock implementation
        Ok(APIResponse::success(201, event))
    }

    /// Get an event by ID
    pub async fn get_event(
        &self, 
        program_id: &str, 
        event_id: &str
    ) -> Result<APIResponse<DemoEvent>> {
        validate_program_id(program_id)?;
        
        // Mock implementation
        let event = DemoEvent {
            id: event_id.to_string(),
            program_id: program_id.to_string(),
            event_name: "Mock Event".to_string(),
            event_type: "demand_response".to_string(),
            start_time: chrono::Utc::now() + chrono::Duration::try_hours(1).unwrap(),
            end_time: chrono::Utc::now() + chrono::Duration::try_hours(3).unwrap(),
        };

        Ok(APIResponse::success(200, event))
    }

    /// Update an event
    pub async fn update_event(
        &self, 
        program_id: &str, 
        event_id: &str, 
        event: DemoEvent
    ) -> Result<APIResponse<DemoEvent>> {
        validate_program_id(program_id)?;
        event.validate()?;
        
        // Mock implementation
        Ok(APIResponse::success(200, event))
    }

    /// Delete an event
    pub async fn delete_event(
        &self, 
        program_id: &str, 
        event_id: &str
    ) -> Result<APIResponse<()>> {
        validate_program_id(program_id)?;
        
        // Mock implementation
        Ok(APIResponse::success(204, ()))
    }

    // ============================================================================
    // Reports API (placeholder - would be similar to above)
    // ============================================================================

    /// Search reports
    pub async fn search_reports(
        &self,
        program_id: Option<String>,
        skip: Option<i32>,
        limit: Option<i32>,
    ) -> Result<APIResponse<Vec<Value>>> {
        validate_search_params(skip, limit)?;

        // Mock implementation
        let reports = vec![serde_json::json!({"id": "report-1", "type": "usage"})];
        Ok(APIResponse::success(200, reports))
    }

    // ============================================================================
    // VENs API (placeholder - would be similar to above)  
    // ============================================================================

    /// Search VENs
    pub async fn search_vens(
        &self,
        skip: Option<i32>,
        limit: Option<i32>,
    ) -> Result<APIResponse<Vec<Value>>> {
        validate_search_params(skip, limit)?;

        // Mock implementation  
        let vens = vec![serde_json::json!({"id": "ven-1", "name": "Mock VEN"})];
        Ok(APIResponse::success(200, vens))
    }
}