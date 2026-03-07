// Central PHP Currency Configuration
export const CURRENCY_CONFIG = {
  // Currency identification
  symbol: '₱',
  code: 'PHP',
  locale: 'en-PH',
  name: 'Philippine Peso',

  // Loan amount constraints
  minLoan: 100000,
  maxLoan: 5000000,

  // Loan terms and corresponding interest rates (per month) - fixed 0.5% for all terms
  loanTerms: [
    { months: 6, interestRate: 0.005, label: '6 months' },
    { months: 12, interestRate: 0.005, label: '12 months' },
    { months: 24, interestRate: 0.005, label: '24 months' },
    { months: 36, interestRate: 0.005, label: '36 months' },
  ],

  // Validation messages
  messages: {
    minLoanError: 'Minimum loan amount is ₱100,000',
    maxLoanError: 'Maximum loan amount is ₱5,000,000',
    invalidTerm: 'Loan term must be 6, 12, 24, or 36 months',
    invalidAmount: 'Loan amount must be between ₱100,000 and ₱5,000,000',
  },
};

// Helper function to get interest rate by term
export function getInterestRateByTerm(termMonths: number): number {
  const term = CURRENCY_CONFIG.loanTerms.find((t) => t.months === termMonths);
  return term ? term.interestRate : CURRENCY_CONFIG.loanTerms[0].interestRate;
}

// Helper function to get term label
export function getTermLabel(termMonths: number): string {
  const term = CURRENCY_CONFIG.loanTerms.find((t) => t.months === termMonths);
  return term
    ? `${term.months} months - ${(term.interestRate * 100).toFixed(1)}%/month`
    : `${termMonths} months`;
}

// Helper function to validate loan amount
export function validateLoanAmount(amount: number): { valid: boolean; error?: string } {
  if (amount < CURRENCY_CONFIG.minLoan) {
    return { valid: false, error: CURRENCY_CONFIG.messages.minLoanError };
  }
  if (amount > CURRENCY_CONFIG.maxLoan) {
    return { valid: false, error: CURRENCY_CONFIG.messages.maxLoanError };
  }
  return { valid: true };
}

// Helper function to validate loan term
export function validateLoanTerm(termMonths: number): boolean {
  return CURRENCY_CONFIG.loanTerms.some((t) => t.months === termMonths);
}

// Helper function to get available loan terms
export function getAvailableLoanTerms(): number[] {
  return CURRENCY_CONFIG.loanTerms.map((t) => t.months);
}
