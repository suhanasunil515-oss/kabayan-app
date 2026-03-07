'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle, Shield, Landmark, CreditCard } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

export default function BankInformationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        const userResponse = await fetch('/api/user')
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch user')
        }

        const bankResponse = await fetch('/api/account/bank-details')
        if (bankResponse.ok) {
          const data = await bankResponse.json()
          if (data.bankDetails?.bankName && data.bankDetails?.accountNumber) {
            setFormData({
              bankName: data.bankDetails.bankName,
              accountNumber: data.bankDetails.accountNumber,
            })
            setIsCompleted(true)
          } else if (data.bankDetails) {
            setFormData({
              bankName: data.bankDetails.bankName || '',
              accountNumber: data.bankDetails.accountNumber || '',
            })
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setApiError('Failed to load data. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    if (apiError) setApiError('')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.bankName?.trim()) {
      newErrors.bankName = 'Bank name is required'
    }
    if (!formData.accountNumber?.trim()) {
      newErrors.accountNumber = 'Account number is required'
    } else if (!/^[0-9\-]+$/.test(formData.accountNumber.replace(/\s/g, ''))) {
      newErrors.accountNumber = 'Please enter a valid account number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)
    setApiError('')

    try {
      const response = await fetch('/api/account/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: formData.bankName.trim(),
          accountNumber: formData.accountNumber.replace(/\s/g, ''),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save bank details')
      }

      router.push('/signature')
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
          <p className="text-[#6C757D]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-8">
      <header className="bg-white border-b border-[#e9ecef] shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/personal-information"
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
                <p className="text-xs text-gray-500">Bank Information</p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">
            <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
              Bank Account Details
            </span>
          </h1>
          <p className="text-[#6C757D]">
            For loan disbursements and withdrawals
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <div className="w-6 h-2 bg-[#0038A8] rounded-full"></div>
          <div className="w-6 h-2 bg-[#0038A8] rounded-full"></div>
          <div className="w-6 h-2 bg-[#0038A8] rounded-full"></div>
          <div className="w-2 h-2 bg-[#e9ecef] rounded-full"></div>
        </div>

        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-900 font-medium">Bank information already completed</p>
              <p className="text-xs text-green-700 mt-1">You can update below if needed</p>
            </div>
          </div>
        )}

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium">{apiError}</p>
          </div>
        )}

        <div className="bg-white border border-[#e9ecef] rounded-2xl p-6 md:p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-[#212529] font-medium flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#0038A8]" />
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  name="bankName"
                  type="text"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g. BDO, BPI, Metrobank"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.bankName ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.bankName && (
                  <p className="text-sm text-red-600">{errors.bankName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-[#212529] font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#CE1126]" />
                  Account Number
                </Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter your bank account number"
                  className={`w-full px-4 py-3 rounded-xl border font-mono tracking-wider ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-600">{errors.accountNumber}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-bold shadow-lg disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : 'Continue to Sign'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
