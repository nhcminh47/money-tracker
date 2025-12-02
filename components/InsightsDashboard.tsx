'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { 
  generateInsights, 
  getSpendingTrends, 
  getTopSpendingCategories,
  getMonthlyComparison,
  generateBudgetRecommendations 
} from '@/lib/ai/insights';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TrendingUp, TrendingDown, Lightbulb, Target, Loader } from 'lucide-react';

export function InsightsDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [budgetRecommendations, setBudgetRecommendations] = useState<any[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [insightsData, trendsData, topCategoriesData, budgetRecs] = await Promise.all([
        generateInsights(),
        getSpendingTrends(),
        getTopSpendingCategories(5),
        generateBudgetRecommendations()
      ]);

      setInsights(insightsData);
      setTrends(trendsData.slice(0, 5));
      setTopCategories(topCategoriesData);
      setBudgetRecommendations(budgetRecs.slice(0, 5));
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">AI Insights</h3>
            <Button 
              onClick={loadInsights} 
              size="sm" 
              variant="secondary"
              className="ml-auto"
            >
              Refresh
            </Button>
          </div>
          
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg"
              >
                <p className="text-sm text-gray-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Spending Trends */}
      {trends.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
            <div className="space-y-3">
              {trends.map((trend) => (
                <div key={trend.categoryId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {trend.change > 0 ? (
                      <TrendingUp className="w-5 h-5 text-red-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{trend.categoryName}</p>
                      <p className="text-xs text-gray-500">
                        ${trend.previousMonth.toFixed(2)} → ${trend.currentMonth.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${trend.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {trend.change > 0 ? '+' : ''}{trend.changePercent.toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      ${Math.abs(trend.change).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Top Spending Categories */}
      {topCategories.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Spending This Month</h3>
            <div className="space-y-3">
              {topCategories.map((category) => (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {category.categoryName}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      ${category.totalSpent.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(category.percentOfTotal, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {category.percentOfTotal.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {category.transactionCount} transactions · Avg: ${category.avgPerTransaction.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Budget Recommendations */}
      {budgetRecommendations.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold">Suggested Budgets</h3>
            </div>
            <div className="space-y-3">
              {budgetRecommendations.map((rec) => (
                <div key={rec.categoryId} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{rec.categoryName}</span>
                    <span className="text-lg font-bold text-green-600">
                      ${rec.suggestedAmount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
