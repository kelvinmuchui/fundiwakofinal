'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<WorkerApplication[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedApp, setSelectedApp] = useState<WorkerApplication | null>(null);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, appsRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/applications', { credentials: 'include' }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
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
        fetchData(); // Refresh data
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

  // Filter functions
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Manage users, applications, and platform settings</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                Welcome, <span className="text-white font-semibold">{session.user.name}</span>
              </span>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
              >
                Back to Home
              </button>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Floating Toast Notifications */}
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-primary-500 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Users</p>
                <p className="text-4xl font-extrabold text-white mt-1">{stats.totalUsers}</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-3xl">👥</span>
              </div>
            </div>
          </div>

          <div className="group bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Fundis</p>
                <p className="text-4xl font-extrabold text-emerald-400 mt-1">{stats.fundis}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-3xl">🔧</span>
              </div>
            </div>
          </div>

          <div className="group bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Clients</p>
                <p className="text-4xl font-extrabold text-blue-400 mt-1">{stats.clients}</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-3xl">💼</span>
              </div>
            </div>
          </div>

          <div className="group bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-amber-500 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Apps</p>
                <p className="text-4xl font-extrabold text-amber-400 mt-1">{stats.pendingApplications}</p>
              </div>
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-3xl animate-pulse">📋</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'applications', label: 'Applications', icon: '📋' },
              { id: 'analytics', label: 'Analytics', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activity */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Applications</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {applications.slice(0, 5).map(app => (
                    <div key={app._id} className="bg-gray-700 rounded p-4 flex items-center justify-between hover:bg-gray-600 transition-colors">
                      <div className="flex-1">
                        <p className="text-white font-medium">{app.name}</p>
                        <p className="text-gray-400 text-sm">{app.skill} • {app.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Status Distribution */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Application Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Pending</span>
                      <span className="text-yellow-400 font-semibold">{stats.pendingApplications}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${applications.length ? (stats.pendingApplications / applications.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Approved</span>
                      <span className="text-green-400 font-semibold">{stats.approvedApplications}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${applications.length ? (stats.approvedApplications / applications.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Rejected</span>
                      <span className="text-red-400 font-semibold">{stats.rejectedApplications}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${applications.length ? (stats.rejectedApplications / applications.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Stats */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Verification Status</h3>
              <div className="space-y-4">
                <div className="bg-gray-700 rounded p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Verified Users</span>
                    <span className="text-green-400 font-semibold">{stats.verified}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {users.length ? Math.round((stats.verified / users.length) * 100) : 0}% of total
                  </div>
                </div>
                <div className="bg-gray-700 rounded p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Unverified Users</span>
                    <span className="text-yellow-400 font-semibold">{users.length - stats.verified}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {users.length ? Math.round(((users.length - stats.verified) / users.length) * 100) : 0}% of total
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filter */}
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

            {/* Users Table */}
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
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300 whitespace-nowrap">Quick Actions</th>
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
                        <td className="px-6 py-4 text-sm text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                              className="p-2 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                              title="Quick View"
                            >
                              👁️
                            </button>
                            {!user.isVerified && (
                              <button
                                onClick={(e) => { e.stopPropagation(); /* Add verify logic if exists */ }}
                                className="p-2 hover:bg-emerald-600/20 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                                title="Verify User"
                              >
                                ✅
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
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
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                            className="p-2 hover:bg-gray-600 rounded-lg text-primary-400 hover:text-primary-300 transition-colors"
                            title="View Full Details"
                          >
                            👁️
                          </button>
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateApplicationStatus(app._id, 'approved'); }}
                                className="p-2 hover:bg-emerald-600/20 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                                title="Approve Immediately"
                              >
                                ✅
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateApplicationStatus(app._id, 'rejected'); }}
                                className="p-2 hover:bg-rose-600/20 rounded-lg text-rose-400 hover:text-rose-300 transition-colors"
                                title="Reject Immediately"
                              >
                                ❌
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
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
              <div className="mt-8 pt-8 border-t border-gray-700/50 flex justify-around text-center">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Total</p>
                  <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
                </div>
                <div className="w-px h-10 bg-gray-700"></div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Growth</p>
                  <p className="text-2xl font-black text-emerald-400">+12%</p>
                </div>
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
                  <div className="mt-4 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[94%]"></div>
                  </div>
                </div>
                <div className="bg-gray-700/30 border border-gray-700 p-6 rounded-2xl hover:bg-gray-700/50 transition-colors group">
                  <p className="text-gray-400 text-sm font-bold uppercase mb-2">Response Time</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">2.4h</p>
                    <span className="text-emerald-400 text-sm font-bold mb-1">↓ 15m</span>
                  </div>
                  <div className="mt-4 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[80%]"></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <h4 className="text-sm font-bold uppercase text-gray-500 tracking-wider">Application Funnel</h4>
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                    <span>APPROVED</span>
                    <span>{Math.round((stats.approvedApplications / (applications.length || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 h-6 rounded-lg overflow-hidden flex">
                    <div className="bg-emerald-500/80 h-full transition-all duration-1000" style={{ width: `${(stats.approvedApplications / (applications.length || 1)) * 100}%` }}></div>
                    <div className="bg-amber-500/80 h-full transition-all duration-1000" style={{ width: `${(stats.pendingApplications / (applications.length || 1)) * 100}%` }}></div>
                    <div className="bg-rose-500/80 h-full transition-all duration-1000" style={{ width: `${(stats.rejectedApplications / (applications.length || 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Selected User */}
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
              <div>
                <p className="text-gray-400 text-sm">Joined</p>
                <p className="text-white font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Selected Application */}
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
              <div>
                <p className="text-gray-400 text-sm">Experience</p>
                <p className="text-white font-medium">{selectedApp.experience}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Availability</p>
                <p className="text-white font-medium capitalize">{selectedApp.availability || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p className="text-white font-medium">{selectedApp.location}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Neighborhood</p>
                <p className="text-white font-medium">{selectedApp.neighborhood}</p>
              </div>
              {selectedApp.tvetInstitution && (
                <div>
                  <p className="text-gray-400 text-sm">TVET Institution</p>
                  <p className="text-white font-medium">{selectedApp.tvetInstitution}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedApp.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  selectedApp.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {selectedApp.status}
                </span>
              </div>
            </div>
            {selectedApp.description && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">Description</p>
                <p className="text-white font-medium mt-1">{selectedApp.description}</p>
              </div>
            )}
            {selectedApp.reasonForJoining && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">Reason for Joining</p>
                <p className="text-white font-medium mt-1">{selectedApp.reasonForJoining}</p>
              </div>
            )}
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