export interface LoanApplication {
  id: number
  user_id: number
  document_number: string
  amount_requested: number
  loan_term_months: number
  interest_rate: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  kyc_front_url: string | null
  kyc_back_url: string | null
  selfie_url: string | null
  personal_info: Record<string, any> | null
  admin_status_message: string | null
  created_at: string
  status_updated_at: string
}

export type ApplicationStep = 'loan_selection' | 'kyc-upload' | 'personal-information' | 'bank-information' | 'signature' | 'application-complete'

export interface UserVerification {
  personal_info_completed: boolean
  kyc_completed: boolean
  signature_completed: boolean
  bank_details_completed?: boolean
}

export function getApplicationProgress(application: LoanApplication, userVerification?: UserVerification | null): {
  currentStep: ApplicationStep
  isKYCComplete: boolean
  isPersonalInfoComplete: boolean
  isBankInfoComplete: boolean
  isSignatureComplete: boolean
  nextStep: ApplicationStep
} {
  const isKYCComplete =
    userVerification?.kyc_completed ||
    (!!application.kyc_front_url &&
    !!application.kyc_back_url &&
    !!application.selfie_url)

  const isPersonalInfoComplete =
    userVerification?.personal_info_completed ||
    (!!application.personal_info &&
    Object.keys(application.personal_info).length > 0)

  const isBankInfoComplete = userVerification?.bank_details_completed ?? false

  const isSignatureComplete =
    userVerification?.signature_completed || false

  let currentStep: ApplicationStep = 'loan_selection'
  let nextStep: ApplicationStep = 'kyc-upload'

  if (!isKYCComplete) {
    currentStep = 'kyc-upload'
    nextStep = 'kyc-upload'
  } else if (!isPersonalInfoComplete) {
    currentStep = 'personal-information'
    nextStep = 'personal-information'
  } else if (!isBankInfoComplete) {
    currentStep = 'bank-information'
    nextStep = 'bank-information'
  } else if (!isSignatureComplete) {
    currentStep = 'signature'
    nextStep = 'signature'
  } else {
    currentStep = 'application-complete'
    nextStep = 'application-complete'
  }

  return {
    currentStep,
    isKYCComplete,
    isPersonalInfoComplete,
    isBankInfoComplete,
    isSignatureComplete,
    nextStep,
  }
}

/**
 * Smart routing for quick loan applications
 * Takes into account user's verification history
 * - If fully verified: redirect to wallet
 * - If personal info done: skip to KYC
 * - Otherwise: normal flow
 */
export function getSmartRedirectPath(
  application: LoanApplication | null,
  userVerification: UserVerification | null,
  isNewApplication: boolean
): string {
  // No application at all
  if (!application) {
    return '/loan-application'
  }

  // Fully verified users on quick loan go straight to wallet
  if (
    userVerification?.personal_info_completed &&
    userVerification?.kyc_completed &&
    userVerification?.bank_details_completed &&
    userVerification?.signature_completed &&
    isNewApplication
  ) {
    return '/wallet'
  }

  const progress = getApplicationProgress(application)

  // For returning users with completed personal info, skip that step
  if (userVerification?.personal_info_completed && !progress.isKYCComplete) {
    return '/kyc-upload'
  }

  // New application or incomplete personal info
  if (!progress.isKYCComplete) {
    return '/kyc-upload'
  }

  if (!progress.isPersonalInfoComplete) {
    return '/personal-information'
  }

  if (!progress.isBankInfoComplete) {
    return '/bank-information'
  }

  if (!progress.isSignatureComplete) {
    return '/signature'
  }

  return '/application-complete'
}

export function getRedirectPath(
  application: LoanApplication | null,
  newApplication: boolean
): string {
  if (!application) {
    return '/loan-application'
  }

  const progress = getApplicationProgress(application)

  // If new application just created, go to KYC
  if (newApplication) {
    return '/kyc-upload'
  }

  // Otherwise redirect to next incomplete step
  if (!progress.isKYCComplete) {
    return '/kyc-upload'
  }
  if (!progress.isPersonalInfoComplete) {
    return '/personal-information'
  }
  if (!progress.isBankInfoComplete) {
    return '/bank-information'
  }
  if (!progress.isSignatureComplete) {
    return '/signature'
  }

  return '/application-complete'
}
