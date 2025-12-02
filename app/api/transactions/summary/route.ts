import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    const supabase = await getSupabaseServerClient();
    const searchParams = request.nextUrl.searchParams;
    
    const accountId = searchParams.get('account_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
      transactionCount: transactions?.length || 0,
    };

    for (const tx of (transactions as Transaction[]) || []) {
      if (tx.type === 'income') {
        summary.totalIncome += parseFloat(tx.amount);
      } else if (tx.type === 'expense') {
        summary.totalExpense += parseFloat(tx.amount);
      }
      // Transfers don't affect net amount in summary
    }

    summary.netAmount = summary.totalIncome - summary.totalExpense;

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error calculating summary:', error);
    return NextResponse.json(
      { error: 'Failed to calculate summary' },
      { status: 500 }
    );
  }
}
