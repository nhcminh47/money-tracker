import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    const supabase = await getSupabaseServerClient();

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(categories || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    const supabase = await getSupabaseServerClient();
    const body = await request.json();

    const { name, type, color, icon } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newCategory: CategoryInsert = {
      user_id: user.id,
      name,
      type,
      color: color || '#3B82F6',
      icon: icon || '📦',
      parent_id: null,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([newCategory] as any)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
