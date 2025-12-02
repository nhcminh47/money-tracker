/**
 * Natural Language Processing for transaction input
 * Parses natural language like "Spent $20 on coffee at Starbucks"
 */

import nlp from 'compromise';

interface ParsedTransaction {
  amount?: number;
  type?: 'Expense' | 'Income' | 'Transfer';
  merchant?: string;
  category?: string;
  date?: Date;
  notes?: string;
}

/**
 * Extract amount from text
 */
function extractAmount(doc: any): number | undefined {
  // Look for money amounts
  const money = doc.money();
  if (money.found) {
    const value = money.json()[0]?.number;
    if (value) {
      return parseFloat(value);
    }
  }
  
  // Fallback: look for numbers with currency symbols
  const text = doc.text();
  const patterns = [
    /\$\s*(\d+(?:[.,]\d{2})?)/,
    /(\d+(?:[.,]\d{2})?)\s*(?:dollars?|USD)/i,
    /€\s*(\d+(?:[.,]\d{2})?)/,
    /(\d+(?:[.,]\d{2})?)\s*(?:euros?|EUR)/i,
    /£\s*(\d+(?:[.,]\d{2})?)/,
    /(\d+(?:[.,]\d{2})?)\s*(?:pounds?|GBP)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', ''));
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  
  return undefined;
}

/**
 * Determine transaction type from text
 */
function extractType(text: string): 'Expense' | 'Income' | 'Transfer' {
  const lowerText = text.toLowerCase();
  
  // Income keywords
  const incomeKeywords = [
    'received', 'earned', 'salary', 'income', 'paycheck', 
    'refund', 'bonus', 'profit', 'dividend'
  ];
  
  // Transfer keywords
  const transferKeywords = [
    'transfer', 'moved', 'transferred', 'sent to account'
  ];
  
  // Expense keywords
  const expenseKeywords = [
    'spent', 'paid', 'bought', 'purchased', 'cost', 
    'expense', 'bill', 'charge'
  ];
  
  if (incomeKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'Income';
  }
  
  if (transferKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'Transfer';
  }
  
  // Default to expense
  return 'Expense';
}

/**
 * Extract merchant/payee from text
 */
function extractMerchant(doc: any, text: string): string | undefined {
  // Look for "at/from/to [place]" patterns
  const atMatch = text.match(/(?:at|from|to)\s+([A-Z][a-zA-Z\s&']+?)(?:\s+(?:on|for|$))/);
  if (atMatch && atMatch[1]) {
    return atMatch[1].trim();
  }
  
  // Look for proper nouns (organizations)
  const organizations = doc.organizations();
  if (organizations.found) {
    return organizations.json()[0]?.text;
  }
  
  // Look for places
  const places = doc.places();
  if (places.found) {
    return places.json()[0]?.text;
  }
  
  return undefined;
}

/**
 * Extract category hint from text
 */
function extractCategory(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  // Category keyword mappings
  const categoryKeywords: Record<string, string[]> = {
    'Food & Dining': ['food', 'lunch', 'dinner', 'breakfast', 'restaurant', 'coffee', 'grocery'],
    'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'transit'],
    'Shopping': ['shopping', 'clothes', 'amazon', 'store', 'mall'],
    'Entertainment': ['movie', 'cinema', 'concert', 'game', 'entertainment'],
    'Utilities': ['electric', 'water', 'gas bill', 'internet', 'phone', 'utility'],
    'Healthcare': ['doctor', 'hospital', 'pharmacy', 'medical', 'health'],
    'Housing': ['rent', 'mortgage', 'insurance'],
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return undefined;
}

/**
 * Extract date from text
 */
function extractDate(doc: any): Date | undefined {
  const dates = doc.dates();
  
  if (dates.found) {
    const dateData = dates.json()[0];
    if (dateData?.text) {
      const date = new Date(dateData.text);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  // Look for relative dates
  const text = doc.text().toLowerCase();
  const today = new Date();
  
  if (text.includes('today')) {
    return today;
  }
  
  if (text.includes('yesterday')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }
  
  return undefined;
}

/**
 * Parse natural language text into transaction data
 * 
 * Examples:
 * - "Spent $20 on coffee at Starbucks"
 * - "Paid $150 for groceries yesterday"
 * - "Received $1000 salary"
 * - "Transferred $500 to savings account"
 */
export function parseNaturalLanguage(input: string): ParsedTransaction {
  const doc = nlp(input);
  const text = input.trim();
  
  return {
    amount: extractAmount(doc),
    type: extractType(text),
    merchant: extractMerchant(doc, text),
    category: extractCategory(text),
    date: extractDate(doc) || new Date(),
    notes: text
  };
}

/**
 * Validate parsed transaction
 */
export function validateParsedTransaction(parsed: ParsedTransaction): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!parsed.amount || parsed.amount <= 0) {
    errors.push('Could not extract amount from text');
  }
  
  if (!parsed.type) {
    errors.push('Could not determine transaction type');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
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
  ];
}
