"""Data models for OpenADR 3 client

This module re-exports models from openadr-3-types and adds client-specific wrappers.
"""

from typing import Generic, Optional, TypeVar
from pydantic import BaseModel

# Import all OpenADR 3 types from the types package
try:
    from generated.models import (
        Program,
        Event,
        Report,
        Ven,
        Resource,
        Subscription,
        Interval,
        Intervalperiod,
        Valuesmap,
        Objecttypes,
        Programrequest,
        Eventrequest,
        Reportrequest,
        Venrequest,
        Subscriptionrequest,
    )
except ImportError:
    # Fallback if openadr-3-types not installed
    raise ImportError(
        "openadr-3-types package not found. "
        "Install it with: pip install openadr-3-types"
    )

# Re-export for convenience
__all__ = [
    "Program",
    "Event",
    "Report",
    "Ven",
    "Resource",
    "Subscription",
    "Interval",
    "Intervalperiod",
    "Valuesmap",
    "Objecttypes",
    "Programrequest",
    "Eventrequest",
    "Reportrequest",
    "Venrequest",
    "Subscriptionrequest",
    "APIError",
    "APIResponse",
    "OAuth2Token",
]

T = TypeVar('T')


class APIError(BaseModel):
    """API error response model (RFC 7807 Problem Details)"""
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


class OAuth2Token(BaseModel):
    """OAuth2 token response model"""
    access_token: str
    token_type: str
    expires_in: int
    scope: Optional[str] = None
