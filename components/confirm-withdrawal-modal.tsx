'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader, Shield, AlertCircle, CheckCircle, CreditCard, User, Phone, Fingerprint, FileText, DollarSign, Clock } from 'lucide-react';

interface Withdrawal {
  id: number;
  withdraw_number: string;
  withdrawal_code: string | null;
  amount: number;
  status: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  user: {
    id: number;
    full_name: string;
    phone_number: string;
  };
}

interface ConfirmWithdrawalModalProps {
  withdrawal: Withdrawal;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmWithdrawalModal({
  withdrawal,
  onClose,
  onConfirm,
}: ConfirmWithdrawalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Company colors
  const darkNavy = '#0B1F3A'
  const gold = '#D4AF37'
  const blue = '#0038A8'
  const red = '#CE1126'
  const green = '#00A86B'

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');

      if (withdrawal.withdrawal_code && !verificationCode) {
        setError('Please enter withdrawal code');
        return;
      }

      console.log('[v0] Confirming withdrawal');

      const response = await fetch(`/api/admin/withdrawals/${withdrawal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'confirm',
          withdrawalCode: verificationCode,
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('[v0] Withdrawal confirmed successfully');
        onConfirm();
      } else {
        console.error('[v0] Confirmation failed:', result.error);
        setError(result.error || 'Failed to confirm withdrawal');
      }
    } catch (err) {
      console.error('[v0] Error confirming withdrawal:', err);
      setError('Error confirming withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl border border-gray-100 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-red-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold">
              <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
                Confirm Withdrawal
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#6C757D]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#CE1126] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#CE1126] font-medium">{error}</p>
            </div>
          )}

          {/* Withdrawal Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" style={{ color: blue }} />
                Withdraw Number
              </p>
              <p className="font-semibold font-mono" style={{ color: darkNavy }}>{withdrawal.withdraw_number}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                <User className="w-3 h-3" style={{ color: red }} />
                Member
              </p>
              <p className="font-semibold" style={{ color: darkNavy }}>{withdrawal.user.full_name}</p>
              <p className="text-xs text-[#6C757D]">{withdrawal.user.phone_number}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3" style={{ color: green }} />
                Amount
              </p>
              <p className="text-2xl font-bold" style={{ color: blue }}>
                ₱{new Intl.NumberFormat('en-US').format(withdrawal.amount)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" style={{ color: gold }} />
                Status
              </p>
              <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-full text-xs font-semibold">
                {withdrawal.status}
              </span>
            </div>
          </div>

          {/* Bank Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-1" style={{ color: darkNavy }}>
              <CreditCard className="w-4 h-4" />
              Bank Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-[#6C757D] mb-1">Bank Name</p>
                <p className="font-medium" style={{ color: darkNavy }}>{withdrawal.bank_name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-[#6C757D] mb-1">Account Number</p>
                <p className="font-medium font-mono" style={{ color: darkNavy }}>{withdrawal.account_number}</p>
              </div>
              <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-[#6C757D] mb-1">Account Name</p>
                <p className="font-medium" style={{ color: darkNavy }}>{withdrawal.account_name}</p>
              </div>
            </div>
          </div>

          {/* Withdrawal Code Verification */}
          {withdrawal.withdrawal_code && (
            <div className="border-t border-gray-200 pt-6">
              <label className="text-sm font-semibold mb-2 flex items-center gap-1" style={{ color: darkNavy }}>
                <Fingerprint className="w-4 h-4" />
                Withdrawal Code Verification
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter withdrawal code"
                disabled={loading}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:border-transparent disabled:opacity-50"
              />
            </div>
          )}

          {/* Confirmation Text */}
          <div className="bg-gradient-to-r from-blue-50 to-red-50 border border-[#0038A8]/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#0038A8] flex-shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: darkNavy }}>
                <strong>Note:</strong> Confirming this withdrawal will deduct{' '}
                <strong style={{ color: red }}>₱{new Intl.NumberFormat('en-US').format(withdrawal.amount)}</strong> from the member's wallet and
                mark this request as completed.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button 
            onClick={onClose} 
            variant="outline" 
            disabled={loading}
            className="border-2 border-gray-300 text-[#6C757D] hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading} 
            className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20] flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? 'Processing...' : 'Confirm Withdrawal'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
