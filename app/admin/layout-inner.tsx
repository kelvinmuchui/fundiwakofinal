'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import {
  Activity,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

const navigationGroups = [
  {
    label: 'Workspace',
    items: [
      { href: '/admin/dashboard', label: 'Overview', tab: 'overview', icon: LayoutDashboard },
      { href: '/admin/dashboard?tab=users', label: 'Users', tab: 'users', icon: Users },
      { href: '/admin/dashboard?tab=applications', label: 'Applications', tab: 'applications', icon: ClipboardList },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { href: '/admin/dashboard?tab=postings', label: 'Postings', tab: 'postings', icon: Building2 },
      { href: '/admin/dashboard?tab=internships', label: 'Internships', tab: 'internships', icon: BriefcaseBusiness },
      { href: '/admin/dashboard?tab=analytics', label: 'Analytics', tab: 'analytics', icon: ChartNoAxesCombined },
    ],
  },
];

export default function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const activeTab = searchParams?.get('tab') ?? 'overview';
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminName = session?.user?.name || 'Admin User';
  const adminInitial = adminName.trim().charAt(0).toUpperCase() || 'A';

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

  const renderNavigation = (onNavigate?: () => void) => (
    <nav aria-label="Admin navigation" className="space-y-7 px-3 py-6">
      {navigationGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === '/admin/dashboard' && activeTab === item.tab;
              return (
                <Link
                  key={item.tab}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 h-[68px] border-b border-slate-200 bg-white">
        <div className="flex h-full items-center">
          <div className="hidden h-full w-64 shrink-0 items-center gap-3 border-r border-slate-200 px-6 md:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <span className="text-lg font-extrabold">F</span>
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-slate-900">FundiWako</p>
              <p className="text-[11px] font-medium text-slate-500">Admin workspace</p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden"
                aria-label="Open admin navigation"
              >
                <Menu size={19} />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">Administration</p>
                <p className="hidden text-xs text-slate-500 sm:block">Manage the FundiWako marketplace</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 sm:px-4"
              >
                <Plus size={17} />
                <span className="hidden sm:inline">Add user</span>
                <span className="sm:hidden">Add</span>
              </button>
              <div className="hidden h-8 w-px bg-slate-200 sm:block" />
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-primary">
                  {adminInitial}
                </div>
                <div className="hidden min-w-0 lg:block">
                  <p className="max-w-36 truncate text-sm font-semibold text-slate-800">{adminName}</p>
                  <p className="text-xs capitalize text-slate-500">
                    {(session?.user as { role?: string } | undefined)?.role || 'Administrator'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-[68px] z-30 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        {renderNavigation()}
        <div className="mt-auto border-t border-slate-200 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
          >
            <Home size={18} strokeWidth={1.8} />
            Back to website
          </Link>
          <div className="mt-4 flex items-center gap-3 rounded-md bg-slate-50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Activity size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">System status</p>
              <p className="text-[11px] text-slate-500">Admin services online</p>
            </div>
            <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close admin navigation"
          />
          <aside className="absolute bottom-0 left-0 top-0 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl">
            <div className="flex h-[68px] items-center justify-between border-b border-slate-200 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-extrabold text-white">F</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">FundiWako</p>
                  <p className="text-[11px] text-slate-500">Admin workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                aria-label="Close admin navigation"
              >
                <X size={18} />
              </button>
            </div>
            {renderNavigation(() => setIsSidebarOpen(false))}
            <div className="mt-auto border-t border-slate-200 p-4">
              <Link
                href="/"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Home size={18} />
                Back to website
              </Link>
            </div>
          </aside>
        </div>
      )}

      <main className="min-h-[calc(100vh-68px)] px-4 py-6 sm:px-6 md:ml-64 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        <footer className="mx-auto mt-10 flex w-full max-w-[1440px] flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FundiWako Marketplace</p>
          <p className="flex items-center gap-1.5"><ShieldCheck size={14} /> Secure admin portal</p>
        </footer>
      </main>

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">User management</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Add new user</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close add user form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  required
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
                  placeholder="+254712345678"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
                >
                  <option value="client">Client</option>
                  <option value="fundi">Fundi</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={16} />
                  {isSubmitting ? 'Adding...' : 'Add user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
