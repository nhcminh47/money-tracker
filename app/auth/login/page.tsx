'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/lib/auth/AuthContext'
import { useTranslation } from '@/lib/i18n/useTranslation'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password, rememberMe)

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-coral-300 via-coral-200 to-coral-100 px-4'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-card shadow-card-hover p-8'>
          <div className='text-center mb-8'>
            <div className='text-6xl mb-4'>💰</div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>{t.auth?.login || 'Login'}</h1>
            <p className='text-gray-600'>{t.auth?.loginSubtitle || 'Sign in to your account'}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className='space-y-6'
          >
            {error && <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>{error}</div>}

            <Input
              type='email'
              label={t.auth?.email || 'Email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              required
              autoComplete='email'
            />

            <Input
              type='password'
              label={t.auth?.password || 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              required
              autoComplete='current-password'
            />

            <div className='flex items-center'>
              <input
                type='checkbox'
                id='remember-me'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className='w-4 h-4 text-coral-500 border-gray-300 rounded focus:ring-coral-400'
              />
              <label
                htmlFor='remember-me'
                className='ml-2 text-sm text-gray-700'
              >
                {t.auth?.rememberMe || 'Remember me'}
              </label>
            </div>

            <Button
              type='submit'
              disabled={loading}
              className='w-full'
            >
              {loading ? t.auth?.signingIn || 'Signing in...' : t.auth?.signIn || 'Sign In'}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              {t.auth?.noAccount || "Don't have an account?"}{' '}
              <Link
                href='/auth/signup'
                className='text-coral-500 hover:text-coral-600 font-medium'
              >
                {t.auth?.signUp || 'Sign up'}
              </Link>
            </p>
          </div>
        </div>

        <p className='text-center text-sm text-gray-500 mt-6'>
          {t.auth?.offlineNote || 'Note: Authentication requires internet connection'}
        </p>
      </div>
    </div>
  )
}
