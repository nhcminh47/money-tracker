'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { suggestCategory, recordCategoryFeedback } from '@/lib/ai/categorization';
import { Sparkles, Check, X } from 'lucide-react';

interface CategorySuggestionProps {
  description: string;
  onAccept: (categoryId: string) => void;
}

export function CategorySuggestion({ description, onAccept }: CategorySuggestionProps) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<Array<{
    categoryId: string;
    categoryName: string;
    confidence: number;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (description && description.length > 2) {
      loadSuggestions();
    }
  }, [description]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const results = await suggestCategory(description);
      setSuggestions(results);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (categoryId: string) => {
    recordCategoryFeedback(description, categoryId, categoryId, true);
    onAccept(categoryId);
    setSuggestions([]);
  };

  const handleReject = (categoryId: string) => {
    recordCategoryFeedback(description, categoryId, '', false);
    setSuggestions(suggestions.filter(s => s.categoryId !== categoryId));
  };

  if (!suggestions.length && !loading) {
    return null;
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-medium text-purple-900">
          {t.ai.suggestedCategories}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-purple-700">{t.ai.processing}</p>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.categoryId}
              className="flex items-center justify-between bg-white rounded-md p-2"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {suggestion.categoryName}
                </p>
                <p className="text-xs text-gray-500">
                  {t.ai.confidence}: {(suggestion.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleAccept(suggestion.categoryId)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title={t.ai.acceptSuggestion}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReject(suggestion.categoryId)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title={t.ai.rejectSuggestion}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
