/**
 * Analytics and insights engine - 100% local, no external API calls
 * Analyzes spending patterns and generates insights
 */

import { db } from '@/lib/db';
import { Transaction } from '@/lib/db';

interface SpendingTrend {
  categoryId: string;
  categoryName: string;
  currentMonth: number;
  previousMonth: number;
  change: number;
  changePercent: number;
}

interface CategoryInsight {
  categoryId: string;
  categoryName: string;
  totalSpent: number;
  transactionCount: number;
  avgPerTransaction: number;
  percentOfTotal: number;
}

interface MonthlyComparison {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface BudgetRecommendation {
  categoryId: string;
  categoryName: string;
  suggestedAmount: number;
  reason: string;
}

/**
 * Get start and end dates for a month
 */
function getMonthRange(monthsAgo: number = 0): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59);
  return { 
    start: start.toISOString(), 
    end: end.toISOString() 
  };
}

/**
 * Calculate spending trends by comparing current vs previous month
 */
export async function getSpendingTrends(): Promise<SpendingTrend[]> {
  const categories = await db.categories.toArray();
  const currentMonth = getMonthRange(0);
  const previousMonth = getMonthRange(1);

  const trends: SpendingTrend[] = [];

  for (const category of categories) {
    if (category.type !== 'expense') continue;

    // Current month spending
    const currentTransactions = await db.transactions
      .where('categoryId')
      .equals(category.id)
      .and(t => t.type === 'Expense' && t.date >= currentMonth.start && t.date <= currentMonth.end)
      .toArray();
    
    const currentTotal = currentTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Previous month spending
    const previousTransactions = await db.transactions
      .where('categoryId')
      .equals(category.id)
      .and(t => t.type === 'Expense' && t.date >= previousMonth.start && t.date <= previousMonth.end)
      .toArray();
    
    const previousTotal = previousTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (currentTotal > 0 || previousTotal > 0) {
      const change = currentTotal - previousTotal;
      const changePercent = previousTotal > 0 ? (change / previousTotal) * 100 : 100;

      trends.push({
        categoryId: category.id,
        categoryName: category.name,
        currentMonth: currentTotal,
        previousMonth: previousTotal,
        change,
        changePercent
      });
    }
  }

  // Sort by absolute change (biggest changes first)
  return trends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

/**
 * Get top spending categories for current month
 */
export async function getTopSpendingCategories(limit: number = 5): Promise<CategoryInsight[]> {
  const categories = await db.categories.toArray();
  const currentMonth = getMonthRange(0);

  const insights: CategoryInsight[] = [];
  let totalSpending = 0;

  for (const category of categories) {
    if (category.type !== 'expense') continue;

    const transactions = await db.transactions
      .where('categoryId')
      .equals(category.id)
      .and(t => t.type === 'Expense' && t.date >= currentMonth.start && t.date <= currentMonth.end)
      .toArray();

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    totalSpending += totalSpent;

    if (totalSpent > 0) {
      insights.push({
        categoryId: category.id,
        categoryName: category.name,
        totalSpent,
        transactionCount: transactions.length,
        avgPerTransaction: totalSpent / transactions.length,
        percentOfTotal: 0 // Will calculate after we have total
      });
    }
  }

  // Calculate percentages
  insights.forEach(insight => {
    insight.percentOfTotal = (insight.totalSpent / totalSpending) * 100;
  });

  // Sort by total spent and return top N
  return insights.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, limit);
}

/**
 * Get monthly comparison for last N months
 */
export async function getMonthlyComparison(months: number = 6): Promise<MonthlyComparison[]> {
  const comparisons: MonthlyComparison[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const range = getMonthRange(i);
    
    const transactions = await db.transactions
      .where('date')
      .between(range.start, range.end, true, true)
      .toArray();

    const income = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    comparisons.push({
      month: new Date(range.start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income,
      expenses,
      net: income - expenses
    });
  }

  return comparisons;
}

/**
 * Generate natural language insights from spending data
 */
export async function generateInsights(): Promise<string[]> {
  const insights: string[] = [];
  const trends = await getSpendingTrends();
  const topCategories = await getTopSpendingCategories(3);

  // Trend insights
  const significantIncreases = trends.filter(t => t.changePercent > 20 && t.change > 10);
  const significantDecreases = trends.filter(t => t.changePercent < -20 && Math.abs(t.change) > 10);

  if (significantIncreases.length > 0) {
    const top = significantIncreases[0];
    insights.push(
      `📈 Your ${top.categoryName} spending increased by ${Math.abs(top.changePercent).toFixed(0)}% this month ($${top.change.toFixed(2)} more).`
    );
  }

  if (significantDecreases.length > 0) {
    const top = significantDecreases[0];
    insights.push(
      `📉 Great job! You reduced ${top.categoryName} spending by ${Math.abs(top.changePercent).toFixed(0)}% this month ($${Math.abs(top.change).toFixed(2)} saved).`
    );
  }

  // Top spending insights
  if (topCategories.length > 0) {
    const top = topCategories[0];
    insights.push(
      `💰 ${top.categoryName} is your biggest expense this month at $${top.totalSpent.toFixed(2)} (${top.percentOfTotal.toFixed(0)}% of total spending).`
    );
  }

  // Frequency insights
  for (const category of topCategories) {
    if (category.transactionCount > 15) {
      insights.push(
        `🔄 You made ${category.transactionCount} ${category.categoryName} purchases this month. Consider setting a budget to track this better.`
      );
    }
  }

  // Monthly comparison insight
  const comparison = await getMonthlyComparison(2);
  if (comparison.length >= 2) {
    const current = comparison[1];
    const previous = comparison[0];
    const savingsChange = current.net - previous.net;

    if (savingsChange > 0) {
      insights.push(
        `✨ You're saving ${Math.abs(savingsChange).toFixed(0)}% more this month compared to last month!`
      );
    } else if (savingsChange < 0) {
      insights.push(
        `⚠️ Your savings decreased by $${Math.abs(savingsChange).toFixed(2)} this month. Review your spending to get back on track.`
      );
    }
  }

  return insights.length > 0 ? insights : ['📊 Keep tracking your expenses to unlock insights!'];
}

/**
 * Generate budget recommendations based on spending patterns
 */
export async function generateBudgetRecommendations(): Promise<BudgetRecommendation[]> {
  const categories = await db.categories.filter(c => c.type === 'expense').toArray();
  const recommendations: BudgetRecommendation[] = [];

  // Analyze last 3 months
  const monthlyData: { [categoryId: string]: number[] } = {};

  for (let i = 0; i < 3; i++) {
    const range = getMonthRange(i);
    
    for (const category of categories) {
      const transactions = await db.transactions
        .where('categoryId')
        .equals(category.id)
        .and(t => t.type === 'Expense' && t.date >= range.start && t.date <= range.end)
        .toArray();

      const total = transactions.reduce((sum, t) => sum + t.amount, 0);

      if (!monthlyData[category.id]) {
        monthlyData[category.id] = [];
      }
      monthlyData[category.id].push(total);
    }
  }

  // Generate recommendations
  for (const category of categories) {
    const data = monthlyData[category.id];
    if (!data || data.length < 2) continue;

    const hasSpending = data.some(amount => amount > 0);
    if (!hasSpending) continue;

    // Calculate average
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    
    // Calculate standard deviation
    const variance = data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    // Suggest budget: average + 1 standard deviation (covers ~84% of cases)
    const suggested = Math.ceil((avg + stdDev) / 10) * 10; // Round to nearest $10

    let reason = '';
    if (stdDev / avg > 0.5) {
      reason = 'Your spending varies significantly. This budget provides flexibility.';
    } else {
      reason = `Based on your average spending of $${avg.toFixed(2)}/month.`;
    }

    recommendations.push({
      categoryId: category.id,
      categoryName: category.name,
      suggestedAmount: suggested,
      reason
    });
  }

  // Sort by suggested amount (highest first)
  return recommendations.sort((a, b) => b.suggestedAmount - a.suggestedAmount);
}
