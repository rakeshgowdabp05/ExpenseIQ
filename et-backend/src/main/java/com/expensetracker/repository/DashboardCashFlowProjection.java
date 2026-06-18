package com.expensetracker.repository;

import com.expensetracker.entity.TransactionType;

import java.math.BigDecimal;

public interface DashboardCashFlowProjection {

    String getCurrencyCode();

    TransactionType getTransactionType();

    BigDecimal getTotalAmount();

    Long getTransactionCount();
}