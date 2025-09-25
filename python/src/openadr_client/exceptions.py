"""Exceptions for OpenADR 3 client"""

from typing import Any, List, Optional


class OADR3Error(Exception):
    """Base exception for OpenADR 3 client errors"""
    pass


class ValidationError(OADR3Error):
    """Raised when data validation fails"""
    
    def __init__(self, message: str, errors: Optional[List[str]] = None) -> None:
        super().__init__(message)
        self.errors = errors or []


class AuthenticationError(OADR3Error):
    """Raised when OAuth2 authentication fails"""
    
    def __init__(self, message: str, status_code: Optional[int] = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class APIError(OADR3Error):
    """Raised when API request fails"""
    
    def __init__(
        self, 
        message: str, 
        status_code: Optional[int] = None,
        response_data: Optional[Any] = None
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.response_data = response_data