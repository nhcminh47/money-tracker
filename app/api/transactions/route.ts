import type { Database } from '@/lib/database.types'
import { getServerUser, getSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    const supabase = await getSupabaseServerClient()
    const searchParams = request.nextUrl.searchParams

    const accountId = searchParams.get('account_id')
    const categoryId = searchParams.get('category_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = searchParams.get('limit')

    let query = supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false })

    if (accountId) {
      query = query.eq('account_id', accountId)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: transactions, error } = await query

    if (error) throw error

    return NextResponse.json(transactions || [])
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    console.log('Transaction POST body:', body)

    const { account_id, category_id, type, amount, currency, notes, date, recurring, to_account_id, device_id } = body

    if (!account_id || !type || !amount || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate transfer has to_account_id
    if (type === 'transfer' && !to_account_id) {
      return NextResponse.json({ error: 'Transfer transactions must have a destination account' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const newTransaction = {
      user_id: user.id,
      account_id,
      category_id: category_id || null,
      type,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      notes: notes || '',
      date,
      cleared: false,
      recurring: recurring || false,
      to_account_id: to_account_id || null,
      deleted: false,
      device_id: device_id || null,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([newTransaction] as any)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
