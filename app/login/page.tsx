'use client'

import React from "react"
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Shield, CheckCircle, Phone, Lock, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { COUNTRY_CODES } from '@/lib/country-codes'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    countryCode: '+63',
    phone: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.phone.trim()) {
        setError('Phone number is required')
        setLoading(false)
        return
      }

      if (!formData.password) {
        setError('Password is required')
        setLoading(false)
        return
      }

      // Combine country code and phone (strip leading 0 from local number, e.g. 0912 -> 912)
      const phoneDigits = formData.phone.replace(/\D/g, '').replace(/^0+/, '')
      const fullPhoneNumber = `${formData.countryCode}${phoneDigits}`

      // Call login API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          phoneNumber: fullPhoneNumber,
          password: formData.password
        })
      })

      const contentType = response.headers.get('content-type')
      let result: { error?: string } = {}
      if (contentType?.includes('application/json')) {
        try {
          result = await response.json()
        } catch {
          setError('Server error. Please try again.')
          setLoading(false)
          return
        }
      } else {
        setError('Server error. Please try again.')
        setLoading(false)
        return
      }

      if (!response.ok) {
        setError(result.error || 'Login failed')
        setLoading(false)
        return
      }

      // Redirect to home on successful login
      setTimeout(() => {
        router.push('/home')
      }, 500)

    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] flex flex-col">
      {/* Header with Back Button */}
      <header className="pt-6 px-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#0038A8] hover:text-[#002c86] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo/Branding - Updated to KabayanLoan */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              {/* Bagong Pilipinas Logo */}
              <div className="w-16 h-16 relative">
                <Image
                  src={GOVERNMENT_LOGOS.bp}
                  alt="Bagong Pilipinas"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <h1 className="text-4xl font-black tracking-tight mb-2">
              <span className="text-[#0038A8]">KABAYAN</span>
              <span className="text-[#CE1126]">LOAN</span>
            </h1>
            
            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs bg-blue-50 text-[#0038A8] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                DMW Accredited
              </span>
              <span className="text-xs bg-green-50 text-[#CE1126] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                BSP Supervised
              </span>
            </div>
            
            <p className="text-[#6C757D] text-sm mt-4">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Phone Number with Country Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0038A8]" />
                  Phone Number
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Country Code Select */}
                  <div className="relative w-full sm:w-1/3">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0038A8] focus:border-transparent appearance-none bg-white text-sm"
                    >
                      {COUNTRY_CODES.map((countryData) => (
                        <option key={`${countryData.code}-${countryData.country}`} value={countryData.code}>
                          {countryData.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Phone Number Input */}
                  <div className="w-full sm:flex-1">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9123456789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0038A8] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#CE1126]" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0038A8] focus:border-transparent transition-all"
                  required
                />
              </div>
              
              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                <Shield className="w-3 h-3" />
                <span>256-bit SSL Encrypted</span>
              </div>
            </form>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-600">
              New to KabayanLoan? Bago pa lang?{' '}
              <Link 
                href="/register" 
                className="text-[#0038A8] hover:text-[#CE1126] font-bold transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* OFW Support Note */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <User className="w-3 h-3" />
              <span>For OFWs worldwide</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="text-center pb-4">
        <p className="text-xs text-gray-400">
          KabayanLoan is SEC Registered, BSP Supervised, and DMW Accredited
        </p>
      </footer>
    </div>
  )
}
