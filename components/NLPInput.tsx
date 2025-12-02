'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { parseNaturalLanguage, validateParsedTransaction, getExamplePhrases } from '@/lib/ai/nlp';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Sparkles, HelpCircle } from 'lucide-react';

interface NLPInputProps {
  onParsed: (data: {
    amount: number;
    type: 'Expense' | 'Income' | 'Transfer';
    notes: string;
    merchant?: string;
    category?: string;
    date?: Date;
  }) => void;
}

export function NLPInput({ onParsed }: NLPInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [error, setError] = useState('');

  const handleParse = () => {
    if (!input.trim()) {
      setError('Please enter a transaction description');
      return;
    }

    const parsed = parseNaturalLanguage(input);
    const validation = validateParsedTransaction(parsed);

    if (!validation.isValid) {
      setError(validation.errors.join('. '));
      return;
    }

    if (parsed.amount) {
      onParsed({
        amount: parsed.amount,
        type: parsed.type || 'Expense',
        notes: parsed.notes || input,
        merchant: parsed.merchant,
        category: parsed.category,
        date: parsed.date
      });
      setInput('');
      setError('');
    }
  };

  const examples = getExamplePhrases();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-medium text-gray-900">{t.ai.naturalLanguage}</h3>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="ml-auto text-gray-500 hover:text-gray-700"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {showExamples && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-purple-900">{t.ai.examples}:</p>
          <ul className="text-xs text-purple-700 space-y-1">
            {examples.map((example, i) => (
              <li 
                key={i} 
                className="cursor-pointer hover:text-purple-900"
                onClick={() => setInput(example)}
              >
                • {example}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          placeholder={t.ai.nlpPlaceholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleParse();
            }
          }}
        />
        <Button onClick={handleParse} className="whitespace-nowrap">
          <Sparkles className="w-4 h-4 mr-1" />
          {t.ai.parseTransaction}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
