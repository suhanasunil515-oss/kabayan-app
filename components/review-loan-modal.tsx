'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader, CheckCircle, AlertCircle, Clock, Ban, UserCheck, FileText, DollarSign, Percent, RefreshCw, XCircle, Shield, AlertTriangle, CreditCard, Banknote, Fingerprint, Lock, Unlock, TrendingDown, TrendingUp, Wallet, Receipt, Gavel, Eye, Copy, RotateCw } from 'lucide-react';

const STATUS_PRESETS = [
  { 
    value: 'UNDER_REVIEW', 
    label: 'Under Review', 
    color: '#3B82F6', 
    icon: Clock,
    description: 'Your application is currently under review. Please wait for further updates from our Finance Department.'
  },
  { 
    value: 'LOAN_APPROVED', 
    label: 'Loan Approved', 
    color: '#22C55E', 
    icon: CheckCircle,
    description: 'Your loan has been approved. Please contact the Finance Department or your credit officer to obtain the OTP code.'
  },
  { 
    value: 'LOAN_APPROVED_CONFIRMATION', 
    label: 'Loan Approved (Confirmation Required)', 
    color: '#22C55E', 
    icon: CheckCircle,
    description: 'To obtain the OTP withdrawal code, please confirm 10% of your authorized credit limit.'
  },
  { 
    value: 'OTP_GENERATED', 
    label: 'OTP Code Generated', 
    color: '#22C55E', 
    icon: Copy,
    description: 'Your withdrawal OTP code is 798429. Please note that this OTP is valid for a single withdrawal only.'
  },
  { 
    value: 'WITHDRAWAL_PROCESSING', 
    label: 'Withdrawal Processing', 
    color: '#6366F1', 
    icon: RotateCw,
    description: 'Your withdrawal request is currently being processed. Please wait for confirmation.'
  },
  { 
    value: 'WITHDRAWAL_FAILED', 
    label: 'Withdrawal Failed', 
    color: '#DC2626', 
    icon: XCircle,
    description: 'Your withdrawal request has failed. Please contact the Finance Department for further details.'
  },
  { 
    value: 'INVALID_BANK_NAME', 
    label: 'Invalid Bank Name', 
    color: '#EF4444', 
    icon: Ban,
    description: 'Your withdrawal request failed because the bank name provided is invalid. Please update your banking information.'
  },
  { 
    value: 'INVALID_BANK_ACCOUNT', 
    label: 'Invalid Bank Account', 
    color: '#EF4444', 
    icon: Ban,
    description: 'The bank account number provided is incorrect. The system failed to transfer funds, and they are temporarily frozen. Please contact us immediately to unfreeze your funds.'
  },
  { 
    value: 'INVALID_BANK_ACCOUNT_FROZEN', 
    label: 'Invalid Bank Account / Fund Frozen', 
    color: '#EF4444', 
    icon: Lock,
    description: 'The system was unable to transfer funds to your bank account because the account information provided is incorrect. As a result, the funds have been frozen. Please contact us to resolve the issue and unfreeze your funds.'
  },
  { 
    value: 'MISMATCH_BENEFICIARY', 
    label: 'Mismatch Beneficiary Name', 
    color: '#EF4444', 
    icon: AlertTriangle,
    description: 'The bank account number does not match the name on your application. The funds have been temporarily frozen. Please contact us immediately to resolve this issue.'
  },
  { 
    value: 'INVALID_ID_CARD', 
    label: 'Invalid ID Card', 
    color: '#EF4444', 
    icon: Fingerprint,
    description: 'Your withdrawal request failed because the ID card information provided is invalid. Please upload a valid identification document.'
  },
  { 
    value: 'FUND_FROZEN', 
    label: 'Fund Frozen', 
    color: '#EF4444', 
    icon: Lock,
    description: 'Your account has been temporarily frozen due to modifications made to your loan approved application. Please contact the Finance Department for assistance.'
  },
  { 
    value: 'ERROR_INFO', 
    label: 'Error Information', 
    color: '#EF4444', 
    icon: AlertCircle,
    description: 'The system was unable to transfer funds due to an error. The funds have been frozen. Please contact us to unfreeze them.'
  },
  { 
    value: 'ACCOUNT_LIMIT_REACHED', 
    label: 'Account Limit Reached', 
    color: '#EF4444', 
    icon: TrendingUp,
    description: 'The system was unable to transfer funds to your bank account as it has reached its limit. The funds have been frozen. Please contact us to unfreeze them.'
  },
  { 
    value: 'PROCESSING_UNFREEZE', 
    label: 'Processing Unfreeze', 
    color: '#6366F1', 
    icon: RefreshCw,
    description: 'Your request to unfreeze your funds is currently being processed.'
  },
  { 
    value: 'UNFROZEN', 
    label: 'Unfrozen', 
    color: '#22C55E', 
    icon: Unlock,
    description: 'Your account has been successfully unfrozen. We apologize for any inconvenience caused and appreciate your patience.'
  },
  { 
    value: 'LOW_CREDIT_SCORE', 
    label: 'Low Credit Score', 
    color: '#F97316', 
    icon: TrendingDown,
    description: 'Your credit score needs attention. Take action now to improve your credit score and secure better financial opportunities.'
  },
  { 
    value: 'TOP_UP_CREDIT_SCORE', 
    label: 'Top-up Credit Score', 
    color: '#8B5CF6', 
    icon: TrendingUp,
    description: 'Your credit score requires improvement. Please complete the necessary steps to increase it.'
  },
  { 
    value: 'WITHDRAWAL_REJECTED', 
    label: 'Withdrawal Rejected', 
    color: '#DC2626', 
    icon: XCircle,
    description: 'Your withdrawal request has been rejected. Please contact the Finance Department for further details.'
  },
  { 
    value: 'OVERDUE', 
    label: 'Overdue', 
    color: '#B91C1C', 
    icon: AlertCircle,
    description: 'Your account is currently overdue. Please deposit the outstanding amount as soon as possible to avoid penalties. We apologize for any inconvenience caused and appreciate your patience.'
  },
  { 
    value: 'TAX', 
    label: 'Tax', 
    color: '#F59E0B', 
    icon: Receipt,
    description: 'Tax payment is required before proceeding. Please contact the Finance Department for further instructions.'
  },
  { 
    value: 'TAX_SETTLED', 
    label: 'Tax Settled', 
    color: '#22C55E', 
    icon: CheckCircle,
    description: 'Your tax payment has been successfully settled. You may proceed with your transaction.'
  },
  { 
    value: 'WITHDRAWAL_SUCCESSFUL', 
    label: 'Withdrawal Successful', 
    color: '#22C55E', 
    icon: Wallet,
    description: 'Your withdrawal has been successfully completed. Please check your bank account for confirmation.'
  },
  { 
    value: 'BANK_INFO_UPDATED', 
    label: 'Bank Info Updated', 
    color: '#22C55E', 
    icon: Banknote,
    description: 'Your banking information has been successfully updated.'
  },
  { 
    value: 'PERSONAL_INFO_UPDATED', 
    label: 'Personal Info Updated', 
    color: '#22C55E', 
    icon: UserCheck,
    description: 'Your personal information has been successfully updated.'
  },
  { 
    value: 'INSURANCE', 
    label: 'Insurance', 
    color: '#0EA5E9', 
    icon: Shield,
    description: 'Insurance verification is required before proceeding. Please contact the Finance Department for details.'
  },
  { 
    value: 'GAMBLING', 
    label: 'Gambling', 
    color: '#F43F5E', 
    icon: AlertTriangle,
    description: 'Your account has been flagged due to gambling-related activity. Please contact the Finance Department for clarification.'
  },
  { 
    value: 'IRREGULAR_ACTIVITY', 
    label: 'Irregular Activity Detected', 
    color: '#DC2626', 
    icon: Eye,
    description: 'We noticed some irregular activity on your account. Please update your information immediately to avoid any disruption in service.'
  },
  { 
    value: 'DUPLICATE_APPLICATION', 
    label: 'Duplicate Application', 
    color: '#E11D48', 
    icon: Copy,
    description: 'A duplicate application has been detected. Please contact the Finance Department to resolve this issue.'
  },
  { 
    value: 'ACCOUNT_SUSPENDED', 
    label: 'Account Suspended', 
    color: '#DC2626', 
    icon: Ban,
    description: 'Your account has been temporarily suspended due to a policy violation or unusual activity. Please contact the Finance Department for assistance.'
  },
  { 
    value: 'ACCOUNT_REACTIVATED', 
    label: 'Account Reactivated', 
    color: '#22C55E', 
    icon: RefreshCw,
    description: 'Your account has been successfully reactivated. You may now continue using all services normally.'
  },
  { 
    value: 'ACCOUNT_DEACTIVATED', 
    label: 'Account Deactivated', 
    color: '#64748B', 
    icon: Ban,
    description: 'Your account has been deactivated. Please contact the Finance Department if you wish to reactivate it.'
  },
  { 
    value: 'RENEW_OTP', 
    label: 'Renew OTP Code', 
    color: '#F59E0B', 
    icon: RotateCw,
    description: 'Your OTP code has expired. Please contact the Finance Department to request a new one.'
  }
];

interface ReviewModalProps {
  loan: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function ReviewModal({ loan, onClose, onSave }: ReviewModalProps) {
  const [status, setStatus] = useState(loan.status || '');
  const [statusColor, setStatusColor] = useState(loan.status_color || '#F59E0B');
  const [description, setDescription] = useState(loan.status_description || loan.admin_status_message || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Philippine flag colors
  const blue = '#0038A8';
  const red = '#CE1126';

  // Update color when status changes
  useEffect(() => {
    const preset = STATUS_PRESETS.find(p => p.value === status);
    if (preset) {
      setStatusColor(preset.color);
    }
  }, [status]);

  // Filter presets based on search
  const filteredPresets = STATUS_PRESETS.filter(preset =>
    preset.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    preset.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      if (!status.trim()) {
        setError('Status is required');
        return;
      }

      if (!statusColor.match(/^#[0-9A-Fa-f]{6}$/)) {
        setError('Invalid hex color format. Use #RRGGBB');
        return;
      }

      await onSave({
        status: status.trim(),
        statusColor,
        statusDescription: description.trim(),
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-5xl w-full p-8 max-h-[95vh] overflow-y-auto border-0 shadow-2xl">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 pb-6 border-b">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
            Review Loan Application
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-[#212529]" />
          </button>
        </div>

        {/* Loan Info Cards - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Document Number Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-md">
            <div className="flex items-center gap-3 text-[#0038A8] mb-3">
              <FileText className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-wider">Document Number</span>
            </div>
            <p className="font-mono font-semibold text-gray-900 text-lg break-all">
              {loan.order_number || loan.document_number}
            </p>
          </div>

          {/* Borrower Name Card */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200 shadow-md">
            <div className="flex items-center gap-3 text-[#CE1126] mb-3">
              <UserCheck className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-wider">Borrower Name</span>
            </div>
            <p className="font-bold text-gray-900 text-xl">
              {loan.borrower_name}
            </p>
            <p className="text-base text-gray-600 mt-2">{loan.borrower_phone}</p>
          </div>

          {/* Loan Amount Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 shadow-md">
            <div className="flex items-center gap-3 text-purple-700 mb-3">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-wider">Loan Amount</span>
            </div>
            <p className="font-bold text-gray-900 text-2xl">
              ₱{Number(loan.loan_amount).toLocaleString()}
            </p>
          </div>

          {/* Interest Rate Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200 shadow-md">
            <div className="flex items-center gap-3 text-amber-700 mb-3">
              <Percent className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-wider">Interest Rate</span>
            </div>
            <p className="font-bold text-gray-900 text-xl">
              {Number(loan.interest_rate).toFixed(1)}%
            </p>
            <p className="text-base text-gray-600 mt-2">{loan.loan_period_months} months</p>
          </div>
        </div>

        {/* Search Presets */}
        <div className="mb-6">
          <label className="block text-base font-semibold text-gray-700 mb-3">
            Search Status Presets
          </label>
          <input
            type="text"
            placeholder="Type to filter statuses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0038A8] focus:ring-opacity-20 focus:border-[#0038A8]"
          />
        </div>

        {/* Status Presets Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="text-base font-semibold text-gray-700">
              Status Presets ({filteredPresets.length})
            </label>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-[#0038A8] hover:text-[#CE1126] font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2 border-2 border-gray-200 rounded-xl bg-gray-50">
            {filteredPresets.map((preset) => {
              const Icon = preset.icon;
              const isSelected = status === preset.value;
              
              return (
                <button
                  key={preset.value}
                  onClick={() => {
                    setStatus(preset.value);
                    setDescription(preset.description);
                  }}
                  className={`
                    flex items-start gap-4 p-5 rounded-xl border-3 transition-all text-left w-full
                    ${isSelected 
                      ? 'border-[#0038A8] bg-white shadow-xl scale-[1.02]' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-lg hover:scale-[1.01]'
                    }
                  `}
                  style={isSelected ? { borderColor: preset.color } : {}}
                >
                  <div 
                    className="p-3 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${preset.color}20` }}
                  >
                    <Icon 
                      className="w-7 h-7" 
                      style={{ color: preset.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900">{preset.label}</span>
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md" 
                        style={{ backgroundColor: preset.color }}
                      />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                      {preset.description}
                    </p>
                    {isSelected && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-medium text-[#0038A8] bg-blue-50 px-3 py-1.5 rounded-full">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Status Input */}
        <div className="mb-6">
          <label className="block text-base font-semibold text-gray-700 mb-3">
            Custom Status
          </label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Enter custom status..."
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0038A8] focus:ring-opacity-20 focus:border-[#0038A8]"
          />
        </div>

        {/* Color Picker */}
        <div className="mb-6">
          <label className="block text-base font-semibold text-gray-700 mb-3">
            Status Color
          </label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={statusColor}
              onChange={(e) => setStatusColor(e.target.value)}
              placeholder="#00FF00"
              className="flex-1 px-5 py-4 text-lg border-2 border-gray-300 rounded-xl font-mono focus:outline-none focus:ring-4 focus:ring-[#0038A8] focus:ring-opacity-20 focus:border-[#0038A8]"
            />
            <div
              className="w-16 h-16 rounded-xl border-4 border-gray-300 shadow-md"
              style={{ backgroundColor: statusColor }}
            />
            <input
              type="color"
              value={statusColor}
              onChange={(e) => setStatusColor(e.target.value)}
              className="w-16 h-16 rounded-xl cursor-pointer border-2 border-gray-300"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="block text-base font-semibold text-gray-700 mb-3">
            Status Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed status message..."
            rows={5}
            maxLength={500}
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0038A8] focus:ring-opacity-20 focus:border-[#0038A8] resize-none"
          />
          <p className="text-sm text-gray-500 mt-2 text-right font-medium">
            {description.length}/500 characters
          </p>
        </div>

        {/* Preview Card */}
        <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-300 shadow-lg">
          <p className="text-base font-semibold text-gray-700 mb-4">Preview:</p>
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="font-bold text-gray-900 text-xl">{status || 'Status'}</span>
          </div>
          <p className="text-base text-gray-700 mt-4 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
            {description || 'Description will appear here'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-200 text-red-700 text-base p-5 rounded-xl">
            {error}
          </div>
        )}

        {/* Action Buttons - Updated to flag colors */}
        <div className="flex gap-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 py-6 text-lg font-semibold border-2 border-[#0038A8] text-[#0038A8] hover:bg-blue-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-6 text-lg font-semibold bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20] gap-3"
          >
            {loading && <Loader className="w-6 h-6 animate-spin" />}
            {loading ? 'Saving...' : 'Update Status'}
          </Button>
        </div>

        {/* Optional Admin Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          KabayanLoan • Admin Portal
        </div>
      </Card>
    </div>
  );
}
