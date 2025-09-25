"""Validation utilities for OpenADR 3 data"""

from typing import Any, Dict, List, Optional
from pydantic import ValidationError as PydanticValidationError

from .exceptions import ValidationError
from .models import Program, Event, Report, Ven


class ValidationResult:
    """Result of a validation operation"""
    
    def __init__(self, success: bool, data: Any = None, errors: Optional[List[str]] = None):
        self.success = success
        self.data = data
        self.errors = errors or []
    
    def raise_if_invalid(self) -> None:
        """Raise ValidationError if validation failed"""
        if not self.success:
            raise ValidationError("Validation failed", self.errors)


def validate_program(data: Dict[str, Any]) -> ValidationResult:
    """Validate Program data"""
    try:
        validated = Program(**data)
        return ValidationResult(True, validated)
    except PydanticValidationError as e:
        errors = [f"{err['loc'][0]}: {err['msg']}" for err in e.errors()]
        return ValidationResult(False, None, errors)


def validate_event(data: Dict[str, Any]) -> ValidationResult:
    """Validate Event data"""
    try:
        validated = Event(**data)
        return ValidationResult(True, validated)
    except PydanticValidationError as e:
        errors = [f"{err['loc'][0]}: {err['msg']}" for err in e.errors()]
        return ValidationResult(False, None, errors)


def validate_report(data: Dict[str, Any]) -> ValidationResult:
    """Validate Report data"""
    try:
        validated = Report(**data)
        return ValidationResult(True, validated)
    except PydanticValidationError as e:
        errors = [f"{err['loc'][0]}: {err['msg']}" for err in e.errors()]
        return ValidationResult(False, None, errors)


def validate_ven(data: Dict[str, Any]) -> ValidationResult:
    """Validate VEN data"""
    try:
        validated = Ven(**data)
        return ValidationResult(True, validated)
    except PydanticValidationError as e:
        errors = [f"{err['loc'][0]}: {err['msg']}" for err in e.errors()]
        return ValidationResult(False, None, errors)


def validate_search_params(skip: Optional[int] = None, limit: Optional[int] = None) -> ValidationResult:
    """Validate search parameters"""
    errors = []
    
    if skip is not None and skip < 0:
        errors.append("skip: must be non-negative")
    
    if limit is not None and (limit < 0 or limit > 50):
        errors.append("limit: must be between 0 and 50")
    
    if errors:
        return ValidationResult(False, None, errors)
    
    return ValidationResult(True)