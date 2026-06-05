'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') ?? 'overview';
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newUserForm),
      });

      if (res.ok) {
        setShowAddUserModal(false);
        setNewUserForm({ name: '', email: '', phone: '', role: 'client' });
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md flex flex-col">
      {/* Top App Bar */}
      <header className="w-full sticky top-0 z-50 bg-slate-950 border-b border-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 px-6 py-4 sm:px-8 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3 rounded-3xl bg-linear-to-r from-primary to-orange-400 px-4 py-3 text-white shadow-xl shadow-primary/20">
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.4em] font-semibold opacity-80">Admin Panel</p>
                <h1 className="text-xl font-bold">FundiWako</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-slate-900/90 px-4 py-3 border border-white/10 shadow-sm">
              <span className="text-slate-400">🔍</span>
              <input
                type="search"
                placeholder="Search applications, users..."
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-100 placeholder:text-slate-500 w-56"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/20 transition hover:bg-orange-600"
            >
              + Add User
            </button>
            <div className="flex items-center gap-3 rounded-full bg-slate-900/90 px-4 py-2 border border-white/10 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white font-bold">A</div>
              <div>
                <p className="text-sm font-semibold text-white">Admin User</p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <aside className="hidden md:flex w-72 sticky top-20 bg-slate-950 text-white flex-col py-8 shadow-2xl h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="px-6 pb-6 border-b border-white/10">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Admin</p>
            <h2 className="mt-4 text-2xl font-bold">FundiWako</h2>
            <p className="mt-2 text-sm text-slate-400">Modern control dashboard</p>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-3">
            {[
              { href: '/admin/dashboard', label: 'Overview', icon: '📊', tab: 'overview' },
              { href: '/admin/dashboard?tab=users', label: 'Users', icon: '👥', tab: 'users' },
              { href: '/admin/dashboard?tab=applications', label: 'Applications', icon: '📋', tab: 'applications' },
              { href: '/admin/dashboard?tab=postings', label: 'Postings', icon: '🏢', tab: 'postings' },
              { href: '/admin/dashboard?tab=analytics', label: 'Analytics', icon: '📈', tab: 'analytics' },
              { href: '/admin/dashboard?tab=settings', label: 'Settings', icon: '⚙️', tab: 'settings' },
            ].map((item) => (
              <Link
                key={item.tab}
                href={item.href}
                className={`flex items-center gap-3 rounded-[1.75rem] px-4 py-3 text-sm font-semibold transition ${
                  activeTab === item.tab ? 'bg-slate-900 text-white ring-1 ring-primary/40 shadow-lg shadow-slate-950/40' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 py-6 border-t border-white/10">
            <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-4 shadow-inner">
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">System status</p>
              <p className="mt-3 text-sm text-slate-200">Stable and secure</p>
              <p className="mt-4 text-xs text-slate-400">v1.0.4 · Audit ready</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 mt-auto bg-surface-container border-t border-outline-variant">
        <div className="flex justify-between items-center px-10 max-w-7xl mx-auto">
          <p className="text-sm text-secondary">© 2024 FundiWako Marketplace. Secure Admin Portal.</p>
          <div className="flex gap-6 items-center">
            <a className="text-sm text-secondary hover:text-primary transition-colors" href="#">Support</a>
            <a className="text-sm text-secondary hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-sm text-secondary hover:text-primary transition-colors" href="#">Audit Log</a>
          </div>
        </div>
      </footer>

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-outline-variant max-w-md w-full p-6 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-on-surface">Add New User</h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-secondary hover:text-on-surface text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-on-surface placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-on-surface placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-on-surface placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="+254712345678"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="client">Client</option>
                  <option value="fundi">Fundi</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2.5 border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-low transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90 disabled:opacity-40 transition-all font-semibold"
                >
                  {isSubmitting ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
