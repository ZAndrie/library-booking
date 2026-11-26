'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/frontend/components/ToastProvider';
import {
  Users,
  ShieldCheck,
  Search,
  UserPlus,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  UserX,
  UserCheck,
  ShieldAlert,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  role: 'staff' | 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersView() {
  const { toast } = useToast();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Password reset modal state
  const [resetTargetUser, setResetTargetUser] = useState<StaffUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // Delete modal state
  const [deleteTargetUser, setDeleteTargetUser] = useState<StaffUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Create account modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    employeeId: '',
    password: '',
    role: 'staff' as 'staff' | 'admin' | 'super_admin',
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch staff directory');
      }
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string, title = 'Saved') => {
    setSuccessMsg(msg);
    toast.success(msg, title);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account');

      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        employeeId: '',
        password: '',
        role: 'staff',
      });
      setShowCreatePassword(false);
      showNotification(`Account created for ${data.user?.name || 'new staff member'}.`, 'Account Created');
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.message);
      toast.error(err.message || 'Failed to create account');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setError('');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user role');
      showNotification('User role updated successfully.');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      setError('');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update account status');
      showNotification(
        !currentStatus ? 'Account activated successfully.' : 'Account deactivated.',
        'Account Updated'
      );
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Failed to update account status');
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    try {
      setResetLoading(true);
      setResetError('');
      const res = await fetch(`/api/admin/users/${resetTargetUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      showNotification(`Password for ${resetTargetUser.name} reset successfully.`, 'Password Reset');
      setResetTargetUser(null);
      setNewPassword('');
    } catch (err: any) {
      setResetError(err.message);
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    try {
      setDeleteLoading(true);
      setError('');
      const res = await fetch(`/api/admin/users/${deleteTargetUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user account');

      showNotification(`Account for ${deleteTargetUser.name} deleted permanently.`, 'Account Deleted');
      setDeleteTargetUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalSuperAdmins = users.filter((u) => u.role === 'super_admin').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalStaff = users.filter((u) => u.role === 'staff').length;
  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-[#8B1515] border border-red-200">
                Staff Administration
              </span>
              <h1 className="font-serif font-bold text-2xl text-slate-900 tracking-tight">
                Staff & Officer Accounts
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Manage library staff permissions, assign roles, reset credentials, and monitor account access.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreateError('');
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1515] hover:bg-[#721111] text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Staff Account</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Accounts</div>
            <div className="text-2xl font-bold font-serif text-slate-900 mt-1">{users.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">{activeCount} Active</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Super Admins</div>
            <div className="text-2xl font-bold font-serif text-rose-800 mt-1">{totalSuperAdmins}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Full System Authority</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Administrators</div>
            <div className="text-2xl font-bold font-serif text-slate-900 mt-1">{totalAdmins}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Catalog & Override Controls</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Desk Staff</div>
            <div className="text-2xl font-bold font-serif text-slate-900 mt-1">{totalStaff}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Circulation & Reservations</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, employee ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#8B1515] mb-2" />
              <span>Loading staff directory...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>No staff accounts match your search filter.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Staff Officer</th>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Access Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#8B1515] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {u.employeeId}
                        </td>

                        <td className="py-3.5 px-4">
                          {isSuperAdmin && !isSelf ? (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className={`px-2 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                                u.role === 'super_admin'
                                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                                  : u.role === 'admin'
                                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                                  : 'bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              <option value="staff">Staff Desk</option>
                              <option value="admin">Administrator</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                u.role === 'super_admin'
                                  ? 'bg-rose-100 text-rose-800'
                                  : u.role === 'admin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.role.replace('_', ' ')}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active Access
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-bold text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Deactivated
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Deactivate/Activate Toggle (Super Admin Only) */}
                            {isSuperAdmin && !isSelf && (
                              <button
                                type="button"
                                onClick={() => handleToggleActive(u._id, u.isActive)}
                                title={u.isActive ? 'Deactivate staff login' : 'Activate staff login'}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  u.isActive
                                    ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {/* Reset Password Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setResetTargetUser(u);
                                setNewPassword('');
                                setResetError('');
                              }}
                              title="Reset Password"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#8B1515] hover:bg-slate-50 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete User Button (Super Admin Only) */}
                            {isSuperAdmin && !isSelf && (
                              <button
                                type="button"
                                onClick={() => setDeleteTargetUser(u)}
                                title="Delete User Permanently"
                                className="p-1.5 rounded-lg border border-red-200 text-rose-700 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

        {/* Modal 1: Reset Password */}
        {resetTargetUser && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-[#8B1515] flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">Reset Staff Password</h3>
                  <p className="text-xs text-slate-500">
                    Assign a new secure password for <strong>{resetTargetUser.name}</strong> ({resetTargetUser.employeeId})
                  </p>
                </div>
              </div>

              {resetError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {resetError}
                </div>
              )}

              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    New Temporary Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetTargetUser(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 bg-[#8B1515] hover:bg-[#721111] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                  >
                    {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Delete User Confirmation */}
        {deleteTargetUser && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900">Delete Staff Account?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to delete <strong>{deleteTargetUser.name}</strong> ({deleteTargetUser.employeeId})? This action cannot be undone.
              </p>

              <div className="flex items-center justify-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setDeleteTargetUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Create Staff Account (Admin & Super Admin Only) */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-[#8B1515] flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-900">Create Staff Account</h3>
                    <p className="text-xs text-slate-500">
                      Provision credentials for an authorized LIRC officer.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {createError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#8B1515]" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g., Maria Santos"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="e.g., maria.santos@cjc.edu.ph"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Employee / Staff ID
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.employeeId}
                      onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
                      placeholder="e.g., LIRC-2026-002"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Account Role
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          role: e.target.value as 'staff' | 'admin' | 'super_admin',
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                    >
                      <option value="staff">Staff Desk</option>
                      {currentUser?.role === 'super_admin' && (
                        <>
                          <option value="admin">Library Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {currentUser?.role !== 'super_admin' && (
                  <p className="text-[11px] text-slate-500">
                    Note: Only Super Administrators can provision Admin or Super Admin accounts.
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Initial Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="Minimum 6 characters..."
                      className="w-full px-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 bg-[#8B1515] hover:bg-[#721111] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
                  >
                    {createLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>Create Account</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
