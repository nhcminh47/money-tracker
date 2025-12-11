'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export interface DateRange {
  startDate: string
  endDate: string
}

export type DatePreset = 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'thisYear' | 'lastYear' | 'ytd' | 'custom'

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

export default function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const { t } = useTranslation()
  const [preset, setPreset] = useState<DatePreset>('thisMonth')
  const [showCustom, setShowCustom] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollability()
    window.addEventListener('resize', checkScrollability)
    return () => window.removeEventListener('resize', checkScrollability)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScrollability, 100)
    }
  }

  const getDateRange = (presetType: DatePreset): DateRange => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    switch (presetType) {
      case 'thisMonth':
        return {
          startDate: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0],
        }
      case 'lastMonth':
        return {
          startDate: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0],
        }
      case 'thisQuarter': {
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3
        return {
          startDate: new Date(currentYear, quarterStartMonth, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, quarterStartMonth + 3, 0).toISOString().split('T')[0],
        }
      }
      case 'lastQuarter': {
        const lastQuarterStartMonth = Math.floor(currentMonth / 3) * 3 - 3
        return {
          startDate: new Date(currentYear, lastQuarterStartMonth, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, lastQuarterStartMonth + 3, 0).toISOString().split('T')[0],
        }
      }
      case 'thisYear':
        return {
          startDate: new Date(currentYear, 0, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, 11, 31).toISOString().split('T')[0],
        }
      case 'lastYear':
        return {
          startDate: new Date(currentYear - 1, 0, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear - 1, 11, 31).toISOString().split('T')[0],
        }
      case 'ytd':
        return {
          startDate: new Date(currentYear, 0, 1).toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
        }
      default:
        return value
    }
  }

  const handlePresetChange = (presetType: DatePreset) => {
    setPreset(presetType)
    if (presetType === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      const range = getDateRange(presetType)
      onChange(range)
    }
  }

  const presets: { value: DatePreset; label: string }[] = [
    { value: 'thisMonth', label: t.reports.dateRange.thisMonth },
    { value: 'lastMonth', label: t.reports.dateRange.lastMonth },
    { value: 'thisQuarter', label: t.reports.dateRange.thisQuarter },
    { value: 'lastQuarter', label: t.reports.dateRange.lastQuarter },
    { value: 'thisYear', label: t.reports.dateRange.thisYear },
    { value: 'lastYear', label: t.reports.dateRange.lastYear },
    { value: 'ytd', label: t.reports.dateRange.ytd },
    { value: 'custom', label: t.reports.dateRange.custom },
  ]

  return (
    <div className={`bg-white rounded-card p-6 shadow-soft ${className}`}>
      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
        <Calendar
          size={20}
          className='text-coral-500'
        />
        {t.reports.dateRange.title}
      </h3>

      {/* Preset Buttons - Horizontal scrollable with navigation */}
      <div className='relative mb-4 -mx-6 px-6'>
        {/* Left Gradient Fade */}
        {canScrollLeft && (
          <div className='absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none' />
        )}

        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className='absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-md p-2 hover:bg-gray-50 transition-colors'
          >
            <ChevronLeft
              size={20}
              className='text-gray-700'
            />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className='overflow-x-auto scrollbar-hide'
        >
          <div className='flex gap-2 min-w-min'>
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePresetChange(p.value)}
                className={`px-4 py-2 rounded-button text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  preset === p.value ? 'bg-coral-500 text-white shadow-soft' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Gradient Fade */}
        {canScrollRight && (
          <div className='absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none' />
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className='absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-md p-2 hover:bg-gray-50 transition-colors'
          >
            <ChevronRight
              size={20}
              className='text-gray-700'
            />
          </button>
        )}
      </div>

      {/* Custom Date Inputs */}
      {showCustom && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>{t.reports.dateRange.startDate}</label>
            <input
              type='date'
              value={value.startDate}
              onChange={(e) =>
                onChange({
                  ...value,
                  startDate: e.target.value,
                })
              }
              className='w-full px-4 py-2 rounded-button border border-gray-300 focus:border-coral-500 focus:ring-2 focus:ring-coral-200 transition-all'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>{t.reports.dateRange.endDate}</label>
            <input
              type='date'
              value={value.endDate}
              onChange={(e) =>
                onChange({
                  ...value,
                  endDate: e.target.value,
                })
              }
              min={value.startDate}
              className='w-full px-4 py-2 rounded-button border border-gray-300 focus:border-coral-500 focus:ring-2 focus:ring-coral-200 transition-all'
            />
          </div>
        </div>
      )}
    </div>
  )
}
