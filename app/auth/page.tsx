'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<'client' | 'fundi' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Sign In State
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    idNumber: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: signInData.email,
        password: signInData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        const session = await getSession();
        const userRole = (session?.user as any)?.role;
        if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else if (userRole === 'fundi') {
          router.push('/fundi/profile');
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!selectedRole) {
      setError('Please select a user type');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...signUpData,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setError('');
      alert('Account created successfully! Please sign in.');
      setActiveTab('signin');
      setSignUpData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        idNumber: '',
      });
      setSelectedRole(null);
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-gray-900 mb-4">
            FundiWako
          </h1>
          <p className="text-lg text-gray-600">
            Connect, Learn, and Grow with Trusted Service Providers
          </p>
        </div>

        {/* Main Auth Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left side - Visual */}
            <div className="hidden md:flex bg-gradient-to-br from-primary-600 to-secondary-600 p-12 flex-col justify-between text-white">
              <div>
                <h2 className="text-3xl font-heading font-bold mb-4">Welcome to FundiWako</h2>
                <p className="text-primary-100 mb-8">
                  Whether you're looking for services or offering your skills, you're in the right place.
                </p>

                {/* Role Cards Preview */}
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                    <h3 className="font-semibold mb-1">👤 Client</h3>
                    <p className="text-sm text-primary-100">Find trusted service providers</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                    <h3 className="font-semibold mb-1">🔧 Fundi</h3>
                    <p className="text-sm text-primary-100">Offer your services & grow your business</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                    <h3 className="font-semibold mb-1">⚙️ Admin</h3>
                    <p className="text-sm text-primary-100">Manage the platform</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-primary-100">
                <p>🔒 Your data is secure and encrypted</p>
              </div>
            </div>

            {/* Right side - Forms */}
            <div className="p-8 md:p-12">
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-8 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('signin')}
                  className={`px-4 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'signin'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`px-4 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'signup'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Sign In Form */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-6">
                  <h3 className="text-xl font-heading font-bold text-gray-900">Sign In</h3>

                  <div>
                    <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      required
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="signin-password"
                      type="password"
                      required
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signup')}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              )}

              {/* Sign Up Form */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-6">
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-6">Create Account</h3>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      I am a *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'client', label: 'Client', icon: '👤' },
                        { value: 'fundi', label: 'Fundi', icon: '🔧' },
                        { value: 'admin', label: 'Admin', icon: '⚙️' },
                      ].map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value as 'client' | 'fundi' | 'admin')}
                          className={`p-4 rounded-lg border-2 text-center transition-all ${
                            selectedRole === role.value
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{role.icon}</div>
                          <div className="font-medium text-sm text-gray-900">{role.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        id="signup-name"
                        type="text"
                        required
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        required
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="signup-phone"
                        type="tel"
                        required
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0712345678"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-id" className="block text-sm font-medium text-gray-700 mb-2">
                        ID Number
                      </label>
                      <input
                        id="signup-id"
                        type="text"
                        required
                        value={signUpData.idNumber}
                        onChange={(e) => setSignUpData({ ...signUpData, idNumber: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="12345678"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        id="signup-password"
                        type="password"
                        required
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        id="signup-confirm"
                        type="password"
                        required
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* For Fundis - Additional Message */}
                  {selectedRole === 'fundi' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      After registration, you'll be directed to complete your professional profile with details about your services, experience, and qualifications.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !selectedRole}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              Back to Home
            </Link>
            {' '} • {' '}
            <Link href="#" className="text-primary-600 hover:text-primary-700 font-medium">
              Privacy Policy
            </Link>
            {' '} • {' '}
            <Link href="#" className="text-primary-600 hover:text-primary-700 font-medium">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
