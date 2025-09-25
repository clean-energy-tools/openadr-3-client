package com.openadr.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.Objects;

/**
 * OpenADR Program representation
 */
public class Program {
    @JsonProperty("id")
    private String id;

    @JsonProperty("createdDateTime")
    private OffsetDateTime createdDateTime;

    @JsonProperty("modificationDateTime")
    private OffsetDateTime modificationDateTime;

    @JsonProperty("programName")
    @NotNull
    @Size(max = 128)
    private String programName;

    @JsonProperty("programLongName")
    @Size(max = 255)
    private String programLongName;

    @JsonProperty("retailerName")
    @NotNull
    @Size(max = 128)
    private String retailerName;

    @JsonProperty("retailerLongName")
    @Size(max = 255)
    private String retailerLongName;

    @JsonProperty("programType")
    @NotNull
    private String programType;

    @JsonProperty("country")
    @NotNull
    @Size(min = 2, max = 2)
    private String country;

    @JsonProperty("principalSubdivision")
    @Size(max = 10)
    private String principalSubdivision;

    @JsonProperty("timeZoneOffset")
    private String timeZoneOffset;

    @JsonProperty("bindingEvents")
    private Boolean bindingEvents;

    @JsonProperty("localPrice")
    private Boolean localPrice;

    public Program() {
    }

    public Program(String programName, String retailerName, String programType, String country) {
        this.programName = programName;
        this.retailerName = retailerName;
        this.programType = programType;
        this.country = country;
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

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public String getProgramLongName() {
        return programLongName;
    }

    public void setProgramLongName(String programLongName) {
        this.programLongName = programLongName;
    }

    public String getRetailerName() {
        return retailerName;
    }

    public void setRetailerName(String retailerName) {
        this.retailerName = retailerName;
    }

    public String getRetailerLongName() {
        return retailerLongName;
    }

    public void setRetailerLongName(String retailerLongName) {
        this.retailerLongName = retailerLongName;
    }

    public String getProgramType() {
        return programType;
    }

    public void setProgramType(String programType) {
        this.programType = programType;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPrincipalSubdivision() {
        return principalSubdivision;
    }

    public void setPrincipalSubdivision(String principalSubdivision) {
        this.principalSubdivision = principalSubdivision;
    }

    public String getTimeZoneOffset() {
        return timeZoneOffset;
    }

    public void setTimeZoneOffset(String timeZoneOffset) {
        this.timeZoneOffset = timeZoneOffset;
    }

    public Boolean getBindingEvents() {
        return bindingEvents;
    }

    public void setBindingEvents(Boolean bindingEvents) {
        this.bindingEvents = bindingEvents;
    }

    public Boolean getLocalPrice() {
        return localPrice;
    }

    public void setLocalPrice(Boolean localPrice) {
        this.localPrice = localPrice;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Program program = (Program) o;
        return Objects.equals(id, program.id) &&
                Objects.equals(programName, program.programName) &&
                Objects.equals(retailerName, program.retailerName) &&
                Objects.equals(programType, program.programType) &&
                Objects.equals(country, program.country);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, programName, retailerName, programType, country);
    }

    @Override
    public String toString() {
        return "Program{" +
                "id='" + id + '\'' +
                ", programName='" + programName + '\'' +
                ", retailerName='" + retailerName + '\'' +
                ", programType='" + programType + '\'' +
                ", country='" + country + '\'' +
                '}';
    }
}