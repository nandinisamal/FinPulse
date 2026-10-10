-- ==============================================================================
-- FinPulse MySQL 8 Production Database Schema
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci, Engine: InnoDB
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS finpulse_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE finpulse_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    currency VARCHAR(5) NOT NULL DEFAULT '₹',
    monthly_income_target DECIMAL(12, 2) NOT NULL DEFAULT 75000.00,
    savings_target_goal INT NOT NULL DEFAULT 25,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. Incomes Table
CREATE TABLE IF NOT EXISTS incomes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    source VARCHAR(120) NOT NULL,
    income_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_income_user_date (user_id, income_date)
) ENGINE=InnoDB;

-- 3. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category ENUM('Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Healthcare', 'Entertainment', 'Other') NOT NULL,
    description VARCHAR(255) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_expense_user_cat (user_id, category),
    INDEX idx_expense_user_date (user_id, expense_date)
) ENGINE=InnoDB;

-- 4. Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category ENUM('Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Healthcare', 'Entertainment', 'Other') NOT NULL,
    limit_amount DECIMAL(12, 2) NOT NULL,
    month_year VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_category_month (user_id, category, month_year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_budget_user_month (user_id, month_year)
) ENGINE=InnoDB;
