# AI Features Integration

## Overview

This document describes the AI-powered features integrated into the Money Tracker application. All AI processing happens locally on the user's device for privacy and security.

## Features Implemented

### 1. Natural Language Processing (NLP) Quick Add

**Location:** Transaction Modal → Quick Add button

**Description:** Users can add transactions by typing in natural language instead of filling out forms.

**Examples:**

- "Spent $50 on groceries today"
- "Received $1000 salary on June 15"
- "Paid $120 for electricity bill"

**Implementation:**

- Component: `components/NLPInput.tsx`
- Library: `compromise` (NLP parsing)
- Integration: `components/TransactionsClient.tsx`

**How to Use:**

1. Open transaction modal (Add Transaction button)
2. Click "✨ Quick Add" button in modal header
3. Type natural language description
4. Review and edit parsed data in form view
5. Save transaction

### 2. Smart Category Suggestions

**Location:** Transaction Form → Below Notes field (auto-appears when notes are entered)

**Description:** AI automatically suggests the most appropriate category based on the transaction description.

**Implementation:**

- Component: `components/CategorySuggestion.tsx`
- Library: `@tensorflow/tfjs` (ML model for categorization)
- Integration: `components/TransactionsClient.tsx`

**How to Use:**

1. Open transaction modal
2. Enter description in the Notes field
3. Smart category suggestion appears automatically
4. Click suggestion to apply category

### 3. Receipt Scanner (OCR)

**Location:** Transaction Modal → Scan Receipt button

**Description:** Upload or capture a photo of a receipt to automatically extract transaction details.

**Implementation:**

- Component: `components/ReceiptScanner.tsx`
- Library: `tesseract.js` (OCR)
- Integration: `components/TransactionsClient.tsx`

**How to Use:**

1. Open transaction modal (Add Transaction button)
2. Click "📸 Scan Receipt" button in modal header
3. Upload receipt image or take photo
4. AI extracts amount, date, and merchant name
5. Review and edit extracted data
6. Save transaction

### 4. AI Insights Dashboard

**Location:** Dashboard → AI Insights tab

**Description:** Get personalized financial insights and recommendations based on spending patterns.

**Features:**

- Spending pattern analysis
- Anomaly detection (unusual transactions)
- Budget recommendations
- Savings opportunities
- Trend predictions

**Implementation:**

- Component: `components/InsightsDashboard.tsx`
- Library: `@tensorflow/tfjs` (pattern analysis)
- Integration: `components/DashboardClient.tsx`

**How to Use:**

1. Navigate to Dashboard page
2. Click "🤖 AI Insights" tab
3. View personalized insights and recommendations
4. Take action on suggestions

## Demo Page

A comprehensive demo page is available at `/ai-demo` to test all AI features independently before using them in production workflows.

## Privacy & Security

- ✅ All AI processing happens locally on device
- ✅ No data sent to external servers
- ✅ Models loaded on-demand for performance
- ✅ Works offline (PWA compatible)

## Technical Stack

### Libraries Used

| Library          | Purpose                       | Size   |
| ---------------- | ----------------------------- | ------ |
| compromise       | Natural language parsing      | ~200KB |
| tesseract.js     | Optical character recognition | ~2MB   |
| @tensorflow/tfjs | Machine learning models       | ~500KB |

### Model Training

- Category classification model trained on common transaction patterns
- Supports both income and expense categories
- Continuously improves with usage (local learning)

## Performance Considerations

- Models are lazy-loaded (only loaded when features are used)
- Processing happens asynchronously (non-blocking UI)
- Results cached for repeated similar inputs
- Optimized for mobile devices

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 14+)
- Mobile browsers: ✅ Optimized for touch

## Testing

Test each feature independently on the `/ai-demo` page before using in production.

### Test Scenarios

1. **NLP Quick Add:**

   - Simple expense: "Spent $20 on coffee"
   - Income: "Got paid $3000 salary"
   - With date: "Paid $50 for gas yesterday"

2. **Category Suggestions:**

   - "Starbucks coffee" → Food & Dining
   - "Shell gas station" → Transportation
   - "Salary payment" → Salary (Income)

3. **Receipt Scanner:**

   - Restaurant receipt
   - Gas station receipt
   - Grocery store receipt

4. **AI Insights:**
   - View with 1+ month of transaction history
   - Check anomaly detection
   - Review savings recommendations

## Future Enhancements

- [ ] Multi-language support for NLP
- [ ] Custom category training
- [ ] Voice input for transactions
- [ ] Recurring transaction detection
- [ ] Smart budget allocation
- [ ] Export AI insights as PDF reports

## Troubleshooting

### Issue: NLP not parsing correctly

**Solution:** Make sure to include amount with $ symbol and use common words

### Issue: Receipt scanner not extracting data

**Solution:** Ensure good lighting and receipt is clearly visible in photo

### Issue: Category suggestions not appearing

**Solution:** Type at least 3 words in the notes field

### Issue: AI Insights loading slowly

**Solution:** First load initializes models; subsequent loads are faster

## Support

For issues or questions about AI features, please check the main README.md or create an issue in the repository.
