# AI Features Testing Guide

## Prerequisites

### Environment Setup

Before testing, ensure your `.env.local` file has valid Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Starting the Development Server

```bash
pnpm install
pnpm run dev
```

The app will be available at `http://localhost:3000`

## Testing Overview

All AI features have been integrated into the production UI:

- ✅ NLP Quick Add in Transaction Modal
- ✅ Smart Category Suggestions in Transaction Form
- ✅ Receipt Scanner in Transaction Modal
- ✅ AI Insights Dashboard Tab

## Test Scenarios

### 1. AI Demo Page (`/ai-demo`)

**Purpose:** Test all AI features independently before using in production

**Test Steps:**

1. Navigate to `http://localhost:3000/ai-demo`
2. Test each tab:

#### Tab 1: Natural Language

- Enter: "Spent $50 on groceries today"
- Expected: Parses amount ($50), type (Expense), date (today), category (groceries)
- Enter: "Received $1000 salary on June 15"
- Expected: Parses amount ($1000), type (Income), date (June 15)

#### Tab 2: Receipt Scanner

- Click "Choose File" or drag & drop a receipt image
- Test with different receipt types (restaurant, gas station, grocery)
- Expected: Extracts merchant name, amount, and date

#### Tab 3: Smart Categories

- Type: "Coffee at Starbucks"
- Expected: Suggests "Food & Dining" or similar category
- Type: "Gas station fill up"
- Expected: Suggests "Transportation" category

#### Tab 4: AI Insights

- Expected: Shows spending analysis, anomalies, and recommendations
- Note: Requires transaction history to generate insights

---

### 2. Transaction Modal - NLP Quick Add

**Location:** Transactions page → Add Transaction button → Quick Add button

**Test Steps:**

1. Navigate to `/transactions`
2. Click "Add Transaction" button
3. Click "✨ Quick Add" button in modal header
4. Enter natural language text

**Test Cases:**

| Input                                 | Expected Behavior                              |
| ------------------------------------- | ---------------------------------------------- |
| "Spent $20 on coffee"                 | Amount: $20, Type: Expense, Notes: "on coffee" |
| "Got paid $3000 salary"               | Amount: $3000, Type: Income, Notes: "salary"   |
| "Paid $50 for gas yesterday"          | Amount: $50, Type: Expense, Date: Yesterday    |
| "Received $100 from friend on July 1" | Amount: $100, Type: Income, Date: July 1       |

**Verification:**

- [ ] NLP parses amount correctly
- [ ] Type (Income/Expense) detected
- [ ] Date parsed when mentioned
- [ ] Form pre-fills with parsed data
- [ ] Can edit parsed data before saving
- [ ] Switch back to regular form works

---

### 3. Transaction Modal - Receipt Scanner

**Location:** Transactions page → Add Transaction button → Scan Receipt button

**Test Steps:**

1. Navigate to `/transactions`
2. Click "Add Transaction" button
3. Click "📸 Scan Receipt" button in modal header
4. Upload a receipt image or take photo

**Test Cases:**

- Restaurant receipt (should extract: merchant, amount, date)
- Gas station receipt (should extract: merchant, amount, date)
- Grocery store receipt (should extract: merchant, amount, date)

**Verification:**

- [ ] Receipt upload interface appears
- [ ] OCR processing starts
- [ ] Merchant name extracted
- [ ] Amount extracted
- [ ] Date extracted (if visible on receipt)
- [ ] Form pre-fills with extracted data
- [ ] Can edit data before saving
- [ ] "Back to Form" button works

**Tips for Best Results:**

- Use well-lit, clear photos
- Ensure receipt text is readable
- Printed receipts work better than thermal receipts

---

### 4. Transaction Form - Smart Category Suggestions

**Location:** Transactions page → Add Transaction → Notes field

**Test Steps:**

1. Navigate to `/transactions`
2. Click "Add Transaction" button
3. Fill in transaction details
4. Type description in "Notes" field

**Test Cases:**

| Description                   | Expected Category Suggestion |
| ----------------------------- | ---------------------------- |
| "Coffee at Starbucks"         | Food & Dining                |
| "Gas at Shell station"        | Transportation               |
| "Rent payment"                | Housing                      |
| "Netflix subscription"        | Entertainment                |
| "Grocery shopping at Walmart" | Groceries                    |
| "Doctor appointment"          | Healthcare                   |
| "Monthly salary"              | Salary (Income)              |

**Verification:**

- [ ] Suggestion appears after typing 3+ words
- [ ] Confidence level shown
- [ ] One-click to apply suggestion
- [ ] Can dismiss and continue manually
- [ ] Works for both Income and Expense types
- [ ] Updates when description changes

---

### 5. Dashboard - AI Insights Tab

**Location:** Dashboard page → AI Insights tab

**Test Steps:**

1. Navigate to `/` (Dashboard)
2. Click "🤖 AI Insights" tab
3. Review insights

**Expected Insights:**

- **Spending Patterns:** Top categories, trends over time
- **Anomaly Detection:** Unusual transactions highlighted
- **Budget Recommendations:** Suggested budgets based on history
- **Savings Opportunities:** Areas to reduce spending
- **Trend Predictions:** Forecasted spending for next month

**Verification:**

- [ ] Tab navigation works
- [ ] Insights load without errors
- [ ] Charts/graphs display correctly
- [ ] Recommendations are relevant
- [ ] "Privacy-first" message displayed
- [ ] Works with limited transaction history

**Note:** More accurate insights with 1+ month of transaction data

---

## Integration Testing

### End-to-End Workflow Tests

#### Scenario 1: Quick Add with NLP

1. Open transaction modal
2. Use NLP Quick Add: "Spent $45 on dinner at restaurant"
3. Review parsed data (should show $45, Expense, "dinner at restaurant")
4. Check category suggestion (should suggest Food & Dining)
5. Accept suggestion or modify
6. Save transaction
7. Verify transaction appears in list

#### Scenario 2: Receipt Scanner Workflow

1. Open transaction modal
2. Click Scan Receipt
3. Upload restaurant receipt
4. Verify extracted data (merchant, amount, date)
5. Category suggestion should appear based on merchant
6. Accept or modify
7. Save transaction
8. Verify in transaction list

#### Scenario 3: Manual Entry with AI Assist

1. Open transaction modal
2. Use regular form
3. Type description in Notes: "Bought coffee at Cafe"
4. Smart category suggestion appears
5. Click to apply suggestion
6. Complete other fields
7. Save transaction
8. Check Dashboard AI Insights for updated patterns

---

## Performance Testing

### Loading Times

- [ ] NLP parsing: < 500ms
- [ ] Category suggestion: < 1 second
- [ ] Receipt OCR: < 5 seconds (depends on image size)
- [ ] AI Insights loading: < 2 seconds

### Resource Usage

- Models lazy-load (only when features are used)
- Browser memory stays under 200MB
- No blocking of UI during AI processing

---

## Browser Compatibility Testing

Test all features in:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (iOS 14+)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## Error Handling Testing

### Network Errors

- [ ] Test offline mode (PWA)
- [ ] Verify graceful degradation without internet
- [ ] Local AI models still work offline

### Invalid Inputs

- [ ] NLP with gibberish text
- [ ] Receipt scanner with non-receipt image
- [ ] Category suggestion with empty description

### Edge Cases

- [ ] Very long descriptions (200+ characters)
- [ ] Special characters in input
- [ ] Multiple currencies mentioned
- [ ] Ambiguous dates ("last Friday")

---

## Known Limitations

1. **NLP Quick Add:**

   - English language only
   - Requires explicit amount mention ("$50" not "fifty dollars")
   - Date parsing limited to common formats

2. **Receipt Scanner:**

   - Works best with printed receipts
   - Thermal receipts may fade and be unreadable
   - Requires good lighting/image quality
   - May not extract all fields from every receipt

3. **Category Suggestions:**

   - Requires 3+ words for best accuracy
   - Initial suggestions improve with usage
   - May not recognize very specific merchants

4. **AI Insights:**
   - Requires minimum 10 transactions for patterns
   - More accurate with 30+ days of data
   - Predictions based on historical patterns only

---

## Troubleshooting

### Issue: NLP not parsing correctly

**Solution:**

- Include $ symbol with amount
- Use common words (spent, paid, received, got)
- Mention date explicitly if not today

### Issue: Receipt scanner not working

**Solution:**

- Check browser camera permissions
- Ensure good lighting
- Use printed receipts when possible
- Try different angle/distance

### Issue: No category suggestions

**Solution:**

- Type at least 3 words
- Use descriptive words (merchant names, activity)
- Check transaction type is set correctly

### Issue: AI Insights empty

**Solution:**

- Add more transaction history (10+ transactions)
- Ensure transactions span multiple days
- Check that categories are assigned

### Issue: Slow performance

**Solution:**

- First load initializes models (one-time delay)
- Close unused browser tabs
- Clear browser cache
- Update browser to latest version

---

## Reporting Issues

When reporting bugs, please include:

- Browser and version
- Screenshot or screen recording
- Steps to reproduce
- Expected vs actual behavior
- Console errors (F12 → Console tab)

---

## Success Criteria

All AI features should:

- ✅ Load without errors
- ✅ Process inputs within expected time
- ✅ Provide accurate results (>80% accuracy)
- ✅ Work offline (PWA mode)
- ✅ Not block UI during processing
- ✅ Gracefully handle errors
- ✅ Work on mobile devices

---

## Next Steps

After successful testing:

1. Deploy to staging environment
2. Test with real production data
3. Monitor user feedback
4. Iterate on accuracy improvements
5. Consider additional AI features

---

## Quick Test Checklist

- [ ] Visit `/ai-demo` and test all 4 tabs
- [ ] Add transaction using NLP Quick Add
- [ ] Add transaction using Receipt Scanner
- [ ] Verify category suggestions appear
- [ ] Check AI Insights on Dashboard
- [ ] Test on mobile device
- [ ] Test offline functionality
- [ ] Verify no console errors
