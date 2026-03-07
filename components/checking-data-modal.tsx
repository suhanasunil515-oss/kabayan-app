'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Loader, Shield, User, Briefcase, FileText, CreditCard, Lock, MapPin, Phone, Mail, Award, Wallet, Fingerprint, Calendar, Globe, AlertCircle, DollarSign, Heart } from 'lucide-react'

interface IdPhoto {
  id: number
  url: string
  type: 'front' | 'back' | 'selfie'
}

interface ContactPerson {
  name: string
  relationship: string
  phone: string
}

interface Member {
  id: string
  name: string
  username: string
  email?: string
  score: number
  wallet: number
  withdrawal_code?: string
  registration_date: string
  status: 'active' | 'disabled'
  registration_area: string
  ip_address: string
  last_login_ip?: string
  last_login_location?: string
  note?: string
  facebook_name?: string
  id_card_number?: string
  id_photos?: IdPhoto[]
  living_address?: string
  loan_purpose?: string
  company_name?: string
  position?: string
  seniority?: string
  monthly_income?: number
  unit_address?: string
  contact_person1?: ContactPerson | string
  contact_person2?: ContactPerson | string
  signature_image?: string
  bank_name?: string
  bank_card_number?: string
  account_number?: string
  bank_details?: {
    bankName?: string
    accountNumber?: string
    setBy?: 'user' | 'admin'
    updatedAt?: string
  }
  gender?: string
  date_of_birth?: string
  full_name?: string
  current_job?: string
  stable_income?: number
  relative_name?: string
  relative_phone?: string
}

interface CheckingDataModalProps {
  memberId: string
  onClose: () => void
}

export function CheckingDataModal({ memberId, onClose }: CheckingDataModalProps) {
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('personal')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Company colors
  const darkNavy = '#0B1F3A'
  const gold = '#D4AF37'
  const blue = '#0038A8'
  const red = '#CE1126'
  const green = '#00A86B'

  useEffect(() => {
    const fetchMemberDetail = async () => {
      try {
        setIsLoading(true)
        setError('')
        console.log('[v0] Fetching member details for ID:', memberId)
        
        const response = await fetch(`/api/members/${memberId}`)
        const data = await response.json()

        console.log('[v0] Member API response:', data)

        if (data.success) {
          // Log all relevant data for debugging
          console.log('[v0] Member data from API:', {
            bank_name: data.data.bank_name,
            bank_card_number: data.data.bank_card_number,
            account_number: data.data.account_number,
            bank_details: data.data.bank_details,
            gender: data.data.gender,
            date_of_birth: data.data.date_of_birth,
            relative_name: data.data.relative_name,
            relative_phone: data.data.relative_phone,
            contact_person1: data.data.contact_person1,
            registration_area: data.data.registration_area,
            ip_address: data.data.ip_address,
            last_login_ip: data.data.last_login_ip,
            last_login_location: data.data.last_login_location,
            note: data.data.note,
            withdrawal_code: data.data.withdrawal_code
          })
          
          setMember(data.data)
        } else {
          setError(data.error || 'Failed to fetch member details')
        }
      } catch (err) {
        console.error('[v0] Fetch member detail error:', err)
        setError('Failed to load member details')
      } finally {
        setIsLoading(false)
      }
    }

    if (memberId) {
      fetchMemberDetail()
    }
  }, [memberId])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not Provided'
    try {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '₱0'
    return `₱${amount.toLocaleString()}`
  }

  const displayValue = (value: any, fallback = 'Not Provided') => {
    if (value === null || value === undefined || value === '') {
      return fallback
    }
    return value
  }

  // Helper function to parse contact_person1 JSON string
  const parseContactPerson1 = (member: Member): ContactPerson | null => {
    if (!member.contact_person1) return null
    
    if (typeof member.contact_person1 === 'object') {
      return member.contact_person1 as ContactPerson
    }
    
    if (typeof member.contact_person1 === 'string') {
      try {
        return JSON.parse(member.contact_person1) as ContactPerson
      } catch (e) {
        console.error('[v0] Error parsing contact_person1:', e)
        return null
      }
    }
    
    return null
  }

  // Helper function to get relative's name from contact_person1
  const getRelativeName = (member: Member): string => {
    // First try direct relative_name field
    if (member.relative_name) return member.relative_name
    
    // Then try to parse from contact_person1
    const contact = parseContactPerson1(member)
    if (contact?.name) return contact.name
    
    return 'Not Provided'
  }

  // Helper function to get relative's phone from contact_person1
  const getRelativePhone = (member: Member): string => {
    // First try direct relative_phone field
    if (member.relative_phone) return member.relative_phone
    
    // Then try to parse from contact_person1
    const contact = parseContactPerson1(member)
    if (contact?.phone) return contact.phone
    
    return 'Not Provided'
  }

  // Helper function to get bank name from various possible fields
  const getBankName = (member: Member): string => {
    if (member.bank_details?.bankName) return member.bank_details.bankName
    if (member.bank_name) return member.bank_name
    return 'Not Provided'
  }

  // Helper function to get account number from various possible fields
  const getAccountNumber = (member: Member): string => {
    if (member.bank_details?.accountNumber) return member.bank_details.accountNumber
    if (member.account_number) return member.account_number
    if (member.bank_card_number) return member.bank_card_number
    return 'Not Provided'
  }

  // Helper function to get IP address (prefer last_login_ip, fallback to ip_address)
  const getIPAddress = (member: Member): string => {
    if (member.last_login_ip) return member.last_login_ip
    if (member.ip_address) return member.ip_address
    return 'N/A'
  }

  // Helper function to get location (prefer last_login_location, fallback to registration_area)
  const getLocation = (member: Member): string => {
    if (member.last_login_location) return member.last_login_location
    if (member.registration_area) return member.registration_area
    return 'Unknown'
  }

  if (selectedImage) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <Card className="max-w-2xl w-full p-6 relative border border-gray-100 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold" style={{ color: darkNavy }}>Document Preview</h3>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-[#6C757D]" />
          </button>
          <img
            src={selectedImage || "/placeholder.svg"}
            alt="Member document"
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg border border-gray-200"
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-100 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
                Member Details
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-[#6C757D]" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#CE1126] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#CE1126] font-medium">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#0038A8] border-t-[#CE1126] rounded-full animate-spin mx-auto" />
              <p className="text-[#6C757D]">Loading member details...</p>
            </div>
          </div>
        ) : member ? (
          <div className="space-y-6">
            {/* Header with member name and status */}
            <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-lg p-4 border border-[#0038A8]/20">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: darkNavy }}>{member.name}</h2>
                  <p className="text-[#6C757D] flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />
                    {member.username}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    member.status === 'active'
                      ? 'bg-green-50 text-[#00A86B] border border-green-200'
                      : 'bg-red-50 text-[#CE1126] border border-red-200'
                  }`}
                >
                  {member.status === 'active' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'banking', label: 'Banking', icon: CreditCard },
                { id: 'account', label: 'Account', icon: Shield },
              ].map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 font-medium whitespace-nowrap transition-all rounded-t-lg ${
                      isActive
                        ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white'
                        : 'text-[#6C757D] hover:text-[#0038A8] hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" style={{ color: blue }} />
                      Full Name
                    </p>
                    <p className="text-[#212529] font-medium">{displayValue(member.full_name || member.name)}</p>
                  </div>

                  {/* ID Card Number */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" style={{ color: red }} />
                      ID Card No.
                    </p>
                    <p className="text-[#212529] font-medium font-mono">{displayValue(member.id_card_number)}</p>
                  </div>

                  {/* Gender */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" style={{ color: green }} />
                      Gender
                    </p>
                    <p className="text-[#212529] font-medium capitalize">
                      {displayValue(member.gender)}
                    </p>
                  </div>

                  {/* Date of Birth */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" style={{ color: blue }} />
                      Date of Birth
                    </p>
                    <p className="text-[#212529] font-medium">
                      {member.date_of_birth ? formatDate(member.date_of_birth) : 'Not Provided'}
                    </p>
                  </div>

                  {/* Living Address */}
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" style={{ color: green }} />
                      Living Address
                    </p>
                    <p className="text-[#212529] font-medium">{displayValue(member.living_address)}</p>
                  </div>

                  {/* Current Job */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" style={{ color: blue }} />
                      Current Job
                    </p>
                    <p className="text-[#212529] font-medium">
                      {displayValue(member.position || member.current_job)}
                    </p>
                  </div>

                  {/* Stable Income */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" style={{ color: green }} />
                      Stable Income
                    </p>
                    <p className="text-[#212529] font-medium">
                      {formatCurrency(member.monthly_income || member.stable_income)}
                    </p>
                  </div>

                  {/* Loan Purpose */}
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3" style={{ color: red }} />
                      Loan Purpose
                    </p>
                    <p className="text-[#212529] font-medium">{displayValue(member.loan_purpose)}</p>
                  </div>

                  {/* Relative's Name - from contact_person1 JSON */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" style={{ color: blue }} />
                      Relative's Name
                    </p>
                    <p className="text-[#212529] font-medium">
                      {getRelativeName(member)}
                    </p>
                  </div>

                  {/* Relative's Phone Number - from contact_person1 JSON */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" style={{ color: red }} />
                      Relative's Phone
                    </p>
                    <p className="text-[#212529] font-medium">
                      {getRelativePhone(member)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                {/* KYC Documents */}
                {member.id_photos && member.id_photos.length > 0 && (
                  <div className="border-b border-gray-200 pb-6">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-1" style={{ color: darkNavy }}>
                      <FileText className="w-4 h-4" />
                      KYC Documents
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {member.id_photos.map((photo: IdPhoto) => (
                        <div
                          key={photo.id}
                          onClick={() => setSelectedImage(photo.url)}
                          className="cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-[#0038A8] transition-colors"
                        >
                          <img
                            src={photo.url || "/placeholder.svg"}
                            alt={`ID ${photo.type}`}
                            className="w-full h-32 object-cover hover:opacity-80 transition-opacity"
                          />
                          <p className="text-xs text-[#6C757D] p-2 text-center bg-blue-50 capitalize">
                            {photo.type}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signature */}
                {member.signature_image ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-1" style={{ color: darkNavy }}>
                      <Fingerprint className="w-4 h-4" />
                      Signature
                    </p>
                    <img
                      src={member.signature_image || "/placeholder.svg"}
                      alt="Signature"
                      onClick={() => setSelectedImage(member.signature_image!)}
                      className="w-full h-auto max-h-48 object-contain border border-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </div>
                ) : (
                  <p className="text-[#6C757D] text-center py-8">No signature uploaded</p>
                )}

                {/* No documents message */}
                {(!member.id_photos || member.id_photos.length === 0) && !member.signature_image && (
                  <p className="text-[#6C757D] text-center py-8">No documents uploaded</p>
                )}
              </div>
            )}

            {/* Banking Tab */}
            {activeTab === 'banking' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" style={{ color: blue }} />
                      Bank Name
                    </p>
                    <p className="text-[#212529] font-medium">{getBankName(member)}</p>
                    {member.bank_details?.setBy === 'admin' && (
                      <span className="text-[10px] bg-blue-100 text-[#0038A8] px-2 py-0.5 rounded-full inline-block mt-1">
                        Admin Set
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-[#6C757D] mb-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" style={{ color: red }} />
                      Account Number
                    </p>
                    <p className="text-[#212529] font-medium font-mono">{getAccountNumber(member)}</p>
                  </div>
                </div>
                
                {!member.bank_name && !member.bank_card_number && !member.bank_details && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-yellow-700">No bank details available for this member.</p>
                  </div>
                )}
              </div>
            )}

            {/* Account Tab - Updated with last_login_ip and last_login_location */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-red-50 rounded-lg p-4 border border-[#0038A8]/20">
                  <h4 className="font-semibold mb-4 flex items-center gap-1" style={{ color: darkNavy }}>
                    <Shield className="w-4 h-4" />
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#6C757D] flex items-center gap-1">
                        <Award className="w-3 h-3" style={{ color: blue }} />
                        Credit Score
                      </p>
                      <p className="text-2xl font-bold" style={{ color: blue }}>{member.score}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6C757D] flex items-center gap-1">
                        <Wallet className="w-3 h-3" style={{ color: green }} />
                        Wallet Balance
                      </p>
                      <p className="text-2xl font-bold text-[#212529]">{formatCurrency(member.wallet)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6C757D] flex items-center gap-1">
                        <Fingerprint className="w-3 h-3" style={{ color: red }} />
                        Withdrawal Code
                      </p>
                      <p className="text-[#212529] font-medium font-mono">
                        {displayValue(member.withdrawal_code)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6C757D] flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: blue }} />
                        Registration Date
                      </p>
                      <p className="text-[#212529] font-medium">{formatDate(member.registration_date)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-4 flex items-center gap-1" style={{ color: darkNavy }}>
                    <Globe className="w-4 h-4" />
                    System Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#6C757D]">Last Login Location</p>
                      <p className="text-[#212529] font-medium">{getLocation(member)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6C757D]">Last Login IP</p>
                      <p className="text-[#212529] font-medium font-mono">{getIPAddress(member)}</p>
                    </div>
                    {member.note && (
                      <div>
                        <p className="text-xs text-[#6C757D]">Notes</p>
                        <p className="text-[#212529] bg-yellow-50 p-2 rounded border border-yellow-200">{member.note}</p>
                      </div>
                    )}
                    
                    {/* Wallet Modification History Section - shows admin names correctly */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-[#6C757D] mb-2 font-semibold">Recent Activity</p>
                      <p className="text-xs text-[#6C757D]">
                        (Wallet modifications performed by: Admin, Admin 1, Admin 2, Admin 3, Admin 4, Admin 5)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex gap-2 pt-6 border-t border-gray-200">
              <Button 
                onClick={onClose} 
                className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20]"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-[#6C757D]">
            No member data found
          </div>
        )}
      </Card>
    </div>
  )
}
