'use client';

import { formatPHP } from '@/lib/currency';

interface LoanContractViewerProps {
  contract: {
    id: number;
    loan_id: number;
    document_number: string;
    borrower_name: string;
    borrower_id_number: string;
    borrower_phone: string;
    loan_amount: string;
    interest_rate: string;
    loan_period: string;
    bank_name: string;
    contract_text: string;
    signed_at: string | null;
    is_active: boolean;
  };
}

export function LoanContractViewer({ contract }: LoanContractViewerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Contract Header */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Loan Contract</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60 mb-1">Document Number</p>
            <p className="font-semibold text-foreground font-mono">{contract.document_number}</p>
          </div>
          <div>
            <p className="text-foreground/60 mb-1">Status</p>
            <p className="font-semibold text-green-600">Active</p>
          </div>
          <div>
            <p className="text-foreground/60 mb-1">Borrower Name</p>
            <p className="font-semibold text-foreground">{contract.borrower_name}</p>
          </div>
          <div>
            <p className="text-foreground/60 mb-1">ID Number</p>
            <p className="font-semibold text-foreground font-mono">{contract.borrower_id_number}</p>
          </div>
          <div>
            <p className="text-foreground/60 mb-1">Loan Amount</p>
            <p className="font-semibold text-foreground">{contract.loan_amount}</p>
          </div>
          <div>
            <p className="text-foreground/60 mb-1">Interest Rate</p>
            <p className="font-semibold text-foreground">{contract.interest_rate}</p>
          </div>
          <div>
            <p className="text-foreground/60 mb-1">Loan Period</p>
            <p className="font-semibold text-foreground">{contract.loan_period}</p>
          </div>
          <div>
            <p className="text-foreground/60 mb-1">Phone Number</p>
            <p className="font-semibold text-foreground">{contract.borrower_phone}</p>
          </div>
        </div>
      </div>

      {/* Contract Body */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
          {contract.contract_text}
        </pre>
      </div>

      {/* Signature Section */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-foreground/60 text-sm mb-2">Lender</p>
            <p className="border-t border-foreground/30 pt-2 font-semibold text-foreground mt-12">
              FinanciaPH Credit
            </p>
          </div>
          <div>
            <p className="text-foreground/60 text-sm mb-2">Borrower</p>
            <p className="border-t border-foreground/30 pt-2 font-semibold text-foreground mt-12">
              {contract.borrower_name}
            </p>
          </div>
        </div>
        {contract.signed_at && (
          <p className="text-sm text-foreground/60 mt-6">
            Signed on: {new Date(contract.signed_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
      </div>

      {/* Print Button */}
      <button
        onClick={() => window.print()}
        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
      >
        Print Contract
      </button>
    </div>
  );
}
