import { getServerUser, getSupabaseServerClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid input: text is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    // Fetch categories using the same approach as the categories API
    const user = await getServerUser()
    const supabase = await getSupabaseServerClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', user.id)
      .order('name', { ascending: true })
      .returns<Array<{ name: string }>>()

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    console.log('Categories query result:', {
      userId: user.id,
      categoriesCount: categories?.length || 0,
      categories: categories,
    })

    const categoryNames = categories && categories.length > 0 ? categories.map((c) => c.name).join(', ') : ''

    const prompt = `You are a financial transaction parser. Parse the following natural language transaction into structured JSON.

Transaction: "${text}"

Today's date is: ${new Date().toISOString().split('T')[0]}

Available categories: ${categoryNames}

Return ONLY a valid JSON object with this exact structure:
{
  "amount": number (extracted monetary value, just the number),
  "type": "Expense" | "Income" | "Transfer" (determine from context),
  "merchant": string or null (business/person name),
  "category": string or null (match one of the available categories listed above, or null if none match),
  "date": string (ISO date format YYYY-MM-DD, interpret relative dates like "yesterday", "last friday"),
  "notes": string (original text or extracted description)
}

Rules:
- Extract the exact amount mentioned
- For "Expense": keywords like spent, paid, bought, purchased, cost
- For "Income": keywords like received, earned, salary, bonus
- For "Transfer": keywords like transferred, moved
- Interpret relative dates correctly (yesterday = previous day, last friday = most recent friday before today)
- Return null for fields that cannot be determined
- Do NOT include any markdown, explanations, or text outside the JSON object`

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    })
    const textResponse = result.text

    if (!textResponse) {
      return NextResponse.json({ error: 'No response from AI model' }, { status: 500 })
    }

    // Clean up response - remove markdown code blocks if present
    let jsonText = textResponse.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?$/g, '')
        .trim()
    }

    const parsed = JSON.parse(jsonText)

    // Validate the response structure
    if (typeof parsed.amount !== 'number' || !parsed.type) {
      return NextResponse.json({ error: 'Invalid response from AI model' }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Error parsing transaction:', error)
    return NextResponse.json(
      { error: 'Failed to parse transaction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
