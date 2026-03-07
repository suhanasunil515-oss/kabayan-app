'use client';

import { formatDate } from '@/lib/utils';
import { getStatusColor } from '@/lib/withdrawal-utils';
import { formatPHP } from '@/lib/currency';
import { Button } from '@/components/ui/button';

interface Withdrawal {
  id: number;
  withdraw_number: string;
  document_number?: string;
  withdrawal_code: string | null;
  amount: number;
  status: string;
  withdrawal_date: string;
  user: {
    id: number;
    full_name: string;
    phone_number: string;
  };
}

interface WithdrawalTableProps {
  withdrawals: Withdrawal[];
  onCheckingData: (withdrawal: Withdrawal) => void;
  onConfirmWithdrawal: (withdrawal: Withdrawal) => void;
  onReject: (withdrawal: Withdrawal) => void;
}

// Statuses that should disable action buttons
const FINAL_STATUSES = ['Completed', 'Failed', 'Refused To Pay', 'Cancelled'];
const PROCESSING_STATUSES = ['Processing'];

export function WithdrawalTable({
  withdrawals,
  onCheckingData,
  onConfirmWithdrawal,
  onReject,
}: WithdrawalTableProps) {
  
  const isActionDisabled = (status: string) => {
    return FINAL_STATUSES.includes(status) || PROCESSING_STATUSES.includes(status);
  };

  const getButtonTitle = (status: string, action: string) => {
    if (FINAL_STATUSES.includes(status)) {
      return `Cannot ${action} - withdrawal is already ${status}`;
    }
    if (PROCESSING_STATUSES.includes(status)) {
      return `Cannot ${action} - withdrawal is currently being processed`;
    }
    return '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e9ecef] bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10">
            <th className="px-6 py-3 text-left font-semibold text-[#212529]">No.</th>
            <th className="px-6 py-3 text-left font-semibold text-[#212529]">Document Number</th>
            <th className="px-6 py-3 text-left font-semibold text-[#212529]">Withdrawal Code</th>
            <th className="px-6 py-3 text-left font-semibold text-[#212529]">Name</th>
            <th className="px-6 py-3 text-left font-semibold text-[#212529]">Username</th>
            <th className="px-6 py-3 text-right font-semibold text-[#212529]">Amount</th>
            <th className="px-6 py-3 text-left font-semibold text-[#212529]">Status</th>
            <th className="px-6 py-3 text-left font-semibold text-[#212529]">Withdrawal Date</th>
            <th className="px-6 py-3 text-left font-semibold text-[#212529]">Operate</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((withdrawal, index) => {
            const disabled = isActionDisabled(withdrawal.status);
            const isPending = withdrawal.status === 'Pending';
            const showActions = isPending;
            
            return (
              <tr key={withdrawal.id} className="border-b border-[#e9ecef] hover:bg-[#0038A8]/5 transition-colors">
                <td className="px-6 py-4 text-[#212529]">{index + 1}</td>
                <td className="px-6 py-4 font-mono text-[#212529]">{withdrawal.document_number || withdrawal.withdraw_number}</td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    placeholder="Code"
                    value={withdrawal.withdrawal_code || ''}
                    readOnly
                    className="w-20 px-2 py-1 border border-[#e9ecef] rounded text-xs bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#0038A8] focus:ring-opacity-20"
                  />
                </td>
                <td className="px-6 py-4 text-[#212529]">{withdrawal.user.full_name}</td>
                <td className="px-6 py-4 font-mono text-[#212529]">{withdrawal.user.phone_number}</td>
                <td className="px-6 py-4 text-right font-semibold text-[#212529]">
                  {formatPHP(withdrawal.amount)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex px-3 py-1 text-xs font-semibold rounded-full text-white"
                    style={{ backgroundColor: getStatusColor(withdrawal.status) }}
                  >
                    {withdrawal.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#212529]">{formatDate(withdrawal.withdrawal_date)}</td>
                <td className="px-6 py-4">
                  {showActions ? (
                    // Show full action buttons for pending withdrawals
                    <div className="flex gap-1">
                      <Button
                        onClick={() => onCheckingData(withdrawal)}
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]"
                        title="Check member details"
                      >
                        Checking Data
                      </Button>
                      <Button
                        onClick={() => onConfirmWithdrawal(withdrawal)}
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]"
                        title="Confirm withdrawal"
                      >
                        Confirm
                      </Button>
                      <Button
                        onClick={() => onReject(withdrawal)}
                        size="sm"
                        className="text-xs px-2 py-1 h-7 border border-[#CE1126] text-[#CE1126] bg-white hover:bg-red-50"
                        title="Reject withdrawal"
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    // Show disabled/read-only state for non-pending withdrawals
                    <div className="flex gap-1">
                      <Button
                        onClick={() => onCheckingData(withdrawal)}
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]"
                        title="Check member details"
                      >
                        Checking Data
                      </Button>
                      <Button
                        disabled
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        title={getButtonTitle(withdrawal.status, 'confirm')}
                      >
                        Confirm
                      </Button>
                      <Button
                        disabled
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        title={getButtonTitle(withdrawal.status, 'reject')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
