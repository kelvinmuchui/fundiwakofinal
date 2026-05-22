'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photoURL: '',
  });

  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          photoURL: data.photoURL || '',
        });
        setIsPhoneVerified(!!data.phoneVerified);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phone) {
      setMessage({ type: 'error', text: 'Please enter a phone number first.' });
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone: formData.phone }),
      });
      if (res.ok) {
        setShowOtpInput(true);
        setMessage({ type: 'success', text: 'OTP sent! Check your phone (or server logs).' });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to send OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending OTP' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone: formData.phone, otp }),
      });
      if (res.ok) {
        setIsPhoneVerified(true);
        setShowOtpInput(false);
        setMessage({ type: 'success', text: 'Phone verified successfully!' });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Invalid OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error verifying OTP' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
          </div>
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white overflow-hidden">
          <div className="p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Photo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-gray-100">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary-100 flex items-center justify-center border-4 border-white shadow-lg">
                    {formData.photoURL ? (
                      <img src={formData.photoURL} alt={formData.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-heading font-semibold text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500 mb-4">Update your photo to help professionals recognize you.</p>
                  <input
                    type="text"
                    placeholder="Enter Image URL"
                    value={formData.photoURL}
                    onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                    className="w-full sm:w-2/3 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                    Phone Number
                    {isPhoneVerified ? (
                      <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        ✓ VERIFIED
                      </span>
                    ) : (
                      <span className="text-amber-600 text-[10px] font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                        NOT VERIFIED
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (isPhoneVerified) setIsPhoneVerified(false); // Reset verification if number changes
                      }}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="e.g., 0712345678"
                    />
                    {!isPhoneVerified && !showOtpInput && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading || !formData.phone}
                        className="px-4 bg-primary-100 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-200 transition-all disabled:opacity-50"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>

                {/* OTP Input Section */}
                {showOtpInput && (
                  <div className="col-span-2 p-4 bg-primary-50 rounded-2xl border border-primary-100 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-primary-900 mb-2 text-center">
                      Enter 6-digit OTP
                    </label>
                    <div className="flex flex-col items-center gap-4">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-32 text-center tracking-[0.5em] text-xl font-bold px-4 py-2 rounded-xl border-2 border-primary-200 focus:border-primary-500 outline-none"
                        placeholder="000000"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpLoading || otp.length !== 6}
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-primary-600/20 disabled:opacity-50"
                        >
                          {otpLoading ? 'Verifying...' : 'Submit OTP'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowOtpInput(false)}
                          className="px-6 py-2 bg-white text-gray-600 rounded-lg text-sm font-bold border border-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {message.text && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-none px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-heading font-semibold shadow-lg shadow-primary-600/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => fetchProfile()}
                  className="flex-1 sm:flex-none px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-heading font-semibold transition-all"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 bg-rose-50 rounded-3xl p-8 border border-rose-100">
          <h3 className="text-lg font-heading font-semibold text-rose-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-rose-700 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-all">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
