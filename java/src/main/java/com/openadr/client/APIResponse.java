package com.openadr.client;

/**
 * Standardized API response wrapper
 * @param <T> The type of the response data
 */
public class APIResponse<T> {
    private final int status;
    private final T response;
    private final APIError problem;

    public APIResponse(int status, T response) {
        this.status = status;
        this.response = response;
        this.problem = null;
    }

    public APIResponse(int status, APIError problem) {
        this.status = status;
        this.response = null;
        this.problem = problem;
    }

    /**
     * @return HTTP status code
     */
    public int getStatus() {
        return status;
    }

    /**
     * @return Response data if successful, null if error
     */
    public T getResponse() {
        return response;
    }

    /**
     * @return Error information if failed, null if successful
     */
    public APIError getProblem() {
        return problem;
    }

    /**
     * @return true if the response was successful (2xx status code)
     */
    public boolean isSuccess() {
        return status >= 200 && status < 300 && problem == null;
    }

    /**
     * @return true if the response was an error
     */
    public boolean isError() {
        return !isSuccess();
    }

    @Override
    public String toString() {
        return "APIResponse{" +
                "status=" + status +
                ", response=" + response +
                ", problem=" + problem +
                '}';
    }
}