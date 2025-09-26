//! Validation utilities for OpenADR 3 data

use crate::error::{Error, Result};
use serde::{Deserialize, Serialize};

// Simple demo types for testing (would be replaced by actual OpenADR 3 types)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DemoProgram {
    pub id: String,
    pub program_name: String,
    pub retailer_name: String,
    pub country: String,
    pub principal_subdivision: Option<String>,
    pub program_type: DemoProgramType,
    pub targets: Vec<DemoTargetType>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DemoProgramType {
    DemandResponse,
    TimeOfUse,
    RealTimePricing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DemoTargetType {
    Residential,
    Commercial,
    Industrial,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DemoEvent {
    pub id: String,
    pub program_id: String,
    pub event_name: String,
    pub event_type: String,
    pub start_time: chrono::DateTime<chrono::Utc>,
    pub end_time: chrono::DateTime<chrono::Utc>,
}

/// Validate search parameters
pub fn validate_search_params(skip: Option<i32>, limit: Option<i32>) -> Result<()> {
    if let Some(skip) = skip {
        if skip < 0 {
            return Err(Error::validation("skip must be non-negative"));
        }
    }

    if let Some(limit) = limit {
        if limit < 0 || limit > 50 {
            return Err(Error::validation("limit must be between 0 and 50"));
        }
    }

    Ok(())
}

/// Validate program ID
pub fn validate_program_id(program_id: &str) -> Result<()> {
    if program_id.trim().is_empty() {
        return Err(Error::validation("program_id cannot be empty"));
    }
    Ok(())
}

/// Validate event data 
pub fn validate_event_data(event: &DemoEvent) -> Result<()> {
    if event.id.trim().is_empty() {
        return Err(Error::validation("event id cannot be empty"));
    }
    if event.program_id.trim().is_empty() {
        return Err(Error::validation("program_id cannot be empty"));
    }
    if event.event_name.trim().is_empty() {
        return Err(Error::validation("event_name cannot be empty"));
    }
    if event.start_time >= event.end_time {
        return Err(Error::validation("start_time must be before end_time"));
    }
    Ok(())
}

/// Validate program data
pub fn validate_program_data(program: &DemoProgram) -> Result<()> {
    if program.id.trim().is_empty() {
        return Err(Error::validation("program id cannot be empty"));
    }
    if program.program_name.trim().is_empty() {
        return Err(Error::validation("program_name cannot be empty"));
    }
    if program.retailer_name.trim().is_empty() {
        return Err(Error::validation("retailer_name cannot be empty"));
    }
    if program.country.trim().is_empty() {
        return Err(Error::validation("country cannot be empty"));
    }
    if program.targets.is_empty() {
        return Err(Error::validation("targets cannot be empty"));
    }
    Ok(())
}

/// Validate a list of programs
pub fn validate_programs(programs: &[DemoProgram]) -> Result<()> {
    for program in programs {
        validate_program_data(program)?;
    }
    Ok(())
}

/// Validate a list of events
pub fn validate_events(events: &[DemoEvent]) -> Result<()> {
    for event in events {
        validate_event_data(event)?;
    }
    Ok(())
}

/// Helper trait for validation
pub trait Validate {
    fn validate(&self) -> Result<()>;
}

impl Validate for DemoProgram {
    fn validate(&self) -> Result<()> {
        validate_program_data(self)
    }
}

impl Validate for DemoEvent {
    fn validate(&self) -> Result<()> {
        validate_event_data(self)
    }
}

impl<T: Validate> Validate for Vec<T> {
    fn validate(&self) -> Result<()> {
        for item in self {
            item.validate()?;
        }
        Ok(())
    }
}