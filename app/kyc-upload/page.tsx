'use client'

import React from "react"
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, X, Upload, CheckCircle, AlertCircle, Info, Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { uploadKYCImage } from '@/lib/storage'
import type { LoanApplication } from '@/lib/application-progress'
import Image from 'next/image'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface User {
  id: number
  phone_number: string
  full_name: string
  credit_score: number
  wallet_balance: number
}

interface UploadProgress {
  front: { uploading: boolean; preview: string | null; url: string | null }
  back: { uploading: boolean; preview: string | null; url: string | null }
  selfie: { uploading: boolean; preview: string | null; url: string | null }
}

export default function KYCUploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    front: { uploading: false, preview: null, url: null },
    back: { uploading: false, preview: null, url: null },
    selfie: { uploading: false, preview: null, url: null },
  })
  const [error, setError] = useState('')
  const [usedFallback, setUsedFallback] = useState(false)
  const [activeUploadType, setActiveUploadType] = useState<'front' | 'back' | 'selfie' | null>(null)

  useEffect(() => {
    const fetchUserAndApplication = async () => {
      try {
        // Fetch user
        const userResponse = await fetch('/api/user')
        if (!userResponse.ok) {
          router.push('/login')
          return
        }
        const userData = await userResponse.json()
        setUser(userData.user)

        // Get application
        const appResponse = await fetch('/api/loans?action=get_user_application')
        if (appResponse.ok) {
          const appData = await appResponse.json()
          if (appData.application) {
            setApplication(appData.application)
            // Pre-fill with existing URLs if available
            if (appData.application.kyc_front_url) {
              setUploadProgress((prev) => ({
                ...prev,
                front: { ...prev.front, url: appData.application.kyc_front_url },
              }))
            }
            if (appData.application.kyc_back_url) {
              setUploadProgress((prev) => ({
                ...prev,
                back: { ...prev.back, url: appData.application.kyc_back_url },
              }))
            }
            if (appData.application.selfie_url) {
              setUploadProgress((prev) => ({
                ...prev,
                selfie: { ...prev.selfie, url: appData.application.selfie_url },
              }))
            }
          } else {
            // No application found, redirect to loan application
            router.push('/loan-application')
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndApplication()
  }, [router])

  const handleFileSelect = async (type: 'front' | 'back' | 'selfie') => {
    if (!user || !application) return

    // Create file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/jpg,image/png'
    
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file || !user || !application) {
        target.value = ''
        return
      }

      setError('')
      setActiveUploadType(type)

      // Show preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const preview = event.target?.result as string
        setUploadProgress((prev) => ({
          ...prev,
          [type]: { ...prev[type], preview },
        }))
      }
      reader.readAsDataURL(file)

      // Upload file
      setUploadProgress((prev) => ({
        ...prev,
        [type]: { ...prev[type], uploading: true },
      }))

      const result = await uploadKYCImage(file, type, user.id, application.id)

      console.log('[v0] Upload result:', result)

      if (!result.success) {
        console.error('[v0] Upload failed:', result.error)
        setError(result.error || 'Upload failed')
        setUploadProgress((prev) => ({
          ...prev,
          [type]: { ...prev[type], uploading: false, preview: null },
        }))
        target.value = ''
        return
      }

      console.log('[v0] Upload success, URL:', result.url)

      // Track if we're using fallback storage
      if (result.isMock) {
        console.log('[v0] Using fallback base64 storage')
        setUsedFallback(true)
      }

      // Success - save URL to database
      setUploadProgress((prev) => ({
        ...prev,
        [type]: { ...prev[type], uploading: false, url: result.url || null },
      }))

      // Update database via API
      try {
        const response = await fetch('/api/loans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_kyc_url',
            applicationId: application.id,
            type,
            url: result.url,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Failed to save document')
        }
      } catch (err) {
        console.error('Database error:', err)
        setError('Failed to save document. Please try again.')
      }

      target.value = ''
      setActiveUploadType(null)
    }

    input.click()
  }

  const removePreview = (type: 'front' | 'back' | 'selfie') => {
    setUploadProgress((prev) => ({
      ...prev,
      [type]: { uploading: false, preview: null, url: null },
    }))
  }

  const handleNext = async () => {
    if (!uploadProgress.front.url || !uploadProgress.back.url || !uploadProgress.selfie.url) {
      setError('Please upload all documents')
      return
    }

    if (!application) {
      setError('Application not found')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Mark KYC as completed for this user via API
      await fetch('/api/users/mark-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'kyc',
        }),
      }).catch((err) => console.error('Error marking KYC verification:', err))

      // Redirect to personal information
      router.push('/personal-information')
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const allUploaded =
    !!uploadProgress.front.url &&
    !!uploadProgress.back.url &&
    !!uploadProgress.selfie.url

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#0038A8] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#6C757D]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

const UploadBox = ({
  type,
  label,
}: {
  type: 'front' | 'back' | 'selfie'
  label: string
}) => {
  const { uploading, preview, url } = uploadProgress[type]
  const isActive = activeUploadType === type
  
  // Get sample image path based on type
  const getSampleImage = () => {
    switch(type) {
      case 'front':
        return '/logos/FrontIDCard.png'
      case 'back':
        return '/logos/BackIDCard.png'
      case 'selfie':
        return '/logos/SelfieIDCard.png'
      default:
        return ''
    }
  }

  return (
    <div className="mb-8">
      <label className="block text-lg font-semibold text-[#212529] mb-4">
        {label}
      </label>
      
      {/* Upload Box */}
      <div 
        className={`
          bg-white border-2 border-[#e9ecef] rounded-2xl overflow-hidden transition-all duration-300
          ${!preview && !url ? 'cursor-pointer hover:border-[#0038A8] hover:shadow-lg' : ''}
          ${isActive ? 'ring-2 ring-[#0038A8] ring-offset-2' : ''}
        `}
        onClick={() => !preview && !url && !uploading && handleFileSelect(type)}
      >
        {preview || url ? (
          <div className="relative p-6">
            <div className="relative border-2 border-[#e9ecef] rounded-xl overflow-hidden mb-4">
              <img
                src={preview || url || ''}
                alt={label}
                className="w-full h-56 object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removePreview(type)
                }}
                className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                disabled={uploading}
              >
                <X className="w-5 h-5 text-[#6C757D]" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-[#00A86B]">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Uploaded successfully</span>
            </div>
            <p className="text-sm text-[#6C757D] mt-1 text-center">
              {label} uploaded
            </p>
          </div>
        ) : (
          <div className="relative w-full h-72 bg-gray-50">
            <Image
              src={getSampleImage()}
              alt={`Sample ${label}`}
              fill
              className="object-contain p-6"
              sizes="(max-width: 768px) 100vw, 500px"
              priority
            />
            {/* Subtle upload indicator on hover */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg">
                  <span className="text-sm font-semibold text-[#0038A8]">Click to upload</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <Button
        onClick={() => handleFileSelect(type)}
        disabled={uploading || !!url}
        className={`
          w-full py-5 rounded-xl font-semibold transition-all duration-300 mt-4 text-base
          ${uploading || url 
            ? 'bg-[#e9ecef] text-[#adb5bd] cursor-not-allowed' 
            : 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white shadow-lg hover:shadow-xl'
          }
        `}
      >
        {uploading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Uploading...
          </>
        ) : url ? (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Uploaded ✓
          </>
        ) : (
          `Upload ${label}`
        )}
      </Button>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-8">
      {/* Header */}
      <header className="bg-white border-b border-[#e9ecef] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/loan-application"
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
                <p className="text-xs text-gray-500">KYC Verification</p>
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

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#212529] mb-2">
            <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
              Identity Verification
            </span>
          </h1>
          <p className="text-[#6C757D]">Take clear photos of your KYC identification</p>
        </div>

        {/* Progress Indicator - Updated colors */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-6 h-2 bg-[#0038A8] rounded-full"></div>
          <div className="w-2 h-2 bg-[#e9ecef] rounded-full"></div>
          <div className="w-2 h-2 bg-[#e9ecef] rounded-full"></div>
          <div className="w-2 h-2 bg-[#e9ecef] rounded-full"></div>
        </div>

        {/* Requirements */}
        <div className="bg-[#f8f9fa] rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 text-[#212529] font-semibold mb-3">
            <Info className="w-5 h-5 text-[#0038A8]" />
            Upload Requirements
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-[#6C757D]">
              <span className="text-[#00A86B]">✓</span>
              Clear, well-lit photos
            </div>
            <div className="flex items-center gap-2 text-[#6C757D]">
              <span className="text-[#00A86B]">✓</span>
              All text must be readable
            </div>
            <div className="flex items-center gap-2 text-[#6C757D]">
              <span className="text-[#00A86B]">✓</span>
              No glare or reflections
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Fallback Storage Warning */}
        {usedFallback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-900 font-medium">
                📝 Your documents are being stored temporarily. They will be uploaded to our secure server shortly.
              </p>
            </div>
          </div>
        )}

        {/* Upload Sections */}
        <div className="space-y-6">
          <UploadBox type="front" label="Front ID Card" />
          <UploadBox type="back" label="Back ID Card" />
          <UploadBox type="selfie" label="Selfie with ID Card" />
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!allUploaded || isSubmitting}
          className={`
            w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20]
            text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
            text-lg mt-8 ${!allUploaded || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              Next
              <svg 
                className="ml-2 w-5 h-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </>
          )}
        </Button>

        {/* Footer Trust Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Your documents are secure and encrypted. KabayanLoan is SEC Registered and BSP Supervised.
          </p>
        </div>
      </main>
    </div>
  )
}
