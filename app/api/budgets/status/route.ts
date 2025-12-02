import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type Budget = Database['public']['Tables']['budgets']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    const supabase = await getSupabaseServerClient();

    // Get all budgets for this user
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id);

    if (budgetsError) throw budgetsError;

    // Get categories for display names
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);

    if (categoriesError) throw categoriesError;

    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // Get all expense transactions for current month
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    if (txError) throw txError;

    // Calculate status for each budget
    const statuses = (budgets as Budget[])?.map((budget) => {
      const category = (categories as Category[])?.find(c => c.id === budget.category_id);
      const categoryTransactions = (transactions as Transaction[])?.filter(tx => tx.category_id === budget.category_id) || [];
      const spent = categoryTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      const remaining = parseFloat(budget.amount) - spent;
      const percentage = parseFloat(budget.amount) > 0 ? (spent / parseFloat(budget.amount)) * 100 : 0;

      return {
        budgetId: budget.id,
        categoryId: budget.category_id,
        categoryName: category?.name || 'Unknown',
        categoryIcon: category?.icon || '📦',
        categoryColor: category?.color || '#3B82F6',
        amount: parseFloat(budget.amount),
        period: budget.period,
        spent,
        remaining,
        percentage: Math.round(percentage),
        isOverBudget: spent > parseFloat(budget.amount),
      };
    }) || [];

    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error calculating budget statuses:', error);
    return NextResponse.json(
      { error: 'Failed to calculate budget statuses' },
      { status: 500 }
    );
  }
}
