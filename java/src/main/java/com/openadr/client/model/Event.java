package com.openadr.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.Objects;

/**
 * OpenADR Event representation
 */
public class Event {
    @JsonProperty("id")
    private String id;

    @JsonProperty("createdDateTime")
    private OffsetDateTime createdDateTime;

    @JsonProperty("modificationDateTime")
    private OffsetDateTime modificationDateTime;

    @JsonProperty("programId")
    @NotNull
    private String programId;

    @JsonProperty("eventName")
    @NotNull
    private String eventName;

    @JsonProperty("priority")
    @NotNull
    private Integer priority;

    @JsonProperty("intervalPeriod")
    private IntervalPeriod intervalPeriod;

    public Event() {
    }

    public Event(String programId, String eventName, Integer priority) {
        this.programId = programId;
        this.eventName = eventName;
        this.priority = priority;
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

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public IntervalPeriod getIntervalPeriod() {
        return intervalPeriod;
    }

    public void setIntervalPeriod(IntervalPeriod intervalPeriod) {
        this.intervalPeriod = intervalPeriod;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Event event = (Event) o;
        return Objects.equals(id, event.id) &&
                Objects.equals(programId, event.programId) &&
                Objects.equals(eventName, event.eventName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, programId, eventName);
    }

    @Override
    public String toString() {
        return "Event{" +
                "id='" + id + '\'' +
                ", programId='" + programId + '\'' +
                ", eventName='" + eventName + '\'' +
                ", priority=" + priority +
                '}';
    }
}