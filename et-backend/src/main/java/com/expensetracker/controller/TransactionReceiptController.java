package com.expensetracker.controller;

import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.ReceiptAttachmentConstants;
import com.expensetracker.common.TransactionApiPaths;
import com.expensetracker.dto.TransactionReceiptFile;
import com.expensetracker.dto.TransactionReceiptResponse;
import com.expensetracker.service.TransactionReceiptService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(TransactionApiPaths.BASE_PATH)
public class TransactionReceiptController {

    private final TransactionReceiptService
            transactionReceiptService;

    private final ApiResponseFactory responseFactory;

    public TransactionReceiptController(
            TransactionReceiptService
                    transactionReceiptService,
            ApiResponseFactory responseFactory
    ) {
        this.transactionReceiptService =
                transactionReceiptService;

        this.responseFactory = responseFactory;
    }

    @PostMapping(
            value = TransactionApiPaths.BY_PUBLIC_ID
                    + TransactionApiPaths.RECEIPT,
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<
            ApiResponse<TransactionReceiptResponse>
            > uploadReceipt(
            Authentication authentication,

            @PathVariable
            String publicId,

            @RequestPart(
                    ReceiptAttachmentConstants
                            .FILE_REQUEST_PART
            )
            MultipartFile file
    ) {
        TransactionReceiptResponse receipt =
                transactionReceiptService
                        .uploadReceipt(
                                authentication.getName(),
                                publicId,
                                file
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .RECEIPT_UPLOAD_SUCCESS,
                        receipt
                )
        );
    }

    @GetMapping(
            TransactionApiPaths.BY_PUBLIC_ID
                    + TransactionApiPaths.RECEIPT
    )
    public ResponseEntity<
            ApiResponse<TransactionReceiptResponse>
            > getReceipt(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        TransactionReceiptResponse receipt =
                transactionReceiptService
                        .getReceipt(
                                authentication.getName(),
                                publicId
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .RECEIPT_FETCH_SUCCESS,
                        receipt
                )
        );
    }

    @GetMapping(
            TransactionApiPaths.BY_PUBLIC_ID
                    + TransactionApiPaths.RECEIPT_FILE
    )
    public ResponseEntity<Resource> downloadReceipt(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        TransactionReceiptFile file =
                transactionReceiptService
                        .downloadReceipt(
                                authentication.getName(),
                                publicId
                        );

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                file.contentType()
                        )
                )
                .contentLength(
                        file.contentLength()
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition
                                .attachment()
                                .filename(file.fileName())
                                .build()
                                .toString()
                )
                .body(file.resource());
    }

    @DeleteMapping(
            TransactionApiPaths.BY_PUBLIC_ID
                    + TransactionApiPaths.RECEIPT
    )
    public ResponseEntity<ApiResponse<Void>> deleteReceipt(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        transactionReceiptService
                .deleteReceipt(
                        authentication.getName(),
                        publicId
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .RECEIPT_DELETE_SUCCESS,
                        null
                )
        );
    }
}
