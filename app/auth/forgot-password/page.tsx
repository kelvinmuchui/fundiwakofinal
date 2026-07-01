"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send reset link.');
      }

      setStatus({ type: 'success', message: data.message || 'We sent a reset link to your email.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Unable to send reset link.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-24">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl bg-white rounded-[2rem] border border-slate-200 p-10 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-heading font-bold text-slate-900 mb-3">Forgot your password?</h1>
            <p className="text-slate-600">Enter your email address and we&apos;ll send you a link to reset it.</p>
          </div>

          {status && (
            <div className={`mb-6 rounded-2xl px-4 py-3 text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending reset link...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              Remembered your password?{' '}
              <Link href="/auth" className="text-primary-600 hover:underline">Back to sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
