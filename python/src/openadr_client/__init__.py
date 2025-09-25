"""OpenADR 3 Python Client Library

A comprehensive Python client library for the OpenADR 3.1.0 protocol,
providing OAuth2 authentication and complete API coverage.
"""

from .config import OADR3Config
from .exceptions import OADR3Error, ValidationError, AuthenticationError

# Conditional import of models (requires Pydantic)
try:
    from .models import APIResponse, APIError
    _models_available = True
except ImportError:
    _models_available = False

__version__ = "1.0.0"
__author__ = "OpenADR Client Project"
__email__ = "info@openadr.org"

# Conditional imports based on available dependencies
__all__ = ["OADR3Config", "OADR3Error", "ValidationError", "AuthenticationError"]

if _models_available:
    __all__.extend(["APIResponse", "APIError"])

# Import client if external dependencies are available
try:
    from .client import OADR3
    __all__.append("OADR3")
except ImportError:
    # Client not available without external dependencies
    pass