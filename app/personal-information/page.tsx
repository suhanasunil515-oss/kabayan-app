'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface User {
  id: number
  phone_number: string
  full_name: string
  email?: string
}

interface PersonalInfo {
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
  // Keep original fields for reference
  facebook_name?: string
  company_name?: string
  position?: string
  seniority?: string
  monthly_income?: string
  unit_address?: string
}

export default function PersonalInformationPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [formData, setFormData] = useState<PersonalInfo>({
    full_name: '',
    id_card_number: '',
    gender: '',
    date_of_birth: '',
    current_job: '',
    stable_income: '',
    loan_purpose: '',
    living_address: '',
    relative_name: '',
    relative_phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string>('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        
        // Check if user is logged in
        const userResponse = await fetch('/api/user')
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch user')
        }
        
        const userData = await userResponse.json()
        setUser(userData.user)

        // Fetch existing personal info
        const infoResponse = await fetch('/api/account/personal-info')
        if (infoResponse.ok) {
          const data = await infoResponse.json()
          if (data.info) {
            setFormData({
              full_name: data.info.full_name || '',
              id_card_number: data.info.id_card_number || '',
              gender: data.info.gender || '',
              date_of_birth: data.info.date_of_birth || '',
              current_job: data.info.current_job || data.info.position || '',
              stable_income: data.info.stable_income || data.info.monthly_income || '',
              loan_purpose: data.info.loan_purpose || '',
              living_address: data.info.living_address || '',
              relative_name: data.info.relative_name || '',
              relative_phone: data.info.relative_phone || '',
            })
          }
        }

        // Check verification status
        const verResponse = await fetch('/api/user?action=get_verification_status')
        if (verResponse.ok) {
          const verData = await verResponse.json()
          if (verData.verification?.personal_info_completed) {
            setIsCompleted(true)
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err)
        setApiError('Failed to load user data. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    if (apiError) {
      setApiError('')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.id_card_number?.trim()) {
      newErrors.id_card_number = 'Identification Card No. is required'
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender'
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required'
    }
    
    if (!formData.current_job?.trim()) {
      newErrors.current_job = 'Current job is required'
    }
    
    if (!formData.stable_income?.trim()) {
      newErrors.stable_income = 'Stable income is required'
    }
    
    if (!formData.loan_purpose?.trim()) {
      newErrors.loan_purpose = 'Loan purpose is required'
    }
    
    if (!formData.living_address?.trim()) {
      newErrors.living_address = 'Current address is required'
    }
    
    if (!formData.relative_name?.trim()) {
      newErrors.relative_name = "Relative's name is required"
    }
    
    if (!formData.relative_phone?.trim()) {
      newErrors.relative_phone = "Relative's phone number is required"
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.relative_phone.trim())) {
      newErrors.relative_phone = 'Please enter a valid phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    
    if (!user) {
      setApiError('User not found. Please log in again.')
      return
    }

    setIsSubmitting(true)
    setApiError('')

    try {
      const response = await fetch('/api/account/personal-info', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save information')
      }

      // Mark verification as completed
      await fetch('/api/users/mark-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'personal_info' }),
      }).catch(err => console.error('Error marking verification:', err))

      // Navigate to bank information step
      router.push('/bank-information')
      
    } catch (err) {
      console.error('Submit error:', err)
      setApiError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#0038A8] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#6C757D]">Loading your information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-8">
      {/* Header */}
      <header className="bg-white border-b border-[#e9ecef] shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/kyc-upload"
              className="flex items-center gap-2 text-[#0038A8] hover:text-[#002c86] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src={GOVERNMENT_LOGOS.bp} alt="KabayanLoan" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-lg font-black tracking-tight">
                    <span className="text-[#0038A8]">KABAYAN</span>
                    <span className="text-[#CE1126]">LOAN</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">Personal Information</p>
              </div>
            </div>
          </div>
          
          {/* Trust Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">
            <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
              Complete Your Profile
            </span>
          </h1>
          <p className="text-[#6C757D]">Please fill in all required information</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-6 h-2 bg-[#0038A8] rounded-full"></div>
          <div className="w-6 h-2 bg-[#0038A8] rounded-full"></div>
          <div className="w-2 h-2 bg-[#e9ecef] rounded-full"></div>
          <div className="w-2 h-2 bg-[#e9ecef] rounded-full"></div>
        </div>

        {/* Success Alert */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-900 font-medium">✓ Personal information already completed</p>
              <p className="text-xs text-green-700 mt-1">You can update your information below if needed</p>
            </div>
          </div>
        )}

        {/* API Error Alert */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium">{apiError}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white border border-[#e9ecef] rounded-2xl p-6 md:p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Actual Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[#212529] font-medium">
                  Actual Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Please fill in information"
                  className={`bg-white border-2 ${
                    errors.full_name ? 'border-red-300 focus:border-red-500' : 'border-[#e9ecef] focus:border-[#0038A8]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                )}
              </div>

              {/* Identification Card No. */}
              <div className="space-y-2">
                <Label htmlFor="id_card_number" className="text-[#212529] font-medium">
                  Identification Card No. <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="id_card_number"
                  name="id_card_number"
                  value={formData.id_card_number}
                  onChange={handleChange}
                  placeholder="Please fill in information"
                  className={`bg-white border-2 ${
                    errors.id_card_number ? 'border-red-300 focus:border-red-500' : 'border-[#e9ecef] focus:border-[#0038A8]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.id_card_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.id_card_number}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-[#212529] font-medium">
                  Please Select your gender <span className="text-red-500">*</span>
                </Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full bg-white border-2 ${
                    errors.gender ? 'border-red-300' : 'border-[#e9ecef]'
                  } rounded-xl px-4 py-3 focus:outline-none focus:border-[#0038A8] transition-colors`}
                  disabled={isSubmitting}
                >
                  <option value="">Please fill in information</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-[#212529] font-medium">
                  Enter your date of birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`bg-white border-2 ${
                    errors.date_of_birth ? 'border-red-300 focus:border-red-500' : 'border-[#e9ecef] focus:border-[#0038A8]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.date_of_birth && (
                  <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
                )}
              </div>

              {/* Current Job */}
              <div className="space-y-2">
                <Label htmlFor="current_job" className="text-[#212529] font-medium">
                  Enter Current Job <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="current_job"
                  name="current_job"
                  value={formData.current_job}
                  onChange={handleChange}
                  placeholder="Please fill in information"
                  className={`bg-white border-2 ${
                    errors.current_job ? 'border-red-300 focus:border-red-500' : 'border-[#e9ecef] focus:border-[#0038A8]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.current_job && (
                  <p className="text-red-500 text-sm mt-1">{errors.current_job}</p>
                )}
              </div>

              {/* Stable Income */}
              <div className="space-y-2">
                <Label htmlFor="stable_income" className="text-[#212529] font-medium">
                  Stable income <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stable_income"
                  name="stable_income"
                  value={formData.stable_income}
                  onChange={handleChange}
                  placeholder="Please fill in information"
                  className={`bg-white border-2 ${
                    errors.stable_income ? 'border-red-300 focus:border-red-500' : 'border-[#e9ecef] focus:border-[#0038A8]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.stable_income && (
                  <p className="text-red-500 text-sm mt-1">{errors.stable_income}</p>
                )}
              </div>

              {/* Loan Purpose - Full Width */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="loan_purpose" className="text-[#212529] font-medium">
                  Enter your loan purpose <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="loan_purpose"
                  name="loan_purpose"
                  value={formData.loan_purpose}
                  onChange={handleChange}
                  placeholder="Please fill in information"
                  className={`bg-white border-2 ${
                    errors.loan_purpose ? 'border-red-300 focus:border-red-500' : 'border-[#e9ecef] focus:border-[#0038A8]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.loan_purpose && (
                  <p className="text-red-500 text-sm mt-1">{errors.loan_purpose}</p>
                )}
              </div>

              {/* Current Address - Full Width */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="living_address" className="text-[#212529] font-medium">
                  Enter your current address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="living_address"
                  name="living_address"
                  value={formData.living_address}
                  onChange={handleChange}
                  placeholder="Please fill in information"
                  className={`bg-white border-2 ${
                    errors.living_address ? 'border-red-300 focus:border-red-500' : 'border-[#e9ecef] focus:border-[#0038A8]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.living_address && (
                  <p className="text-red-500 text-sm mt-1">{errors.living_address}</p>
                )}
              </div>

              {/* Relative Name */}
              <div className="space-y-2">
                <Label htmlFor="relative_name" className="text-[#212529] font-medium">
                  Enter the name of your relative <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="relative_name"
                  name="relative_name"
                  value={formData.relative_name}
                  onChange={handleChange}
                  placeholder="Please fill in information"
                  className={`bg-white border-2 ${
                    errors.relative_name ? 'border-red-300 focus:border-red-500' : 'border-[#e9ecef] focus:border-[#0038A8]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.relative_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.relative_name}</p>
                )}
              </div>

              {/* Relative Phone */}
              <div className="space-y-2">
                <Label htmlFor="relative_phone" className="text-[#212529] font-medium">
                  Enter your relative's phone number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="relative_phone"
                  name="relative_phone"
                  value={formData.relative_phone}
                  onChange={handleChange}
                  placeholder="Please fill in information"
                  className={`bg-white border-2 ${
                    errors.relative_phone ? 'border-red-300 focus:border-red-500' : 'border-[#e9ecef] focus:border-[#0038A8]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.relative_phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.relative_phone}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6 border-t border-[#e9ecef]">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-semibold py-3 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Information'
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Trust Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Your information is secure and encrypted. KabayanLoan is SEC Registered and BSP Supervised.
          </p>
        </div>
      </main>
    </div>
  )
}
