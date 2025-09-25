"""Data models for OpenADR 3 client responses"""

from datetime import datetime
from typing import Any, Dict, Generic, List, Optional, TypeVar, Union
from pydantic import BaseModel, Field


T = TypeVar('T')


class APIError(BaseModel):
    """API error response model"""
    type: Optional[str] = None
    title: Optional[str] = None
    status: Optional[int] = None
    detail: Optional[str] = None


class APIResponse(BaseModel, Generic[T]):
    """Generic API response wrapper"""
    status: int
    response: Optional[T] = None
    problem: Optional[APIError] = None
    
    @property
    def is_success(self) -> bool:
        """Check if response was successful"""
        return 200 <= self.status < 300 and self.problem is None
    
    @property
    def is_error(self) -> bool:
        """Check if response was an error"""
        return not self.is_success


# Basic OpenADR 3 model classes for client implementation
class Program(BaseModel):
    """OpenADR Program model"""
    id: Optional[str] = None
    created_date_time: Optional[datetime] = None
    modification_date_time: Optional[datetime] = None
    program_name: str = Field(..., description="Program name")
    program_long_name: Optional[str] = None
    retailer_name: str = Field(..., description="Retailer name")
    retailer_long_name: Optional[str] = None
    program_type: str = Field(..., description="Program type")
    country: str = Field(..., description="Country code")
    principal_subdivision: Optional[str] = None
    time_zone_offset: Optional[str] = None
    binding_events: Optional[bool] = None
    local_price: Optional[bool] = None


class Event(BaseModel):
    """OpenADR Event model"""
    id: Optional[str] = None
    created_date_time: Optional[datetime] = None
    modification_date_time: Optional[datetime] = None
    program_id: str = Field(..., description="Program ID")
    event_name: str = Field(..., description="Event name")
    priority: int = Field(..., description="Event priority")
    interval_period: Optional[Dict[str, Any]] = None


class Report(BaseModel):
    """OpenADR Report model"""
    id: Optional[str] = None
    created_date_time: Optional[datetime] = None
    modification_date_time: Optional[datetime] = None
    program_id: str = Field(..., description="Program ID")
    event_id: Optional[str] = None
    client_name: str = Field(..., description="Client name")
    report_name: str = Field(..., description="Report name")


class Ven(BaseModel):
    """OpenADR VEN (Virtual End Node) model"""
    id: Optional[str] = None
    created_date_time: Optional[datetime] = None
    modification_date_time: Optional[datetime] = None
    ven_name: str = Field(..., description="VEN name")


class OAuth2Token(BaseModel):
    """OAuth2 token response model"""
    access_token: str
    token_type: str
    expires_in: int
    scope: Optional[str] = None