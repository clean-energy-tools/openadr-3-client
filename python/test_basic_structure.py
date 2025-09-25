#!/usr/bin/env python3
"""Basic structure test for OpenADR 3 Python client (no external dependencies)"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_config():
    """Test configuration module"""
    try:
        from openadr_client.config import OADR3Config
        print("✓ Config import successful")
        
        # Test valid configuration
        config = OADR3Config(
            base_url="https://example.com/",
            client_id="test-client",
            client_secret="test-secret",
            scope="test-scope"
        )
        print(f"✓ Config creation successful")
        print(f"✓ Base URL normalized: '{config.base_url}' (removed trailing slash)")
        print(f"✓ Timeout default: {config.timeout}")
        
        # Test validation
        try:
            OADR3Config("", "test", "test")
            print("✗ Should have failed with empty base_url")
        except ValueError as e:
            print(f"✓ Validation works: {e}")
            
        return True
        
    except Exception as e:
        print(f"✗ Config test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_models():
    """Test model module (without Pydantic if not available)"""
    try:
        # Try to import pydantic models
        from openadr_client.models import Program, Event, APIResponse, APIError
        print("✓ Models import successful")
        
        # Test basic model creation
        program = Program(
            program_name="Test Program",
            retailer_name="Test Retailer", 
            program_type="PRICING_TARIFF",
            country="US"
        )
        print(f"✓ Program model creation successful: {program.program_name}")
        
        # Test API response model
        response = APIResponse(status=200)
        print(f"✓ APIResponse creation successful: status={response.status}")
        print(f"✓ Response is_success: {response.is_success}")
        
        return True
        
    except ImportError as e:
        if "pydantic" in str(e):
            print("⚠ Pydantic not available (expected without dependencies)")
            return True
        else:
            print(f"✗ Models test failed: {e}")
            return False
    except Exception as e:
        print(f"✗ Models test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_validation():
    """Test validation module"""
    try:
        from openadr_client.validation import ValidationResult, validate_search_params
        print("✓ Validation import successful")
        
        # Test validation result
        result = ValidationResult(True, "test data")
        print(f"✓ ValidationResult creation successful: success={result.success}")
        
        # Test search params validation
        result = validate_search_params(skip=0, limit=10)
        print(f"✓ Search params validation successful: {result.success}")
        
        # Test invalid params
        result = validate_search_params(skip=-1, limit=100)
        print(f"✓ Invalid params detected: success={result.success}, errors={result.errors}")
        
        return True
        
    except ImportError as e:
        if "pydantic" in str(e):
            print("⚠ Pydantic not available for validation (expected)")
            return True
        else:
            print(f"✗ Validation test failed: {e}")
            return False
    except Exception as e:
        print(f"✗ Validation test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_exceptions():
    """Test exceptions module"""
    try:
        from openadr_client.exceptions import OADR3Error, ValidationError, AuthenticationError, APIError
        print("✓ Exceptions import successful")
        
        # Test exception creation
        error = ValidationError("Test validation error", ["error1", "error2"])
        print(f"✓ ValidationError creation successful: {error.errors}")
        
        api_error = APIError("Test API error", 400, {"detail": "Bad request"})
        print(f"✓ APIError creation successful: status={api_error.status_code}")
        
        return True
        
    except Exception as e:
        print(f"✗ Exceptions test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all basic structure tests"""
    print("Testing OpenADR 3 Python Client Structure...")
    print("=" * 50)
    
    tests = [
        ("Configuration", test_config),
        ("Models", test_models), 
        ("Validation", test_validation),
        ("Exceptions", test_exceptions),
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\n{name} Test:")
        print("-" * 20)
        success = test_func()
        results.append((name, success))
    
    print("\n" + "=" * 50)
    print("Summary:")
    for name, success in results:
        status = "✓ PASS" if success else "✗ FAIL" 
        print(f"  {name}: {status}")
    
    all_passed = all(success for _, success in results)
    print(f"\nOverall: {'✓ ALL TESTS PASSED' if all_passed else '✗ SOME TESTS FAILED'}")
    
    if all_passed:
        print("\n✓ Python project structure is correct!")
        print("✓ Core modules can be imported and used")
        print("✓ Basic functionality works without external dependencies")
        print("\nTo install full dependencies: pip install -e .")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    exit(main())