package com.expensetracker.common;

public final class ReceiptAttachmentConstants {

    public static final String FILE_REQUEST_PART =
            "file";

    public static final String PNG_EXTENSION =
            "png";

    public static final String JPEG_EXTENSION =
            "jpg";

    public static final String WEBP_EXTENSION =
            "webp";

    public static final String PDF_EXTENSION =
            "pdf";

    public static final String DEFAULT_EXTENSION =
            "bin";

    public static final int SHA_256_HEX_LENGTH =
            64;

    private ReceiptAttachmentConstants() {
        throw new IllegalStateException(
                "ReceiptAttachmentConstants cannot be instantiated."
        );
    }
}
