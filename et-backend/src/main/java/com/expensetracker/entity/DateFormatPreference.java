package com.expensetracker.entity;

public enum DateFormatPreference {

    DD_MM_YYYY("dd-MM-yyyy"),

    MM_DD_YYYY("MM-dd-yyyy"),

    YYYY_MM_DD("yyyy-MM-dd");

    private final String pattern;

    DateFormatPreference(
            String pattern
    ) {
        this.pattern = pattern;
    }

    public String getPattern() {
        return pattern;
    }
}