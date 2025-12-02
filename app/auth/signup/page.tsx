'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTranslation } from '@/lib/i18n/useTranslation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignupPage() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError(t.auth?.passwordMismatch || 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(t.auth?.passwordTooShort || 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t.auth?.checkEmail || 'Check your email'}
            </h1>
            <p className="text-gray-600 mb-6">
              {t.auth?.confirmEmailSent || 'We sent you a confirmation link. Please check your email and click the link to activate your account.'}
            </p>
            <Link href="/auth/login">
              <Button className="w-full">
                {t.auth?.backToLogin || 'Back to Login'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💰</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t.auth?.createAccount || 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {t.auth?.signupSubtitle || 'Start tracking your money'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              type="email"
              label={t.auth?.email || 'Email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Input
              type="password"
              label={t.auth?.password || 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Input
              type="password"
              label={t.auth?.confirmPassword || 'Confirm Password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <div className="text-xs text-gray-500 space-y-1">
              <p>{t.auth?.passwordReqs || 'Password requirements:'}:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t.auth?.minChars || 'At least 6 characters'}</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (t.auth?.creatingAccount || 'Creating account...') : (t.auth?.signUp || 'Sign Up')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t.auth?.haveAccount || 'Already have an account?'}{' '}
              <Link href="/auth/login" className="text-sky-600 hover:text-sky-700 font-medium">
                {t.auth?.signIn || 'Sign in'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
