'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CountryCodeSelect from './country-code-select'

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [countryCode, setCountryCode] = useState('+254')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (10+ digits)'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions'
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
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          phoneNumber: formData.phone,
          password: formData.password,
          fullName: formData.phone, // Using phone as placeholder for full_name
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ api: data.error || 'Registration failed. Please try again.' })
        return
      }

      // Redirect to login on success
      router.push('/login')
    } catch (error) {
      setErrors({ api: 'An error occurred. Please try again.' })
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.replace(/\D/g, ''),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* API Error Message */}
      {errors.api && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <p className="text-sm text-destructive font-medium">{errors.api}</p>
        </div>
      )}

      {/* Phone Number */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-foreground">
          Phone Number
        </Label>
        <div className="flex gap-2">
          <CountryCodeSelect
            value={countryCode}
            onChange={setCountryCode}
          />
          <div className="flex-1">
            <Input
              name="phone"
              type="tel"
              placeholder="0123456789"
              value={formatPhoneNumber(formData.phone)}
              onChange={handleChange}
              className={`bg-white border-2 transition-colors text-sm ${
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

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-semibold text-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={handleChange}
            className={`bg-white border-2 pr-10 transition-colors text-sm ${
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
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive font-medium">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-semibold text-foreground"
        >
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`bg-white border-2 pr-10 transition-colors text-sm ${
              errors.confirmPassword
                ? 'border-destructive focus:border-destructive'
                : 'border-input focus:border-primary'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={
              showConfirmPassword ? 'Hide password' : 'Show password'
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive font-medium">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-3 py-2">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="w-4 h-4 rounded border-2 border-input bg-white cursor-pointer accent-primary mt-0.5"
        />
        <label htmlFor="terms" className="text-xs text-foreground cursor-pointer">
          I agree to the{' '}
          <a href="#" className="text-primary hover:underline font-medium">
            Terms & Conditions
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:underline font-medium">
            Privacy Policy
          </a>
        </label>
      </div>
      {errors.terms && (
        <p className="text-xs text-destructive font-medium">{errors.terms}</p>
      )}

      {/* Register Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-6"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </form>
  )
}
