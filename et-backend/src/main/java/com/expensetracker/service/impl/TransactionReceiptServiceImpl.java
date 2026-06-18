package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.ReceiptAttachmentConstants;
import com.expensetracker.config.ReceiptStorageProperties;
import com.expensetracker.dto.TransactionReceiptFile;
import com.expensetracker.dto.TransactionReceiptResponse;
import com.expensetracker.entity.FinancialTransaction;
import com.expensetracker.entity.TransactionReceiptAttachment;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.mapper.TransactionReceiptMapper;
import com.expensetracker.repository.FinancialTransactionRepository;
import com.expensetracker.repository.TransactionReceiptAttachmentRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.TransactionReceiptService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

@Service
public class TransactionReceiptServiceImpl
        implements TransactionReceiptService {

    private final ReceiptStorageProperties
            receiptStorageProperties;

    private final UserRepository userRepository;

    private final FinancialTransactionRepository
            financialTransactionRepository;

    private final TransactionReceiptAttachmentRepository
            receiptAttachmentRepository;

    private final TransactionReceiptMapper
            transactionReceiptMapper;

    public TransactionReceiptServiceImpl(
            ReceiptStorageProperties
                    receiptStorageProperties,
            UserRepository userRepository,
            FinancialTransactionRepository
                    financialTransactionRepository,
            TransactionReceiptAttachmentRepository
                    receiptAttachmentRepository,
            TransactionReceiptMapper
                    transactionReceiptMapper
    ) {
        this.receiptStorageProperties =
                receiptStorageProperties;

        this.userRepository = userRepository;

        this.financialTransactionRepository =
                financialTransactionRepository;

        this.receiptAttachmentRepository =
                receiptAttachmentRepository;

        this.transactionReceiptMapper =
                transactionReceiptMapper;
    }

    @Override
    @Transactional
    public TransactionReceiptResponse uploadReceipt(
            String authenticatedEmail,
            String transactionPublicId,
            MultipartFile file
    ) {
        User user =
                getAuthenticatedUser(authenticatedEmail);

        FinancialTransaction transaction =
                getOwnedTransaction(
                        transactionPublicId,
                        user.getId()
                );

        validateFile(file);

        byte[] fileBytes =
                readFileBytes(file);

        String contentType =
                normalizeContentType(
                        file.getContentType()
                );

        String originalFileName =
                normalizeOriginalFileName(
                        file.getOriginalFilename()
                );

        Path baseDirectory =
                getBaseDirectory();

        createStorageDirectory(baseDirectory);

        receiptAttachmentRepository
                .findByTransactionId(transaction.getId())
                .ifPresent(this::deleteExistingReceipt);

        TransactionReceiptAttachment receipt =
                new TransactionReceiptAttachment();

        receipt.setUser(user);
        receipt.setTransaction(transaction);
        receipt.setOriginalFileName(originalFileName);
        receipt.setContentType(contentType);
        receipt.setFileSizeBytes(file.getSize());
        receipt.setSha256Hash(
                sha256Hex(fileBytes)
        );

        String storedFileName =
                buildStoredFileName(
                        transaction.getPublicId(),
                        contentType
                );

        Path storedPath =
                baseDirectory
                        .resolve(storedFileName)
                        .normalize();

        ensureStoredPathInsideBase(
                baseDirectory,
                storedPath
        );

        writeFile(
                storedPath,
                fileBytes
        );

        receipt.setStoredFileName(storedFileName);
        receipt.setStoragePath(
                storedPath.toString()
        );

        TransactionReceiptAttachment savedReceipt =
                receiptAttachmentRepository
                        .saveAndFlush(receipt);

        return transactionReceiptMapper
                .toResponse(savedReceipt);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionReceiptResponse getReceipt(
            String authenticatedEmail,
            String transactionPublicId
    ) {
        User user =
                getAuthenticatedUser(authenticatedEmail);

        TransactionReceiptAttachment receipt =
                getOwnedReceipt(
                        transactionPublicId,
                        user.getId()
                );

        return transactionReceiptMapper
                .toResponse(receipt);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionReceiptFile downloadReceipt(
            String authenticatedEmail,
            String transactionPublicId
    ) {
        User user =
                getAuthenticatedUser(authenticatedEmail);

        TransactionReceiptAttachment receipt =
                getOwnedReceipt(
                        transactionPublicId,
                        user.getId()
                );

        Path path =
                Path.of(receipt.getStoragePath())
                        .toAbsolutePath()
                        .normalize();

        if (!Files.exists(path)) {
            throw new ResourceNotFoundException(
                    ApplicationMessages
                            .RECEIPT_FILE_NOT_FOUND
            );
        }

        try {
            Resource resource =
                    new UrlResource(path.toUri());

            return new TransactionReceiptFile(
                    receipt.getOriginalFileName(),
                    receipt.getContentType(),
                    receipt.getFileSizeBytes(),
                    resource
            );
        } catch (MalformedURLException exception) {
            throw new IllegalStateException(
                    ApplicationMessages
                            .RECEIPT_STORAGE_FAILED,
                    exception
            );
        }
    }

    @Override
    @Transactional
    public void deleteReceipt(
            String authenticatedEmail,
            String transactionPublicId
    ) {
        User user =
                getAuthenticatedUser(authenticatedEmail);

        TransactionReceiptAttachment receipt =
                getOwnedReceipt(
                        transactionPublicId,
                        user.getId()
                );

        deleteExistingReceipt(receipt);
    }

    private User getAuthenticatedUser(
            String authenticatedEmail
    ) {
        return userRepository
                .findByEmailIgnoreCase(
                        authenticatedEmail
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                ApplicationMessages
                                        .USER_ACCOUNT_NOT_FOUND
                        )
                );
    }

    private FinancialTransaction getOwnedTransaction(
            String transactionPublicId,
            Long userId
    ) {
        return financialTransactionRepository
                .findByPublicIdAndUserId(
                        normalizeRequiredIdentifier(
                                transactionPublicId
                        ),
                        userId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                ApplicationMessages
                                        .FINANCIAL_TRANSACTION_NOT_FOUND
                        )
                );
    }

    private TransactionReceiptAttachment getOwnedReceipt(
            String transactionPublicId,
            Long userId
    ) {
        return receiptAttachmentRepository
                .findByTransactionPublicIdAndUserId(
                        normalizeRequiredIdentifier(
                                transactionPublicId
                        ),
                        userId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                ApplicationMessages
                                        .RECEIPT_NOT_FOUND
                        )
                );
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(
                    ApplicationMessages
                            .RECEIPT_EMPTY_FILE
            );
        }

        if (
                receiptStorageProperties
                        .getMaxFileSizeBytes() > 0
                && file.getSize()
                > receiptStorageProperties
                        .getMaxFileSizeBytes()
        ) {
            throw new BadRequestException(
                    ApplicationMessages
                            .RECEIPT_FILE_TOO_LARGE
            );
        }

        String contentType =
                normalizeContentType(
                        file.getContentType()
                );

        boolean allowed =
                receiptStorageProperties
                        .getAllowedContentTypes()
                        .stream()
                        .map(this::normalizeContentType)
                        .anyMatch(contentType::equals);

        if (!allowed) {
            throw new BadRequestException(
                    ApplicationMessages
                            .RECEIPT_FILE_TYPE_NOT_ALLOWED
            );
        }
    }

    private String normalizeContentType(
            String contentType
    ) {
        return contentType == null
                ? ""
                : contentType
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String normalizeOriginalFileName(
            String originalFileName
    ) {
        String cleaned =
                StringUtils.cleanPath(
                        originalFileName == null
                                ? ""
                                : originalFileName
                ).trim();

        if (
                cleaned.isBlank()
                || cleaned.contains("..")
        ) {
            throw new BadRequestException(
                    ApplicationMessages
                            .RECEIPT_FILE_NAME_INVALID
            );
        }

        return cleaned;
    }

    private Path getBaseDirectory() {
        String basePath =
                receiptStorageProperties.getBasePath();

        if (basePath == null || basePath.isBlank()) {
            throw new IllegalStateException(
                    ApplicationMessages
                            .RECEIPT_STORAGE_NOT_CONFIGURED
            );
        }

        return Path.of(basePath)
                .toAbsolutePath()
                .normalize();
    }

    private void createStorageDirectory(
            Path baseDirectory
    ) {
        try {
            Files.createDirectories(baseDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    ApplicationMessages
                            .RECEIPT_STORAGE_FAILED,
                    exception
            );
        }
    }

    private byte[] readFileBytes(
            MultipartFile file
    ) {
        try {
            return file.getBytes();
        } catch (IOException exception) {
            throw new IllegalStateException(
                    ApplicationMessages
                            .RECEIPT_STORAGE_FAILED,
                    exception
            );
        }
    }

    private void writeFile(
            Path storedPath,
            byte[] fileBytes
    ) {
        try {
            Files.write(storedPath, fileBytes);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    ApplicationMessages
                            .RECEIPT_STORAGE_FAILED,
                    exception
            );
        }
    }

    private void deleteExistingReceipt(
            TransactionReceiptAttachment receipt
    ) {
        try {
            Files.deleteIfExists(
                    Path.of(receipt.getStoragePath())
                            .toAbsolutePath()
                            .normalize()
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    ApplicationMessages
                            .RECEIPT_STORAGE_FAILED,
                    exception
            );
        }

        receiptAttachmentRepository.delete(receipt);
        receiptAttachmentRepository.flush();
    }

    private String buildStoredFileName(
            String transactionPublicId,
            String contentType
    ) {
        return transactionPublicId
                + "-"
                + UUID.randomUUID()
                + "."
                + extensionForContentType(contentType);
    }

    private String extensionForContentType(
            String contentType
    ) {
        return switch (contentType) {
            case "image/png" ->
                    ReceiptAttachmentConstants
                            .PNG_EXTENSION;
            case "image/jpeg" ->
                    ReceiptAttachmentConstants
                            .JPEG_EXTENSION;
            case "image/webp" ->
                    ReceiptAttachmentConstants
                            .WEBP_EXTENSION;
            case "application/pdf" ->
                    ReceiptAttachmentConstants
                            .PDF_EXTENSION;
            default ->
                    ReceiptAttachmentConstants
                            .DEFAULT_EXTENSION;
        };
    }

    private void ensureStoredPathInsideBase(
            Path baseDirectory,
            Path storedPath
    ) {
        if (!storedPath.startsWith(baseDirectory)) {
            throw new BadRequestException(
                    ApplicationMessages
                            .RECEIPT_FILE_NAME_INVALID
            );
        }
    }

    private String sha256Hex(byte[] fileBytes) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            String hash =
                    HexFormat.of()
                            .formatHex(
                                    digest.digest(fileBytes)
                            );

            if (
                    hash.length()
                    != ReceiptAttachmentConstants
                    .SHA_256_HEX_LENGTH
            ) {
                throw new IllegalStateException(
                        ApplicationMessages
                                .RECEIPT_STORAGE_FAILED
                );
            }

            return hash;
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    ApplicationMessages
                            .RECEIPT_STORAGE_FAILED,
                    exception
            );
        }
    }

    private String normalizeRequiredIdentifier(
            String value
    ) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(
                    ApplicationMessages
                            .FINANCIAL_TRANSACTION_NOT_FOUND
            );
        }

        return value.trim();
    }
}
