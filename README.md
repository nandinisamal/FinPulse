# FinPulse — Expense Tracker & Personal Finance Advisor


FinPulse is an enterprise-grade full-stack personal finance management and intelligent advisory web application built from scratch. It features strict session-based authentication with BCrypt hashing, atomic financial CRUD operations with `BigDecimal` precision, category budgeting with active threshold alerts, multi-month spending trend visualization with Chart.js, and a deterministic, rule-based 50/30/20 personal finance advisor.

---

## 1. Complete Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3.4, Spring Web REST API, Spring Data JPA, Hibernate 6, Spring Security 6 |
| **Database** | MySQL 8.0 (InnoDB engine, `utf8mb4_unicode_ci` collation, Foreign Keys, ON DELETE CASCADE) |
| **Build Tool** | Apache Maven 3.8+ (`pom.xml`) |
| **Testing** | JUnit 5, Mockito, Spring Security Test, Spring Boot Test |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Chart.js 4.4, Lucide / Bootstrap Icons |
| **Architecture** | Layered Controller-Service-Repository pattern with DTO isolation and Domain modeling |

---

## 2. Complete Project Folder Structure

```text
finpulse/
├── backend/                               # Spring Boot 3 & Maven Application
│   ├── pom.xml                            # Maven dependencies, Java 17, Spring Boot 3.3.4
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/finpulse/
│   │   │   │   ├── FinPulseApplication.java   # Spring Boot @SpringBootApplication entry point
│   │   │   │   ├── config/
│   │   │   │   │   ├── SecurityConfig.java    # Spring Security 6, BCrypt, Session & CSRF config
│   │   │   │   │   └── WebConfig.java         # CORS configuration and static mappings
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java        # /api/auth (register, login, logout, me)
│   │   │   │   │   ├── IncomeController.java      # /api/incomes (CRUD, date filters)
│   │   │   │   │   ├── ExpenseController.java     # /api/expenses (CRUD, category filters)
│   │   │   │   │   ├── BudgetController.java      # /api/budgets (monthly category limits)
│   │   │   │   │   ├── DashboardController.java   # /api/dashboard/summary (aggregations)
│   │   │   │   │   ├── AdvisorController.java     # /api/advisor/recommendations (heuristics)
│   │   │   │   │   └── UserController.java        # /api/user/profile
│   │   │   │   ├── dto/
│   │   │   │   │   ├── RegisterRequest.java       # User registration payload with validation
│   │   │   │   │   ├── LoginRequest.java          # Authentication request payload
│   │   │   │   │   ├── AuthResponse.java          # Authenticated user session response
│   │   │   │   │   ├── IncomeDto.java             # Income request data transfer object
│   │   │   │   │   ├── ExpenseDto.java            # Expense request data transfer object
│   │   │   │   │   ├── BudgetDto.java             # Budget cap data transfer object
│   │   │   │   │   ├── DashboardSummaryDto.java   # Executive dashboard totals
│   │   │   │   │   └── AdvisorRecommendationDto.java # Heuristic advisory payload
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java    # Centralized @RestControllerAdvice
│   │   │   │   │   ├── ResourceNotFoundException.java # HTTP 404 handler
│   │   │   │   │   └── DuplicateResourceException.java# HTTP 409 conflict handler
│   │   │   │   ├── model/
│   │   │   │   │   ├── User.java                  # JPA Entity: users table
│   │   │   │   │   ├── Income.java                # JPA Entity: incomes table (BigDecimal)
│   │   │   │   │   ├── Expense.java               # JPA Entity: expenses table
│   │   │   │   │   ├── Budget.java                # JPA Entity: budgets table (unique index)
│   │   │   │   │   ├── ExpenseCategory.java       # Enum: Food, Travel, Shopping, Bills, etc.
│   │   │   │   │   └── PaymentMethod.java         # Enum: Credit Card, Debit Card, UPI, Cash
│   │   │   │   ├── repository/
│   │   │   │   │   ├── UserRepository.java        # Spring Data JPA UserRepository
│   │   │   │   │   ├── IncomeRepository.java      # JPQL date range & aggregation queries
│   │   │   │   │   ├── ExpenseRepository.java     # JPQL category sum & date range queries
│   │   │   │   │   └── BudgetRepository.java      # Monthly budget lookup by user
│   │   │   │   └── service/
│   │   │   │       ├── UserService.java           # BCrypt password hashing and user lookup
│   │   │   │       ├── CustomUserDetailsService.java # UserDetailsService for Spring Security
│   │   │   │       ├── IncomeService.java         # Income business logic with user isolation
│   │   │   │       ├── ExpenseService.java        # Expense business logic with user isolation
│   │   │   │       ├── BudgetService.java         # Budget limits and upsert logic
│   │   │   │       ├── DashboardService.java      # Real-time mathematical rollups
│   │   │   │       └── FinanceAdvisorService.java # 50/30/20 and deficit rule engine
│   │   │   └── resources/
│   │   │       ├── application.properties         # MySQL connection, JPA, Hibernate configs
│   │   │       ├── schema.sql                     # MySQL 8 table DDL with foreign keys
│   │   │       └── data.sql                       # Default Alex Rivera demonstration seed data
│   │   └── test/
│   │       ├── java/com/finpulse/
│   │       │   ├── FinanceAdvisorServiceTest.java # JUnit 5 advisory heuristic tests
│   │       │   ├── ExpenseServiceTest.java        # JUnit 5 user isolation & CRUD tests
│   │       │   └── FinPulseApplicationTests.java  # Spring Boot Context load test
│   │       └── resources/
│   │           └── application.properties         # In-memory H2 config for automated tests
├── src/                                   # Frontend UI (Bootstrap 5, Chart.js, React SPA)
│   ├── components/
│   │   ├── Sidebar.tsx                    # Fixed / collapsible navy sidebar
│   │   ├── Navbar.tsx                     # Top navigation, notifications, quick action
│   │   ├── MetricCard.tsx                 # Financial summary cards with status accents
│   │   ├── ChartWrapper.tsx               # Chart.js canvas integration
│   │   ├── Modal.tsx                      # Bootstrap 5 styled modal dialog
│   │   └── QuickAddModal.tsx              # Quick Income/Expense logger
│   ├── pages/
│   │   ├── LandingPage.tsx                # Page 1: Portfolio landing & architecture overview
│   │   ├── LoginPage.tsx                  # Page 2: Session login with one-click demo
│   │   ├── RegisterPage.tsx               # Page 3: User registration with password meter
│   │   ├── DashboardPage.tsx              # Page 4: Executive dashboard with 4 metrics & 2 charts
│   │   ├── IncomePage.tsx                 # Page 5: Income CRUD, date range, monthly totals
│   │   ├── ExpensePage.tsx                # Page 6: Expense CRUD, category filter, payment methods
│   │   ├── BudgetPage.tsx                 # Page 7: Monthly budget limits with progress bars
│   │   ├── TransactionsPage.tsx           # Page 8: Unified journal, pagination, CSV export
│   │   ├── AnalyticsPage.tsx              # Page 9: Multi-month trends, burn rate, payment chart
│   │   ├── AdvisorPage.tsx                # Page 10: 50/30/20 rule engine & interactive simulator
│   │   ├── ProfilePage.tsx                # Page 11: Financial targets & password change
│   │   ├── SettingsPage.tsx               # Page 12: Currency, JSON backup/restore, reset
│   │   └── CodeViewerPage.tsx             # Interactive Spring Boot & Maven code inspector
│   ├── services/
│   │   ├── apiService.ts                  # Persistent REST API client
│   │   └── advisorEngine.ts               # Rule-based financial advisor heuristics
│   ├── types/
│   │   └── finance.ts                     # TypeScript domain models
│   ├── App.tsx                            # Root component with routing and global state
│   ├── index.css                          # Navy theme, typography, custom scrollbars
│   └── main.tsx                           # Application mounting
├── index.html                             # Bootstrap 5 CDN and meta headers
├── package.json                           # Frontend scripts and runtime dependencies
└── README.md                              # Complete setup, commands, API docs, viva guide
```

---

## 3. MySQL 8 Database Creation and Configuration

### Prerequisites
- MySQL Server 8.0+ installed and running.
- MySQL Command Line Client or MySQL Workbench.

### Step 1: Create Database & User
Open MySQL CLI or Workbench and execute:

```sql
CREATE DATABASE IF NOT EXISTS finpulse_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'finpulse_user'@'localhost' IDENTIFIED BY 'FinPulse@Secure2026';
GRANT ALL PRIVILEGES ON finpulse_db.* TO 'finpulse_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Run Table Creation Script (`schema.sql`)
Execute the provided `backend/src/main/resources/schema.sql`:

```sql
USE finpulse_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    currency VARCHAR(5) NOT NULL DEFAULT '$',
    monthly_income_target DECIMAL(12, 2) NOT NULL DEFAULT 5000.00,
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
```

---

## 4. Exact Windows PowerShell Commands to Run the Application

### Option A: Run Full Java 17 + Spring Boot 3 Backend on Windows

Open **Windows PowerShell** as Administrator or standard user:

```powershell
# 1. Verify Java 17 and Maven installations
java -version
mvn -version

# 2. Set MySQL credentials via Environment Variables (Never hardcoded)
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/finpulse_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME="finpulse_user"
$env:SPRING_DATASOURCE_PASSWORD="FinPulse@Secure2026"

# 3. Navigate into the backend directory
cd C:\path\to\finpulse\backend

# 4. Compile, run automated tests, and build the JAR
mvn clean package

# 5. Launch the Spring Boot 3 application on port 8080
java -jar target\finpulse-backend-1.0.0.jar
# Or directly via Maven:
# mvn spring-boot:run
```

### Option B: Run Frontend Dashboard (Vite / Node on Port 3000)

Open a second **Windows PowerShell** window:

```powershell
cd C:\path\to\finpulse
npm install
npm run dev
```

Visit: `http://localhost:3000`

---

## 5. REST API Endpoint Documentation

| HTTP Method | Endpoint | Description | Protected? |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with name, email, password, and targets | No |
| `POST` | `/api/auth/login` | Authenticate credentials and establish HTTP Session | No |
| `POST` | `/api/auth/logout` | Invalidate current session and clear security context | Yes |
| `GET` | `/api/auth/me` | Fetch currently logged in user profile | Yes |
| `GET` | `/api/incomes` | List incomes (supports `startDate` & `endDate` query params) | Yes |
| `POST` | `/api/incomes` | Create income record with amount, source, date, notes | Yes |
| `PUT` | `/api/incomes/{id}` | Update existing income record (enforces user isolation) | Yes |
| `DELETE` | `/api/incomes/{id}` | Delete income record | Yes |
| `GET` | `/api/expenses` | List expenses (supports `category`, `startDate`, `endDate`) | Yes |
| `POST` | `/api/expenses` | Create expense record with category, method, date | Yes |
| `PUT` | `/api/expenses/{id}` | Update expense record (enforces user isolation) | Yes |
| `DELETE` | `/api/expenses/{id}` | Delete expense record | Yes |
| `GET` | `/api/budgets` | Fetch budget caps for month (`?monthYear=2026-10`) | Yes |
| `POST` | `/api/budgets` | Upsert category budget limit for specified month | Yes |
| `PUT` | `/api/budgets/{id}` | Update budget spending cap limit | Yes |
| `DELETE` | `/api/budgets/{id}` | Delete budget limit | Yes |
| `GET` | `/api/dashboard/summary` | Real-time rollups: income, expense, balance, savings rate | Yes |
| `GET` | `/api/advisor/recommendations` | Deterministic rule-based advice & 50/30/20 evaluation | Yes |

---

## 6. Personal Finance Advisor Rule Heuristics

The advisor evaluates user records using quantitative financial formulas:

1. **Missing Inflow Heuristic**: Checks if `totalMonthlyIncome == 0`. Prompts immediate recording of primary earnings.
2. **Deficit Alert**: If `totalMonthlyExpenses > totalMonthlyIncome`, triggers a Critical Alert specifying the exact currency shortfall and prescribes freezing discretionary spending.
3. **Savings Rate Assessment**:
   $$\text{Savings Rate} = \frac{\text{Total Income} - \text{Total Expenses}}{\text{Total Income}} \times 100$$
   Evaluates against user's custom benchmark (default 25%). If $\text{rate} \ge \text{target}$, delivers positive reinforcement with capital allocation advice. If $\text{rate} < \text{target}$, calculates exact monthly currency shortfall needed to meet goal.
4. **Budget Breach Heuristic**: Computes category utilization:
   $$\text{Utilization} = \frac{\text{Category Spent}}{\text{Category Limit}} \times 100$$
   - $> 100\%$: High-priority overbudget warning with exact overspent amount.
   - $80\% - 99\%$: Approaching limit cautionary notice with remaining allowance.
5. **50/30/20 Model**:
   - **Needs (50%)**: Bills, Healthcare, Education, and Essential Groceries.
   - **Wants (30%)**: Shopping, Dining Out, Entertainment, Travel.
   - **Savings (20%)**: Retained liquidity surplus.

---

## 7. Portfolio Viva & Demonstration Instructions

For portfolio presentations and university viva examinations:
1. **Landing Page**: Demonstrates the software engineering problem statement, technology stack badges, and architectural diagrams.
2. **Live Demo Login**: Use the prominent "One-Click Demo Login" to enter as **Alex Rivera** with pre-seeded data showcasing active charts, budget progress, and advisory triggers.
3. **CRUD Demonstrations**: Add an income or expense using the "+ Add Record" button. Notice immediate live recalculation of the available balance, savings rate, and Chart.js visuals without manual page reload.
4. **Advisor Testing**: Set a small budget for `Food` ($100). Because Food spending exceeds $100, observe the immediate **Overbudget Alert** appear with specific mathematical reasoning.
5. **CSV Export**: Navigate to Transactions and click "Export CSV" to demonstrate reporting capabilities.
6. **Code Inspector**: Open the **"Spring Boot 3 / Maven"** tab in the sidebar or navbar to show examiners the complete backend code (`pom.xml`, `SecurityConfig.java`, `FinanceAdvisorService.java`, `schema.sql`) directly within the running application.

---

## 8. Troubleshooting

- **Port 8080 Conflict**: If another service uses port 8080 on Windows, run `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8085` or set `server.port=8085` in `application.properties`.
- **MySQL Connection Refused**: Ensure MySQL service is running via Windows Services (`services.msc` -> `MySQL80` -> Start) or run `net start MySQL80` in an elevated command prompt.
- **Access Denied for Root**: Verify environment variables:
  `$env:SPRING_DATASOURCE_USERNAME="your_user"`
  `$env:SPRING_DATASOURCE_PASSWORD="your_password"`
