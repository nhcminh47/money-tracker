'use client'

import { ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <button
      onClick={scrollToTop}
      className='md:hidden fixed bottom-32 right-4 z-40 w-12 h-12 bg-white rounded-full shadow-card hover:shadow-card-hover flex items-center justify-center transition-all hover:scale-105 active:scale-95'
      aria-label='Back to top'
    >
      <ChevronUp
        size={24}
        className='text-coral-500'
        strokeWidth={2.5}
      />
    </button>
  )
}
