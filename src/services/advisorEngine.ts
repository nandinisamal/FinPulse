import { User, Income, Expense, Budget, AdvisorRecommendation, BudgetStatus } from '../types/finance';

export interface AdvisorAnalysisResult {
  savingsRate: number;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  recommendations: AdvisorRecommendation[];
  budgetStatuses: BudgetStatus[];
  categoryTotals: Record<string, number>;
  fiftyThirtyTwenty: {
    needs: { amount: number; percentage: number; target: 50 };
    wants: { amount: number; percentage: number; target: 30 };
    savings: { amount: number; percentage: number; target: 20 };
  };
}

export function runFinancialAdvisor(
  user: User,
  incomes: Income[],
  expenses: Expense[],
  budgets: Budget[],
  monthFilter?: string // YYYY-MM
): AdvisorAnalysisResult {
  const currentMonth = monthFilter || new Date().toISOString().slice(0, 7);

  // Filter for the active period
  const monthIncomes = incomes.filter(i => i.date.startsWith(currentMonth));
  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const activeBudgets = budgets.filter(b => b.monthYear === currentMonth);

  const totalIncome = monthIncomes.reduce((acc, i) => acc + Number(i.amount), 0);
  const totalExpense = monthExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netCashflow / totalIncome) * 100) : 0;

  // Category totals
  const categoryTotals: Record<string, number> = {};
  for (const exp of monthExpenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
  }

  // Budget Status calculations
  const budgetStatuses: BudgetStatus[] = activeBudgets.map(b => {
    const spent = categoryTotals[b.category] || 0;
    const remaining = Number(b.limitAmount) - spent;
    const percentage = b.limitAmount > 0 ? (spent / Number(b.limitAmount)) * 100 : 0;
    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (percentage >= 100) status = 'danger';
    else if (percentage >= 80) status = 'warning';

    return {
      ...b,
      spent,
      remaining,
      percentage: Math.round(percentage * 10) / 10,
      status,
    };
  });

  // 50/30/20 Rule categorization
  // Needs: Bills, Healthcare, Education, Groceries (part of Food)
  // Wants: Shopping, Entertainment, Travel, Dining
  let needsAmount = 0;
  let wantsAmount = 0;

  for (const exp of monthExpenses) {
    if (['Bills', 'Healthcare', 'Education'].includes(exp.category)) {
      needsAmount += Number(exp.amount);
    } else if (['Shopping', 'Entertainment', 'Travel'].includes(exp.category)) {
      wantsAmount += Number(exp.amount);
    } else {
      // Food: Split 70% needs (essential groceries) / 30% wants (dining out/cafes)
      needsAmount += Number(exp.amount) * 0.7;
      wantsAmount += Number(exp.amount) * 0.3;
    }
  }

  const fiftyThirtyTwenty = {
    needs: {
      amount: Math.round(needsAmount),
      percentage: totalIncome > 0 ? Math.round((needsAmount / totalIncome) * 100) : 0,
      target: 50 as const,
    },
    wants: {
      amount: Math.round(wantsAmount),
      percentage: totalIncome > 0 ? Math.round((wantsAmount / totalIncome) * 100) : 0,
      target: 30 as const,
    },
    savings: {
      amount: Math.max(0, Math.round(netCashflow)),
      percentage: Math.max(0, Math.round(savingsRate)),
      target: 20 as const,
    },
  };

  const recommendations: AdvisorRecommendation[] = [];

  // 1. Missing Data Check
  if (monthIncomes.length === 0) {
    recommendations.push({
      id: 'missing-income',
      type: 'warning',
      title: 'Missing Income Records',
      message: `No income entries found for ${currentMonth}. Add your salary or side income to unlock accurate cashflow calculations.`,
      reason: 'Rule: Cashflow analysis requires at least 1 income source per fiscal cycle.',
      suggestedAction: 'Navigate to Income Management and record your monthly earnings.',
    });
  }

  if (activeBudgets.length === 0) {
    recommendations.push({
      id: 'missing-budgets',
      type: 'tip',
      title: 'No Budgets Configured',
      message: 'Setting category spending limits prevents accidental overspending.',
      reason: 'Rule: Users with at least 3 category budgets save an average of 18% more each quarter.',
      suggestedAction: 'Create monthly budgets for Food, Bills, and Shopping in Budget Management.',
    });
  }

  // 2. Deficit / Cashflow Warning
  if (totalIncome > 0 && totalExpense > totalIncome) {
    const deficit = totalExpense - totalIncome;
    recommendations.push({
      id: 'cashflow-deficit',
      type: 'critical',
      title: 'Negative Cash Flow Alert (Deficit)',
      message: `Your monthly expenses (${user.currency}${totalExpense.toLocaleString()}) exceed your income (${user.currency}${totalIncome.toLocaleString()}) by ${user.currency}${deficit.toLocaleString()}.`,
      reason: `Rule: Incurring a monthly deficit erodes emergency reserves and risks credit debt accumulation.`,
      suggestedAction: 'Pause non-essential discretionary purchases (Shopping & Entertainment) for the rest of the month.',
      potentialSavings: deficit,
    });
  }

  // 3. Savings Rate Evaluation
  if (totalIncome > 0 && totalExpense <= totalIncome) {
    const targetRate = user.savingsTargetGoal || 20;
    if (savingsRate >= targetRate) {
      recommendations.push({
        id: 'savings-goal-met',
        type: 'positive',
        title: 'Outstanding Savings Discipline',
        message: `Your current savings rate is ${savingsRate.toFixed(1)}%, beating your target of ${targetRate}%. Net surplus: ${user.currency}${netCashflow.toLocaleString()}.`,
        reason: `Rule: Maintaining >${targetRate}% savings creates rapid compound growth for long-term wealth.`,
        suggestedAction: 'Consider allocating this surplus toward high-yield savings or diversified index funds.',
      });
    } else {
      const shortfallPercent = (targetRate - savingsRate).toFixed(1);
      const neededAmount = Math.round((totalIncome * (targetRate / 100)) - netCashflow);
      recommendations.push({
        id: 'savings-shortfall',
        type: 'warning',
        title: 'Savings Rate Below Target',
        message: `Your current savings rate of ${savingsRate.toFixed(1)}% is ${shortfallPercent}% below your target of ${targetRate}%. You need ${user.currency}${neededAmount.toLocaleString()} more in savings.`,
        reason: `Rule: Consistently falling short of your target (${targetRate}%) delays your milestone fund goals.`,
        suggestedAction: 'Review high-variable expense categories below to optimize discretionary costs.',
        potentialSavings: neededAmount,
      });
    }
  }

  // 4. Overbudget Warnings
  const overspentBudgets = budgetStatuses.filter(b => b.status === 'danger');
  const warningBudgets = budgetStatuses.filter(b => b.status === 'warning');

  for (const b of overspentBudgets) {
    const overAmount = b.spent - Number(b.limitAmount);
    recommendations.push({
      id: `budget-exceeded-${b.category}`,
      type: 'critical',
      title: `Overbudget Alert: ${b.category}`,
      message: `You spent ${user.currency}${b.spent.toLocaleString()} on ${b.category}, exceeding the ${user.currency}${b.limitAmount.toLocaleString()} budget by ${user.currency}${overAmount.toLocaleString()} (${b.percentage}% utilized).`,
      reason: `Rule: Hard limits breached trigger automatic fiscal alerts to prevent compounding monthly deficits.`,
      suggestedAction: `Freeze further discretionary spending in ${b.category} until next month or adjust allocation from an under-utilized category.`,
      potentialSavings: overAmount,
      category: b.category,
    });
  }

  for (const b of warningBudgets) {
    recommendations.push({
      id: `budget-warning-${b.category}`,
      type: 'warning',
      title: `Budget Limit Approaching: ${b.category}`,
      message: `You have consumed ${b.percentage}% of your ${b.category} budget (${user.currency}${b.spent.toLocaleString()} / ${user.currency}${b.limitAmount.toLocaleString()}). Only ${user.currency}${b.remaining.toLocaleString()} remaining.`,
      reason: `Rule: Spending between 80% and 99% of category cap indicates velocity risk before month-end.`,
      suggestedAction: `Slow down daily spending rate in ${b.category} to stay within the limit.`,
      category: b.category,
    });
  }

  // 5. High-Spending Category Diagnostics
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0 && totalExpense > 0) {
    const [topCat, topAmount] = sortedCategories[0];
    const topPct = Math.round((topAmount / totalExpense) * 100);

    if (topPct > 35 && topCat !== 'Bills') {
      recommendations.push({
        id: `high-category-${topCat}`,
        type: 'warning',
        title: `Heavy Concentration in ${topCat} (${topPct}%)`,
        message: `${topCat} makes up ${topPct}% (${user.currency}${topAmount.toLocaleString()}) of all your expenses this month.`,
        reason: 'Rule: Any single non-housing/non-bill category exceeding 35% of total expenses indicates disproportionate resource allocation.',
        suggestedAction: `Audit recent transactions in ${topCat}. Target a 15% reduction (${user.currency}${Math.round(topAmount * 0.15).toLocaleString()} saved).`,
        potentialSavings: Math.round(topAmount * 0.15),
        category: topCat as any,
      });
    }
  }

  // 6. Practical 50/30/20 Balance Advice
  if (fiftyThirtyTwenty.wants.percentage > 35) {
    const excessWants = Math.round(totalIncome * ((fiftyThirtyTwenty.wants.percentage - 30) / 100));
    recommendations.push({
      id: 'wants-excess',
      type: 'tip',
      title: '50/30/20 Optimization: High Discretionary (Wants)',
      message: `Your lifestyle wants represent ${fiftyThirtyTwenty.wants.percentage}% of total income (recommended: 30%). You are spending ~${user.currency}${excessWants.toLocaleString()} above benchmark.`,
      reason: 'Rule: The 50/30/20 balanced budget rule keeps discretionary expenses capped at 30% of take-home income.',
      suggestedAction: 'Review dining out, subscription streaming, and impulse purchases.',
      potentialSavings: excessWants,
    });
  }

  return {
    savingsRate,
    totalIncome,
    totalExpense,
    netCashflow,
    recommendations,
    budgetStatuses,
    categoryTotals,
    fiftyThirtyTwenty,
  };
}
