'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Loader, 
  X,
  Filter,
  Calendar,
  RefreshCw,
  Shield,
  Users,
  Wallet,
  CreditCard,
  Fingerprint,
  Lock,
  User,
  Banknote,
  TrendingUp,
  Award,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Eye,
  Trash2
} from 'lucide-react';
import { CheckingDataModal } from '@/components/checking-data-modal';
import { formatPHP } from '@/lib/currency';
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info';
import { useAdminRole } from '@/contexts/admin-context';
import { canUseUserAction } from '@/lib/admin-roles';

interface Member {
  id: string;
  name: string;
  username: string;
  score: number;
  wallet: number;
  withdrawalCode: string | null;
  registrationDate: string;
  status: 'active' | 'disabled';
  registrationArea: string;
  ipAddress: string;
  lastLoginLocation?: string | null;
  lastLoginIp?: string | null;
  lastLoginAt?: string | null;
  note: string | null;
  email?: string;
}

interface ApiResponse {
  success: boolean;
  data: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const QUICK_DATE_RANGES = {
  today: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      start: today,
      end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    };
  },
  yesterday: () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return {
      start: yesterday,
      end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
    };
  },
  week: () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start, end: today };
  },
  lastWeek: () => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() - 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  },
  month: () => {
    const today = new Date();
    const start = new Date(today);
    start.setMonth(today.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    return { start, end: today };
  },
  lastMonth: () => {
    const today = new Date();
    const end = new Date(today);
    end.setMonth(today.getMonth() - 1);
    end.setDate(1);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  },
};

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminRole = useAdminRole();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [fullMemberData, setFullMemberData] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [actionType, setActionType] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionData, setActionData] = useState<any>({});
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setPage(1);
      if (searchTimeout) clearTimeout(searchTimeout);
      setSearchTimeout(
        setTimeout(() => {
          // API will be called in the useEffect
        }, 300)
      );
    },
    [searchTimeout]
  );

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin', { method: 'GET' });
        if (!response.ok) {
          router.push('/admin-login');
          return;
        }
        setIsLoading(false);
      } catch (err) {
        console.error('[v0] Session check error:', err);
        router.push('/admin-login');
      }
    };
    checkSession();
  }, [router]);

  // Fetch members
  const fetchMembers = async () => {
    try {
      setIsFetching(true);
      setError('');

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());

      const response = await fetch(`/api/members?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setMembers(data.data);
        setTotalMembers(data.pagination.total);
        setTotalPages(data.pagination.pages);
      } else {
        throw new Error(data.error || 'Failed to fetch members');
      }
    } catch (err) {
      console.error('[v0] Fetch members error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    fetchMembers();
  }, [isLoading, page, searchTerm, startDate, endDate, pageSize]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) => {
    return formatPHP(amount);
  };

  const formatRegistrationArea = (member: Member) => {
    const location = member.lastLoginLocation || member.registrationArea || 'Unknown';
    const ip = member.lastLoginIp || member.ipAddress || 'N/A';
    return `${location} · IP: ${ip}`;
  };

  const applyQuickDateRange = (range: keyof typeof QUICK_DATE_RANGES) => {
    const dates = QUICK_DATE_RANGES[range]();
    setStartDate(dates.start.toISOString().split('T')[0]);
    setEndDate(dates.end.toISOString().split('T')[0]);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const fetchMemberDetail = async (memberId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/members/${memberId}`);
      const data = await response.json();

      if (data.success) {
        setFullMemberData(data.data);
        setSelectedMember(data.data);
      } else {
        setError('Failed to fetch member details');
      }
    } catch (err) {
      console.error('[v0] Fetch detail error:', err);
      setError('Failed to fetch member details');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewMember = async (member: Member) => {
    await fetchMemberDetail(member.id);
    setShowDetailModal(true);
  };

  const handleViewNote = (note: string | null) => {
    if (note) {
      setSelectedNote(note);
      setShowNoteModal(true);
    }
  };

  const handleAction = async (member: Member, action: string) => {
    setSelectedMember(member);
    setActionType(action);
    setActionData({});
    setShowActionModal(true);

    // Fetch user data for identity and bank actions
    if (action === 'identity' || action === 'bank') {
      try {
        const response = await fetch(`/api/members/${member.id}`);
        if (response.ok) {
          const result = await response.json();
          const userData = result.data;
          console.log('[v0] User data fetched:', userData);

          if (action === 'identity') {
            // Get ID card number and full name
            setActionData({
              idNumber: userData.id_card_number || '',
              actualName: userData.full_name || ''
            });
          } else if (action === 'bank') {
            // Fetch bank information
            setActionData({
              bankName: userData.bank_name || '',
              accountNumber: userData.account_number || ''
            });
          }
        }
      } catch (error) {
        console.error('[v0] Error fetching user data:', error);
      }
    }
  };

  const handleActionSubmit = async () => {
    if (!selectedMember) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      // Prepare payload based on action type
      let payload: any = {
        action: actionType,
      };

      if (actionType === 'status') {
        // For status toggle, we need to specify what we're toggling TO
        // If current status is 'active', we're disabling (setting to disabled/true for is_banned)
        // If current status is 'disabled', we're enabling (setting to active/false for is_banned)
        payload.status = selectedMember.status === 'active' ? 'disabled' : 'active';
      } else {
        payload = { ...payload, ...actionData };
      }

      console.log('[v0] Sending PATCH request:', payload);

      const response = await fetch(`/api/members/${selectedMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('[v0] PATCH response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update member');
      }

      setSuccess('Member updated successfully');
      setShowActionModal(false);

      // Refresh member list
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('[v0] Action error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update member');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#6C757D]">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-blue-50/30 border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
                User Management
              </span>
            </h1>
            <p className="text-sm text-[#6C757D] flex items-center gap-2">
              <Users className="w-3 h-3" />
              Showing {totalMembers} members total
            </p>
          </div>
          
          {/* Government Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-red-50 px-3 py-1.5 rounded-full border border-[#0038A8]/20">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#212529]">SEC • BSP • DMW</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#CE1126] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#CE1126] font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
            <div className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5">✓</div>
            <p className="text-sm text-[#00A86B] font-medium">{success}</p>
          </div>
        )}

        {/* Filter Card */}
        <Card className="p-6 mb-8 border border-gray-100 shadow-md bg-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#212529]">Filter Users</h3>
          </div>
          
          <div className="space-y-4">
            {/* Search and Date Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-1">
                  <User className="w-4 h-4 text-[#0038A8]" />
                  Search by Name or Phone
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6C757D]" />
                  <input
                    type="text"
                    placeholder="Search by name or username..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[#0038A8]" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[#CE1126]" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                />
              </div>
            </div>

            {/* Quick Date Buttons and Actions */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]" onClick={() => applyQuickDateRange('today')}>
                Today
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]" onClick={() => applyQuickDateRange('yesterday')}>
                Yesterday
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]" onClick={() => applyQuickDateRange('week')}>
                This Week
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]" onClick={() => applyQuickDateRange('lastWeek')}>
                Last Week
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]" onClick={() => applyQuickDateRange('month')}>
                This Month
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]" onClick={() => applyQuickDateRange('lastMonth')}>
                Last Month
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20] gap-1"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </Button>
              <Button size="sm" className="border-2 border-[#0038A8] text-[#0038A8] bg-white hover:bg-blue-50" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Members Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">No.</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Username</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Score</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Wallet</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Area</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Note</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#212529]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isFetching && members.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#0038A8] border-t-[#CE1126] rounded-full animate-spin" />
                        <span className="text-[#6C757D]">Loading members...</span>
                      </div>
                    </td>
                  </tr>
                ) : members.length > 0 ? (
                  members.map((member, index) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-4 text-[#212529]">{(page - 1) * pageSize + index + 1}</td>
                      <td className="px-4 py-4 text-[#212529] font-medium">{member.name}</td>
                      <td className="px-4 py-4 text-[#212529] text-sm">{member.username}</td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-[#0038A8]" />
                          <span className="text-[#212529]">{member.score}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1">
                          <Wallet className="w-3 h-3 text-[#00A86B]" />
                          <span className="text-[#212529]">{formatCurrency(member.wallet)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {member.withdrawalCode || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#212529] text-sm">{formatDate(member.registrationDate)}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.status === 'active'
                              ? 'bg-green-50 text-[#00A86B] border border-green-200'
                              : 'bg-red-50 text-[#CE1126] border border-red-200'
                          }`}
                        >
                          {member.status === 'active' ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td 
                        className="px-4 py-4 text-[#212529] text-xs min-w-[140px] max-w-[280px]" 
                        title={formatRegistrationArea(member)}
                      >
                        <span className="flex items-center gap-1 flex-wrap">
                          {member.lastLoginLocation || member.registrationArea ? (
                            <Globe className="w-3 h-3 text-[#00A86B] shrink-0" />
                          ) : (
                            <MapPin className="w-3 h-3 text-[#6C757D] shrink-0" />
                          )}
                          <span className="break-words">
                            {formatRegistrationArea(member)}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {member.note ? (
                          <button
                            onClick={() => handleViewNote(member.note)}
                            className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors group"
                            title="Click to view full note"
                          >
                            <FileText className="w-3 h-3 text-[#0038A8]" />
                            <span className="text-[#212529] max-w-[100px] truncate">
                              {member.note.length > 15 ? member.note.substring(0, 15) + '...' : member.note}
                            </span>
                            <Eye className="w-3 h-3 text-[#6C757D] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ) : (
                          <span className="text-[#6C757D] text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 min-w-[200px]">
                          {canUseUserAction(adminRole, 'details') && (
                          <button
                            onClick={() => handleViewMember(member)}
                            className="px-2 py-1 text-xs font-medium bg-blue-50 text-[#0038A8] rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap"
                            title="View member details"
                          >
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Details
                            </span>
                          </button>
                          )}
                          {canUseUserAction(adminRole, 'wallet') && (
                          <button
                            onClick={() => handleAction(member, 'wallet')}
                            className="px-2 py-1 text-xs font-medium bg-emerald-50 text-[#00A86B] rounded-md hover:bg-emerald-100 transition-colors whitespace-nowrap"
                          >
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              Wallet
                            </span>
                          </button>
                          )}
                          {canUseUserAction(adminRole, 'withdrawal-code') && (
                          <button
                            onClick={() => handleAction(member, 'withdrawal-code')}
                            className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors whitespace-nowrap"
                          >
                            <span className="flex items-center gap-1">
                              <Fingerprint className="w-3 h-3" />
                              Code
                            </span>
                          </button>
                          )}
                          {canUseUserAction(adminRole, 'score') && (
                          <button
                            onClick={() => handleAction(member, 'score')}
                            className="px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 transition-colors whitespace-nowrap"
                          >
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Score
                            </span>
                          </button>
                          )}
                          {canUseUserAction(adminRole, 'identity') && (
                          <button
                            onClick={() => handleAction(member, 'identity')}
                            className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors whitespace-nowrap"
                          >
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              ID
                            </span>
                          </button>
                          )}
                          {canUseUserAction(adminRole, 'password') && (
                          <button
                            onClick={() => handleAction(member, 'password')}
                            className="px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors whitespace-nowrap"
                          >
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Password
                            </span>
                          </button>
                          )}
                          {canUseUserAction(adminRole, 'bank') && (
                          <button
                            onClick={() => handleAction(member, 'bank')}
                            className="px-2 py-1 text-xs font-medium bg-cyan-50 text-cyan-700 rounded-md hover:bg-cyan-100 transition-colors whitespace-nowrap"
                          >
                            <span className="flex items-center gap-1">
                              <Banknote className="w-3 h-3" />
                              Bank
                            </span>
                          </button>
                          )}
                          {canUseUserAction(adminRole, 'status') && (
                          <button
                            onClick={() => handleAction(member, 'status')}
                            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                              member.status === 'active'
                                ? 'bg-red-50 text-[#CE1126] hover:bg-red-100'
                                : 'bg-green-50 text-[#00A86B] hover:bg-green-100'
                            }`}
                          >
                            {member.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                          )}
                          {canUseUserAction(adminRole, 'delete') && (
                          <button
                            onClick={() => {
                              setMemberToDelete(member);
                              setShowDeleteConfirm(true);
                            }}
                            className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap"
                            title="Permanently delete user and all data"
                          >
                            <span className="flex items-center gap-1">
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </span>
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-12 h-12 text-gray-300" />
                        <p className="text-[#6C757D] text-lg">No members found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || isFetching}
              className="border-2 border-[#0038A8] text-[#0038A8] bg-white hover:bg-blue-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <span className="text-sm text-[#6C757D]">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || isFetching}
              className="border-2 border-[#0038A8] text-[#0038A8] bg-white hover:bg-blue-50 disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Government Logos */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 border border-[#0038A8]/20">
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

      {/* Detail Modal - Using Comprehensive Checking Data Modal */}
      {showDetailModal && selectedMember && (
        <CheckingDataModal
          memberId={selectedMember.id}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && memberToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 border-2 border-red-200 shadow-xl bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-[#212529]">Permanently delete user</h3>
              </div>
              <button
                onClick={() => { setShowDeleteConfirm(false); setMemberToDelete(null); }}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                disabled={deleteLoading}
              >
                <X className="w-5 h-5 text-[#6C757D]" />
              </button>
            </div>
            <p className="text-sm text-[#6C757D] mb-2">
              This will <strong>permanently delete</strong> the user and all related data from the database (loans, transactions, withdrawals, etc.). This cannot be undone.
            </p>
            <p className="text-sm text-[#212529] mb-4 p-3 bg-gray-50 rounded-lg">
              User: <span className="font-semibold">{memberToDelete.name}</span>
              <br />
              <span className="text-xs text-[#6C757D]">Username / Phone: {memberToDelete.username}</span>
            </p>
            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  if (!memberToDelete) return;
                  setDeleteLoading(true);
                  setError('');
                  try {
                    const res = await fetch(`/api/admin/users/${memberToDelete.id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
                    setSuccess('User has been permanently deleted.');
                    setShowDeleteConfirm(false);
                    setMemberToDelete(null);
                    await fetchMembers();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to delete user');
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    Delete permanently
                  </>
                )}
              </Button>
              <Button
                onClick={() => { setShowDeleteConfirm(false); setMemberToDelete(null); }}
                variant="outline"
                className="flex-1 border-2 border-gray-200"
                disabled={deleteLoading}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 border border-gray-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#212529]">User Note</h3>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-[#6C757D]" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-[#6C757D] mb-2">Full Note:</p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[300px] overflow-y-auto">
                <p className="text-[#212529] whitespace-pre-wrap break-words">{selectedNote}</p>
              </div>
            </div>

            <Button
              onClick={() => setShowNoteModal(false)}
              className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white"
            >
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 border border-gray-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
                  {actionType === 'wallet' && <Wallet className="w-4 h-4 text-white" />}
                  {actionType === 'withdrawal-code' && <Fingerprint className="w-4 h-4 text-white" />}
                  {actionType === 'score' && <TrendingUp className="w-4 h-4 text-white" />}
                  {actionType === 'identity' && <CreditCard className="w-4 h-4 text-white" />}
                  {actionType === 'password' && <Lock className="w-4 h-4 text-white" />}
                  {actionType === 'bank' && <Banknote className="w-4 h-4 text-white" />}
                  {actionType === 'status' && <User className="w-4 h-4 text-white" />}
                </div>
                <h3 className="text-lg font-bold text-[#212529]">
                  {actionType === 'wallet' && 'Wallet Modification'}
                  {actionType === 'withdrawal-code' && 'Withdrawal Code'}
                  {actionType === 'score' && 'Credit Score'}
                  {actionType === 'identity' && 'ID Identify'}
                  {actionType === 'password' && 'Password'}
                  {actionType === 'bank' && 'Bank Card Number'}
                  {actionType === 'status' && `${selectedMember.status === 'active' ? 'Disable' : 'Enable'} Member`}
                </h3>
              </div>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-[#6C757D]" />
              </button>
            </div>

            <p className="text-sm text-[#6C757D] mb-4">
              Member: <span className="font-medium text-[#212529]">{selectedMember.name}</span>
            </p>

            {actionType === 'wallet' && (
              <div className="mb-4">
                <p className="text-sm text-[#6C757D] mb-2">Current Balance</p>
                <p className="text-[#212529] font-medium mb-4 text-xl text-[#0038A8]">{formatCurrency(selectedMember.wallet)}</p>
                <label className="block text-sm font-medium text-[#212529] mb-2">New Amount</label>
                <input
                  type="number"
                  placeholder="Enter new amount"
                  value={actionData.amount || ''}
                  onChange={(e) => setActionData({ ...actionData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                />
              </div>
            )}

            {actionType === 'withdrawal-code' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#212529] mb-2">Enter A Withdraw Code</label>
                <input
                  type="text"
                  placeholder="Enter code"
                  value={actionData.code || ''}
                  onChange={(e) => setActionData({ ...actionData, code: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                />
              </div>
            )}

            {actionType === 'score' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#212529] mb-2">Credit Score (Default: 500)</label>
                <input
                  type="number"
                  placeholder="Enter score"
                  defaultValue={selectedMember.score || 500}
                  onChange={(e) => setActionData({ ...actionData, score: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                />
              </div>
            )}

            {actionType === 'identity' && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-2">ID Card Number</label>
                  <input
                    type="text"
                    placeholder="Enter ID card number"
                    value={actionData.idNumber || ''}
                    onChange={(e) => setActionData({ ...actionData, idNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-2">Actual Name</label>
                  <input
                    type="text"
                    placeholder="Enter actual name"
                    value={actionData.actualName || ''}
                    onChange={(e) => setActionData({ ...actionData, actualName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {actionType === 'password' && (
              <div className="mb-4">
                <p className="text-sm text-[#6C757D] mb-3">Phone: <span className="font-medium text-[#212529]">{selectedMember.username}</span></p>
                <label className="block text-sm font-medium text-[#212529] mb-2">Enter New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={actionData.password || ''}
                  onChange={(e) => setActionData({ ...actionData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                />
              </div>
            )}

            {actionType === 'bank' && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-2">Bank Name</label>
                  <input
                    type="text"
                    placeholder="Enter bank name"
                    value={actionData.bankName || ''}
                    onChange={(e) => setActionData({ ...actionData, bankName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-2">Account Number</label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    value={actionData.accountNumber || ''}
                    onChange={(e) => setActionData({ ...actionData, accountNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {actionType === 'status' && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Are you sure you want to <span className="font-bold">{selectedMember.status === 'active' ? 'disable' : 'enable'}</span> this member?
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleActionSubmit}
                disabled={actionLoading}
                className="flex-1 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white"
              >
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : 'Confirm'}
              </Button>
              <Button onClick={() => setShowActionModal(false)} variant="outline" className="flex-1 border-2 border-gray-200">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
