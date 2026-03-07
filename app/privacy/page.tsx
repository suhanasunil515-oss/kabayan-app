'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft,
  Shield,
  Lock,
  CheckCircle,
  Eye,
  Database,
  Key,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Heart,
  Users,
  Globe
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

export default function LandingPrivacyPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('introduction')

  const policySections = [
    {
      id: 'introduction',
      title: 'Introduction',
      content: 'We protect your personal information and respect your right to privacy.'
    },
    {
      id: 'information',
      title: 'Information We Collect',
      content: 'We collect information you provide when registering, applying for loans, or using our services.'
    },
    {
      id: 'usage',
      title: 'How We Use Information',
      content: 'We use your information to provide services, verify identity, prevent fraud, and comply with laws.'
    },
    {
      id: 'security',
      title: 'Data Security',
      content: 'We implement bank-grade security measures to protect your data.'
    },
    {
      id: 'rights',
      title: 'Your Rights',
      content: 'You have rights to access, correct, and delete your personal information.'
    }
  ]

  const securityFeatures = [
    { icon: Lock, title: '256-bit SSL Encryption', desc: 'Bank-grade data protection' },
    { icon: Shield, title: 'Two-Factor Auth', desc: 'Extra account security' },
    { icon: Database, title: 'Secure Servers', desc: 'BSP-compliant infrastructure' },
    { icon: Key, title: 'Access Control', desc: 'Strict permission management' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef]">
      {/* Header */}
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
                <p className="text-sm text-[#6C757D]">Privacy Policy</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#f0f8f0] px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                <span className="font-semibold text-sm">BSP Supervised</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">For OFWs</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-white/90 mb-6">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          
         {/* Government Logos - Now with NPC */}
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
    <Image src={GOVERNMENT_LOGOS.npc} alt="NPC" width={24} height={24} className="object-contain" />
  </div>
  <span className="text-sm text-white/80 ml-2">Data Privacy Compliant</span>
</div>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-[#0038A8]" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Navigation */}
            <div className="md:w-1/3">
              <div className="sticky top-24">
                <h3 className="font-bold text-lg mb-4">Policy Sections</h3>
                <nav className="space-y-2">
                  {policySections.map((section) => (
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
                    </button>
                  ))}
                </nav>

                {/* Compliance Badges */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-bold mb-3">Compliance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                      <span className="text-sm">Data Privacy Act 2012 (RA 10173)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                      <span className="text-sm">BSP Circular • Data Privacy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                      <span className="text-sm">NPC Registered • National Privacy Commission</span>
                    </div>
                  </div>

                  {/* Government Partner Mini Logos - FIXED: Check if NPC exists */}
                 {/* Government Partner Mini Logos - Now with NPC */}
<div className="mt-6 flex items-center gap-3">
  <div className="w-8 h-8 relative opacity-70">
    <Image src={GOVERNMENT_LOGOS.npc} alt="NPC" width={32} height={32} className="object-contain" />
  </div>
  <span className="text-xs text-gray-500">NPC Compliant</span>
</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="md:w-2/3">
              {policySections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="mb-8 last:mb-0 pb-8 border-b border-gray-100 last:border-0"
                >
                  <h2 className="text-2xl font-bold text-[#212529] mb-4">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 mb-3">{section.content}</p>
                </section>
              ))}

              {/* OFW Data Protection Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0038A8]" />
                  OFW Data Protection
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Your data is protected even when applying from overseas</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">International data transfer safeguards in place</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">OFW-specific privacy rights under Philippine law</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Contact Information */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Contact Our Data Protection Officer
                </h3>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-4">Data Protection Officer</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-[#0038A8]" />
                          <span className="text-gray-700">dpo@kabayanloan.com</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-[#0038A8]" />
                          <span className="text-gray-700">OFW Hotline 24/7</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">For data privacy concerns</p>
                    </div>
                    
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-[#0038A8] mt-1" />
                          <span className="text-gray-700">Response within 48 hours</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="w-4 h-4 text-[#0038A8] mt-1" />
                          <span className="text-gray-700">OFW priority support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

              {/* NPC Registration Note */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  KabayanLoan is registered with the National Privacy Commission (NPC). 
                  KabayanLoan is registered with the National Privacy Commission.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - UPDATED with Philippine flag colors */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-white border-2 border-[#0038A8] text-[#0038A8] hover:bg-[#f0f7ff] py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          
          <Link
            href="/terms"
            className="flex-1 bg-gradient-to-r from-[#0038A8] to-[#CE1126] text-white hover:from-[#002c86] hover:to-[#b80f20] py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
          >
            <Shield className="w-5 h-5" />
            View Terms of Service
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            KabayanLoan is SEC Registered, BSP Supervised, and NPC Compliant. 
            All rights reserved.
          </p>
        </div>
      </main>
    </div>
  )
}
