package com.expensetracker.repository;

import com.expensetracker.entity.TransactionStatus;

public interface DashboardTransactionStatusProjection {

    TransactionStatus getTransactionStatus();

    Long getTransactionCount();
}