/**
 * OCR service for receipt scanning using Tesseract.js
 * Extracts merchant, amount, date, and items from receipt images
 */

import { createWorker, Worker } from 'tesseract.js';

interface ReceiptData {
  merchant?: string;
  amount?: number;
  currency?: string;
  date?: Date;
  items?: Array<{
    name: string;
    price: number;
  }>;
  rawText: string;
}

let worker: Worker | null = null;

/**
 * Initialize Tesseract worker
 */
async function getWorker(): Promise<Worker> {
  if (!worker) {
    worker = await createWorker('eng');
  }
  return worker;
}

/**
 * Extract text from image using OCR
 */
async function extractText(imageData: string | File | Blob): Promise<string> {
  const w = await getWorker();
  const { data: { text } } = await w.recognize(imageData);
  return text;
}

/**
 * Parse amount from text (supports various formats)
 */
function parseAmount(text: string): number | undefined {
  // Common patterns for amounts
  const patterns = [
    /total[:\s]*\$?(\d+[.,]\d{2})/i,
    /amount[:\s]*\$?(\d+[.,]\d{2})/i,
    /\$\s*(\d+[.,]\d{2})/,
    /(\d+[.,]\d{2})\s*USD/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  
  return undefined;
}

/**
 * Parse merchant name from text
 */
function parseMerchant(text: string): string | undefined {
  // Usually the merchant name is at the top of the receipt
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length > 0) {
    // Take first non-empty line as merchant
    const firstLine = lines[0].trim();
    
    // Filter out common receipt headers
    const excludePatterns = ['receipt', 'invoice', 'bill', 'tax', 'date'];
    const isExcluded = excludePatterns.some(pattern => 
      firstLine.toLowerCase().includes(pattern)
    );
    
    if (!isExcluded && firstLine.length > 2 && firstLine.length < 50) {
      return firstLine;
    }
  }
  
  return undefined;
}

/**
 * Parse date from text
 */
function parseDate(text: string): Date | undefined {
  // Common date patterns
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,  // MM/DD/YYYY or DD/MM/YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,    // YYYY/MM/DD
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Try parsing as Date
        const dateStr = match[0];
        const date = new Date(dateStr);
        
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        // Continue to next pattern
      }
    }
  }
  
  return undefined;
}

/**
 * Parse line items from receipt text
 */
function parseItems(text: string): Array<{ name: string; price: number }> {
  const items: Array<{ name: string; price: number }> = [];
  const lines = text.split('\n');
  
  // Pattern: item name followed by price
  const itemPattern = /^(.+?)\s+\$?(\d+[.,]\d{2})$/;
  
  lines.forEach(line => {
    const match = line.trim().match(itemPattern);
    if (match) {
      const name = match[1].trim();
      const price = parseFloat(match[2].replace(',', '.'));
      
      // Filter out totals and subtotals
      const excludeTerms = ['total', 'subtotal', 'tax', 'amount', 'balance'];
      const isExcluded = excludeTerms.some(term => 
        name.toLowerCase().includes(term)
      );
      
      if (!isExcluded && !isNaN(price) && price > 0) {
        items.push({ name, price });
      }
    }
  });
  
  return items;
}

/**
 * Scan receipt image and extract transaction data
 */
export async function scanReceipt(imageData: string | File | Blob): Promise<ReceiptData> {
  try {
    // Extract text from image
    const rawText = await extractText(imageData);
    
    // Parse various fields
    const merchant = parseMerchant(rawText);
    const amount = parseAmount(rawText);
    const date = parseDate(rawText);
    const items = parseItems(rawText);
    
    // Detect currency (default to USD)
    const currency = rawText.match(/USD|EUR|GBP|VND|JPY/i)?.[0] || 'USD';
    
    return {
      merchant,
      amount,
      currency,
      date,
      items,
      rawText
    };
  } catch (error) {
    console.error('Error scanning receipt:', error);
    throw new Error('Failed to scan receipt. Please try again.');
  }
}

/**
 * Cleanup worker when no longer needed
 */
export async function cleanupOCR(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
