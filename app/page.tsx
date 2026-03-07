'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import BankCarousel from '@/components/bank-carousel'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'
import { 
  Globe, Users, Banknote, Rocket, Shield, Zap, Clock, 
  Percent, LogIn, UserPlus, ChevronRight, Star, CheckCircle, 
  Award, Phone, Mail, Headphones, Heart, Target, TrendingUp,
  CreditCard, Smartphone, Wallet, Briefcase, FileText,
  Calculator, ChevronLeft
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function HomePage() {
  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(100000)
  const [activeAmount, setActiveAmount] = useState(100000)
  const [selectedTerm, setSelectedTerm] = useState(6)

  // Testimonials Carousel State
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)

  // Quick amount options
  const quickAmounts = [100000, 300000, 500000]

  // Loan terms with fixed 0.5% monthly interest rate
  const loanTerms = [
    { months: 6, rate: 0.005, label: '6 months' },
    { months: 12, rate: 0.005, label: '12 months' },
    { months: 24, rate: 0.005, label: '24 months' },
    { months: 36, rate: 0.005, label: '36 months' }
  ]

  // Flat-rate formula: Monthly = (Amount / Term) + (Amount × 0.005)
  const calculateMonthlyPayment = (amount: number, termMonths: number, rate: number) => {
    if (termMonths === 0) return amount
    const x = amount / termMonths
    const y = amount * rate // rate is decimal (0.005 for 0.5%)
    return Math.round((x + y) * 100) / 100
  }

  // Get current rate
  const getCurrentRate = () => {
    const term = loanTerms.find(t => t.months === selectedTerm)
    return term ? term.rate : 0.005
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-PH')
  }

  // Calculate derived values
  const currentRate = getCurrentRate()
  const monthlyPayment = calculateMonthlyPayment(loanAmount, selectedTerm, currentRate)
  const totalPayment = monthlyPayment * selectedTerm
  const totalInterest = totalPayment - loanAmount

  // Auto-slide testimonials every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-emerald-50/30">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Professional Logo with Bagong Pilipinas */}
            <div className="flex items-center gap-4">
              {/* Bagong Pilipinas Logo */}
              <div className="w-12 h-12 lg:w-14 lg:h-14 relative">
                <Image
                  src="/logos/BP.png"
                  alt="Bagong Pilipinas"
                  width={56}
                  height={56}
                  className="object-contain"
                  priority
                />
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              
              {/* Brand Name */}
              <div>
                <div className="flex items-baseline">
                  <span className="text-2xl lg:text-3xl font-black tracking-tight">
                    <span className="text-[#0038A8]">KABAYAN</span>
                    <span className="text-[#CE1126]">LOAN</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] lg:text-xs bg-[#FFD700] text-gray-800 px-2 py-0.5 rounded-full font-semibold">
                    OFW
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="#features" className="text-gray-700 hover:text-[#0038A8] font-medium transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-[#0038A8] font-medium transition-colors">
                How It Works
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-[#0038A8] font-medium transition-colors">
                Testimonials
              </Link>
              <Link href="#government" className="text-gray-700 hover:text-[#0038A8] font-medium transition-colors">
                Government Partners
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-[#0038A8]">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white px-4 sm:px-6 shadow-lg hover:shadow-xl transition-all">
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Apply Now</span>
                  <span className="sm:hidden">Apply</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Hero Section */}
        <section className="text-center mb-16 md:mb-20 lg:mb-24">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200/50">
            <Award className="w-4 h-4 text-[#FF6B00]" />
            <span>Trusted by 500K+ OFWs Worldwide 🇵🇭</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 lg:mb-6">
            Instant Loans para sa{' '}
            <span className="bg-gradient-to-r from-[#0038A8] via-[#00A86B] to-[#FF6B00] bg-clip-text text-transparent">
              OFW Worldwide
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 lg:mb-12 max-w-3xl mx-auto px-4">
            No collateral • Apply anywhere • Approved in 24 hours • Direct to your e-wallet
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto mb-12 lg:mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-3xl sm:text-4xl font-bold text-[#0038A8] mb-2">₱5M</div>
              <div className="text-gray-600">Maximum Loan Amount</div>
              <div className="text-sm text-gray-500 mt-2">Flexible terms for your needs</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-3xl sm:text-4xl font-bold text-[#00A86B] mb-2 flex items-center justify-center gap-2">
                <Zap className="w-6 h-6" />
                <span>24h</span>
              </div>
              <div className="text-gray-600">Fast Approval</div>
              <div className="text-sm text-gray-500 mt-2">Get approved within a day</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-3xl sm:text-4xl font-bold text-[#FF6B00] mb-2 flex items-center justify-center gap-2">
                <Percent className="w-6 h-6" />
                <span>0.5%</span>
              </div>
              <div className="text-gray-600">Low Interest Rate</div>
              <div className="text-sm text-gray-500 mt-2">Competitive rates for OFWs</div>
            </div>
          </div>
        </section>

        {/* Loan Calculator Section */}
        <section className="mb-16 md:mb-20">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <Calculator className="w-6 h-6 text-[#0038A8]" />
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Magkano ang kailangan mo?
                </h2>
              </div>
              <p className="text-gray-600 text-base sm:text-lg px-4">
                Gamitin ang calculator para malaman ang iyong monthly payment
              </p>
            </div>

            {/* Calculator Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6 md:p-8 mx-4 sm:mx-6 md:mx-0">
              
              {/* Loan Amount Display */}
              <div className="text-center mb-6">
                <span className="text-sm text-gray-500 uppercase tracking-wider">Loan Amount</span>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0038A8] mt-1">
                  ₱{formatCurrency(loanAmount)}
                </div>
              </div>

              {/* Amount Slider */}
              <div className="mb-8 px-2">
                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => {
                    setLoanAmount(parseInt(e.target.value))
                    setActiveAmount(parseInt(e.target.value))
                  }}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-pan-y
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:h-8 
                    [&::-webkit-slider-thumb]:w-8 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-[#0038A8]
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-white
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:h-8
                    [&::-moz-range-thumb]:w-8
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-[#0038A8]
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-white
                    [&::-moz-range-thumb]:cursor-pointer"
                />
                
                {/* Min/Max Labels */}
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                  <span>₱100K</span>
                  <span>₱5M</span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-3 px-1">Quick select:</p>
                <div className="flex gap-3 justify-center">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setLoanAmount(amount)
                        setActiveAmount(amount)
                      }}
                      className={`flex-1 max-w-[120px] py-4 rounded-xl text-base font-semibold transition-all touch-manipulation ${
                        activeAmount === amount 
                          ? 'bg-[#0038A8] text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                      }`}
                    >
                      ₱{amount/1000}K
                    </button>
                  ))}
                </div>
              </div>

              {/* Term Selection */}
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-3 px-1">Loan term:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {loanTerms.map((term) => (
                    <button
                      key={term.months}
                      onClick={() => setSelectedTerm(term.months)}
                      className={`py-3 sm:py-4 rounded-xl text-center transition-all touch-manipulation ${
                        selectedTerm === term.months 
                          ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                      }`}
                    >
                      <div className="font-semibold text-sm sm:text-base">{term.label}</div>
                      <div className="text-xs mt-1 opacity-80">{(term.rate * 100).toFixed(1)}%</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-red-50 p-6 rounded-2xl mb-6">
                <div className="text-center mb-4">
                  <span className="text-sm text-gray-600">Monthly Payment</span>
                  <div className="text-3xl sm:text-4xl font-bold text-[#212529] mt-1">
                    ₱{formatCurrency(monthlyPayment)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <span className="text-gray-500 block">Total Interest</span>
                    <span className="font-semibold text-[#CE1126]">₱{formatCurrency(totalInterest)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-500 block">Total Payment</span>
                    <span className="font-semibold text-[#0038A8]">₱{formatCurrency(totalPayment)}</span>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <Link href="/login" className="block">
                <button className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 touch-manipulation flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Apply Now - Free!
                </button>
              </Link>

              {/* Trust Note */}
              <p className="text-xs text-gray-400 text-center mt-4">
                ✓ No hidden fees • No interest on first month • DMW Accredited
              </p>
            </div>
          </div>
        </section>

        {/* Government Partners Section */}
        <section id="government" className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-[#0038A8]" />
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Government Partners
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Recognized and regulated by Philippine government agencies
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
              {/* DMW */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.dmw}
                    alt="DMW"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">DMW</span>
                <span className="text-[10px] text-gray-500 text-center">Department of Migrant Workers</span>
              </div>

              {/* OWWA */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.owwa}
                    alt="OWWA"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">OWWA</span>
                <span className="text-[10px] text-gray-500 text-center">Overseas Workers Welfare Admin</span>
              </div>

              {/* BSP */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.bsp}
                    alt="BSP"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">BSP</span>
                <span className="text-[10px] text-gray-500 text-center">Bangko Sentral ng Pilipinas</span>
              </div>

              {/* SEC */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.sec}
                    alt="SEC"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">SEC</span>
                <span className="text-[10px] text-gray-500 text-center">Securities and Exchange Commission</span>
              </div>

              {/* DOF */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.dof}
                    alt="DOF"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">DOF</span>
                <span className="text-[10px] text-gray-500 text-center">Department of Finance</span>
              </div>

              {/* Bagong Pilipinas */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.bp}
                    alt="Bagong Pilipinas"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">Bagong Pilipinas</span>
                <span className="text-[10px] text-gray-500 text-center">Government Program</span>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                <span className="text-sm text-gray-700 font-medium">
                  SEC Registered • BSP Supervised • DMW Accredited
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* OFW Features Section */}
        <section id="features" className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-[#FF6B00]" />
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Bakit Kami Pinagkakatiwalaan ng OFW
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Designed specifically for Overseas Filipino Workers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ofwFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              3 Simple Steps to Get Your Loan
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From application to payout, we made it simple for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#0038A8] to-[#CE1126] -translate-y-1/2"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  <div className="mt-4 text-[#0038A8]">
                    {step.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Carousel */}
        <section id="testimonials" className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Stories from Our OFW Community
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join thousands of OFWs who trust us
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative max-w-md mx-auto">
            {/* Testimonial Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 min-h-[320px] flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-8 h-8 text-[#0038A8]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg">{testimonials[currentTestimonialIndex].name}</h4>
                  <p className="text-sm text-gray-500">{testimonials[currentTestimonialIndex].location}</p>
                  <p className="text-xs text-[#0038A8]">{testimonials[currentTestimonialIndex].country}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <div className="flex-1">
                <p className="text-gray-600 italic mb-4 text-base leading-relaxed">
                  "{testimonials[currentTestimonialIndex].quote}"
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-bold text-[#0038A8]">{testimonials[currentTestimonialIndex].loanAmount}</span>
                <div className="flex gap-1">
                  {testimonials.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentTestimonialIndex ? 'bg-[#0038A8] w-4' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={() => setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hidden sm:block hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#0038A8]" />
            </button>
            <button 
              onClick={() => setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hidden sm:block hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#0038A8]" />
            </button>
          </div>
        </section>

        {/* Bank Partners */}
        <section className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Partner Banks & Payment Platforms
            </h3>
            <p className="text-gray-600 text-lg">Direct integration with your preferred financial institutions</p>
          </div>

          <BankCarousel />
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-3xl p-8 md:p-12 text-center text-white mb-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24"></div>
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Handa Ka Na Bang Umutang?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Samahan ang 500,000+ OFW na nakuha na ang kanilang loan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="sm:flex-1 max-w-sm">
                <Button className="w-full bg-white text-[#0038A8] hover:bg-gray-100 text-lg py-6 rounded-2xl shadow-lg">
                  <Wallet className="w-5 h-5 mr-2" />
                  Apply Now
                </Button>
              </Link>
              <Link href="/login" className="sm:flex-1 max-w-sm">
                <Button variant="outline" className="w-full border-2 border-white text-white hover:bg-white/10 text-lg py-6 rounded-2xl bg-transparent">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Already have an account? Log in
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-4 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                <span>24/7 Customer Support</span>
              </div>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>100% Secure</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 relative">
                  <Image
                    src="/logos/BP.png"
                    alt="Bagong Pilipinas"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight">
                    <span className="text-[#0038A8]">KABAYAN</span>
                    <span className="text-[#CE1126]">LOAN</span>
                  </span>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 text-[#00A86B]" />
                    DMW Accredited
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                For OFWs and families. Fast, secure, and accessible loans.
              </p>
              
              {/* Trust Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-[10px] bg-blue-50 text-[#0038A8] px-2 py-1 rounded-full font-medium">
                  SEC Registered
                </span>
                <span className="text-[10px] bg-green-50 text-[#00A86B] px-2 py-1 rounded-full font-medium">
                  BSP Supervised
                </span>
                <span className="text-[10px] bg-orange-50 text-[#FF6B00] px-2 py-1 rounded-full font-medium">
                  DMW Accredited
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-gray-600 hover:text-[#0038A8] transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#0038A8] rounded-full"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-gray-600 hover:text-[#0038A8] transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#0038A8] rounded-full"></span>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-[#0038A8] transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#0038A8] rounded-full"></span>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-gray-600 hover:text-[#0038A8] transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#0038A8] rounded-full"></span>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* OFW Resources */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">OFW Resources</h4>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#CE1126] rounded-full"></span>
                  DMW OFW Guide
                </li>
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#CE1126] rounded-full"></span>
                  OWWA Programs
                </li>
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#CE1126] rounded-full"></span>
                  Pag-IBIG for OFWs
                </li>
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#CE1126] rounded-full"></span>
                  SSS Flexi Fund
                </li>
              </ul>
              
              {/* Government Partner Mini Badges */}
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 relative opacity-70">
                  <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={24} height={24} className="object-contain" />
                </div>
                <div className="w-6 h-6 relative opacity-70">
                  <Image src={GOVERNMENT_LOGOS.owwa} alt="OWWA" width={24} height={24} className="object-contain" />
                </div>
                <div className="w-6 h-6 relative opacity-70">
                  <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={24} height={24} className="object-contain" />
                </div>
                <span className="text-[10px] text-gray-400">Government Partners</span>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[#0038A8]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">24/7 Hotline</span>
                    <p className="text-xs text-gray-500">Always available</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[#00A86B]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Email Support</span>
                    <p className="text-xs text-gray-500">support@kabayanloan.com</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Live Chat</span>
                    <p className="text-xs text-gray-500">24/7 Available</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-200 pt-6 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500 text-center md:text-left flex items-center gap-2">
                <div className="w-5 h-5 relative">
                  <Image
                    src="/logos/BP.png"
                    alt="Bagong Pilipinas"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <p>© 2024 KabayanLoan. All rights reserved.</p>
              </div>
              
              {/* Accreditation Badges */}
              <div className="flex items-center gap-3">
                <span className="text-xs bg-blue-50 text-[#0038A8] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  SEC Reg
                </span>
                <span className="text-xs bg-green-50 text-[#00A86B] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  BSP Supervised
                </span>
                <span className="text-xs bg-orange-50 text-[#FF6B00] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  DMW Accredited
                </span>
              </div>
            </div>
            
            {/* Government Accreditation Line */}
            <div className="mt-4 text-center">
              <p className="text-[10px] text-gray-400">
                In partnership with the Department of Migrant Workers (DMW), Overseas Workers Welfare Administration (OWWA), 
                Bangko Sentral ng Pilipinas (BSP), and Securities and Exchange Commission (SEC)
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

// OFW Features
const ofwFeatures = [
  {
    icon: <Target className="w-6 h-6 text-[#FF6B00]" />,
    title: "For OFWs Worldwide",
    description: "Specially designed for our modern-day heroes abroad",
  },
  {
    icon: <Globe className="w-6 h-6 text-[#0038A8]" />,
    title: "Global Coverage",
    description: "Apply from anywhere, receive funds anywhere"
  },
  {
    icon: <Rocket className="w-6 h-6 text-[#00A86B]" />,
    title: "24-Hour Approval",
    description: "Fast track processing for emergency needs"
  },
  {
    icon: <CreditCard className="w-6 h-6 text-[#FF6B00]" />,
    title: "Direct to E-Wallet",
    description: "Receive money directly to GCash, Maya, or bank",
  }
]

// Steps
const steps = [
  {
    title: "Apply Online",
    description: "Complete our simple 5-minute application form",
    icon: <Smartphone className="w-8 h-8" />
  },
  {
    title: "Get Approved",
    description: "Receive approval within 24 hours",
    icon: <Shield className="w-8 h-8" />
  },
  {
    title: "Receive Funds",
    description: "Money sent directly to your account",
    icon: <Wallet className="w-8 h-8" />
  }
]

// Testimonials - 10 items
const testimonials = [
  {
    name: "Maria Santos",
    location: "Nurse",
    country: "Dubai, UAE",
    quote: "So fast! Approved in just 12 hours. A big help for my family's emergency needs.",
    loanAmount: "₱250,000"
  },
  {
    name: "Juan Dela Cruz",
    location: "Engineer",
    country: "Riyadh, Saudi",
    quote: "No collateral, easy process. Competitive interest rates for OFWs.",
    loanAmount: "₱500,000"
  },
  {
    name: "Ana Reyes",
    location: "Teacher",
    country: "Singapore",
    quote: "24/7 support, someone always responds. Very professional service.",
    loanAmount: "₱150,000"
  },
  {
    name: "Pedro Mercado",
    location: "Seaman",
    country: "International Waters",
    quote: "Even at sea, I was able to apply right away. A big help for my family.",
    loanAmount: "₱750,000"
  },
  {
    name: "Luzviminda Cruz",
    location: "Domestic Helper",
    country: "Hong Kong",
    quote: "First time borrowing online but so easy and safe. Thanks KabayanLoan!",
    loanAmount: "₱100,000"
  },
  {
    name: "Rolando Villanueva",
    location: "Factory Worker",
    country: "Taiwan",
    quote: "Money arrived in my GCash within 24 hours. Very helpful for emergencies.",
    loanAmount: "₱300,000"
  },
  {
    name: "Marilou Fernandez",
    location: "Caregiver",
    country: "Canada",
    quote: "Good interest rates and no hidden charges. Recommended for OFWs.",
    loanAmount: "₱450,000"
  },
  {
    name: "Ramon Bautista",
    location: "IT Professional",
    country: "USA",
    quote: "Smooth application process and customer support responds quickly.",
    loanAmount: "₱1,200,000"
  },
  {
    name: "Elena Santiago",
    location: "Sales Manager",
    country: "Japan",
    quote: "I used the loan for my family's business. Thank you KabayanLoan!",
    loanAmount: "₱800,000"
  },
  {
    name: "Ricardo Garcia",
    location: "Construction Worker",
    country: "Qatar",
    quote: "Simple requirements and no collateral needed. Perfect for OFWs.",
    loanAmount: "₱200,000"
  }
]
