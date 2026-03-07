'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Shield,
  UserPlus,
  Lock,
  Trash2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ROLE_LABELS } from '@/lib/admin-roles';

interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string | null;
}

export default function AdministratorsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'REGULAR_ADMIN' as 'SUPERIOR_ADMIN' | 'VIP_ADMIN' | 'REGULAR_ADMIN',
  });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/administrators');
      if (!res.ok) {
        if (res.status === 403) {
          router.push('/admin/dashboard');
          return;
        }
        throw new Error('Failed to fetch admins');
      }
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/administrators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          username: createForm.username.trim(),
          email: createForm.email.trim(),
          password: createForm.password,
          role: createForm.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');
      setSuccess('Admin created successfully');
      setShowCreateModal(false);
      setCreateForm({ username: '', email: '', password: '', role: 'REGULAR_ADMIN' });
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/administrators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          targetAdminId: selectedAdmin.id,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      setSuccess('Password updated successfully');
      setShowPasswordModal(false);
      setSelectedAdmin(null);
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`Deactivate admin "${admin.username}"? They will no longer be able to log in.`)) return;
    setDeletingId(admin.id);
    setError('');
    try {
      const res = await fetch('/api/admin/administrators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', targetAdminId: admin.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete admin');
      setSuccess('Admin deactivated successfully');
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#0038A8] border-t-[#CE1126] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <header className="bg-gradient-to-r from-white to-blue-50/30 border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
                Administrator Management
              </span>
            </h1>
            <p className="text-sm text-[#6C757D] flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Create, manage, and deactivate administrators
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Admin
          </Button>
        </div>
      </header>

      <main className="px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#CE1126] flex-shrink-0" />
            <p className="text-sm text-[#CE1126] font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
            <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0" />
            <p className="text-sm text-[#00A86B] font-medium">{success}</p>
          </div>
        )}

        <Card className="border border-gray-100 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Username</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Last Login</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-100 hover:bg-blue-50/30">
                    <td className="px-4 py-4 font-medium">{admin.username}</td>
                    <td className="px-4 py-4 text-[#6C757D]">{admin.email}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-[#0038A8]">
                        {ROLE_LABELS[admin.role] || admin.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          admin.is_active ? 'bg-green-50 text-[#00A86B]' : 'bg-red-50 text-[#CE1126]'
                        }`}
                      >
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#6C757D]">{formatDate(admin.last_login)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setNewPassword('');
                            setShowPasswordModal(true);
                          }}
                          disabled={!admin.is_active}
                        >
                          <Lock className="w-3 h-3 mr-1" />
                          Password
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(admin)}
                          disabled={!admin.is_active || deletingId === admin.id}
                        >
                          {deletingId === admin.id ? '...' : <><Trash2 className="w-3 h-3 mr-1" />Deactivate</>}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-lg font-bold mb-4">Create New Admin</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={createForm.password}
                    onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Min 8 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="REGULAR_ADMIN">Regular Admin (Details + Checking only)</option>
                  <option value="VIP_ADMIN">VIP Admin (All except this page)</option>
                  <option value="SUPERIOR_ADMIN">Superior Admin (Full access)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-lg font-bold mb-4">Change Password: {selectedAdmin.username}</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowPasswordModal(false); setSelectedAdmin(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
