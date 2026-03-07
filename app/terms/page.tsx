'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft,
  CheckCircle,
  Shield,
  FileText,
  Scale,
  Gavel,
  UserCheck,
  DollarSign,
  AlertTriangle,
  Globe,
  Heart,
  Users,
  Clock,
  HandCoins
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

export default function LandingTermsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('agreement')

  const termsSections = [
    {
      id: 'agreement',
      title: 'Agreement to Terms',
      content: 'By accessing our website or services, you agree to be bound by these Terms of Service.'
    },
    {
      id: 'eligibility',
      title: 'Eligibility',
      content: 'You must be at least 18 years old and a Filipino citizen to use our services.'
    },
    {
      id: 'services',
      title: 'Our Services',
      content: 'We provide online lending services to qualified Filipino citizens and OFWs worldwide.'
    },
    {
      id: 'responsibilities',
      title: 'User Responsibilities',
      content: 'You are responsible for providing accurate information and maintaining account security.'
    },
    {
      id: 'prohibited',
      title: 'Prohibited Activities',
      content: 'You may not use our services for illegal activities or provide false information.'
    }
  ]

  const loanTerms = [
    { term: '6 months', rate: '0.5% monthly', apr: '6% APR' },
    { term: '12 months', rate: '0.5% monthly', apr: '6% APR' },
    { term: '24 months', rate: '0.5% monthly', apr: '6% APR' },
    { term: '36 months', rate: '0.5% monthly', apr: '6% APR' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef]">
      {/* Header - Updated with Bagong Pilipinas logo */}
      <header className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#0038A8] hover:text-[#002c86]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              {/* Bagong Pilipinas Logo */}
              <div className="w-10 h-10 relative">
                <Image
                  src={GOVERNMENT_LOGOS.bp}
                  alt="Bagong Pilipinas"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#212529] flex items-baseline gap-1">
                  <span className="text-[#0038A8]">KABAYAN</span>
                  <span className="text-[#CE1126]">LOAN</span>
                </h1>
                <p className="text-sm text-[#6C757D]">Terms of Service</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#f0f7ff] px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                <span className="font-semibold text-sm">SEC Registered</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section - Updated with OFW focus */}
        <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">For OFWs</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-white/90 mb-6">
            Welcome to KabayanLoan. These terms govern your use of our website and services. 
            Mangyaring basahin nang mabuti ang mga tuntuning ito.
          </p>
          
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
            <span className="text-sm text-white/80 ml-2">Government Regulated</span>
          </div>
        </div>

        {/* Quick Summary - Updated with Tagalog */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-[#0038A8]" />
              <h3 className="font-bold text-lg">Legal Agreement</h3>
            </div>
            <p className="text-gray-600 text-sm">Binding contract between you and KabayanLoan</p>
            <p className="text-xs text-[#CE1126] mt-2">Legal na kasunduan</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Gavel className="w-6 h-6 text-[#00A86B]" />
              <h3 className="font-bold text-lg">Philippine Law</h3>
            </div>
            <p className="text-gray-600 text-sm">Governed by laws of the Philippines</p>
            <p className="text-xs text-[#CE1126] mt-2">Batay sa batas ng Pilipinas</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-[#FF6B00]" />
              <h3 className="font-bold text-lg">Electronic Acceptance</h3>
            </div>
            <p className="text-gray-600 text-sm">Use of services equals acceptance</p>
            <p className="text-xs text-[#CE1126] mt-2">Paggamit ay pagsang-ayon</p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Navigation */}
            <div className="md:w-1/3">
              <div className="sticky top-24">
                <h3 className="font-bold text-lg mb-4">Sections</h3>
                <nav className="space-y-2">
                  {termsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
                        setActiveSection(section.id)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">{section.title}</div>
                      <div className={`text-xs ${activeSection === section.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {section.english}
                      </div>
                    </button>
                  ))}
                </nav>
                
                {/* Government Accreditation */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-sm mb-3">Government Accreditation</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                      <span className="text-xs text-gray-600">SEC Registration No. CS201916052</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                      <span className="text-xs text-gray-600">BSP Supervised • Financing Company</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                      <span className="text-xs text-gray-600">DMW Accredited OFW Lender</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="md:w-2/3">
              {termsSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="mb-8 last:mb-0 pb-8 border-b border-gray-100 last:border-0"
                >
                  <h2 className="text-2xl font-bold text-[#212529] mb-2">
                    {section.title}
                  </h2>
                  <p className="text-sm text-[#CE1126] mb-4">{section.english}</p>
                  <p className="text-gray-600 mb-3">{section.content}</p>
                  <p className="text-gray-500 italic bg-blue-50 p-4 rounded-lg">
                  </p>
                </section>
              ))}
              
              {/* OFW Special Provisions */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0038A8]" />
                  Special Provisions for OFWs
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">OFWs can apply from anywhere in the world</p>
                      <p className="text-sm text-gray-500">You can apply from anywhere in the world</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">No need to be physically present in Philippines</p>
                      <p className="text-sm text-gray-500">No need to be in the Philippines</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">International payment options available</p>
                      <p className="text-sm text-gray-500">Pwedeng magbayad internationally</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Loan Terms Table */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#0038A8]" />
                  Sample Loan Terms
                </h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white">
                        <th className="p-4 text-left">Loan Term</th>
                        <th className="p-4 text-left">Monthly Rate</th>
                        <th className="p-4 text-left">Annual Rate (APR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanTerms.map((term, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-4 font-semibold">{term.term}</td>
                          <td className="p-4 text-[#00A86B] font-semibold">{term.rate}</td>
                          <td className="p-4">{term.apr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  *Rates are subject to change based on credit assessment
                </p>
              </div>

              {/* Important Notice */}
              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
<strong>Important:</strong> These terms are a summary. Full terms are available after account registration.
                    By continuing to use our services, you accept these terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* OFW Rights */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0038A8]" />
                  Your Rights as an OFW
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <span>Right to transparent loan terms</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <span>Right to data privacy</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <span>Right to fair collection practices</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-white border-2 border-[#0038A8] text-[#0038A8] hover:bg-[#f0f7ff] py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          
          <Link
            href="/privacy"
            className="flex-1 bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20] py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
          >
            <Shield className="w-5 h-5" />
            View Privacy Policy
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            KabayanLoan is SEC Registered, BSP Supervised, and DMW Accredited. 
            All rights reserved.
          </p>
        </div>
      </main>
    </div>
  )
}
