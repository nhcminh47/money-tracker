'use client'

import { getExamplePhrases, parseNaturalLanguage, validateParsedTransaction } from '@/lib/ai/nlp'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { HelpCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface NLPInputProps {
  onParsed: (data: {
    amount: number
    type: 'Expense' | 'Income' | 'Transfer'
    notes: string
    merchant?: string
    category?: string
    date?: Date
  }) => void
}

export function NLPInput({ onParsed }: NLPInputProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [error, setError] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const handleParse = async () => {
    if (!input.trim()) {
      setError('Please enter a transaction description')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const parsed = await parseNaturalLanguage(input)
      const validation = validateParsedTransaction(parsed)

      if (!validation.isValid) {
        setError(validation.errors.join('. '))
        setIsLoading(false)
        return
      }

      if (parsed.amount) {
        onParsed({
          amount: parsed.amount,
          type: parsed.type || 'Expense',
          notes: parsed.notes || input,
          merchant: parsed.merchant,
          category: parsed.category,
          date: parsed.date,
        })
        setInput('')
        setError('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const examples = getExamplePhrases()

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 mb-2'>
        <Sparkles className='w-5 h-5 text-coral-500' />
        <h3 className='font-medium text-gray-900'>{t.ai.naturalLanguage}</h3>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className='ml-auto text-gray-500 hover:text-gray-700'
        >
          <HelpCircle className='w-4 h-4' />
        </button>
      </div>

      {showExamples && (
        <div className='bg-coral-50 border border-coral-200 rounded-lg p-3 space-y-2'>
          <p className='text-sm font-medium text-coral-900'>{t.ai.examples}:</p>
          <ul className='text-xs text-coral-700 space-y-1'>
            {examples.map((example, i) => (
              <li
                key={i}
                className='cursor-pointer hover:text-coral-900'
                onClick={() => setInput(example)}
              >
                • {example}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className='flex gap-2'>
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError('')
          }}
          placeholder={t.ai.nlpPlaceholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleParse()
            }
          }}
        />
        <Button
          onClick={handleParse}
          disabled={isLoading}
          className='whitespace-nowrap'
        >
          <Sparkles className='w-4 h-4 mr-1' />
          {isLoading ? 'Parsing...' : t.ai.parseTransaction}
        </Button>
      </div>

      {error && <p className='text-sm text-red-600'>{error}</p>}
    </div>
  )
}
