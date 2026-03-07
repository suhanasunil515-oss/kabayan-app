'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Lock, 
  Ban, 
  CreditCard, 
  User, 
  History, 
  FileText, 
  CheckCircle, 
  Eye,
  Shield,
  Wallet,
  Calendar,
  Phone,
  Mail,
  Award,
  Clock,
  AlertCircle,
  Briefcase,
  DollarSign,
  Percent,
  Fingerprint,
  Camera,
  Signature,
  Banknote,
  RefreshCw
} from 'lucide-react';
import { formatPHP } from '@/lib/currency';
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info';

interface UserData {
  id: number;
  phone_number: string;
  full_name: string;
  email?: string;
  wallet_balance: number;
  credit_score: number;
  created_at: string;
  personal_info_completed: boolean;
  kyc_completed: boolean;
  signature_completed: boolean;
  last_verified_at?: string;
  bank_details?: any;
}

interface Loan {
  id: number;
  status: string;
  amount_requested: number;
  interest_rate: number;
  loan_term_months: number;
  personal_info: any;
  kyc_front_url?: string;
  kyc_back_url?: string;
  selfie_url?: string;
  signature_url?: string;
  created_at: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description?: string;
  created_at: string;
}

interface Activity {
  transactions: Transaction[];
  repayments: any[];
}

interface WalletNoteEntry {
  id: number;
  admin_username?: string | null;
  admin_id?: number | null;
  old_balance?: number | null;
  new_balance?: number | null;
  amount_changed?: number | null;
  reason?: string | null;
  created_at: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [walletNoteHistory, setWalletNoteHistory] = useState<WalletNoteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'verification' | 'activity' | 'actions'>('profile');

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newOTP, setNewOTP] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkSession();
  }, [router]);

  useEffect(() => {
    if (!isLoading && userId) {
      console.log('[v0] Triggering fetchUserData with userId:', userId);
      fetchUserData();
    }
  }, [isLoading, userId]);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/admin', { method: 'GET' });
      if (!response.ok) {
        router.push('/admin/login');
        return;
      }
      setIsLoading(false);
    } catch (err) {
      router.push('/admin/login');
    }
  };

  const fetchUserData = async () => {
    try {
      setError('');
      console.log('[v0] Fetching user data for ID:', userId);
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_detail',
          userId: parseInt(userId),
        }),
      });

      console.log('[v0] API response status:', response.status);
      const data = await response.json();
      console.log('[v0] API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user data');
      }

      if (!data.user) {
        throw new Error('No user data returned from API');
      }

      setUser(data.user);
      setLoans(data.loans || []);
      setActivity(data.activity);
      setWalletNoteHistory(data.walletNoteHistory || []);
      console.log('[v0] User data loaded:', data.user?.id);
    } catch (err) {
      console.error('[v0] Fetch user error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          userId: user?.id,
          password: newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');

      setShowPasswordModal(false);
      setNewPassword('');
      alert('Password reset successfully');
      fetchUserData();
    } catch (err) {
      console.error('[v0] Reset password error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateOTP = async () => {
    if (!newOTP) {
      setError('Please enter OTP');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_otp',
          userId: user?.id,
          otp: newOTP,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update OTP');

      setShowOTPModal(false);
      setNewOTP('');
      alert('OTP updated successfully');
      fetchUserData();
    } catch (err) {
      console.error('[v0] Update OTP error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update OTP');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBanUser = async () => {
    if (!confirm('Are you sure you want to ban this user? They will not be able to login.')) return;

    try {
      setError('');
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ban_user',
          userId: user?.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to ban user');

      alert('User banned successfully');
      fetchUserData();
    } catch (err) {
      console.error('[v0] Ban user error:', err);
      setError(err instanceof Error ? err.message : 'Failed to ban user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#0038A8] border-t-[#CE1126] rounded-full animate-spin" />
          </div>
          <p className="text-[#6C757D] font-medium">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md border border-gray-100 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-[#CE1126]" />
            </div>
            <p className="text-[#212529] text-lg mb-2">User not found</p>
            <p className="text-[#6C757D] text-sm mb-6">The user you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.back()} className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white">
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'active': return '#00A86B';
      case 'pending': return '#FF6B00';
      case 'rejected': return '#CE1126';
      default: return '#6C757D';
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="gap-2 text-[#0038A8] hover:text-[#002c86]">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Users
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
                    {user.full_name || 'Unknown'}
                  </span>
                </h1>
                <p className="text-sm text-[#6C757D] flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {user.phone_number}
                  {user.email && (
                    <>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </>
                  )}
                </p>
              </div>
            </div>
            
            {/* Government Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-red-50 px-3 py-1.5 rounded-full border border-[#0038A8]/20">
              <Shield className="w-4 h-4 text-[#0038A8]" />
              <span className="text-xs font-medium text-[#212529]">SEC • BSP • DMW</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#CE1126] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#CE1126] font-medium">{error}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto pb-1">
          {(['profile', 'verification', 'activity', 'actions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium rounded-t-lg transition-all capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white shadow-md'
                  : 'text-[#6C757D] hover:text-[#0038A8] hover:bg-blue-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border border-gray-100 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-[#212529]">Personal Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#6C757D] mb-1">Full Name</p>
                  <p className="text-[#212529] font-medium">{user.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6C757D] mb-1">Phone Number</p>
                  <p className="text-[#212529] font-medium">{user.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6C757D] mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Member Since
                  </p>
                  <p className="text-[#212529] font-medium">{new Date(user.created_at).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6C757D] mb-1 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Credit Score
                  </p>
                  <p className="text-2xl font-bold text-[#0038A8]">{user.credit_score || '-'}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-gray-100 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-[#212529]">Wallet & Funds</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#6C757D] mb-1">Wallet Balance</p>
                  <p className="text-3xl font-bold text-[#0038A8]">{formatPHP(Number(user.wallet_balance || 0))}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6C757D] mb-1">Account Status</p>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium text-white inline-block"
                    style={{ backgroundColor: getStatusColor('active') }}
                  >
                    Active
                  </span>
                </div>
                {user.last_verified_at && (
                  <div>
                    <p className="text-sm text-[#6C757D] mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last Verified
                    </p>
                    <p className="text-[#212529]">{new Date(user.last_verified_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Wallet change history (all notes from administrators) */}
            <Card className="p-6 border border-gray-100 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-[#212529]">Wallet change history (Notes)</h3>
              </div>
              {walletNoteHistory.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {walletNoteHistory.map((entry) => {
                    const admin = entry.admin_username?.trim() || 'Unknown administrator';
                    const oldVal = entry.old_balance != null ? Number(entry.old_balance).toLocaleString('en-PH') : '0';
                    const newVal = entry.new_balance != null ? Number(entry.new_balance).toLocaleString('en-PH') : '0';
                    const dateStr = entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
                    return (
                      <li key={entry.id} className="py-2 px-3 bg-gray-50 rounded-lg border border-gray-100 text-[#212529]">
                        Administrator username &quot;{admin}&quot; changed the balance from {oldVal} to {newVal} on {dateStr}.
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[#6C757D]">No wallet balance changes recorded yet.</p>
              )}
            </Card>
          </div>
        )}

        {/* VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <Card className="p-6 border border-gray-100 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-[#212529]">Verification Status</h3>
              </div>
              
              <div className="space-y-4">
                {/* Personal Info Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${user.personal_info_completed ? 'bg-green-50' : 'bg-gray-100'}`}>
                      <User className={`w-5 h-5 ${user.personal_info_completed ? 'text-[#00A86B]' : 'text-[#6C757D]'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-[#212529]">Personal Information</p>
                      <p className="text-sm text-[#6C757D]">{user.personal_info_completed ? 'Completed' : 'Pending'}</p>
                    </div>
                  </div>
                  {user.personal_info_completed && <CheckCircle className="w-5 h-5 text-[#00A86B]" />}
                </div>

                {/* KYC Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${user.kyc_completed ? 'bg-green-50' : 'bg-gray-100'}`}>
                      <Camera className={`w-5 h-5 ${user.kyc_completed ? 'text-[#00A86B]' : 'text-[#6C757D]'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-[#212529]">KYC Documents</p>
                      <p className="text-sm text-[#6C757D]">{user.kyc_completed ? 'Verified' : 'Pending'}</p>
                    </div>
                  </div>
                  {user.kyc_completed && <CheckCircle className="w-5 h-5 text-[#00A86B]" />}
                </div>

                {/* Signature Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${user.signature_completed ? 'bg-green-50' : 'bg-gray-100'}`}>
                      <Signature className={`w-5 h-5 ${user.signature_completed ? 'text-[#00A86B]' : 'text-[#6C757D]'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-[#212529]">Signature</p>
                      <p className="text-sm text-[#6C757D]">{user.signature_completed ? 'Completed' : 'Pending'}</p>
                    </div>
                  </div>
                  {user.signature_completed && <CheckCircle className="w-5 h-5 text-[#00A86B]" />}
                </div>
              </div>
            </Card>

            {loans.length > 0 && loans[0] && (
              <Card className="p-6 border border-gray-100 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#212529]">KYC Documents</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loans[0].kyc_front_url && (
                    <div>
                      <p className="text-sm text-[#6C757D] mb-2">ID Front</p>
                      <div className="relative group">
                        <img src={loans[0].kyc_front_url || "/placeholder.svg"} alt="KYC Front" className="rounded-lg border border-gray-200 h-40 object-cover w-full" />
                        <a href={loans[0].kyc_front_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Eye className="w-8 h-8 text-white" />
                        </a>
                      </div>
                    </div>
                  )}
                  {loans[0].kyc_back_url && (
                    <div>
                      <p className="text-sm text-[#6C757D] mb-2">ID Back</p>
                      <div className="relative group">
                        <img src={loans[0].kyc_back_url || "/placeholder.svg"} alt="KYC Back" className="rounded-lg border border-gray-200 h-40 object-cover w-full" />
                        <a href={loans[0].kyc_back_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Eye className="w-8 h-8 text-white" />
                        </a>
                      </div>
                    </div>
                  )}
                  {loans[0].selfie_url && (
                    <div>
                      <p className="text-sm text-[#6C757D] mb-2">Selfie</p>
                      <div className="relative group">
                        <img src={loans[0].selfie_url || "/placeholder.svg"} alt="Selfie" className="rounded-lg border border-gray-200 h-40 object-cover w-full" />
                        <a href={loans[0].selfie_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Eye className="w-8 h-8 text-white" />
                        </a>
                      </div>
                    </div>
                  )}
                  {loans[0].signature_url && (
                    <div>
                      <p className="text-sm text-[#6C757D] mb-2">Signature</p>
                      <div className="relative group">
                        <img src={loans[0].signature_url || "/placeholder.svg"} alt="Signature" className="rounded-lg border border-gray-200 h-40 object-cover w-full" />
                        <a href={loans[0].signature_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Eye className="w-8 h-8 text-white" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            {activity && activity.transactions.length > 0 && (
              <Card className="p-6 border border-gray-100 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#212529]">Recent Transactions</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-[#6C757D] font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-[#6C757D] font-medium">Type</th>
                        <th className="px-4 py-3 text-left text-[#6C757D] font-medium">Amount</th>
                        <th className="px-4 py-3 text-left text-[#6C757D] font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.transactions.map((tx) => {
                        const isCredit = tx.type === 'deposit' || tx.type === 'manual_deposit' || tx.type === 'loan_disbursement';
                        return (
                          <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-[#212529]">{new Date(tx.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 capitalize text-[#212529]">{tx.type}</td>
                            <td className={`px-4 py-3 font-medium ${isCredit ? 'text-[#00A86B]' : 'text-[#CE1126]'}`}>
                              {isCredit ? '+' : '-'}{formatPHP(Number(tx.amount))}
                            </td>
                            <td className="px-4 py-3 text-[#6C757D]">{tx.description || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {(!activity || activity.transactions.length === 0) && (
              <Card className="p-12 text-center border border-gray-100">
                <div className="flex flex-col items-center">
                  <History className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-[#6C757D] text-lg mb-1">No activity found</p>
                  <p className="text-gray-400 text-sm">This user hasn't made any transactions yet.</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ACTIONS TAB */}
        {activeTab === 'actions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#0038A8]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#212529]">Password Management</h3>
                  <p className="text-xs text-[#6C757D]">Reset user login password</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowPasswordModal(true)} 
                className="w-full border-2 border-[#0038A8] text-[#0038A8] bg-white hover:bg-blue-50 mt-2"
              >
                Reset Password
              </Button>
            </Card>

            <Card className="p-6 border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-[#CE1126]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#212529]">Withdrawal OTP</h3>
                  <p className="text-xs text-[#6C757D]">Set or update withdrawal OTP code</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowOTPModal(true)} 
                className="w-full border-2 border-[#CE1126] text-[#CE1126] bg-white hover:bg-red-50 mt-2"
              >
                Update OTP
              </Button>
            </Card>

            <Card className="p-6 border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-[#00A86B]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#212529]">Bank Details</h3>
                  <p className="text-xs text-[#6C757D]">Edit user bank account information</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowBankModal(true)} 
                className="w-full border-2 border-[#00A86B] text-[#00A86B] bg-white hover:bg-green-50 mt-2"
              >
                Edit Bank Details
              </Button>
            </Card>

            <Card className="p-6 border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#212529]">Personal Info</h3>
                  <p className="text-xs text-[#6C757D]">Update user name and phone</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowPersonalModal(true)} 
                className="w-full border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-50 mt-2"
              >
                Edit Personal Info
              </Button>
            </Card>

            <Card className="p-6 md:col-span-2 border border-gray-100 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Ban className="w-5 h-5 text-[#CE1126]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#212529]">Account Status</h3>
                  <p className="text-xs text-[#6C757D]">Ban user from accessing their account</p>
                </div>
              </div>
              <Button 
                onClick={handleBanUser} 
                className="w-full bg-gradient-to-r from-[#CE1126] to-[#b80f20] hover:from-[#b80f20] hover:to-[#9e0d1b] text-white mt-2"
              >
                Ban User
              </Button>
            </Card>
          </div>
        )}

        {/* Government Logos */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 border border-[#0038A8]/20">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#00A86B]">BSP Supervised</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#CE1126]">DMW Accredited</span>
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 border border-gray-100 shadow-xl">
            <h3 className="text-lg font-bold text-[#212529] mb-2">Reset Password</h3>
            <p className="text-sm text-[#6C757D] mb-4">Enter a new password for {user.full_name}</p>
            
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#212529] mb-4 focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={handleResetPassword} 
                disabled={isSaving} 
                className="flex-1 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : 'Reset Password'}
              </Button>
              <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1 border-2 border-gray-200">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Update OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 border border-gray-100 shadow-xl">
            <h3 className="text-lg font-bold text-[#212529] mb-2">Update Withdrawal OTP</h3>
            <p className="text-sm text-[#6C757D] mb-4">Set a new OTP code for {user.full_name}</p>
            
            <input
              type="text"
              placeholder="Enter OTP Code"
              value={newOTP}
              onChange={(e) => setNewOTP(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#212529] mb-4 focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={handleUpdateOTP} 
                disabled={isSaving} 
                className="flex-1 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating...
                  </span>
                ) : 'Update OTP'}
              </Button>
              <Button onClick={() => setShowOTPModal(false)} variant="outline" className="flex-1 border-2 border-gray-200">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 border border-gray-100 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Banknote className="w-5 h-5 text-[#00A86B]" />
              </div>
              <h3 className="text-lg font-bold text-[#212529]">Edit Bank Details</h3>
            </div>
            <p className="text-sm text-[#6C757D] mb-6">Feature coming soon. You'll be able to edit user bank account information.</p>
            <Button onClick={() => setShowBankModal(false)} className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white">
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Personal Info Modal */}
      {showPersonalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 border border-gray-100 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-[#212529]">Edit Personal Info</h3>
            </div>
            <p className="text-sm text-[#6C757D] mb-6">Feature coming soon. You'll be able to edit user name and phone number.</p>
            <Button onClick={() => setShowPersonalModal(false)} className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white">
              Close
            </Button>
          </Card>
        </div>
      )}
    </>
  );
}
