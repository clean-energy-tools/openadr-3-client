package com.openadr.client.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.Objects;

/**
 * OpenADR IntervalPeriod representation
 */
public class IntervalPeriod {
    @JsonProperty("start")
    @NotNull
    private OffsetDateTime start;

    @JsonProperty("duration")
    private String duration;

    @JsonProperty("randomizeStart")
    private String randomizeStart;

    public IntervalPeriod() {
    }

    public IntervalPeriod(OffsetDateTime start) {
        this.start = start;
    }

    public IntervalPeriod(OffsetDateTime start, String duration) {
        this.start = start;
        this.duration = duration;
    }

    public OffsetDateTime getStart() {
        return start;
    }

    public void setStart(OffsetDateTime start) {
        this.start = start;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getRandomizeStart() {
        return randomizeStart;
    }

    public void setRandomizeStart(String randomizeStart) {
        this.randomizeStart = randomizeStart;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        IntervalPeriod that = (IntervalPeriod) o;
        return Objects.equals(start, that.start) &&
                Objects.equals(duration, that.duration);
    }

    @Override
    public int hashCode() {
        return Objects.hash(start, duration);
    }

    @Override
    public String toString() {
        return "IntervalPeriod{" +
                "start=" + start +
                ", duration='" + duration + '\'' +
                ", randomizeStart='" + randomizeStart + '\'' +
                '}';
    }
}