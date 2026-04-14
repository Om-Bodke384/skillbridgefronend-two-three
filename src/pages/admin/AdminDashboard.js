import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StatCard, Badge, Avatar } from '../../components/ui/index';
import { HiUsers, HiUserGroup, HiShieldCheck, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('overview');
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users', {
          params: {
            limit: 20,
            role: roleFilter || undefined,
            search: search || undefined,
          },
        }),
      ]);
      setStats(dashRes.data.data);
      setUsers(usersRes.data.data.users || []);
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [roleFilter, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      toast.success('Role updated');
      load();
    } catch { /* handled */ }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/status`);
      toast.success('Status updated');
      load();
    } catch { /* handled */ }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      load();
    } catch { /* handled */ }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <HiShieldCheck className="text-amber-400 text-3xl" />
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-0.5">Manage users, communities, and platform settings</p>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1 w-fit">
        {['overview', 'users', 'communities'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={<HiUsers />}     label="Total Users"    value={stats.stats.totalUsers}       color="primary" />
            <StatCard icon={<HiUserGroup />} label="Communities"    value={stats.stats.totalCommunities} color="cyan" />
            <StatCard icon="⚡"              label="Hackathons"     value={stats.stats.totalHackathons}  color="amber" />
            <StatCard icon="🎓"              label="Students"       value={stats.stats.studentCount}     color="green" />
            <StatCard icon="👨‍🏫"             label="Mentors"        value={stats.stats.mentorCount}      color="purple" />
            <StatCard icon="🛡️"              label="Admins"         value={stats.stats.adminCount}       color="red" />
          </div>

          <div className="card">
            <h2 className="font-semibold text-white mb-4">🕐 Recent Signups</h2>
            <div className="space-y-3">
              {stats.recentUsers?.map((u) => (
                <div key={u._id} className="flex items-center gap-3">
                  <Avatar src={u.avatar} name={u.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <Badge variant={u.role === 'admin' ? 'red' : u.role === 'mentor' ? 'amber' : 'gray'}>
                    {u.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="input flex-1"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input w-40"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card animate-pulse h-16" />
              ))}
            </div>
          ) : (
            <div className="card !p-0 overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-800/80 border-b border-gray-700">
                  <tr>
                    {['User', 'Role', 'Status', 'Domain', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  )}
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-800/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={u.avatar} name={u.name} size="xs" />
                          <div>
                            <p className="text-sm font-medium text-white">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-gray-700 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.isActive ? 'green' : 'red'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {u.techDomain || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleStatus(u._id)}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                            className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                          >
                            {u.isActive ? '🔒' : '🔓'}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            title="Delete user"
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <HiTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Communities Tab */}
      {tab === 'communities' && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🏘️</p>
          <p className="text-gray-300 font-medium mb-2">Community Management</p>
          <p className="text-gray-400 text-sm">
            Toggle active status, assign admins, and monitor activity via the API.
          </p>
          <code className="block mt-4 text-xs text-indigo-300 bg-gray-800/80 rounded-lg px-4 py-2 inline-block">
            GET /api/admin/communities
          </code>
        </div>
      )}
    </div>
  );
}
