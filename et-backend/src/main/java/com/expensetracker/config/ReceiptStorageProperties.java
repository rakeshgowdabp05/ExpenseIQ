package com.expensetracker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.storage.receipts")
public class ReceiptStorageProperties {

    private String basePath;

    private long maxFileSizeBytes;

    private List<String> allowedContentTypes =
            new ArrayList<>();

    public String getBasePath() {
        return basePath;
    }

    public void setBasePath(String basePath) {
        this.basePath = basePath;
    }

    public long getMaxFileSizeBytes() {
        return maxFileSizeBytes;
    }

    public void setMaxFileSizeBytes(long maxFileSizeBytes) {
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    public List<String> getAllowedContentTypes() {
        return allowedContentTypes;
    }

    public void setAllowedContentTypes(
            List<String> allowedContentTypes
    ) {
        this.allowedContentTypes =
                allowedContentTypes == null
                        ? new ArrayList<>()
                        : allowedContentTypes;
    }
}
