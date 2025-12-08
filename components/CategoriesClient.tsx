'use client'

import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ResponsiveSelect } from '@/components/ui/ResponsiveSelect'
import { Toast } from '@/components/ui/Toast'
import { seedCategories } from '@/lib/db/utils'
import { useTranslation } from '@/lib/i18n/useTranslation'
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryStats,
  updateCategory,
  type Category,
} from '@/lib/services/categories'
import { formatCurrency, getSettings, type AppSettings } from '@/lib/services/settings'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const PRESET_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#f97316',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#f43f5e',
  '#64748b',
  '#6b7280',
]

const PRESET_ICONS = [
  '🍔',
  '🛍️',
  '🚗',
  '💡',
  '🎬',
  '⚕️',
  '📦',
  '💰',
  '💼',
  '📈',
  '💵',
  '🏠',
  '✈️',
  '🎓',
  '🎮',
  '📱',
  '👕',
  '⚽',
  '🎨',
  '📚',
  '🍺',
  '☕',
]

export default function CategoriesClient() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: PRESET_COLORS[0],
    icon: PRESET_ICONS[0],
    parentId: null as string | null,
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [stats, setStats] = useState<Record<string, { transactionCount: number; totalAmount: number }>>({})

  useEffect(() => {
    const supabase = createClient()

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        console.log('Category change detected')
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(categoriesChannel)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      await seedCategories()
      const [cats, appSettings] = await Promise.all([getAllCategories(), getSettings()])
      setCategories(cats)
      setSettings(appSettings)

      // Load stats for each category
      const statsMap: Record<string, { transactionCount: number; totalAmount: number }> = {}
      await Promise.all(
        cats.map(async (cat) => {
          statsMap[cat.id] = await getCategoryStats(cat.id)
        }),
      )
      setStats(statsMap)
    } catch (error) {
      console.error('Failed to load categories:', error)
      showToast('Failed to load categories', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  function openCreateModal() {
    setEditingCategory(null)
    setFormData({
      name: '',
      type: 'expense',
      color: PRESET_COLORS[0],
      icon: PRESET_ICONS[0],
      parentId: null,
    })
    setIsModalOpen(true)
  }

  function openEditModal(category: Category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      parentId: category.parentId,
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      showToast('Please enter a category name', 'error')
      return
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
        showToast('Category updated successfully', 'success')
      } else {
        await createCategory(formData)
        showToast('Category created successfully', 'success')
      }
      setIsModalOpen(false)
      loadData()
    } catch (error) {
      console.error('Failed to save category:', error)
      showToast('Failed to save category', 'error')
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${t.categories?.deleteConfirm || 'Are you sure you want to delete'} "${name}"?`)) {
      return
    }

    try {
      await deleteCategory(id)
      showToast('Category deleted successfully', 'success')
      loadData()
    } catch (error) {
      console.error('Failed to delete category:', error)
      showToast((error as Error).message || 'Failed to delete category', 'error')
    }
  }

  const filteredCategories = categories.filter((cat) => {
    if (filterType === 'all') return true
    return cat.type === filterType
  })

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>{t.common?.loading || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title={t.categories?.title || 'Categories'}
        description='Organize your transactions with categories'
      />

      <div className='flex items-center justify-between'>
        <div className='text-sm text-gray-600'>
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </div>
        <Button
          onClick={openCreateModal}
          className='hidden md:inline-flex'
        >
          {t.categories?.createCategory || 'Add Category'}
        </Button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={openCreateModal}
        className='md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-coral-400 hover:bg-coral-500 text-white rounded-full shadow-button hover:shadow-card flex items-center justify-center transition-all active:scale-95'
        aria-label={t.categories?.createCategory || 'Add Category'}
      >
        <span className='text-2xl'>+</span>
      </button>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Card>
          <div className='space-y-1'>
            <p className='text-sm text-gray-500'>{t.categories?.totalCategories || 'Total Categories'}</p>
            <p className='text-2xl font-bold text-gray-900'>{categories.length}</p>
          </div>
        </Card>
        <Card>
          <div className='space-y-1'>
            <p className='text-sm text-gray-500'>{t.categories?.incomeCategories || 'Income Categories'}</p>
            <p className='text-2xl font-bold text-green-600'>{incomeCategories.length}</p>
          </div>
        </Card>
        <Card>
          <div className='space-y-1'>
            <p className='text-sm text-gray-500'>{t.categories?.expenseCategories || 'Expense Categories'}</p>
            <p className='text-2xl font-bold text-red-600'>{expenseCategories.length}</p>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className='flex gap-2'>
          <Button
            variant={filterType === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilterType('all')}
          >
            {t.categories?.all || 'All'}
          </Button>
          <Button
            variant={filterType === 'income' ? 'primary' : 'secondary'}
            onClick={() => setFilterType('income')}
          >
            {t.categories?.income || 'Income'}
          </Button>
          <Button
            variant={filterType === 'expense' ? 'primary' : 'secondary'}
            onClick={() => setFilterType('expense')}
          >
            {t.categories?.expense || 'Expense'}
          </Button>
        </div>
      </Card>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card>
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg mb-4'>{t.categories?.noCategories || 'No categories yet'}</p>
            <Button onClick={openCreateModal}>{t.categories?.addFirstCategory || 'Add Your First Category'}</Button>
          </div>
        </Card>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className='hover:shadow-md transition-shadow'
            >
              <div className='space-y-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-12 h-12 rounded-lg flex items-center justify-center text-2xl'
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <h3 className='font-medium text-gray-900'>{category.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.type === 'income' ? t.categories?.income || 'income' : t.categories?.expense || 'expense'}
                      </span>
                    </div>
                  </div>
                </div>

                {stats[category.id] && (
                  <div className='text-sm text-gray-600 space-y-1'>
                    <p>
                      {stats[category.id].transactionCount} {t.categories?.transactions || 'transactions'}
                    </p>
                    <p className='font-medium'>{formatCurrency(stats[category.id].totalAmount, settings?.currency)}</p>
                  </div>
                )}

                <div className='flex gap-2 pt-2 border-t border-gray-200'>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => openEditModal(category)}
                    className='flex-1'
                  >
                    {t.common?.edit || 'Edit'}
                  </Button>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => handleDelete(category.id, category.name)}
                    className='flex-1'
                  >
                    {t.common?.delete || 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? t.categories?.editCategory || 'Edit Category' : t.categories?.createCategory || 'Add Category'}
      >
        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <Input
            key='category-name'
            type='text'
            label={t.categories?.categoryName || 'Category Name'}
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <ResponsiveSelect
            key='category-type'
            label={t.categories?.type || 'Type'}
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense' })}
            options={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]}
          />

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>{t.categories?.color || 'Color'}</label>
            <div className='grid grid-cols-8 gap-2'>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type='button'
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    formData.color === color ? 'border-coral-500 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>{t.categories?.icon || 'Icon'}</label>
            <div className='grid grid-cols-11 gap-2'>
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type='button'
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${
                    formData.icon === icon ? 'border-coral-500 scale-110 bg-coral-50' : 'border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className='flex gap-3 pt-4'>
            <Button
              type='submit'
              className='flex-1'
            >
              {editingCategory ? t.common?.update || 'Update Category' : t.common?.add || 'Add Category'}
            </Button>
            <Button
              type='button'
              variant='secondary'
              onClick={() => setIsModalOpen(false)}
              className='flex-1'
            >
              {t.common?.cancel || 'Cancel'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
