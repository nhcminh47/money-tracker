import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    const supabase = await getSupabaseServerClient();

    const { data: budgets, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(budgets || []);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    const supabase = await getSupabaseServerClient();
    const body = await request.json();

    const { category_id, amount, period, start_date, end_date } = body;

    if (!category_id || !amount || !period) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newBudget = {
      user_id: user.id,
      category_id,
      amount: parseFloat(amount),
      period,
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || null,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('budgets')
      .insert([newBudget] as any)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
