'use client'

import { CategorySuggestion } from '@/components/CategorySuggestion'
import { InsightsDashboard } from '@/components/InsightsDashboard'
import AppLayout from '@/components/layouts/AppLayout'
import { NLPInput } from '@/components/NLPInput'
import { ReceiptScanner } from '@/components/ReceiptScanner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Brain, Camera, Sparkles, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function AIDemoPage() {
  const [activeTab, setActiveTab] = useState<'nlp' | 'ocr' | 'category' | 'insights'>('nlp')
  const [testDescription, setTestDescription] = useState('Coffee at Starbucks')

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className='max-w-6xl mx-auto p-6 space-y-6'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <h1 className='text-3xl font-bold text-gray-900'>🤖 AI Features Demo</h1>
            <p className='text-gray-600'>Test all AI-powered features in your money tracker</p>
          </div>

          {/* Tabs */}
          <div className='flex gap-2 overflow-x-auto pb-2'>
            <Button
              variant={activeTab === 'nlp' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('nlp')}
            >
              <Sparkles className='w-4 h-4 mr-2' />
              Natural Language
            </Button>
            <Button
              variant={activeTab === 'ocr' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('ocr')}
            >
              <Camera className='w-4 h-4 mr-2' />
              Receipt Scanner
            </Button>
            <Button
              variant={activeTab === 'category' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('category')}
            >
              <Brain className='w-4 h-4 mr-2' />
              Smart Categories
            </Button>
            <Button
              variant={activeTab === 'insights' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('insights')}
            >
              <TrendingUp className='w-4 h-4 mr-2' />
              AI Insights
            </Button>
          </div>

          {/* Content */}
          <Card>
            {activeTab === 'nlp' && (
              <div className='space-y-4'>
                <div>
                  <h2 className='text-xl font-semibold mb-2'>💬 Natural Language Processing</h2>
                  <p className='text-gray-600 text-sm mb-4'>Type a transaction in plain English and watch AI parse it automatically.</p>
                </div>

                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2'>
                  <p className='text-sm font-medium text-blue-900'>Try these examples:</p>
                  <ul className='text-sm text-blue-700 space-y-1'>
                    <li>• "Spent $50 on groceries at Walmart"</li>
                    <li>• "Earned $2000 salary payment"</li>
                    <li>• "Paid $80 for dinner at restaurant"</li>
                    <li>• "Transfer $500 to savings"</li>
                  </ul>
                </div>

                <NLPInput
                  onParsed={(data) => {
                    console.log('Parsed transaction:', data)
                    alert(
                      `✅ Parsed successfully!\n\nAmount: $${data.amount}\nType: ${data.type}\nMerchant: ${
                        data.merchant || 'N/A'
                      }\nCategory: ${data.category || 'N/A'}`,
                    )
                  }}
                />
              </div>
            )}

            {activeTab === 'ocr' && (
              <div className='space-y-4'>
                <div>
                  <h2 className='text-xl font-semibold mb-2'>📸 Receipt Scanner (OCR)</h2>
                  <p className='text-gray-600 text-sm mb-4'>Upload a receipt photo and AI will extract the merchant, amount, and items.</p>
                </div>

                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <p className='text-sm text-green-700'>
                    <strong>Tip:</strong> Use a clear, well-lit photo for best results. The AI works better with printed receipts.
                  </p>
                </div>

                <ReceiptScanner
                  onScanned={(data) => {
                    console.log('Scanned receipt:', data)
                    alert(
                      `✅ Receipt scanned!\n\nMerchant: ${data.merchant || 'Unknown'}\nAmount: $${data.amount || 'N/A'}\nDate: ${
                        data.date || 'N/A'
                      }`,
                    )
                  }}
                />
              </div>
            )}

            {activeTab === 'category' && (
              <div className='space-y-4'>
                <div>
                  <h2 className='text-xl font-semibold mb-2'>🧠 Smart Category Suggestions</h2>
                  <p className='text-gray-600 text-sm mb-4'>AI learns from your transaction history to suggest the right category.</p>
                </div>

                <div className='space-y-3'>
                  <label className='block text-sm font-medium text-gray-700'>Test Description:</label>
                  <input
                    type='text'
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='e.g., Coffee at Starbucks'
                  />
                </div>

                <CategorySuggestion
                  description={testDescription}
                  onSelect={(categoryId: string) => {
                    console.log('Accepted category:', categoryId)
                    alert(`✅ Category selected: ${categoryId}`)
                  }}
                />

                <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
                  <p className='text-sm text-purple-700'>
                    <strong>Note:</strong> The AI needs at least 10 transactions to start learning patterns. Try different descriptions!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className='space-y-4'>
                <div>
                  <h2 className='text-xl font-semibold mb-2'>📊 AI-Powered Insights</h2>
                  <p className='text-gray-600 text-sm mb-4'>
                    Analyze your spending patterns, trends, and get personalized budget recommendations.
                  </p>
                </div>

                <InsightsDashboard />
              </div>
            )}
          </Card>

          {/* Info Box */}
          <Card className='bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'>
            <div className='flex items-start gap-3'>
              <Sparkles className='w-5 h-5 text-purple-600 mt-1' />
              <div>
                <h3 className='font-semibold text-gray-900'>Privacy First AI</h3>
                <p className='text-sm text-gray-600 mt-1'>
                  All AI features run 100% locally in your browser. No data is sent to external servers. Your financial data stays private
                  and secure.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
