'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Wallet,
  ArrowDownCircle,
  User
} from 'lucide-react';
import Image from 'next/image';
import { WithdrawalTable } from '@/components/withdrawal-table';
import { CheckingDataModal } from '@/components/checking-data-modal';
import { ConfirmWithdrawalModal } from '@/components/confirm-withdrawal-modal';
import DeleteConfirmDialog from '@/components/delete-confirm-dialog';
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info';
import { useAdminRole } from '@/contexts/admin-context';
import { canAccessFundManagement } from '@/lib/admin-roles';
import { formatPHP } from '@/lib/currency';

interface Withdrawal {
  id: number;
  withdraw_number: string;
  withdrawal_code: string | null;
  amount: number;
  status: string;
  withdrawal_date: string;
  user: {
    id: number;
    full_name: string;
    phone_number: string;
    wallet_balance: number;
  };
}

interface DepositUser {
  id: number;
  full_name: string;
  phone_number: string;
  wallet_balance: number;
  document_number: string | null;
}

interface DepositRecord {
  id: number;
  user_id: number;
  amount: number;
  purpose: string;
  notes: string | null;
  admin_username: string | null;
  created_at: string;
  user?: { id: number; full_name: string; phone_number: string } | null;
}

const DEPOSIT_PURPOSES = [
  'Loan disbursement',
  'Top-up',
  'Adjustment',
  'Refund',
  'Other',
];

export default function FundManagementPage() {
  const router = useRouter();
  const adminRole = useAdminRole();
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'deposits'>('withdrawals');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => {
    if (adminRole && !canAccessFundManagement(adminRole)) {
      router.replace('/admin/dashboard');
    }
  }, [adminRole, router]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Modal states
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showCheckingDataModal, setShowCheckingDataModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Deposits tab state
  const [depositSearchQuery, setDepositSearchQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState<DepositUser | null>(null);
  const [depositSearching, setDepositSearching] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPurpose, setDepositPurpose] = useState(DEPOSIT_PURPOSES[0]);
  const [depositNotes, setDepositNotes] = useState('');
  const [depositSubmitLoading, setDepositSubmitLoading] = useState(false);
  const [depositRecords, setDepositRecords] = useState<DepositRecord[]>([]);
  const [depositTotal, setDepositTotal] = useState(0);
  const [depositPage, setDepositPage] = useState(1);
  const [depositLimit] = useState(10);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [depositStartDate, setDepositStartDate] = useState('');
  const [depositEndDate, setDepositEndDate] = useState('');
  const [depositRecordSearch, setDepositRecordSearch] = useState('');

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', ((page - 1) * limit).toString());
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/withdrawals?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setWithdrawals(result.data);
        setTotal(result.total);
        setError('');
      } else {
        setError(result.error || 'Failed to fetch withdrawals');
      }
    } catch (err) {
      setError('Error fetching withdrawals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, searchTerm, statusFilter]);

  useEffect(() => {
    fetchWithdrawals();
  }, [page, startDate, endDate, searchTerm, statusFilter]);

  const fetchDepositRecords = async () => {
    try {
      setDepositLoading(true);
      const params = new URLSearchParams();
      params.set('limit', depositLimit.toString());
      params.set('offset', ((depositPage - 1) * depositLimit).toString());
      if (depositStartDate) params.set('startDate', depositStartDate);
      if (depositEndDate) params.set('endDate', depositEndDate);
      if (depositRecordSearch.trim()) params.set('search', depositRecordSearch.trim());
      const res = await fetch(`/api/admin/deposits?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDepositRecords(data.data || []);
        setDepositTotal(data.total ?? 0);
        setDepositError('');
      } else {
        setDepositError(data.error || 'Failed to load deposit records');
      }
    } catch (e) {
      setDepositError('Failed to load deposit records');
    } finally {
      setDepositLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'deposits') fetchDepositRecords();
  }, [activeTab, depositPage, depositStartDate, depositEndDate]);

  const handleDepositSearch = async () => {
    const q = depositSearchQuery.trim();
    if (!q) {
      setDepositError('Enter phone number or loan document number');
      return;
    }
    setDepositSearching(true);
    setDepositError('');
    setSearchedUser(null);
    try {
      const res = await fetch(`/api/admin/deposits?searchUser=true&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.user) {
        setSearchedUser(data.user);
        setDepositError('');
      } else {
        setDepositError(data.error || 'User not found');
      }
    } catch (e) {
      setDepositError('Search failed');
    } finally {
      setDepositSearching(false);
    }
  };

  const handleDepositSubmit = async () => {
    if (!searchedUser) {
      setDepositError('Search for a user first');
      return;
    }
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setDepositError('Enter a valid amount');
      return;
    }
    setDepositSubmitLoading(true);
    setDepositError('');
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: searchedUser.id,
          amount,
          purpose: depositPurpose,
          notes: depositNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDepositAmount('');
        setDepositNotes('');
        setSearchedUser(null);
        setDepositSearchQuery('');
        fetchDepositRecords();
        setDepositError('');
      } else {
        setDepositError(data.error || 'Deposit failed');
      }
    } catch (e) {
      setDepositError('Deposit request failed');
    } finally {
      setDepositSubmitLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchWithdrawals();
  };

  const handleRefresh = () => {
    setPage(1);
    fetchWithdrawals();
  };

  const handleCheckingData = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowCheckingDataModal(true);
  };

  const handleConfirmWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowConfirmModal(true);
  };

  const handleDeleteClick = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedWithdrawal) return;
    
    try {
      const response = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowRejectDialog(false);
        fetchWithdrawals();
      } else {
        setError(result.error || 'Failed to reject withdrawal');
      }
    } catch (err) {
      setError('Error rejecting withdrawal');
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-blue-50/30 border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
                Fund Management
              </span>
            </h1>
            <p className="text-sm text-[#6C757D] flex items-center gap-2">
              <DollarSign className="w-3 h-3" />
              Withdrawals and manual deposits
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-red-50 px-3 py-1.5 rounded-full border border-[#0038A8]/20">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#212529]">SEC • BSP • DMW</span>
          </div>
        </div>
        {/* Tabs */}
        <div className="px-6 flex gap-1 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'withdrawals'
                ? 'border-[#0038A8] text-[#0038A8]'
                : 'border-transparent text-[#6C757D] hover:text-[#212529]'
            }`}
          >
            Withdrawals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'deposits'
                ? 'border-[#0038A8] text-[#0038A8]'
                : 'border-transparent text-[#6C757D] hover:text-[#212529]'
            }`}
          >
            Manual Deposits
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {activeTab === 'withdrawals' && (
        <>
        {/* Filters */}
        <Card className="p-6 mb-6 border border-gray-100 shadow-md bg-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#212529]">Filter & Search</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Start Date */}
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

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#CE1126]" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#FF6B00]" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
                <option value="Refused To Pay">Refused To Pay</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-1">
                <Users className="w-4 h-4 text-[#0038A8]" />
                Search
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by document number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent"
                />
                <Button
                  onClick={handleSearch}
                  size="icon"
                  className="px-4 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleRefresh}
              size="sm"
              className="gap-2 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Error Message (withdrawals) */}
        {error && activeTab === 'withdrawals' && (
          <Card className="p-4 mb-6 bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#CE1126] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#CE1126]">{error}</p>
          </Card>
        )}

        {/* Table */}
        <Card className="border border-gray-100 shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#0038A8] border-t-[#CE1126] rounded-full animate-spin" />
                <p className="text-[#6C757D]">Loading withdrawals...</p>
              </div>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No withdrawals found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or check back later</p>
              </div>
            </div>
          ) : (
            <>
              <WithdrawalTable
                withdrawals={withdrawals}
                onCheckingData={handleCheckingData}
                onConfirmWithdrawal={handleConfirmWithdrawal}
                onReject={handleDeleteClick}
              />

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="border-2 border-[#0038A8] text-[#0038A8] bg-white hover:bg-blue-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <span className="text-sm text-[#6C757D]">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="border-2 border-[#0038A8] text-[#0038A8] bg-white hover:bg-blue-50 disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </Card>
        </>
        )}

        {activeTab === 'deposits' && (
          <>
            {/* Deposit form */}
            <Card className="p-6 mb-6 border border-gray-100 shadow-md bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
                  <ArrowDownCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-[#212529]">Manual Deposit</h3>
              </div>
              <p className="text-sm text-[#6C757D] mb-4">Search by user phone number or loan document number, then enter amount and purpose. Balance is added to the user&apos;s wallet in real time.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#212529] mb-1">Phone or document number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={depositSearchQuery}
                      onChange={(e) => setDepositSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDepositSearch()}
                      placeholder="e.g. +639171234567 or document number"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#0038A8]"
                    />
                    <Button
                      onClick={handleDepositSearch}
                      disabled={depositSearching}
                      className="bg-[#0038A8] hover:bg-[#002c86] text-white"
                    >
                      {depositSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>
              </div>
              {searchedUser && (
                <div className="mb-4 p-4 bg-blue-50/50 rounded-lg border border-[#0038A8]/20 flex flex-wrap items-center gap-4">
                  <User className="w-5 h-5 text-[#0038A8]" />
                  <div>
                    <p className="font-medium text-[#212529]">{searchedUser.full_name}</p>
                    <p className="text-sm text-[#6C757D]">{searchedUser.phone_number}</p>
                    {searchedUser.document_number && (
                      <p className="text-xs text-[#6C757D]">Document: {searchedUser.document_number}</p>
                    )}
                  </div>
                  <div className="ml-auto">
                    <p className="text-sm text-[#6C757D]">Current balance</p>
                    <p className="text-lg font-semibold text-[#0038A8]">{formatPHP(searchedUser.wallet_balance)}</p>
                  </div>
                </div>
              )}
              {searchedUser && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#212529] mb-1">Amount (₱)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#212529] mb-1">Purpose</label>
                    <select
                      value={depositPurpose}
                      onChange={(e) => setDepositPurpose(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8]"
                    >
                      {DEPOSIT_PURPOSES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#212529] mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      value={depositNotes}
                      onChange={(e) => setDepositNotes(e.target.value)}
                      placeholder="e.g. Reference or reason"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#0038A8]"
                    />
                  </div>
                </div>
              )}
              {searchedUser && (
                <div className="mt-4">
                  <Button
                    onClick={handleDepositSubmit}
                    disabled={depositSubmitLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                    className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white"
                  >
                    {depositSubmitLoading ? 'Processing...' : 'Complete deposit'}
                  </Button>
                </div>
              )}
            </Card>

            {depositError && activeTab === 'deposits' && (
              <Card className="p-4 mb-6 bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#CE1126] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#CE1126]">{depositError}</p>
              </Card>
            )}

            {/* Deposit records table */}
            <Card className="border border-gray-100 shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#0038A8]" />
                  <h3 className="font-semibold text-[#212529]">Deposit records</h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Search user..."
                    value={depositRecordSearch}
                    onChange={(e) => setDepositRecordSearch(e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 rounded text-sm w-40"
                  />
                  <input
                    type="date"
                    value={depositStartDate}
                    onChange={(e) => setDepositStartDate(e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 rounded text-sm"
                  />
                  <span className="text-[#6C757D]">to</span>
                  <input
                    type="date"
                    value={depositEndDate}
                    onChange={(e) => setDepositEndDate(e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 rounded text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={() => { setDepositPage(1); fetchDepositRecords(); }}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {depositLoading ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-[#0038A8] border-t-[#CE1126] rounded-full animate-spin mx-auto" />
                  <p className="text-[#6C757D] mt-2">Loading deposit records...</p>
                </div>
              ) : depositRecords.length === 0 ? (
                <div className="p-12 text-center text-[#6C757D]">No deposit records found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-[#6C757D] font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-[#6C757D] font-medium">User</th>
                          <th className="px-4 py-3 text-right text-[#6C757D] font-medium">Amount</th>
                          <th className="px-4 py-3 text-left text-[#6C757D] font-medium">Purpose</th>
                          <th className="px-4 py-3 text-left text-[#6C757D] font-medium">Performed by</th>
                          <th className="px-4 py-3 text-left text-[#6C757D] font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {depositRecords.map((row) => (
                          <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-[#212529]">
                              {new Date(row.created_at).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="px-4 py-3 text-[#212529]">
                              {row.user ? `${row.user.full_name || '-'} (${row.user.phone_number || '-'})` : `User #${row.user_id}`}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-[#00A86B]">
                              +{formatPHP(row.amount)}
                            </td>
                            <td className="px-4 py-3 text-[#212529]">{row.purpose}</td>
                            <td className="px-4 py-3 text-[#212529]">{row.admin_username || '-'}</td>
                            <td className="px-4 py-3 text-[#6C757D] max-w-[200px] truncate" title={row.notes || ''}>
                              {row.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
                    <span className="text-sm text-[#6C757D]">Total: {depositTotal} record(s)</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDepositPage((p) => Math.max(1, p - 1))}
                        disabled={depositPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-[#6C757D] self-center">
                        Page {depositPage} of {Math.ceil(depositTotal / depositLimit) || 1}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDepositPage((p) => p + 1)}
                        disabled={depositPage >= Math.ceil(depositTotal / depositLimit)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </>
        )}

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

      {/* Modals */}
      {showCheckingDataModal && selectedWithdrawal && (
        <CheckingDataModal
          memberId={selectedWithdrawal.user.id.toString()}
          onClose={() => setShowCheckingDataModal(false)}
        />
      )}

      {showConfirmModal && selectedWithdrawal && (
        <ConfirmWithdrawalModal
          withdrawal={selectedWithdrawal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false);
            fetchWithdrawals();
          }}
        />
      )}

      {showRejectDialog && selectedWithdrawal && (
        <DeleteConfirmDialog
          title="Reject Withdrawal"
          message={`Are you sure you want to reject this withdrawal request? (${selectedWithdrawal.withdraw_number}) The amount will be returned to the user's wallet.`}
          onConfirm={handleRejectConfirm}
          onCancel={() => setShowRejectDialog(false)}
        />
      )}
    </>
  );
}
