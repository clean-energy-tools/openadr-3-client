"""Basic tests for OpenADR 3 Python client"""

import pytest
from openadr_client import OADR3, OADR3Config
from openadr_client.models import Program


def test_config_creation():
    """Test OADR3Config creation and validation"""
    # Valid configuration
    config = OADR3Config(
        base_url="https://example.com",
        client_id="test-client",
        client_secret="test-secret"
    )
    
    assert config.base_url == "https://example.com"
    assert config.client_id == "test-client"
    assert config.client_secret == "test-secret"
    assert config.scope is None
    assert config.timeout == 30.0


def test_config_validation():
    """Test OADR3Config validation"""
    # Empty base_url
    with pytest.raises(ValueError, match="base_url cannot be empty"):
        OADR3Config(base_url="", client_id="test", client_secret="test")
    
    # Empty client_id
    with pytest.raises(ValueError, match="client_id cannot be empty"):
        OADR3Config(base_url="https://example.com", client_id="", client_secret="test")
    
    # Empty client_secret
    with pytest.raises(ValueError, match="client_secret cannot be empty"):
        OADR3Config(base_url="https://example.com", client_id="test", client_secret="")
    
    # Invalid timeout
    with pytest.raises(ValueError, match="timeout must be positive"):
        OADR3Config(base_url="https://example.com", client_id="test", client_secret="test", timeout=-1)


def test_config_url_normalization():
    """Test that trailing slashes are removed from base_url"""
    config = OADR3Config(
        base_url="https://example.com/",
        client_id="test",
        client_secret="test"
    )
    
    assert config.base_url == "https://example.com"


def test_client_creation():
    """Test OADR3 client creation"""
    config = OADR3Config(
        base_url="https://example.com",
        client_id="test-client",
        client_secret="test-secret"
    )
    
    client = OADR3(config)
    assert client.config == config


def test_program_model():
    """Test Program model creation and validation"""
    program = Program(
        program_name="Test Program",
        retailer_name="Test Retailer",
        program_type="PRICING_TARIFF",
        country="US"
    )
    
    assert program.program_name == "Test Program"
    assert program.retailer_name == "Test Retailer"
    assert program.program_type == "PRICING_TARIFF"
    assert program.country == "US"
    assert program.id is None  # Not set initially


def test_context_manager():
    """Test that client can be used as context manager"""
    config = OADR3Config(
        base_url="https://example.com",
        client_id="test",
        client_secret="test"
    )
    
    with OADR3(config) as client:
        assert client.config == config
    
    # Client should be closed after context manager exits
    assert client._token_client.is_closed
    assert client._api_client.is_closed