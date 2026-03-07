'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CountryCodeSelect from './country-code-select'

export default function LoginForm() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+254')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ phone?: string; password?: string; api?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (10+ digits)'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const phoneDigits = phone.replace(/\D/g, '').replace(/^0+/, '')
      const fullPhoneNumber = `${countryCode}${phoneDigits}`
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          phoneNumber: fullPhoneNumber,
          password,
        }),
      })

      const contentType = response.headers.get('content-type')
      let data: { error?: string } = {}
      if (contentType?.includes('application/json')) {
        try {
          data = await response.json()
        } catch {
          setErrors({ api: 'Server error. Please try again.' })
          setIsLoading(false)
          return
        }
      } else {
        setErrors({ api: 'Server error. Please try again.' })
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        setErrors({ api: data.error || 'Login failed. Please try again.' })
        return
      }

      // Redirect to home on success
      router.push('/home')
    } catch (error) {
      setErrors({ api: 'An error occurred. Please try again.' })
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* API Error Message */}
      {errors.api && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <p className="text-sm text-destructive font-medium">{errors.api}</p>
        </div>
      )}

      {/* Phone Number Field */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Phone Number
        </Label>
        <div className="flex gap-2">
          <CountryCodeSelect
            value={countryCode}
            onChange={setCountryCode}
          />
          <div className="flex-1 relative">
            <Input
              type="tel"
              placeholder="0123456789"
              value={formatPhoneNumber(phone)}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className={`bg-white border-2 transition-colors ${
                errors.phone
                  ? 'border-destructive focus:border-destructive'
                  : 'border-input focus:border-primary'
              }`}
            />
          </div>
        </div>
        {errors.phone && (
          <p className="text-xs text-destructive font-medium">{errors.phone}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`bg-white border-2 pr-10 transition-colors ${
              errors.password
                ? 'border-destructive focus:border-destructive'
                : 'border-input focus:border-primary'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive font-medium">{errors.password}</p>
        )}
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <a
          href="#"
          className="text-xs text-primary hover:underline font-medium"
        >
          Forgot Password?
        </a>
      </div>

      {/* Login Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </form>
  )
}
