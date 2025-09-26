//! # OpenADR 3 Rust Client
//!
//! A comprehensive Rust client library for the OpenADR 3.1.0 protocol,
//! providing OAuth2 authentication and complete API coverage.
//!
//! ## Features
//!
//! - **OAuth2 Authentication**: Automatic token management using Client Credentials flow
//! - **Complete API Coverage**: All OpenADR 3.1.0 operations implemented
//! - **Input/Output Validation**: Request and response validation using OpenADR 3 types
//! - **Type Safety**: Full Rust type safety with comprehensive error handling
//! - **Async Support**: Built on tokio and reqwest for async HTTP
//!
//! ## Quick Start
//!
//! ```rust,no_run
//! use openadr3_client::{OADR3, OADR3Config};
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let config = OADR3Config::new(
//!         "https://your-vtn-server.com".to_string(),
//!         "your-client-id".to_string(),
//!         "your-client-secret".to_string(),
//!     ).with_scope("read_targets");
//!
//!     let client = OADR3::new(config);
//!
//!     let programs = client.search_all_programs(None, None, None).await?;
//!
//!     if programs.is_success() {
//!         println!("Found {} programs", programs.response().len());
//!     }
//!
//!     Ok(())
//! }
//! ```

pub mod client;
pub mod config;
pub mod error;
pub mod models;
pub mod validation;

pub use client::OADR3;
pub use config::OADR3Config;
pub use error::{Error, Result};
pub use models::{APIResponse, OAuth2Token};
pub use validation::{DemoProgram, DemoEvent, DemoProgramType, DemoTargetType};