/**
 * Philippine Peso (PHP ₱) Currency Utilities
 * Standardized formatting and validation for the entire application
 */

/**
 * Format a number to Philippine Peso currency format
 * @param amount - The amount to format
 * @returns Formatted string like "₱100,000.00"
 */
export function formatPHP(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) return '₱0.00'
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

/**
 * Validate if loan amount is within acceptable range
 * @param amount - The loan amount to validate
 * @returns true if valid, false otherwise
 */
export function validateLoanAmount(amount: number): boolean {
  return amount >= 100000 && amount <= 5000000
}

/**
 * Get error message for invalid loan amount
 * @param amount - The loan amount
 * @returns Error message or empty string if valid
 */
export function getLoanAmountError(amount: number): string {
  if (amount < 100000) {
    return 'Minimum loan amount is ₱100,000.00'
  }
  if (amount > 5000000) {
    return 'Maximum loan amount is ₱5,000,000.00'
  }
  return ''
}

/**
 * Get interest rate for a given loan term
 * @param termMonths - Loan term in months (6, 12, 24, or 36)
 * @returns Interest rate as decimal (e.g., 0.5 for 0.5%)
 */
export function getInterestRateByTerm(termMonths: number): number {
  // Fixed 0.5% monthly rate for all loan terms
  return 0.5
}

/**
 * Get all available loan terms
 * @returns Array of available loan terms in months
 */
export function getAvailableLoanTerms(): number[] {
  return [6, 12, 24, 36]
}

/**
 * Get loan term labels with interest rates
 * @returns Array of term options for form selects
 */
export function getLoanTermOptions(): Array<{
  value: number
  label: string
  rate: number
}> {
  return [
    { value: 6, label: '6 months', rate: 0.5 },
    { value: 12, label: '12 months', rate: 0.5 },
    { value: 24, label: '24 months', rate: 0.5 },
    { value: 36, label: '36 months', rate: 0.5 },
  ]
}

/**
 * Convert monthly interest rate to annual percentage rate (APR)
 * @param monthlyRate - Monthly interest rate as decimal
 * @returns Annual rate
 */
export function monthlyToAnnualRate(monthlyRate: number): number {
  return monthlyRate * 12
}

/**
 * Validate if loan term is valid
 * @param term - Loan term in months
 * @returns true if valid
 */
export function isValidLoanTerm(term: number): boolean {
  return getAvailableLoanTerms().includes(term)
}

/**
 * Get validation error for loan term
 * @param term - Loan term to validate
 * @returns Error message or empty string if valid
 */
export function getLoanTermError(term: number): string {
  if (!isValidLoanTerm(term)) {
    return 'Loan term must be 6, 12, 24, or 36 months'
  }
  return ''
}

/**
 * Constants for currency configuration
 */
export const CURRENCY_CONFIG = {
  SYMBOL: '₱',
  CODE: 'PHP',
  LOCALE: 'en-PH',
  MIN_LOAN: 100000,
  MAX_LOAN: 5000000,
  VALID_TERMS: [6, 12, 24, 36] as const,
  INTEREST_RATES: {
    6: 0.5,
    12: 0.5,
    24: 0.5,
    36: 0.5,
  } as const,
}
