/**
 * Document Export Validation Utilities
 * Validates documents before allowing export to prevent bad quality exports
 */

export interface ValidationResult {
  errors: string[]
  warnings: string[]
  isValid: boolean
}

/**
 * Validate Loan Approval Letter before export
 */
export function validateLoanApprovalLetter(data: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Critical validations (errors)
  if (!data.documentNumber) {
    errors.push('Document number is missing. Please select a loan first.')
  }
  if (!data.borrowerName) {
    errors.push('Borrower name is missing.')
  }
  if (!data.idCardImage) {
    errors.push('ID card image is missing. Please upload a valid ID card/passport.')
  }
  if (!data.loanApprovalCode || data.loanApprovalCode === 'PENDING') {
    errors.push('Loan approval code is not set. Document cannot be exported as pending.')
  }
  if (!data.loanAmount) {
    errors.push('Loan amount is missing.')
  }

  // Warnings (non-critical)
  if (!data.signatureImage) {
    warnings.push('Signature image not found. Document will show placeholder.')
  }
  if (!data.idCardNumber) {
    warnings.push('ID card number not available.')
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  }
}

/**
 * Validate Loan List Table before export
 */
export function validateLoanListTable(data: any, loans: any[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Critical validations
  if (!loans || loans.length === 0) {
    errors.push('No loans to export. Please search and select loans first.')
  }

  loans.forEach((loan, idx) => {
    if (!loan.document_number) {
      errors.push(`Loan ${idx + 1}: Missing document number`)
    }
    if (!loan.borrower_name) {
      errors.push(`Loan ${idx + 1}: Missing borrower name`)
    }
    if (!loan.loan_amount || loan.loan_amount <= 0) {
      errors.push(`Loan ${idx + 1}: Invalid loan amount`)
    }
  })

  // Warnings
  if (loans.length > 100) {
    warnings.push(`Large export (${loans.length} rows). Export may take longer.`)
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  }
}

/**
 * Validate Repayment Schedule before export
 */
export function validateRepaymentSchedule(data: any, schedule: any[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Critical validations
  if (!data.documentNumber) {
    errors.push('Document number is missing. Please select a loan first.')
  }
  if (!data.borrowerName) {
    errors.push('Borrower name is missing.')
  }
  if (!data.loanAmount || data.loanAmount <= 0) {
    errors.push('Invalid loan amount.')
  }
  if (!schedule || schedule.length === 0) {
    errors.push('Repayment schedule is empty.')
  }

  // Validate schedule entries
  schedule.forEach((item, idx) => {
    if (!item.dueDate) {
      errors.push(`Month ${idx + 1}: Missing due date`)
    }
    if (item.total <= 0) {
      errors.push(`Month ${idx + 1}: Invalid payment amount`)
    }
  })

  // Warnings
  if (!data.borrowerPhone) {
    warnings.push('Borrower phone number not available.')
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  }
}

/**
 * Generic validation for all document types
 */
export function validateDocument(
  documentType: 'loan-approval' | 'loan-list-table' | 'repayment-schedule',
  data: any,
  additionalData?: any
): ValidationResult {
  switch (documentType) {
    case 'loan-approval':
      return validateLoanApprovalLetter(data)
    case 'loan-list-table':
      return validateLoanListTable(data, additionalData?.loans || [])
    case 'repayment-schedule':
      return validateRepaymentSchedule(data, additionalData?.schedule || [])
    default:
      return {
        errors: ['Unknown document type'],
        warnings: [],
        isValid: false
      }
  }
}
