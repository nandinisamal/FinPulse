-- Seed User: Alex Rivera (password: Password@123, BCrypt hash below)
INSERT INTO users (id, name, email, password_hash, currency, monthly_income_target, savings_target_goal)
VALUES (1, 'Alex Rivera', 'alex.rivera@example.com', '$2a$10$wK8rDkO28nklkM5O2bH9eupO4fX7v91u0z4rTj5pG0vM6/7jK3Vhe', '₹', 85000.00, 25)
ON DUPLICATE KEY UPDATE name=name;

-- Seed Incomes (INR)
INSERT INTO incomes (user_id, amount, source, income_date, notes) VALUES
(1, 75000.00, 'Software Engineering Salary', '2026-10-01', 'Direct deposit'),
(1, 18000.00, 'Freelance Consulting', '2026-10-08', 'FinTech UI review'),
(1, 3500.00, 'Mutual Fund Dividends', '2026-10-12', 'Quarterly distribution')
ON DUPLICATE KEY UPDATE amount=amount;

-- Seed Expenses (INR)
INSERT INTO expenses (user_id, amount, category, description, expense_date, payment_method) VALUES
(1, 24000.00, 'Bills', 'Apartment Rent, Electricity & WiFi', '2026-10-02', 'UpiTransfer'),
(1, 4850.00, 'Food', 'Supermarket Groceries', '2026-10-03', 'CreditCard'),
(1, 1850.00, 'Food', 'Team Dinner & Café', '2026-10-05', 'CreditCard'),
(1, 2400.00, 'Travel', 'Metro Card & Fuel Refill', '2026-10-06', 'DebitCard'),
(1, 3800.00, 'Shopping', 'Desk Chair Cushion & Tech Accessories', '2026-10-07', 'CreditCard'),
(1, 1650.00, 'Healthcare', 'Dental Checkup & Vitamins', '2026-10-09', 'DebitCard')
ON DUPLICATE KEY UPDATE amount=amount;

-- Seed Budgets (INR)
INSERT INTO budgets (user_id, category, limit_amount, month_year) VALUES
(1, 'Food', 12000.00, '2026-10'),
(1, 'Bills', 28000.00, '2026-10'),
(1, 'Travel', 6000.00, '2026-10'),
(1, 'Shopping', 8000.00, '2026-10'),
(1, 'Healthcare', 4000.00, '2026-10')
ON DUPLICATE KEY UPDATE limit_amount=limit_amount;
