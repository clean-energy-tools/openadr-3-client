package com.openadr.client;

/**
 * Configuration class for OpenADR 3 client
 */
public class OADR3Config {
    private final String baseUrl;
    private final String clientId;
    private final String clientSecret;
    private final String scope;

    public OADR3Config(String baseUrl, String clientId, String clientSecret) {
        this(baseUrl, clientId, clientSecret, null);
    }

    public OADR3Config(String baseUrl, String clientId, String clientSecret, String scope) {
        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("baseUrl cannot be null or empty");
        }
        if (clientId == null || clientId.trim().isEmpty()) {
            throw new IllegalArgumentException("clientId cannot be null or empty");
        }
        if (clientSecret == null || clientSecret.trim().isEmpty()) {
            throw new IllegalArgumentException("clientSecret cannot be null or empty");
        }

        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scope = scope;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getClientId() {
        return clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public String getScope() {
        return scope;
    }

    @Override
    public String toString() {
        return "OADR3Config{" +
                "baseUrl='" + baseUrl + '\'' +
                ", clientId='" + clientId + '\'' +
                ", clientSecret='***'" +
                ", scope='" + scope + '\'' +
                '}';
    }
}