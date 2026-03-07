// Document Verification Types
export type DocumentVerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type DocumentType = 'id_card' | 'income_proof' | 'employment_letter' | 'bank_statement' | 'payslip'

export interface DocumentVerification {
  id: number
  user_id: number
  loan_id?: number
  document_type: DocumentType
  document_url?: string
  verification_status: DocumentVerificationStatus
  verified_by?: number
  verification_notes?: string
  rejection_reason?: string
  verified_at?: string
  created_at: string
  updated_at: string
}

// Notification Types
export type NotificationType = 'sms' | 'email' | 'in_app'
export type NotificationChannel = 'application_status' | 'withdrawal' | 'verification' | 'payment_reminder'
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read'
export type SMSDeliveryStatus = 'pending' | 'delivered' | 'failed' | 'undelivered'

export interface Notification {
  id: number
  user_id: number
  notification_type: NotificationType
  channel: NotificationChannel
  title: string
  message: string
  status: NotificationStatus
  phone_number?: string
  email?: string
  sms_provider_id?: string
  sms_delivery_status?: SMSDeliveryStatus
  error_message?: string
  retry_count: number
  last_retry_at?: string
  sent_at?: string
  read_at?: string
  created_at: string
  updated_at: string
}

// Loan Status History Types
export interface LoanStatusHistory {
  id: number
  loan_id: number
  old_status: string
  new_status: string
  status_color: string
  description: string
  changed_by: number
  changed_at: string
}

// Application Status Response
export interface ApplicationStatusResponse {
  loanId: number
  status: string
  currentStage: string
  completionPercentage: number
  documentsStatus: {
    documentType: DocumentType
    status: DocumentVerificationStatus
    verifiedAt?: string
  }[]
  nextSteps: string[]
  lastUpdated: string
}

// SMS Status Response
export interface SMSStatusResponse {
  notificationId: number
  message: string
  status: SMSDeliveryStatus
  sentAt: string
  deliveredAt?: string
  failureReason?: string
}

// API Error Response
export interface APIErrorResponse {
  error: string
  code?: string
  details?: unknown
}

// API Success Response
export interface APISuccessResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

// Add to your existing types file
export interface PersonalInfoFormData {
  full_name: string
  id_card_number: string
  gender: string
  date_of_birth: string
  current_job: string
  stable_income: string
  loan_purpose: string
  living_address: string
  relative_name: string
  relative_phone: string
}

export interface ContactPerson {
  name: string
  phone: string
  relationship: string
}
