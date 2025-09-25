package com.openadr.client.validation;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Utility class for validating OpenADR objects
 */
public class ValidationUtils {
    private static final ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();
    private static final Validator validator = validatorFactory.getValidator();

    /**
     * Validates an object using Jakarta Bean Validation
     * @param object The object to validate
     * @param <T> The type of the object
     * @return ValidationResult containing validation status and errors
     */
    public static <T> ValidationResult validate(T object) {
        if (object == null) {
            return ValidationResult.failure("Object cannot be null");
        }

        Set<ConstraintViolation<T>> violations = validator.validate(object);
        
        if (violations.isEmpty()) {
            return ValidationResult.success();
        }

        String errors = violations.stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.joining(", "));

        return ValidationResult.failure(errors);
    }

    /**
     * Validates search parameters
     */
    public static ValidationResult validateSearchParams(Integer skip, Integer limit) {
        if (skip != null && skip < 0) {
            return ValidationResult.failure("Skip must be non-negative");
        }

        if (limit != null && (limit < 0 || limit > 50)) {
            return ValidationResult.failure("Limit must be between 0 and 50");
        }

        return ValidationResult.success();
    }

    /**
     * Validates that a string ID is not null or empty
     */
    public static ValidationResult validateId(String id, String fieldName) {
        if (id == null || id.trim().isEmpty()) {
            return ValidationResult.failure(fieldName + " cannot be null or empty");
        }
        return ValidationResult.success();
    }

    /**
     * Result of a validation operation
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String errorMessage;

        private ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }

        public static ValidationResult success() {
            return new ValidationResult(true, null);
        }

        public static ValidationResult failure(String errorMessage) {
            return new ValidationResult(false, errorMessage);
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public void throwIfInvalid() {
            if (!valid) {
                throw new IllegalArgumentException(errorMessage);
            }
        }
    }
}