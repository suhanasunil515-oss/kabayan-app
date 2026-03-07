'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Home, 
  Wallet, 
  User as UserIcon, 
  Building, 
  FileText, 
  Calendar, 
  Receipt, 
  Info, 
  Headphones, 
  Cog, 
  FileSignature, 
  ChevronRight, 
  UserCircle, 
  LogOut, 
  TrendingUp,
  Shield,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPHP } from '@/lib/currency'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface UserProfile {
  id: number
  phone_number: string
  full_name: string
  credit_score: number
  wallet_balance: number
  creditLabel: string
  joinedDate: string
}

interface MenuItem {
  icon: any
  label: string
  description: string
  href: string
  color?: string
}

interface MenuSection {
  title: string
  icon: any
  items: MenuItem[]
}

export default function MyAccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
  // Credit score maximum value
  const MAX_CREDIT_SCORE = 850

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/account/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
          console.log('[v0] Profile loaded:', data.profile)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('[v0] Error fetching profile:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
    
    // Poll for profile updates every 10 seconds to detect admin credit score changes
    const pollInterval = setInterval(fetchProfile, 10000)
    
    return () => {
      clearInterval(pollInterval)
    }
  }, [router])

  // Calculate credit score percentage
  const getCreditScorePercentage = (score: number): number => {
    if (score > MAX_CREDIT_SCORE) return 100
    if (score < 0) return 0
    return (score / MAX_CREDIT_SCORE) * 100
  }

  // Format percentage for display
  const formatPercentage = (score: number): string => {
    const percentage = getCreditScorePercentage(score)
    return percentage.toFixed(1)
  }

  // Determine if credit score is low (below 650)
  const isLowCreditScore = (score: number): boolean => {
    return score < 650
  }

  // Get color based on credit score
  const getCreditScoreColor = (score: number): string => {
    if (score >= 700) return '#00A86B' // Excellent - Green
    if (score >= 650) return '#FF6B00' // Fair - Orange
    return '#CE1126' // Low - Philippine Flag Red
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  // Updated menu sections with Philippine flag colors
  const menuSections: MenuSection[] = [
    {
      title: 'Account Management',
      icon: Cog,
      items: [
        {
          icon: Cog,
          label: 'Account Management',
          description: 'Manage personal info & bank accounts',
          href: '/my-account/account-management',
          color: '#0038A8'
        }
      ]
    },
    {
      title: 'Loan Management',
      icon: FileText,
      items: [
        {
          icon: FileSignature,
          label: 'Loan Contract',
          description: 'View active loans',
          href: '/my-account/loan-contract',
          color: '#CE1126'
        },
        {
          icon: Calendar,
          label: 'Repayment Schedule',
          description: 'Payment due dates',
          href: '/my-account/repayment-schedule',
          color: '#0038A8'
        },
        {
          icon: Receipt,
          label: 'Repayment Records',
          description: 'Payment history',
          href: '/my-account/repayment-records',
          color: '#00A86B'
        }
      ]
    },
    {
      title: 'Support & Information',
      icon: Info,
      items: [
        {
          icon: Building,
          label: 'About KabayanLoan',
          description: 'Company information',
          href: '/my-account/about-us',
          color: '#0038A8'
        },
        {
          icon: Headphones,
          label: 'Customer Support',
          description: '24/7 Help Center',
          href: '/my-account/support',
          color: '#CE1126'
        }
      ]
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#0038A8] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#212529]/60">Loading account...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#CE1126] mb-4">Failed to load account</p>
          <Button 
            onClick={() => router.push('/home')}
            className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white"
          >
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const creditScoreColor = getCreditScoreColor(profile.credit_score)
  const isLowScore = isLowCreditScore(profile.credit_score)
  const creditScorePercentage = getCreditScorePercentage(profile.credit_score)
  const formattedPercentage = formatPercentage(profile.credit_score)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-28 md:pb-32">
      {/* Header with KabayanLoan branding */}
      <header className="bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] py-4 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src={GOVERNMENT_LOGOS.bp} alt="KabayanLoan" width={32} height={32} className="object-contain" />
              </div>
              <span className="text-lg font-black tracking-tight">
                <span className="text-[#0038A8]">KABAYAN</span>
                <span className="text-[#CE1126]">LOAN</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                <Shield className="w-4 h-4 text-[#0038A8]" />
                <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 max-w-6xl mx-auto py-8">
        {/* Profile Card - Redesigned with Philippine Flag Gradient */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-8"></div>
            
            {/* Government Logos Strip */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={24} height={24} className="object-contain" />
              </div>
              <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={24} height={24} className="object-contain" />
              </div>
              <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={24} height={24} className="object-contain" />
              </div>
            </div>
            
            {/* User Profile Info */}
            <div className="text-center mb-8 relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <UserCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 break-words">{profile.full_name}</h2>
              <div className="space-y-1">
                <div className="text-base md:text-lg opacity-90">{profile.phone_number}</div>
                {profile.joinedDate && (
                  <div className="text-sm opacity-70 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    Member since {new Date(profile.joinedDate).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Balance Section - FIXED for large amounts */}
            <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/20 relative z-10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-bold opacity-90 mb-2">
                  <CreditCard className="w-5 h-5 flex-shrink-0" />
                  <span>Wallet Balance</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-extrabold leading-tight break-words max-w-full">
                    {formatPHP(profile.wallet_balance)}
                  </span>
                </div>
                <div className="text-sm opacity-80 mt-2">Available Funds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Score Card - Redesigned */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: `linear-gradient(135deg, ${creditScoreColor}, ${creditScoreColor}cc)` }}
              >
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#212529]">Credit Score</h2>
                <p className="text-[#6C757D]">Your financial credibility score</p>
              </div>
            </div>

            {/* Credit Score Display */}
            <div className="text-center mb-8">
              <div 
                className="text-5xl md:text-6xl font-extrabold mb-2"
                style={{ color: creditScoreColor }}
              >
                {profile.credit_score}
              </div>
              <div className="text-lg text-[#6C757D] mb-8">
                out of {MAX_CREDIT_SCORE}
              </div>

              {/* Credit Score Bar */}
              <div className="mb-8">
                <div className="relative h-8 bg-[#f5f7fa] rounded-full overflow-hidden mb-2">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${creditScorePercentage}%`,
                      background: `linear-gradient(to right, ${creditScoreColor}, ${creditScoreColor}dd)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-white/90 shadow-sm" 
                          style={{ color: creditScoreColor }}>
                      {formattedPercentage}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-[#6C757D] px-2">
                  <span>0</span>
                  <span>{MAX_CREDIT_SCORE}</span>
                </div>
              </div>

              {/* Alert Message for Low Score */}
              {isLowScore && (
                <div className="bg-red-50 border-l-4 border-[#CE1126] p-5 rounded-lg mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-[#CE1126]" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-[#CE1126] font-medium">
                        Your credit score is below the required threshold. Please contact our financial support team to review your account and restore your credit status to the standard level required for withdrawals.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message for Good Score */}
              {!isLowScore && profile.credit_score >= 700 && (
                <div className="bg-green-50 border-l-4 border-[#00A86B] p-5 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-[#00A86B]" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-[#00A86B] font-medium">
                        Your credit status is excellent. You are fully eligible to apply for loans and access withdrawal services.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fair Score Message */}
              {!isLowScore && profile.credit_score < 700 && profile.credit_score >= 650 && (
                <div className="bg-yellow-50 border-l-4 border-[#FF6B00] p-5 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-[#FF6B00]" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-[#FF6B00] font-medium">
                        Your credit score is fair. Maintain good payment habits to improve your score.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Sections - Redesigned with Philippine Flag Colors */}
        <div className="max-w-4xl mx-auto">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-4">
              <h3 className="text-lg font-semibold text-[#212529] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-white" />
                </div>
                <span>{section.title}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-[#f5f7fa] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 no-underline text-[#212529] border border-gray-100 hover:border-[#0038A8]/30"
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ background: `linear-gradient(135deg, ${item.color || '#0038A8'}, ${item.color === '#CE1126' ? '#b80f20' : '#002c86'})` }}
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-1 truncate">{item.label}</div>
                      <div className="text-xs text-[#6C757D] group-hover:text-[#0038A8] transition-colors truncate">{item.description}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#0038A8] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Government Trust Badges */}
        <div className="max-w-4xl mx-auto mt-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl p-4 border border-[#0038A8]/20">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 relative">
                  <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={24} height={24} className="object-contain" />
                </div>
                <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 relative">
                  <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={24} height={24} className="object-contain" />
                </div>
                <span className="text-xs font-medium text-[#00A86B]">BSP Supervised</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 relative">
                  <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={24} height={24} className="object-contain" />
                </div>
                <span className="text-xs font-medium text-[#CE1126]">DMW Accredited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="max-w-4xl mx-auto mt-8">
          <Button
            onClick={handleLogoutClick}
            className="w-full py-4 rounded-xl border-2 border-[#CE1126] bg-white text-[#CE1126] hover:bg-gradient-to-r hover:from-[#0038A8] hover:to-[#CE1126] hover:text-white transition-all duration-300 hover:-translate-y-0.5 shadow hover:shadow-lg flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Footer Note */}
        <div className="max-w-4xl mx-auto mt-6 text-center">
          <p className="text-xs text-gray-400">
            KabayanLoan is SEC Registered, BSP Supervised, and DMW Accredited. 
            All rights reserved.
          </p>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-gray-100">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[#212529] mb-2 text-center">Logout</h3>
            <p className="text-sm text-[#6C757D] mb-6 text-center">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowLogoutModal(false)}
                variant="outline"
                className="flex-1 border-2 border-gray-200 text-[#6C757D] hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Updated with Philippine Flag Blue */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] py-4 z-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link
            href="/home"
            className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#0038A8] hover:bg-[rgba(0,56,168,0.05)] no-underline"
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">HOME</span>
          </Link>
          
          <Link
            href="/wallet"
            className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#0038A8] hover:bg-[rgba(0,56,168,0.05)] no-underline"
          >
            <Wallet className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>
          
          <Link
            href="/my-account"
            className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[#0038A8] bg-[rgba(0,56,168,0.05)] no-underline"
          >
            <UserCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
