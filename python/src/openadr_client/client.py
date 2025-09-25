"""OpenADR 3 Python Client Implementation"""

import asyncio
import time
from typing import Any, Dict, List, Optional, Union

import httpx
from authlib.integrations.httpx_client import OAuth2Client

from .config import OADR3Config
from .exceptions import APIError, AuthenticationError, ValidationError
from .models import APIResponse, APIError as APIErrorModel, Event, OAuth2Token, Program, Report, Ven
from .validation import (
    ValidationResult,
    validate_event,
    validate_program,
    validate_report,
    validate_search_params,
    validate_ven,
)


class OADR3:
    """OpenADR 3 client for Python
    
    This client provides access to all OpenADR 3.1.0 API operations with
    OAuth2 Client Credentials Flow authentication and comprehensive validation.
    """

    def __init__(self, config: OADR3Config) -> None:
        """Initialize the OpenADR 3 client
        
        Args:
            config: Client configuration
        """
        self.config = config
        self._access_token: Optional[str] = None
        self._token_expires_at: float = 0.0
        
        # Create HTTP client for token requests
        self._token_client = httpx.Client(timeout=config.timeout)
        
        # Create OAuth2 client for API requests
        self._api_client = OAuth2Client(
            client_id=config.client_id,
            client_secret=config.client_secret,
            timeout=config.timeout,
        )

    def __enter__(self) -> "OADR3":
        """Context manager entry"""
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Context manager exit"""
        self.close()

    def close(self) -> None:
        """Close HTTP clients"""
        self._token_client.close()
        self._api_client.close()

    def _get_access_token(self) -> str:
        """Get a valid OAuth2 access token, refreshing if necessary"""
        # Check if we have a valid token (with 30-second buffer)
        now = time.time()
        if self._access_token and self._token_expires_at > now + 30:
            return self._access_token

        # Request new token using OAuth2 Client Credentials flow
        token_url = f"{self.config.base_url}/auth/token"
        data = {
            "grant_type": "client_credentials",
            "client_id": self.config.client_id,
            "client_secret": self.config.client_secret,
        }
        
        if self.config.scope:
            data["scope"] = self.config.scope

        try:
            response = self._token_client.post(
                token_url,
                data=data,
                headers={"Accept": "application/json"},
            )
            response.raise_for_status()
            
            token_data = response.json()
            token = OAuth2Token(**token_data)
            
            self._access_token = token.access_token
            # Set expiration with 30-second buffer
            self._token_expires_at = now + token.expires_in - 30
            
            return self._access_token
            
        except httpx.HTTPStatusError as e:
            raise AuthenticationError(
                f"OAuth2 token request failed: {e.response.status_code} {e.response.text}",
                e.response.status_code
            )
        except Exception as e:
            raise AuthenticationError(f"OAuth2 token request failed: {e}")

    def _make_request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
    ) -> httpx.Response:
        """Make an authenticated HTTP request"""
        token = self._get_access_token()
        
        url = f"{self.config.base_url}{path}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        }
        
        if data is not None:
            headers["Content-Type"] = "application/json"

        try:
            response = self._api_client.request(
                method=method,
                url=url,
                params=params,
                json=data,
                headers=headers,
            )
            return response
            
        except Exception as e:
            raise APIError(f"API request failed: {e}")

    def _handle_response(self, response: httpx.Response, expected_type: Any = None) -> APIResponse:
        """Handle API response and return standardized response"""
        try:
            if response.headers.get("content-type", "").startswith("application/json"):
                response_data = response.json()
            else:
                response_data = response.text
        except Exception:
            response_data = response.text

        if response.is_success:
            # Successful response
            if expected_type and response_data:
                # Validate response data if type is provided
                if expected_type == List[Program]:
                    validated_data = []
                    for item in response_data:
                        result = validate_program(item)
                        result.raise_if_invalid()
                        validated_data.append(result.data)
                    response_data = validated_data
                elif expected_type == List[Event]:
                    validated_data = []
                    for item in response_data:
                        result = validate_event(item)
                        result.raise_if_invalid()
                        validated_data.append(result.data)
                    response_data = validated_data
                elif expected_type == List[Report]:
                    validated_data = []
                    for item in response_data:
                        result = validate_report(item)
                        result.raise_if_invalid()
                        validated_data.append(result.data)
                    response_data = validated_data
                elif expected_type == List[Ven]:
                    validated_data = []
                    for item in response_data:
                        result = validate_ven(item)
                        result.raise_if_invalid()
                        validated_data.append(result.data)
                    response_data = validated_data
                elif expected_type == Program:
                    result = validate_program(response_data)
                    result.raise_if_invalid()
                    response_data = result.data
                elif expected_type == Event:
                    result = validate_event(response_data)
                    result.raise_if_invalid()
                    response_data = result.data
                elif expected_type == Report:
                    result = validate_report(response_data)
                    result.raise_if_invalid()
                    response_data = result.data
                elif expected_type == Ven:
                    result = validate_ven(response_data)
                    result.raise_if_invalid()
                    response_data = result.data
            
            return APIResponse(status=response.status_code, response=response_data)
        else:
            # Error response
            try:
                error = APIErrorModel(**response_data)
            except Exception:
                error = APIErrorModel(
                    status=response.status_code,
                    title=response.reason_phrase,
                    detail=str(response_data)
                )
            
            return APIResponse(status=response.status_code, problem=error)

    # Programs API

    def search_all_programs(
        self,
        targets: Optional[List[str]] = None,
        skip: Optional[int] = None,
        limit: Optional[int] = None,
    ) -> APIResponse[List[Program]]:
        """Search all programs
        
        Args:
            targets: Optional target filters
            skip: Number of records to skip for pagination
            limit: Maximum number of records to return (max 50)
            
        Returns:
            API response containing list of programs
        """
        # Validate parameters
        validate_search_params(skip, limit).raise_if_invalid()
        
        params = {}
        if targets:
            params["targets"] = targets
        if skip is not None:
            params["skip"] = skip
        if limit is not None:
            params["limit"] = limit

        response = self._make_request("GET", "/programs", params=params)
        return self._handle_response(response, List[Program])

    def create_program(self, program: Program) -> APIResponse[Program]:
        """Create a new program
        
        Args:
            program: The program to create
            
        Returns:
            API response containing the created program
        """
        # Validate input
        result = validate_program(program.model_dump())
        result.raise_if_invalid()
        
        response = self._make_request("POST", "/programs", data=program.model_dump())
        return self._handle_response(response, Program)

    def search_program_by_program_id(self, program_id: str) -> APIResponse[Program]:
        """Search for a specific program by ID
        
        Args:
            program_id: The program ID
            
        Returns:
            API response containing the program
        """
        if not program_id:
            raise ValidationError("program_id cannot be empty")
        
        response = self._make_request("GET", f"/programs/{program_id}")
        return self._handle_response(response, Program)

    def update_program(self, program_id: str, program: Program) -> APIResponse[Program]:
        """Update an existing program
        
        Args:
            program_id: The program ID
            program: The updated program data
            
        Returns:
            API response containing the updated program
        """
        if not program_id:
            raise ValidationError("program_id cannot be empty")
        
        # Validate input
        result = validate_program(program.model_dump())
        result.raise_if_invalid()
        
        response = self._make_request("PUT", f"/programs/{program_id}", data=program.model_dump())
        return self._handle_response(response, Program)

    def delete_program(self, program_id: str) -> APIResponse[None]:
        """Delete a program
        
        Args:
            program_id: The program ID
            
        Returns:
            API response
        """
        if not program_id:
            raise ValidationError("program_id cannot be empty")
        
        response = self._make_request("DELETE", f"/programs/{program_id}")
        return self._handle_response(response)

    # Events API

    def search_all_events(
        self,
        program_id: Optional[str] = None,
        skip: Optional[int] = None,
        limit: Optional[int] = None,
    ) -> APIResponse[List[Event]]:
        """Search all events
        
        Args:
            program_id: Optional program ID filter
            skip: Number of records to skip for pagination
            limit: Maximum number of records to return (max 50)
            
        Returns:
            API response containing list of events
        """
        # Validate parameters
        validate_search_params(skip, limit).raise_if_invalid()
        
        params = {}
        if program_id:
            params["programId"] = program_id
        if skip is not None:
            params["skip"] = skip
        if limit is not None:
            params["limit"] = limit

        response = self._make_request("GET", "/events", params=params)
        return self._handle_response(response, List[Event])

    def create_event(self, event: Event) -> APIResponse[Event]:
        """Create a new event
        
        Args:
            event: The event to create
            
        Returns:
            API response containing the created event
        """
        # Validate input
        result = validate_event(event.model_dump())
        result.raise_if_invalid()
        
        response = self._make_request("POST", "/events", data=event.model_dump())
        return self._handle_response(response, Event)

    # Reports API

    def search_all_reports(
        self,
        program_id: Optional[str] = None,
        client_name: Optional[str] = None,
        skip: Optional[int] = None,
        limit: Optional[int] = None,
    ) -> APIResponse[List[Report]]:
        """Search all reports
        
        Args:
            program_id: Optional program ID filter
            client_name: Optional client name filter
            skip: Number of records to skip for pagination
            limit: Maximum number of records to return (max 50)
            
        Returns:
            API response containing list of reports
        """
        # Validate parameters
        validate_search_params(skip, limit).raise_if_invalid()
        
        params = {}
        if program_id:
            params["programId"] = program_id
        if client_name:
            params["clientName"] = client_name
        if skip is not None:
            params["skip"] = skip
        if limit is not None:
            params["limit"] = limit

        response = self._make_request("GET", "/reports", params=params)
        return self._handle_response(response, List[Report])

    def create_report(self, report: Report) -> APIResponse[Report]:
        """Create a new report
        
        Args:
            report: The report to create
            
        Returns:
            API response containing the created report
        """
        # Validate input
        result = validate_report(report.model_dump())
        result.raise_if_invalid()
        
        response = self._make_request("POST", "/reports", data=report.model_dump())
        return self._handle_response(response, Report)

    # VENs API

    def search_vens(
        self,
        ven_name: Optional[str] = None,
        skip: Optional[int] = None,
        limit: Optional[int] = None,
    ) -> APIResponse[List[Ven]]:
        """Search VENs
        
        Args:
            ven_name: Optional VEN name filter
            skip: Number of records to skip for pagination
            limit: Maximum number of records to return (max 50)
            
        Returns:
            API response containing list of VENs
        """
        # Validate parameters
        validate_search_params(skip, limit).raise_if_invalid()
        
        params = {}
        if ven_name:
            params["venName"] = ven_name
        if skip is not None:
            params["skip"] = skip
        if limit is not None:
            params["limit"] = limit

        response = self._make_request("GET", "/vens", params=params)
        return self._handle_response(response, List[Ven])

    def create_ven(self, ven: Ven) -> APIResponse[Ven]:
        """Create a new VEN
        
        Args:
            ven: The VEN to create
            
        Returns:
            API response containing the created VEN
        """
        # Validate input
        result = validate_ven(ven.model_dump())
        result.raise_if_invalid()
        
        response = self._make_request("POST", "/vens", data=ven.model_dump())
        return self._handle_response(response, Ven)