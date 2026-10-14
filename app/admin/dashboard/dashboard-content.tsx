'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CorporateRecruitmentForm from '../../components/CorporateRecruitmentForm';
import { BadgeCheck, BriefcaseBusiness, ClipboardList, RefreshCw, Users } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  [key: string]: unknown;
}

interface WorkerApplication {
  _id: string;
  name: string;
  phone: string;
  email: string;
  skill: string;
  experience: string;
  description?: string;
  location?: string;
  neighborhood?: string;
  tvetInstitution?: string;
  availability?: string;
  reasonForJoining?: string;
  status: string;
  createdAt: string;
  submittedAt?: string;
  [key: string]: unknown;
}

interface CorporatePosting {
  _id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyWebsite?: string;
  location: string;
  postingType: string;
  serviceCategory: string;
  positions: number;
  preferredStartDate?: string;
  duration?: string;
  description: string;
  status: 'new' | 'reviewed' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface InternshipApplication {
  _id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  postingCompany: string;
  postingCategory?: string;
  postingLocation?: string;
  institution: string;
  yearOfStudy: string;
  areaOfInterest?: string;
  motivation?: string;
  resumeUrl?: string;
  status: string;
  submittedAt: string;
}

const hiddenUserFields = new Set([
  'password',
  'verificationToken',
  'verificationTokenExpires',
  'resetToken',
  'resetTokenExpires',
  'bankAccountNumberEncrypted',
  'bankAccountNameEncrypted',
  'mpesaNumberEncrypted',
  'idNumberEncrypted',
  'phoneEncrypted',
  'connections',
  'connectionRequests',
  'blocked',
  'profileViews',
  'notifications',
]);

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not provided';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(formatDetailValue).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatDetailLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (character) => character.toUpperCase());
}

export default function AdminDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<WorkerApplication[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedApp, setSelectedApp] = useState<WorkerApplication | null>(null);
  const [selectedPost, setSelectedPost] = useState<CorporatePosting | null>(null);
  const [selectedInternshipApplication, setSelectedInternshipApplication] = useState<InternshipApplication | null>(null);
  const [postings, setPostings] = useState<CorporatePosting[]>([]);
  const [internshipApplications, setInternshipApplications] = useState<InternshipApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!session || !session.user || userRole !== 'admin') {
      router.push('/auth');
      return;
    }

    fetchData();
  }, [session, status, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'users', 'applications', 'postings', 'internships', 'analytics'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, appsRes, postingsRes, internshipAppsRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/applications', { credentials: 'include' }),
        fetch('/api/admin/corporate-postings', { credentials: 'include' }),
        fetch('/api/internship-applications', { credentials: 'include' }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }

      if (postingsRes.ok) {
        const postsData = await postingsRes.json();
        setPostings(postsData);
      }

      if (internshipAppsRes.ok) {
        const internshipAppsData = await internshipAppsRes.json();
        setInternshipApplications(internshipAppsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, newStatus: string) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setSelectedApp(null);
        setSuccessMessage(`Application ${newStatus} successfully!`);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || `Failed to ${newStatus} application`);
      }
    } catch (error) {
      console.error('Error updating application:', error);
      setErrorMessage('Error updating application. Please try again.');
    }
  };

  const updatePostingStatus = async (id: string, newStatus: string) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      const res = await fetch(`/api/admin/corporate-postings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setSelectedPost(null);
        setSuccessMessage(`Posting ${newStatus} successfully!`);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || `Failed to ${newStatus} posting`);
      }
    } catch (error) {
      console.error('Error updating posting:', error);
      setErrorMessage('Error updating posting. Please try again.');
    }
  };

  const updateInternshipApplicationStatus = async (id: string, newStatus: string) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      const res = await fetch(`/api/admin/internship-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setSelectedInternshipApplication(null);
        setSuccessMessage(`Application ${newStatus} successfully!`);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || `Failed to ${newStatus} application`);
      }
    } catch (error) {
      console.error('Error updating internship application:', error);
      setErrorMessage('Error updating internship application. Please try again.');
    }
  };

  const deleteUser = async (user: User) => {
    if (!window.confirm(`Delete ${user.name}'s account? This cannot be undone.`)) return;

    setDeletingUserId(user._id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorMessage(errorData.error || 'Failed to delete user');
        return;
      }

      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser._id !== user._id));
      setSelectedUser(null);
      setSuccessMessage('User deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage('Error deleting user. Please try again.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: users.length,
    fundis: users.filter(u => u.role === 'fundi').length,
    clients: users.filter(u => u.role === 'client').length,
    verified: users.filter(u => u.isVerified).length,
    pendingApplications: applications.filter(a => a.status === 'pending').length,
    approvedApplications: applications.filter(a => a.status === 'approved').length,
    rejectedApplications: applications.filter(a => a.status === 'rejected').length,
    internshipPostings: postings.filter(p => p.postingType === 'internship').length,
    internshipApplications: internshipApplications.length,
    approvedPostings: postings.filter(p => p.status === 'approved').length,
    rejectedPostings: postings.filter(p => p.status === 'rejected').length,
  };

  const selectedApplicationUser = selectedApp
    ? users.find((user) => user.email.toLowerCase() === selectedApp.email.toLowerCase()) ?? null
    : null;
  const tabTitles: Record<string, { title: string; description: string }> = {
    overview: { title: 'Dashboard overview', description: 'A snapshot of users, applications, and activity across FundiWako.' },
    users: { title: 'User management', description: 'Browse and manage client, fundi, and administrator accounts.' },
    applications: { title: 'Fundi applications', description: 'Review new fundi registrations and their submitted profile details.' },
    postings: { title: 'Marketplace postings', description: 'Review and manage company service and recruitment postings.' },
    internships: { title: 'Internships', description: 'Manage internship postings and candidate applications.' },
    analytics: { title: 'Analytics', description: 'Monitor account, verification, and marketplace activity.' },
  };
  const currentTab = tabTitles[activeTab] ?? tabTitles.overview;
  const navigateToTab = (tab: string) => {
    router.push(tab === 'overview' ? '/admin/dashboard' : `/admin/dashboard?tab=${tab}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-primary"></div>
          <p className="text-sm font-medium text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !session.user || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="admin-dashboard-content space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">FundiWako / Admin</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{currentTab.title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{currentTab.description}</p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Refresh data
        </button>
      </div>

      {activeTab === 'overview' && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total users', value: stats.totalUsers, detail: 'Accounts on the platform', icon: Users, tone: 'bg-orange-50 text-primary' },
            { label: 'Fundis', value: stats.fundis, detail: 'Service providers', icon: BriefcaseBusiness, tone: 'bg-blue-50 text-blue-700' },
            { label: 'Pending applications', value: stats.pendingApplications, detail: 'Waiting for review', icon: ClipboardList, tone: 'bg-amber-50 text-amber-700' },
            { label: 'Verified users', value: stats.verified, detail: 'Approved profiles', icon: BadgeCheck, tone: 'bg-emerald-50 text-emerald-700' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-md border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{item.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
                  </div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-md ${item.tone}`}>
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                </div>
                <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">{item.detail}</p>
              </article>
            );
          })}
        </section>
      )}

          <div className="fixed bottom-8 right-8 z-100 flex flex-col gap-3 pointer-events-none">
            {successMessage && (
              <div className="animate-reveal glass-light bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto border-none">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">✓</div>
                <p className="font-semibold">{successMessage}</p>
              </div>
            )}
            {errorMessage && (
              <div className="animate-reveal glass-light bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto border-none">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">✕</div>
                <p className="font-semibold">{errorMessage}</p>
              </div>
            )}
          </div>

          {activeTab === 'overview' && (
            <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
              <div className="space-y-6">
                <div className="rounded-4xl border border-surface-container-high shadow-sm bg-white p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">Latest activity</p>
                      <h2 className="mt-3 text-2xl font-extrabold text-on-background">Applications & updates</h2>
                      <p className="mt-2 text-sm text-secondary">Review the most recent work applications and keep the platform moving.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-3xl bg-surface-container-low p-4 text-center">
                        <p className="text-sm text-secondary">Open</p>
                        <p className="mt-2 text-xl font-bold text-on-background">{stats.pendingApplications}</p>
                      </div>
                      <div className="rounded-3xl bg-surface-container-low p-4 text-center">
                        <p className="text-sm text-secondary">Approved</p>
                        <p className="mt-2 text-xl font-bold text-on-background">{stats.approvedApplications}</p>
                      </div>
                      <div className="rounded-3xl bg-surface-container-low p-4 text-center">
                        <p className="text-sm text-secondary">Rejected</p>
                        <p className="mt-2 text-xl font-bold text-on-background">{stats.rejectedApplications}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-4xl border border-surface-container-high shadow-sm bg-white p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-xl font-semibold text-on-background">Recent Applications</h3>
                      <p className="text-sm text-secondary">Quick access to the most recent submissions.</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">Real-time</span>
                  </div>
                  <div className="divide-y divide-surface-container p-1">
                    {applications.slice(0, 5).map((app) => (
                      <div key={app._id} className="flex flex-col gap-3 p-4 rounded-3xl transition hover:bg-surface-container-low cursor-pointer" onClick={() => setSelectedApp(app)}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-base font-semibold text-on-background">{app.name}</p>
                            <p className="text-sm text-secondary">{app.skill} · {app.email}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            app.status === 'pending' ? 'bg-yellow-500/15 text-yellow-500' :
                            app.status === 'approved' ? 'bg-emerald-500/15 text-emerald-500' :
                            'bg-rose-500/15 text-rose-500'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-secondary">
                          <span>{app.experience} experience</span>
                          <span>{app.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-4xl border border-surface-container-high shadow-sm bg-white p-6">
                  <h3 className="text-xl font-semibold text-on-background mb-4">Application status distribution</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Pending', value: stats.pendingApplications, color: 'bg-yellow-500' },
                      { label: 'Approved', value: stats.approvedApplications, color: 'bg-emerald-500' },
                      { label: 'Rejected', value: stats.rejectedApplications, color: 'bg-rose-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm text-secondary mb-2">
                          <span>{item.label}</span>
                          <span className="font-semibold text-on-background">{item.value}</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-surface-container-low">
                          <div
                            className={`${item.color} h-full rounded-full`}
                            style={{ width: `${applications.length ? (item.value / applications.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-4xl border border-surface-container-high shadow-sm bg-white p-6">
                  <h3 className="text-xl font-semibold text-on-background mb-4">Team snapshot</h3>
                  <div className="grid gap-4">
                    <div className="rounded-3xl bg-surface-container-low p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-secondary">Clients</p>
                      <p className="mt-2 text-3xl font-bold text-on-background">{stats.clients}</p>
                    </div>
                    <div className="rounded-3xl bg-surface-container-low p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-secondary">Verification</p>
                      <p className="mt-2 text-3xl font-bold text-on-background">{users.length ? Math.round((stats.verified / users.length) * 100) : 0}%</p>
                    </div>
                    <div className="rounded-3xl bg-surface-container-low p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-secondary">Active postings</p>
                      <p className="mt-2 text-3xl font-bold text-on-background">{postings.length}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-4xl border border-surface-container-high shadow-sm bg-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-on-background">Quick actions</h3>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">Smart</span>
                  </div>
                  <div className="space-y-3 text-sm text-secondary">
                    <button
                      onClick={() => navigateToTab('users')}
                      className="w-full rounded-3xl border border-surface-container-high px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5"
                    >
                      Manage users
                    </button>
                    <button
                      onClick={() => navigateToTab('applications')}
                      className="w-full rounded-3xl border border-surface-container-high px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5"
                    >
                      Review applications
                    </button>
                    <button
                      onClick={() => navigateToTab('postings')}
                      className="w-full rounded-3xl border border-surface-container-high px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5"
                    >
                      Review postings
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="fundi">Fundi</option>
                  <option value="client">Client</option>
                </select>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 border-b border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Phone</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Role</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredUsers.map(user => (
                        <tr key={user._id} className="group hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                          <td className="px-6 py-4 text-sm text-white font-medium">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{user.phone}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                              user.role === 'fundi' ? 'bg-green-500/20 text-green-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isVerified ? 'bg-green-500/20 text-green-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {user.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Skill</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Experience</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {applications.map(app => (
                      <tr key={app._id} className="group hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => setSelectedApp(app)}>
                        <td className="px-6 py-4 text-sm text-white font-medium">{app.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{app.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{app.skill}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{app.experience}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'postings' && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Company</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Contact</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Service</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Positions</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {postings.map(post => (
                      <tr key={post._id} className="group hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => setSelectedPost(post)}>
                        <td className="px-6 py-4 text-sm text-white font-medium">{post.companyName}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{post.contactName} · {post.contactEmail}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{post.serviceCategory}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{post.positions}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            post.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                            post.status === 'reviewed' ? 'bg-yellow-500/20 text-yellow-400' :
                            post.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'internships' && (
            <div className="space-y-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Internship overview</h3>
                    <p className="text-sm text-gray-400">Review internship posts and the candidates who applied.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">Internship posts: {stats.internshipPostings}</span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">Applications: {stats.internshipApplications}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-4xl border border-surface-container-high bg-white p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-on-background">Create a new internship posting</h3>
                  <p className="mt-2 text-sm text-secondary">Submit an internship posting directly from the admin dashboard.</p>
                </div>
                <CorporateRecruitmentForm onSuccess={fetchData} />
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 border-b border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Company</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Category</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Location</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Positions</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {postings.filter(post => post.postingType === 'internship').map(post => (
                        <tr key={post._id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-white font-medium">{post.companyName}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{post.serviceCategory}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{post.location}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{post.positions}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              post.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                              post.status === 'reviewed' ? 'bg-yellow-500/20 text-yellow-400' :
                              post.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}>
                              {post.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 border-b border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Applicant</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Company</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Institution</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Year</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {internshipApplications.map(app => (
                        <tr key={app._id} className="hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => setSelectedInternshipApplication(app)}>
                          <td className="px-6 py-4 text-sm text-white font-medium">{app.applicantName}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{app.applicantEmail}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{app.postingCompany}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{app.institution}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{app.yearOfStudy}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              app.status === 'submitted' ? 'bg-slate-100 text-slate-700' :
                              app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}>{app.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-reveal">
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                  <span className="text-2xl">🥧</span> User Distribution
                </h3>
                <div className="flex flex-col gap-6">
                  {[
                    { label: 'Fundis', count: stats.fundis, color: 'bg-emerald-500', icon: '🔧' },
                    { label: 'Clients', count: stats.clients, color: 'bg-blue-500', icon: '💼' },
                    { label: 'Admins', count: stats.totalUsers - stats.fundis - stats.clients, color: 'bg-purple-500', icon: '⚡' }
                  ].map((item, idx) => (
                    <div key={idx} className="group flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${item.color}/10 flex items-center justify-center text-xl`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300 font-medium">{item.label}</span>
                          <span className="text-white font-bold">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                          <div
                            className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out hover:brightness-110`}
                            style={{ width: `${stats.totalUsers ? (item.count / stats.totalUsers) * 100 : 0}%`, transitionDelay: `${idx * 100}ms` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                  <span className="text-2xl">🌱</span> Platform Health
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-700/30 border border-gray-700 p-6 rounded-2xl hover:bg-gray-700/50 transition-colors group">
                    <p className="text-gray-400 text-sm font-bold uppercase mb-2">Completion Rate</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">94%</p>
                      <span className="text-emerald-400 text-sm font-bold mb-1">↑ 2%</span>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 border border-gray-700 p-6 rounded-2xl hover:bg-gray-700/50 transition-colors group">
                    <p className="text-gray-400 text-sm font-bold uppercase mb-2">Response Time</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">2.4h</p>
                      <span className="text-emerald-400 text-sm font-bold mb-1">↓ 15m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
                aria-label="Close user details"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(selectedUser)
                .filter(([key]) => !hiddenUserFields.has(key))
                .map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <p className="text-gray-400 text-sm">{formatDetailLabel(key)}</p>
                    <p className="text-white font-medium wrap-break-word">{formatDetailValue(value)}</p>
                  </div>
                ))}
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => deleteUser(selectedUser)}
                disabled={deletingUserId === selectedUser._id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {deletingUserId === selectedUser._id ? 'Deleting...' : 'Delete user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedInternshipApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">Internship Application</h2>
              <button
                onClick={() => setSelectedInternshipApplication(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Applicant</p>
                <p className="text-white font-medium">{selectedInternshipApplication.applicantName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-medium">{selectedInternshipApplication.applicantEmail}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-medium">{selectedInternshipApplication.applicantPhone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Institution</p>
                <p className="text-white font-medium">{selectedInternshipApplication.institution}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-300">
              <p><span className="text-gray-400">Posting:</span> {selectedInternshipApplication.postingCompany}</p>
              <p><span className="text-gray-400">Area of interest:</span> {selectedInternshipApplication.areaOfInterest || 'Not provided'}</p>
              <p><span className="text-gray-400">Motivation:</span> {selectedInternshipApplication.motivation || 'Not provided'}</p>
              {selectedInternshipApplication.resumeUrl && (
                <a href={selectedInternshipApplication.resumeUrl} target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">Open resume / portfolio</a>
              )}
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => updateInternshipApplicationStatus(selectedInternshipApplication._id, 'approved')}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => updateInternshipApplicationStatus(selectedInternshipApplication._id, 'rejected')}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">Application Details</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-white"
                aria-label="Close application details"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(selectedApp)
                .filter(([key]) => key !== '_id')
                .map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <p className="text-gray-400 text-sm">{formatDetailLabel(key)}</p>
                    <p className="text-white font-medium wrap-break-word">{formatDetailValue(value)}</p>
                  </div>
                ))}
            </div>
            <section className="mt-6 border-t border-gray-700 pt-4">
              <h3 className="mb-4 text-lg font-semibold text-white">Account details from the user record</h3>
              {selectedApplicationUser ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(selectedApplicationUser)
                    .filter(([key]) => !hiddenUserFields.has(key))
                    .map(([key, value]) => (
                      <div key={key} className="min-w-0">
                        <p className="text-gray-400 text-sm">{formatDetailLabel(key)}</p>
                        <p className="text-white font-medium wrap-break-word">{formatDetailValue(value)}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No matching user account was found for this application.</p>
              )}
            </section>
            {selectedApp.status === 'pending' && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={() => updateApplicationStatus(selectedApp._id, 'approved')}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateApplicationStatus(selectedApp._id, 'rejected')}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
