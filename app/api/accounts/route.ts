import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type AccountInsert = Database['public']['Tables']['accounts']['Insert'];

export async function GET(request: NextRequest) {
  try {
    console.log('[Accounts API] Fetching accounts...');
    const user = await getServerUser();
    console.log('[Accounts API] User ID:', user.id);
    const supabase = await getSupabaseServerClient();

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Accounts API] Supabase error:', error);
      throw error;
    }

    console.log('[Accounts API] Found accounts:', accounts?.length || 0);
    return NextResponse.json(accounts || []);
  } catch (error) {
    console.error('[Accounts API] Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    const supabase = await getSupabaseServerClient();
    const body = await request.json();

    const { name, type, currency, icon, color } = body;

    if (!name || !type || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newAccount: AccountInsert = {
      user_id: user.id,
      name,
      type,
      currency,
      balance: 0,
      icon: icon || getDefaultIcon(type),
      color: color || '#3B82F6',
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('accounts')
      .insert([newAccount] as any)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

function getDefaultIcon(type: string): string {
  const icons: Record<string, string> = {
    cash: '💵',
    bank: '🏦',
    credit_card: '💳',
    savings: '🏦',
    investment: '📈',
    other: '💰',
  };
  return icons[type] || '💰';
}
