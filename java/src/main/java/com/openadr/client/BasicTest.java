package com.openadr.client;

/**
 * Basic test class to verify Java compilation works
 */
public class BasicTest {
    private final String baseUrl;
    private final String clientId;
    private final String clientSecret;

    public BasicTest(String baseUrl, String clientId, String clientSecret) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
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

    @Override
    public String toString() {
        return "BasicTest{" +
                "baseUrl='" + baseUrl + '\'' +
                ", clientId='" + clientId + '\'' +
                ", clientSecret='***'" +
                '}';
    }

    public static void main(String[] args) {
        BasicTest test = new BasicTest("https://example.com", "client", "secret");
        System.out.println("Basic Java compilation test successful!");
        System.out.println("Test instance: " + test);
    }
}