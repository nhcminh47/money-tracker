/**
 * Natural Language Processing for transaction input
 * Uses Google Gemini AI for parsing natural language transactions
 */

interface ParsedTransaction {
  amount?: number
  type?: 'Expense' | 'Income' | 'Transfer'
  merchant?: string
  category?: string
  date?: Date
  notes?: string
}

interface GeminiResponse {
  amount: number
  type: 'Expense' | 'Income' | 'Transfer'
  merchant: string | null
  category: string | null
  date: string
  notes: string
}

/**
 * Parse natural language text into transaction data using Gemini AI
 *
 * Examples:
 * - "Spent $20 on coffee at Starbucks"
 * - "Paid $150 for groceries yesterday"
 * - "Received $1000 salary"
 * - "Transferred $500 to savings account"
 * - "I spent $20 for gasoline last friday"
 */
export async function parseNaturalLanguage(input: string): Promise<ParsedTransaction> {
  try {
    const response = await fetch('/api/ai/parse-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: input.trim() }),
    })

    if (!response.ok) {
      throw new Error('Failed to parse transaction')
    }

    const data: GeminiResponse = await response.json()

    return {
      amount: data.amount,
      type: data.type,
      merchant: data.merchant || undefined,
      category: data.category || undefined,
      date: data.date ? new Date(data.date) : new Date(),
      notes: data.notes || input,
    }
  } catch (error) {
    console.error('Error parsing natural language:', error)
    throw new Error('Could not parse transaction. Please try again.')
  }
}

/**
 * Validate parsed transaction
 */
export function validateParsedTransaction(parsed: ParsedTransaction): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!parsed.amount || parsed.amount <= 0) {
    errors.push('Could not extract amount from text')
  }

  if (!parsed.type) {
    errors.push('Could not determine transaction type')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Generate example phrases for user guidance
 */
export function getExamplePhrases(): string[] {
  return [
    'Spent $25 on lunch at Chipotle',
    'Paid $150 for groceries at Walmart',
    'Received $2000 salary',
    'Transferred $500 to savings',
    'Bought coffee for $5 yesterday',
    '$30 for gas at Shell',
  ]
}
