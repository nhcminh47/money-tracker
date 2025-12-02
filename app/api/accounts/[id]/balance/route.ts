import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    const supabase = await getSupabaseServerClient();

    // Get all transactions for this account
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .or(`account_id.eq.${id},to_account_id.eq.${id}`);

    if (error) throw error;

    let balance = 0;

    for (const tx of (transactions as Transaction[]) || []) {
      if (tx.type === 'income') {
        balance += parseFloat(tx.amount);
      } else if (tx.type === 'expense') {
        balance -= parseFloat(tx.amount);
      } else if (tx.type === 'transfer') {
        // Transfer from this account (debit)
        if (tx.account_id === id) {
          balance -= parseFloat(tx.amount);
        }
        // Transfer to this account (credit)
        if (tx.to_account_id === id) {
          balance += parseFloat(tx.amount);
        }
      }
    }

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error calculating balance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate balance' },
      { status: 500 }
    );
  }
}
