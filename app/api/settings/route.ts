import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type SettingsInsert = Database['public']['Tables']['settings']['Insert'];
type SettingsUpdate = Database['public']['Tables']['settings']['Update'];

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    const supabase = await getSupabaseServerClient();

    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    // If no settings exist, create default ones
    if (!settings) {
      const now = new Date().toISOString();
      const defaultSettings = {
        user_id: user.id,
        currency: 'USD',
        date_format: 'MM/dd/yyyy',
        theme: 'system',
        language: 'en',
        created_at: now,
        updated_at: now,
      };

      const { data: newSettings, error: createError } = await supabase
        .from('settings')
        .insert([defaultSettings] as any)
        .select()
        .single();

      if (createError) throw createError;

      return NextResponse.json(newSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser();
    const supabase = await getSupabaseServerClient();
    const body = await request.json();

    const updates: SettingsUpdate = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    delete updates.user_id;
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('settings')
      // @ts-ignore Supabase type inference issue
      .update(updates as any)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
