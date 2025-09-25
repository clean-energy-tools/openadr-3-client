"""Configuration for OpenADR 3 client"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class OADR3Config:
    """Configuration for OpenADR 3 client
    
    Args:
        base_url: The VTN server base URL
        client_id: OAuth2 client ID
        client_secret: OAuth2 client secret
        scope: Optional OAuth2 scope
        timeout: Request timeout in seconds (default: 30)
    """
    
    base_url: str
    client_id: str
    client_secret: str
    scope: Optional[str] = None
    timeout: float = 30.0
    
    def __post_init__(self) -> None:
        """Validate and normalize configuration"""
        if not self.base_url:
            raise ValueError("base_url cannot be empty")
        if not self.client_id:
            raise ValueError("client_id cannot be empty")
        if not self.client_secret:
            raise ValueError("client_secret cannot be empty")
            
        # Remove trailing slash from base_url
        if self.base_url.endswith('/'):
            self.base_url = self.base_url.rstrip('/')
            
        if self.timeout <= 0:
            raise ValueError("timeout must be positive")
    
    def __repr__(self) -> str:
        return (
            f"OADR3Config("
            f"base_url='{self.base_url}', "
            f"client_id='{self.client_id}', "
            f"client_secret='***', "
            f"scope={self.scope!r}, "
            f"timeout={self.timeout}"
            f")"
        )