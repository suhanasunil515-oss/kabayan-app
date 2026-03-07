'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  Shield, 
  AlertTriangle,
  Scale,
  Gavel,
  UserCheck,
  Clock,
  DollarSign,
  CreditCard,
  Home,
  Wallet,
  UserCircle,
  Globe,
  Heart,
  Users,
  Printer,
  Download
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

export default function TermsOfServicePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string>('agreement-terms')

  // Bilingual terms sections
  const termsSections = [
    {
      id: 'agreement-terms',
      title: '1. Agreement to Terms',
      content: [
        'These Terms of Service constitute a legally binding agreement between you and KabayanLoan.',
        'By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms.'
      ]
    },
    {
      id: 'eligibility',
      title: '2. Eligibility Requirements',
      content: [
        'To use KabayanLoan services, you must:',
        '• Be at least 18 years old',
        '• Be a resident of the Philippines or a Filipino citizen working abroad (OFW)',
        '• Have a valid government-issued ID',
        '• Have an active mobile number and email address',
        '• Have a source of income',
        '• Agree to credit checks and background verification'
      ]
    },
    {
      id: 'loan-services',
      title: '3. Loan Services',
      content: [
        'When you apply for a loan through KabayanLoan:',
        '• You authorize us to conduct credit checks',
        '• You provide accurate and complete information',
        '• Approval is subject to our credit policies',
        '• We may reject your application without explanation'
      ]
    },
    {
      id: 'repayment-terms',
      title: '4. Repayment Terms',
      content: [
        'You agree to:',
        '• Make payments on or before the due date',
        '• Pay all applicable fees and charges',
        '• Maintain sufficient funds in your payment account',
        '• Notify us immediately of any payment difficulties'
      ]
    },
    {
      id: 'user-responsibilities',
      title: '5. User Responsibilities',
      content: [
        'You agree to:',
        '• Use the Services only for lawful purposes',
        '• Provide accurate and truthful information',
        '• Maintain the security of your account',
        '• Comply with all applicable laws and regulations'
      ]
    },
    {
      id: 'ofw-provisions',
      title: '6. OFW Special Provisions',
      content: [
        'For Overseas Filipino Workers (OFWs):',
        '• You can apply from anywhere in the world',
        '• No need to be physically present in the Philippines',
        '• International payment options available',
        '• Special consideration for foreign income documentation'
      ]
    }
  ]

const loanTerms = [
  { months: 6,  rate: 0.005, processingFee: 'No processing fee', lateFee: '5% of overdue amount' },
  { months: 12, rate: 0.005, processingFee: 'No processing fee', lateFee: '5% of overdue amount' },
  { months: 24, rate: 0.005, processingFee: 'No processing fee', lateFee: '5% of overdue amount' },
  { months: 36, rate: 0.005, processingFee: 'No processing fee', lateFee: '5% of overdue amount' }
];

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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-24">
      {/* HEADER - Redesigned with KabayanLoan branding */}
      <header className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4 print:hidden">
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
                <p className="text-xs text-gray-500">Terms of Service</p>
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
                src={GOVERNMENT_LOGOS.dmw}
                alt="DMW Logo"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-xs text-[#CE1126]">DMW Accredited</span>
            </div>
          </div>
        </div>
      </header>

      {/* TERMS HEADER - Redesigned with flag gradient */}
      <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white rounded-2xl mx-4 mt-4 p-6 md:p-8 max-w-6xl md:mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-6 h-6" />
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">For OFWs</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-white/80">Last Updated: February 2024</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Version 4.2</span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Effective: February 7, 2024
              </span>
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
            <Image src={GOVERNMENT_LOGOS.owwa} alt="OWWA" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-sm text-white/80 ml-2">Government Regulated</span>
        </div>

        {/* Legal Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-white/20">
            <Scale className="w-5 h-5 text-white" />
            <div>
              <div className="font-semibold">Legal Agreement</div>
              <div className="text-sm text-white/80">Binding Contract</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-white/20">
            <Gavel className="w-5 h-5 text-white" />
            <div>
              <div className="font-semibold">Philippine Law</div>
              <div className="text-sm text-white/80">Governing Jurisdiction</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-white/20">
            <UserCheck className="w-5 h-5 text-white" />
            <div>
              <div className="font-semibold">Electronic Acceptance</div>
              <div className="text-sm text-white/80">Same as Signature</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* LOAN TERMS TABLE - Redesigned with flag colors */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            Loan Terms & Fees
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white">
                  <th className="p-4 text-left rounded-tl-xl">Loan Term</th>
                  <th className="p-4 text-left">Monthly Rate</th>
                  <th className="p-4 text-left">APR</th>
                  <th className="p-4 text-left">Processing Fee</th>
                  <th className="p-4 text-left rounded-tr-xl">Late Payment Fee</th>
                </tr>
              </thead>
              <tbody>
                {loanTerms.map((term, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 border-b border-gray-200">
                      <div className="font-semibold">{term.months} months</div>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="font-semibold text-[#00A86B]">{(term.rate * 100).toFixed(1)}%</div>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="font-semibold text-[#0038A8]">{(term.rate * 12 * 100).toFixed(1)}%</div>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="font-semibold text-[#CE1126]">{term.processingFee}</div>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="font-semibold text-[#FF6B00]">{term.lateFee}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100">
              <h3 className="font-semibold text-[#212529] mb-4">Terms Sections</h3>
              <nav className="space-y-2">
                {termsSections.map((section) => (
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

              {/* Government Accreditation */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-bold mb-3 text-sm">Government Accreditation</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                    <span className="text-xs text-gray-600">SEC Registered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                    <span className="text-xs text-gray-600">BSP Supervised</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                    <span className="text-xs text-gray-600">DMW Accredited OFW Lender</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              {termsSections.map((section, index) => (
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

              {/* OFW Special Provisions */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl border border-[#0038A8]/20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0038A8]" />
                  OFW Rights & Protections
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Right to transparent loan terms</p>
                      <p className="text-sm text-gray-500">Right to transparent loan terms</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Right to data privacy</p>
                      <p className="text-sm text-gray-500">Right to data privacy</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Right to fair collection practices</p>
                      <p className="text-sm text-gray-500">Right to fair collection practices</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">DMW assistance for OFW concerns</p>
                      <p className="text-sm text-gray-500">Tulong ng DMW para sa mga OFW</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Contact Section */}
              <section className="mt-12 pt-10 border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-6 border border-[#0038A8]/20">
                  <h3 className="text-lg font-bold text-[#212529] mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#0038A8]" />
                    Legal Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[#212529] mb-3">KabayanLoan Legal Department</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-[#0038A8]" />
                          <a 
                            href="mailto:legal@kabayanloan.com"
                            className="text-[#0038A8] hover:underline"
                          >
                            legal@kabayanloan.com
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-[#CE1126]" />
                          <a 
                            href="tel:+639171234567"
                            className="text-[#CE1126] hover:underline"
                          >
                            OFW Legal Hotline
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-[#0038A8] mt-1" />
                          <span className="text-[#6C757D]">15th Floor, One Corporate Centre, Julia Vargas Ave, Ortigas Center, Pasig City, Metro Manila</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-[#00A86B]" />
                          <span className="text-[#6C757D]">Monday to Friday, 9:00 AM to 6:00 PM PHT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Important Notice */}
              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Important / Mahalaga:</strong> These terms are legally binding. By continuing to use our services, you accept these terms.
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
                <Image src={GOVERNMENT_LOGOS.owwa} alt="OWWA" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#FF6B00]">OWWA Partner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-6 pb-4">
        <p className="text-xs text-gray-400">
          KabayanLoan is SEC Registered, BSP Supervised, DMW Accredited, and OWWA Partner. 
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
