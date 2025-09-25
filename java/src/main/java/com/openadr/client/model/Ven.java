package com.openadr.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.Objects;

/**
 * OpenADR VEN (Virtual End Node) representation
 */
public class Ven {
    @JsonProperty("id")
    private String id;

    @JsonProperty("createdDateTime")
    private OffsetDateTime createdDateTime;

    @JsonProperty("modificationDateTime")
    private OffsetDateTime modificationDateTime;

    @JsonProperty("venName")
    @NotNull
    private String venName;

    public Ven() {
    }

    public Ven(String venName) {
        this.venName = venName;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public OffsetDateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(OffsetDateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    public OffsetDateTime getModificationDateTime() {
        return modificationDateTime;
    }

    public void setModificationDateTime(OffsetDateTime modificationDateTime) {
        this.modificationDateTime = modificationDateTime;
    }

    public String getVenName() {
        return venName;
    }

    public void setVenName(String venName) {
        this.venName = venName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Ven ven = (Ven) o;
        return Objects.equals(id, ven.id) &&
                Objects.equals(venName, ven.venName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, venName);
    }

    @Override
    public String toString() {
        return "Ven{" +
                "id='" + id + '\'' +
                ", venName='" + venName + '\'' +
                '}';
    }
}