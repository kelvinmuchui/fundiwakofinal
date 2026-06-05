'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CorporateRecruitmentForm from '../../components/CorporateRecruitmentForm';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
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
  postingCompany: string;
  institution: string;
  yearOfStudy: string;
  status: string;
  submittedAt: string;
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
  const [postings, setPostings] = useState<CorporatePosting[]>([]);
  const [internshipApplications, setInternshipApplications] = useState<InternshipApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    const userRole = (session?.user as any)?.role;
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  if (!session || !session.user || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <section className="rounded-[2.5rem] bg-slate-950 text-white shadow-2xl border border-white/10 overflow-hidden">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_35%),linear-gradient(90deg,#0f172a,#111827)] px-8 py-8 sm:px-12 sm:py-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.45em] text-primary/80">Admin Workspace</p>
                  <h1 className="mt-3 text-4xl font-extrabold text-white">FundiWako Admin Dashboard</h1>
                  <p className="mt-3 text-sm leading-7 text-slate-300">A polished admin console for guests, service providers, and corporate postings — built to manage everything from one modern surface.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-5 shadow-xl shadow-slate-950/20">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Signed in as</p>
                    <p className="mt-3 text-lg font-semibold text-white">{session.user.name}</p>
                  </div>
                  <div className="flex gap-3 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20">
                    <button
                      onClick={() => router.push('/')}
                      className="flex-1 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                    >
                      Back to Home
                    </button>
                    <button
                      onClick={() => signOut()}
                      className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 bg-slate-900/80">
              <div className="rounded-[1.75rem] bg-slate-900 border border-white/10 p-6 shadow-xl shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Users</p>
                <p className="mt-4 text-3xl font-semibold text-white">{stats.totalUsers}</p>
                <p className="mt-2 text-sm text-slate-400">Total platform users</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-900 border border-white/10 p-6 shadow-xl shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Fundis</p>
                <p className="mt-4 text-3xl font-semibold text-white">{stats.fundis}</p>
                <p className="mt-2 text-sm text-slate-400">Active fundi accounts</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-900 border border-white/10 p-6 shadow-xl shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Pending</p>
                <p className="mt-4 text-3xl font-semibold text-white">{stats.pendingApplications}</p>
                <p className="mt-2 text-sm text-slate-400">Open applications</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-900 border border-white/10 p-6 shadow-xl shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Verified</p>
                <p className="mt-4 text-3xl font-semibold text-white">{stats.verified}</p>
                <p className="mt-2 text-sm text-slate-400">Verified users</p>
              </div>
            </div>
          </section>

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

          <div className="mb-6 rounded-full bg-slate-900/80 p-2 shadow-inner border border-white/10">
            <nav className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'users', label: 'Users', icon: '👥' },
                { id: 'applications', label: 'Applications', icon: '📋' },
                { id: 'postings', label: 'Postings', icon: '🏢' },
                { id: 'internships', label: 'Internships', icon: '🎓' },
                { id: 'analytics', label: 'Analytics', icon: '📈' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
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
                      onClick={() => setActiveTab('users')}
                      className="w-full rounded-3xl border border-surface-container-high px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5"
                    >
                      Manage users
                    </button>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="w-full rounded-3xl border border-surface-container-high px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5"
                    >
                      Review applications
                    </button>
                    <button
                      onClick={() => setActiveTab('postings')}
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
                    <span className="inline-flex items-center rounded-full bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200">Internship posts: {stats.internshipPostings}</span>
                    <span className="inline-flex items-center rounded-full bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200">Applications: {stats.internshipApplications}</span>
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
                        <tr key={app._id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-white font-medium">{app.applicantName}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{app.applicantEmail}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{app.postingCompany}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{app.institution}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{app.yearOfStudy}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{app.status}</span>
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
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-medium">{selectedUser.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <p className="text-white font-medium capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Verification Status</p>
                <p className={`font-medium ${selectedUser.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                  {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">Application Details</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-medium">{selectedApp.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-medium">{selectedApp.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-medium">{selectedApp.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Skill/Service</p>
                <p className="text-white font-medium">{selectedApp.skill}</p>
              </div>
            </div>
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
