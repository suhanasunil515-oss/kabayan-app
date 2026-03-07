'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  Lock, 
  FileText, 
  Users,
  Eye,
  Database,
  Key,
  AlertCircle,
  Home,
  Wallet,
  UserCircle,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Clock,
  Heart,
  Globe
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

export default function PrivacyPolicyPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string>('introduction')

  // Simple data structure with Tagalog translations
  const policySections = [
    {
      id: 'introduction',
      title: '1. Introduction • Panimula',
      content: [
        'Welcome to KabayanLoan. We are committed to protecting your personal information and your right to privacy.',
        'By using KabayanLoan services, you consent to the collection and use of your personal information as described in this Privacy Policy.',
      ]
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      content: [
        'We collect personal information that you voluntarily provide to us when you register for an account, apply for a loan, or use our services.',
        'Types of information include: Identity information, contact details, financial information, and transaction data.',
      ]
    },
    {
      id: 'information-use',
      title: '3. How We Use Your Information',
      content: [
        'We use your information for loan processing, account management, verification, communication, and service improvement.',
        'We may also use it for compliance with legal obligations and regulatory requirements.',
      ]
    },
    {
      id: 'data-security',
      title: '4. Data Security',
      content: [
        'We implement bank-grade security measures including 256-bit SSL encryption, two-factor authentication, and regular security audits.',
        'All data is stored in secure, BSP-compliant servers located in the Philippines.',
      ]
    },
    {
      id: 'privacy-rights',
      title: '5. Your Privacy Rights',
      content: [
        'Under the Data Privacy Act of 2012, you have rights including:',
        '• Right to access your personal data',
        '• Right to rectify inaccurate data',
        '• Right to erasure of your data',
        '• Right to restrict processing',
        '• Right to data portability',
      ]
    }
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
      setActiveSection(sectionId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-24">
      {/* HEADER - Redesigned with KabayanLoan branding */}
      <header className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="text-[#0038A8] hover:text-[#002c86] hover:bg-[#f0f7ff] p-2 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src={GOVERNMENT_LOGOS.bp}
                  alt="KabayanLoan"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-xl font-black tracking-tight">
                    <span className="text-[#0038A8]">KABAYAN</span>
                    <span className="text-[#CE1126]">LOAN</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">Privacy Policy</p>
              </div>
            </div>
          </div>
          
          {/* Government Badges */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <Image
                src={GOVERNMENT_LOGOS.sec}
                alt="SEC Logo"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-xs text-[#0038A8]">SEC Registered</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
              <Image
                src={GOVERNMENT_LOGOS.bsp}
                alt="BSP Logo"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-xs text-[#00A86B]">BSP Supervised</span>
            </div>
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full">
              <Image
                src={GOVERNMENT_LOGOS.npc || GOVERNMENT_LOGOS.sec}
                alt="NPC Logo"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-xs text-[#CE1126]">NPC Compliant</span>
            </div>
          </div>
        </div>
      </header>

      {/* POLICY HEADER - Redesigned with flag gradient */}
      <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white rounded-2xl mx-4 mt-4 p-6 md:p-8 max-w-6xl md:mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-6 h-6" />
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">For OFWs</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
            <div className="flex items-center gap-4">
              <span className="text-white/80">Last Updated: February 2024</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Version 3.1</span>
            </div>
          </div>
        </div>

        {/* Government Logos */}
        <div className="flex items-center gap-4 mt-4">
          <div className="w-8 h-8 relative bg-white/10 rounded-lg p-1">
            <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={24} height={24} className="object-contain" />
          </div>
          <div className="w-8 h-8 relative bg-white/10 rounded-lg p-1">
            <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={24} height={24} className="object-contain" />
          </div>
          <div className="w-8 h-8 relative bg-white/10 rounded-lg p-1">
            <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={24} height={24} className="object-contain" />
          </div>
          <div className="w-8 h-8 relative bg-white/10 rounded-lg p-1">
            <Image src={GOVERNMENT_LOGOS.npc || GOVERNMENT_LOGOS.sec} alt="NPC" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-sm text-white/80 ml-2">Data Privacy Compliant</span>
        </div>

        {/* Compliance Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-white/20">
            <Shield className="w-5 h-5 text-white" />
            <div>
              <div className="font-semibold">Data Privacy Act</div>
              <div className="text-sm text-white/80">Compliant with RA 10173</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-white/20">
            <Lock className="w-5 h-5 text-white" />
            <div>
              <div className="font-semibold">BSP Circular</div>
              <div className="text-sm text-white/80">Consumer Protection Standards</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-white/20">
            <CheckCircle className="w-5 h-5 text-white" />
            <div>
              <div className="font-semibold">SEC & NPC</div>
              <div className="text-sm text-white/80">Registered & Compliant</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100">
              <h3 className="font-semibold text-[#212529] mb-4">Policy Sections</h3>
              <nav className="space-y-2">
                {policySections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white'
                        : 'text-[#6C757D] hover:bg-[#f0f7ff] hover:text-[#0038A8]'
                    }`}
                  >
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>

              {/* Compliance Badges */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-bold mb-3 text-sm">Compliance</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                    <span className="text-xs">Data Privacy Act 2012 (RA 10173)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                    <span className="text-xs">BSP Circular • Data Privacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                    <span className="text-xs">NPC Registered • National Privacy Commission</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              {policySections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={`mb-10 ${index !== 0 ? 'pt-10 border-t border-gray-200' : ''}`}
                >
                  <h2 className="text-xl font-bold text-[#212529] mb-6 pb-2 border-b-2 border-[#0038A8]">
                    {section.title}
                  </h2>

                  {section.content.map((paragraph, pIndex) => {
                    // Check if paragraph contains Tagalog marker
                    if (paragraph.startsWith('🇵🇭')) {
                      return (
                        <div key={pIndex} className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-[#0038A8]">
                          <p className="text-[#0038A8] leading-relaxed italic">
                            {paragraph}
                          </p>
                        </div>
                      )
                    }
                    // Check if paragraph contains bullet points
                    if (paragraph.startsWith('•')) {
                      return (
                        <div key={pIndex} className="flex items-start gap-2 mb-2 ml-4">
                          <div className="w-1.5 h-1.5 bg-[#CE1126] rounded-full mt-2"></div>
                          <p className="text-[#6C757D]">{paragraph.substring(1).trim()}</p>
                        </div>
                      )
                    }
                    // Regular paragraph
                    return (
                      <p key={pIndex} className="mb-4 text-[#6C757D] leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  })}
                </section>
              ))}

              {/* OFW Data Protection Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl border border-[#0038A8]/20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0038A8]" />
                  OFW Data Protection
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Your data is protected even when applying from overseas</p>
                      <p className="text-sm text-gray-500">Your data is protected when applying from anywhere in the world</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">International data transfer safeguards in place</p>
                      <p className="text-sm text-gray-500">International data transfer safeguards in place</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">OFW-specific privacy rights under Philippine law</p>
                      <p className="text-sm text-gray-500">OFW-specific privacy rights under Philippine law</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Contact Section */}
              <section className="mt-12 pt-10 border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-6 border border-[#0038A8]/20">
                  <h3 className="text-lg font-bold text-[#212529] mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#0038A8]" />
                    Contact Our Data Protection Officer
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[#212529] mb-3">Data Protection Officer</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-[#0038A8]" />
                          <a 
                            href="mailto:dpo@kabayanloan.com"
                            className="text-[#0038A8] hover:underline"
                          >
                            dpo@kabayanloan.com
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-[#CE1126]" />
                          <a 
                            href="tel:+639171234567"
                            className="text-[#CE1126] hover:underline"
                          >
                            OFW Hotline • 24/7
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">For data privacy concerns</p>
                    </div>
                    
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-[#0038A8] mt-1" />
                          <span className="text-[#6C757D]">Response within 48 hours</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="w-4 h-4 text-[#0038A8] mt-1" />
                          <span className="text-[#6C757D]">OFW priority support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Important Notice */}
              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Your Privacy Rights:</strong> You have rights under the Data Privacy Act of 2012 including access, correction, and deletion of your personal data.
                    </p>
                    <p className="text-sm text-yellow-700 mt-2">
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="w-full mt-6 bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to About Us
            </button>
          </div>
        </div>
      </div>

      {/* Government Trust Badges */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
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
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.npc || GOVERNMENT_LOGOS.sec} alt="NPC" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#0038A8]">NPC Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-6 pb-4">
        <p className="text-xs text-gray-400">
          KabayanLoan is SEC Registered, BSP Supervised, NPC Compliant, and DMW Accredited. 
          All rights reserved.
        </p>
      </div>

      {/* BOTTOM NAVIGATION - Updated colors */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 py-4 border-t border-gray-100">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link
            href="/home"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#0038A8] hover:bg-[rgba(0,56,168,0.05)]"
          >
            <Home className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">HOME</span>
          </Link>

          <Link
            href="/wallet"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#0038A8] hover:bg-[rgba(0,56,168,0.05)]"
          >
            <Wallet className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>

          <Link
            href="/my-account"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[#0038A8] bg-[rgba(0,56,168,0.05)]"
          >
            <UserCircle className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
