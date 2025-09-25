package com.openadr.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.openadr.client.model.*;
import com.openadr.client.validation.ValidationUtils;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * OpenADR 3 client for Java
 * 
 * This client provides access to all OpenADR 3.1.0 API operations with
 * OAuth2 Client Credentials Flow authentication and comprehensive validation.
 */
public class OADR3 {
    private static final Logger logger = LoggerFactory.getLogger(OADR3.class);
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    private final OADR3Config config;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private volatile String accessToken;
    private volatile long tokenExpiresAt;

    /**
     * Creates a new OpenADR 3 client instance
     * 
     * @param config The client configuration
     */
    public OADR3(OADR3Config config) {
        this.config = config;
        
        // Configure HTTP client with reasonable timeouts
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .build();

        // Configure JSON object mapper
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * Gets a valid OAuth2 access token, refreshing if necessary
     */
    private synchronized String getAccessToken() throws IOException {
        // Check if we have a valid token (with 30-second buffer)
        long now = System.currentTimeMillis();
        if (accessToken != null && tokenExpiresAt > now + 30000) {
            return accessToken;
        }

        // Request new token using OAuth2 Client Credentials flow
        RequestBody tokenRequestBody = new FormBody.Builder()
                .add("grant_type", "client_credentials")
                .add("client_id", config.getClientId())
                .add("client_secret", config.getClientSecret())
                .add("scope", config.getScope() != null ? config.getScope() : "")
                .build();

        Request tokenRequest = new Request.Builder()
                .url(config.getBaseUrl() + "/auth/token")
                .post(tokenRequestBody)
                .addHeader("Accept", "application/json")
                .build();

        try (Response response = httpClient.newCall(tokenRequest).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("OAuth2 token request failed: " + response.code() + " " + response.message());
            }

            ResponseBody body = response.body();
            if (body == null) {
                throw new IOException("Empty response body from token endpoint");
            }

            String responseString = body.string();
            TokenResponse tokenResponse = objectMapper.readValue(responseString, TokenResponse.class);
            
            this.accessToken = tokenResponse.getAccessToken();
            // Set expiration with 30-second buffer
            this.tokenExpiresAt = now + (tokenResponse.getExpiresIn() - 30) * 1000L;
            
            logger.debug("Successfully obtained OAuth2 access token");
            return accessToken;
        }
    }

    /**
     * Makes an HTTP request with proper authentication and error handling
     */
    private <T> APIResponse<T> makeRequest(String method, String path, Object requestBody, 
                                          TypeReference<T> responseType) throws IOException {
        String token = getAccessToken();
        
        // Build URL
        String url = config.getBaseUrl() + path;
        
        // Build request
        Request.Builder requestBuilder = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + token)
                .addHeader("Accept", "application/json");

        // Add request body if present
        if (requestBody != null) {
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            RequestBody body = RequestBody.create(jsonBody, JSON);
            
            switch (method.toUpperCase()) {
                case "POST":
                    requestBuilder.post(body);
                    break;
                case "PUT":
                    requestBuilder.put(body);
                    break;
                case "PATCH":
                    requestBuilder.patch(body);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported method with body: " + method);
            }
        } else {
            switch (method.toUpperCase()) {
                case "GET":
                    requestBuilder.get();
                    break;
                case "DELETE":
                    requestBuilder.delete();
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported method: " + method);
            }
        }

        Request request = requestBuilder.build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            ResponseBody responseBody = response.body();
            String responseString = responseBody != null ? responseBody.string() : "";

            if (response.isSuccessful()) {
                // Parse successful response
                if (responseString.isEmpty() || responseType == null) {
                    return new APIResponse<>(response.code(), null);
                }
                
                T responseData = objectMapper.readValue(responseString, responseType);
                return new APIResponse<>(response.code(), responseData);
            } else {
                // Parse error response
                APIError error;
                try {
                    error = objectMapper.readValue(responseString, APIError.class);
                } catch (Exception e) {
                    // Fallback error
                    error = new APIError("HTTP_ERROR", response.message(), response.code(), responseString);
                }
                return new APIResponse<>(response.code(), error);
            }
        }
    }

    /**
     * Makes a GET request with query parameters
     */
    private <T> APIResponse<T> makeGetRequest(String path, TypeReference<T> responseType) throws IOException {
        return makeRequest("GET", path, null, responseType);
    }

    // Programs API

    /**
     * Searches all programs
     * 
     * @param targets Optional target filters
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return (max 50)
     * @return API response containing list of programs
     */
    public APIResponse<List<Program>> searchAllPrograms(List<String> targets, Integer skip, Integer limit) 
            throws IOException {
        
        // Validate parameters
        ValidationUtils.validateSearchParams(skip, limit).throwIfInvalid();
        
        // Build query string
        StringBuilder pathBuilder = new StringBuilder("/programs");
        String queryParams = buildQueryString(
                "targets", targets,
                "skip", skip,
                "limit", limit
        );
        if (!queryParams.isEmpty()) {
            pathBuilder.append("?").append(queryParams);
        }

        APIResponse<List<Program>> response = makeGetRequest(pathBuilder.toString(), 
                new TypeReference<List<Program>>() {});
        
        // Validate response data
        if (response.isSuccess() && response.getResponse() != null) {
            for (Program program : response.getResponse()) {
                ValidationUtils.validate(program).throwIfInvalid();
            }
        }
        
        return response;
    }

    /**
     * Creates a new program
     * 
     * @param program The program to create
     * @return API response containing the created program
     */
    public APIResponse<Program> createProgram(Program program) throws IOException {
        if (program == null) {
            throw new IllegalArgumentException("Program cannot be null");
        }
        
        // Validate input
        ValidationUtils.validate(program).throwIfInvalid();
        
        APIResponse<Program> response = makeRequest("POST", "/programs", program, 
                new TypeReference<Program>() {});
        
        // Validate response data
        if (response.isSuccess() && response.getResponse() != null) {
            ValidationUtils.validate(response.getResponse()).throwIfInvalid();
        }
        
        return response;
    }

    /**
     * Searches for a specific program by ID
     * 
     * @param programId The program ID
     * @return API response containing the program
     */
    public APIResponse<Program> searchProgramByProgramId(String programId) throws IOException {
        ValidationUtils.validateId(programId, "programId").throwIfInvalid();
        
        APIResponse<Program> response = makeGetRequest("/programs/" + programId, 
                new TypeReference<Program>() {});
        
        // Validate response data
        if (response.isSuccess() && response.getResponse() != null) {
            ValidationUtils.validate(response.getResponse()).throwIfInvalid();
        }
        
        return response;
    }

    /**
     * Updates an existing program
     * 
     * @param programId The program ID
     * @param program The updated program data
     * @return API response containing the updated program
     */
    public APIResponse<Program> updateProgram(String programId, Program program) throws IOException {
        ValidationUtils.validateId(programId, "programId").throwIfInvalid();
        if (program == null) {
            throw new IllegalArgumentException("Program cannot be null");
        }
        
        // Validate input
        ValidationUtils.validate(program).throwIfInvalid();
        
        APIResponse<Program> response = makeRequest("PUT", "/programs/" + programId, program, 
                new TypeReference<Program>() {});
        
        // Validate response data
        if (response.isSuccess() && response.getResponse() != null) {
            ValidationUtils.validate(response.getResponse()).throwIfInvalid();
        }
        
        return response;
    }

    /**
     * Deletes a program
     * 
     * @param programId The program ID
     * @return API response
     */
    public APIResponse<Void> deleteProgram(String programId) throws IOException {
        ValidationUtils.validateId(programId, "programId").throwIfInvalid();
        
        return makeRequest("DELETE", "/programs/" + programId, null, null);
    }

    // Events API

    /**
     * Searches all events
     * 
     * @param programId Optional program ID filter
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return (max 50)
     * @return API response containing list of events
     */
    public APIResponse<List<Event>> searchAllEvents(String programId, Integer skip, Integer limit) 
            throws IOException {
        
        // Validate parameters
        ValidationUtils.validateSearchParams(skip, limit).throwIfInvalid();
        
        // Build query string
        StringBuilder pathBuilder = new StringBuilder("/events");
        String queryParams = buildQueryString(
                "programId", programId,
                "skip", skip,
                "limit", limit
        );
        if (!queryParams.isEmpty()) {
            pathBuilder.append("?").append(queryParams);
        }

        APIResponse<List<Event>> response = makeGetRequest(pathBuilder.toString(), 
                new TypeReference<List<Event>>() {});
        
        // Validate response data
        if (response.isSuccess() && response.getResponse() != null) {
            for (Event event : response.getResponse()) {
                ValidationUtils.validate(event).throwIfInvalid();
            }
        }
        
        return response;
    }

    /**
     * Creates a new event
     * 
     * @param event The event to create
     * @return API response containing the created event
     */
    public APIResponse<Event> createEvent(Event event) throws IOException {
        if (event == null) {
            throw new IllegalArgumentException("Event cannot be null");
        }
        
        // Validate input
        ValidationUtils.validate(event).throwIfInvalid();
        
        APIResponse<Event> response = makeRequest("POST", "/events", event, 
                new TypeReference<Event>() {});
        
        // Validate response data
        if (response.isSuccess() && response.getResponse() != null) {
            ValidationUtils.validate(response.getResponse()).throwIfInvalid();
        }
        
        return response;
    }

    // Reports API

    /**
     * Searches all reports
     * 
     * @param programId Optional program ID filter
     * @param clientName Optional client name filter
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return (max 50)
     * @return API response containing list of reports
     */
    public APIResponse<List<Report>> searchAllReports(String programId, String clientName, 
                                                     Integer skip, Integer limit) throws IOException {
        
        // Validate parameters
        ValidationUtils.validateSearchParams(skip, limit).throwIfInvalid();
        
        // Build query string
        StringBuilder pathBuilder = new StringBuilder("/reports");
        String queryParams = buildQueryString(
                "programId", programId,
                "clientName", clientName,
                "skip", skip,
                "limit", limit
        );
        if (!queryParams.isEmpty()) {
            pathBuilder.append("?").append(queryParams);
        }

        APIResponse<List<Report>> response = makeGetRequest(pathBuilder.toString(), 
                new TypeReference<List<Report>>() {});
        
        // Validate response data
        if (response.isSuccess() && response.getResponse() != null) {
            for (Report report : response.getResponse()) {
                ValidationUtils.validate(report).throwIfInvalid();
            }
        }
        
        return response;
    }

    /**
     * Creates a new report
     * 
     * @param report The report to create
     * @return API response containing the created report
     */
    public APIResponse<Report> createReport(Report report) throws IOException {
        if (report == null) {
            throw new IllegalArgumentException("Report cannot be null");
        }
        
        // Validate input
        ValidationUtils.validate(report).throwIfInvalid();
        
        APIResponse<Report> response = makeRequest("POST", "/reports", report, 
                new TypeReference<Report>() {});
        
        // Validate response data
        if (response.isSuccess() && response.getResponse() != null) {
            ValidationUtils.validate(response.getResponse()).throwIfInvalid();
        }
        
        return response;
    }

    // VENs API

    /**
     * Searches VENs
     * 
     * @param venName Optional VEN name filter
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return (max 50)
     * @return API response containing list of VENs
     */
    public APIResponse<List<Ven>> searchVens(String venName, Integer skip, Integer limit) 
            throws IOException {
        
        // Validate parameters
        ValidationUtils.validateSearchParams(skip, limit).throwIfInvalid();
        
        // Build query string
        StringBuilder pathBuilder = new StringBuilder("/vens");
        String queryParams = buildQueryString(
                "venName", venName,
                "skip", skip,
                "limit", limit
        );
        if (!queryParams.isEmpty()) {
            pathBuilder.append("?").append(queryParams);
        }

        APIResponse<List<Ven>> response = makeGetRequest(pathBuilder.toString(), 
                new TypeReference<List<Ven>>() {});
        
        // Validate response data
        if (response.isSuccess() && response.getResponse() != null) {
            for (Ven ven : response.getResponse()) {
                ValidationUtils.validate(ven).throwIfInvalid();
            }
        }
        
        return response;
    }

    /**
     * Creates a new VEN
     * 
     * @param ven The VEN to create
     * @return API response containing the created VEN
     */
    public APIResponse<Ven> createVen(Ven ven) throws IOException {
        if (ven == null) {
            throw new IllegalArgumentException("VEN cannot be null");
        }
        
        // Validate input
        ValidationUtils.validate(ven).throwIfInvalid();
        
        APIResponse<Ven> response = makeRequest("POST", "/vens", ven, 
                new TypeReference<Ven>() {});
        
        // Validate response data
        if (response.isSuccess() && response.getResponse() != null) {
            ValidationUtils.validate(response.getResponse()).throwIfInvalid();
        }
        
        return response;
    }

    // Utility methods

    /**
     * Builds a query string from key-value pairs
     */
    private String buildQueryString(Object... params) {
        StringBuilder query = new StringBuilder();
        
        for (int i = 0; i < params.length; i += 2) {
            String key = (String) params[i];
            Object value = params[i + 1];
            
            if (value != null) {
                if (query.length() > 0) {
                    query.append("&");
                }
                
                if (value instanceof List) {
                    List<?> list = (List<?>) value;
                    for (int j = 0; j < list.size(); j++) {
                        if (j > 0) query.append("&");
                        query.append(key).append("=").append(list.get(j));
                    }
                } else {
                    query.append(key).append("=").append(value);
                }
            }
        }
        
        return query.toString();
    }

    /**
     * OAuth2 token response model
     */
    private static class TokenResponse {
        @com.fasterxml.jackson.annotation.JsonProperty("access_token")
        private String accessToken;
        
        @com.fasterxml.jackson.annotation.JsonProperty("token_type")
        private String tokenType;
        
        @com.fasterxml.jackson.annotation.JsonProperty("expires_in")
        private int expiresIn;
        
        @com.fasterxml.jackson.annotation.JsonProperty("scope")
        private String scope;

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }

        public String getTokenType() {
            return tokenType;
        }

        public void setTokenType(String tokenType) {
            this.tokenType = tokenType;
        }

        public int getExpiresIn() {
            return expiresIn;
        }

        public void setExpiresIn(int expiresIn) {
            this.expiresIn = expiresIn;
        }

        public String getScope() {
            return scope;
        }

        public void setScope(String scope) {
            this.scope = scope;
        }
    }
}