package com.openadr.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.Objects;

/**
 * OpenADR Report representation
 */
public class Report {
    @JsonProperty("id")
    private String id;

    @JsonProperty("createdDateTime")
    private OffsetDateTime createdDateTime;

    @JsonProperty("modificationDateTime")
    private OffsetDateTime modificationDateTime;

    @JsonProperty("programId")
    @NotNull
    private String programId;

    @JsonProperty("eventId")
    private String eventId;

    @JsonProperty("clientName")
    @NotNull
    private String clientName;

    @JsonProperty("reportName")
    @NotNull
    private String reportName;

    public Report() {
    }

    public Report(String programId, String clientName, String reportName) {
        this.programId = programId;
        this.clientName = clientName;
        this.reportName = reportName;
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

    public String getProgramId() {
        return programId;
    }

    public void setProgramId(String programId) {
        this.programId = programId;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Report report = (Report) o;
        return Objects.equals(id, report.id) &&
                Objects.equals(programId, report.programId) &&
                Objects.equals(clientName, report.clientName) &&
                Objects.equals(reportName, report.reportName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, programId, clientName, reportName);
    }

    @Override
    public String toString() {
        return "Report{" +
                "id='" + id + '\'' +
                ", programId='" + programId + '\'' +
                ", clientName='" + clientName + '\'' +
                ", reportName='" + reportName + '\'' +
                '}';
    }
}