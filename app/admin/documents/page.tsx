'use client'

import { FileText, Download, ArrowRight, Lock, Share2, Printer, Shield, Award, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

export default function DocumentManagementPage() {
  const documents = [
    {
      title: 'Loan Approval Letter',
      description: 'Generate and download professional loan approval letters with company branding and government logos',
      icon: FileText,
      href: '/admin/documents/loan-approval-letter',
      gradient: 'from-[#0038A8] to-[#CE1126]',
      color: 'blue-red',
      formats: ['PDF', 'PNG', 'Excel'],
      features: ['SEC/BSP/DMW logos', 'Borrower details', 'Loan terms', 'Professional format', 'OFW Loan Department stamp']
    },
    {
      title: 'Loan List Table',
      description: 'Export complete loan records table with applicant information and status tracking',
      icon: FileText,
      href: '/admin/documents/loan-list-table',
      gradient: 'from-[#00A86B] to-[#0038A8]',
      color: 'green-blue',
      formats: ['PDF', 'PNG', 'Excel'],
      features: ['All loan records', 'Status badges', 'Filter information', 'Pagination data', 'Color-coded status']
    },
    {
      title: 'Repayment Schedule',
      description: 'Generate detailed monthly repayment schedules with amortization and balance tracking',
      icon: FileText,
      href: '/admin/documents/repayment-schedule',
      gradient: 'from-[#CE1126] to-[#FF6B00]',
      color: 'red-orange',
      formats: ['PDF', 'PNG', 'Excel'],
      features: ['Monthly breakdown', 'Principal & interest', 'Balance tracking', 'Payment due dates', 'Late fee calculations']
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] bg-clip-text text-transparent">
                Document Management
              </span>
            </h1>
            <p className="text-sm text-[#6C757D] flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Generate, manage, and export professional financial documents
            </p>
          </div>
          
          {/* Government Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-red-50 px-3 py-1.5 rounded-full border border-[#0038A8]/20">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#212529]">SEC • BSP • DMW</span>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-10">
        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {documents.map((doc) => {
            const Icon = doc.icon
            return (
              <div key={doc.title} className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all overflow-hidden group">
                {/* Color Header - Using flag gradients */}
                <div className={`h-2 bg-gradient-to-r ${doc.gradient}`}></div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${doc.gradient} flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[#212529]">{doc.title}</h2>
                  </div>

                  <p className="text-[#6C757D] text-sm mb-4">{doc.description}</p>

                  {/* Formats */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[#212529] mb-2 flex items-center gap-1">
                      <Award className="w-3 h-3 text-[#0038A8]" />
                      Export Formats:
                    </p>
                    <div className="flex gap-2">
                      {doc.formats.map((fmt) => (
                        <span key={fmt} className="px-2.5 py-1 bg-gray-100 text-[#212529] text-xs font-medium rounded border border-gray-200">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-[#212529] mb-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[#00A86B]" />
                      Features:
                    </p>
                    <ul className="space-y-1">
                      {doc.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-xs text-[#6C757D]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0038A8]"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Link href={doc.href} className="block">
                    <Button className={`w-full bg-gradient-to-r ${doc.gradient} text-white font-semibold py-2.5 rounded-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2`}>
                      <Download className="w-4 h-4" />
                      Generate & Export
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Government Logos Strip */}
        <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 mb-8 border border-[#0038A8]/20">
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

        {/* Quick Actions Section - Redesigned with flag colors */}
        <div className="bg-gradient-to-br from-blue-50 to-red-50 rounded-2xl border border-[#0038A8]/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#0038A8]" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#0038A8] hover:bg-blue-50 transition-all text-left group">
              <div className="flex items-center gap-3 mb-2">
                <Share2 className="w-5 h-5 text-[#0038A8] group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[#212529]">Share Document</span>
              </div>
              <p className="text-sm text-[#6C757D]">Send documents directly to clients via email</p>
            </button>

            <button className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#00A86B] hover:bg-green-50 transition-all text-left group">
              <div className="flex items-center gap-3 mb-2">
                <Printer className="w-5 h-5 text-[#00A86B] group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[#212529]">Print Document</span>
              </div>
              <p className="text-sm text-[#6C757D]">Print documents directly from the browser</p>
            </button>

            <button className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#CE1126] hover:bg-red-50 transition-all text-left group">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-[#CE1126] group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[#212529]">Secure Archive</span>
              </div>
              <p className="text-sm text-[#6C757D]">Archive and manage document history securely</p>
            </button>
          </div>
        </div>

        {/* Info Section - Redesigned */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8">
          <h2 className="text-2xl font-bold text-[#212529] mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Document Generation Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[#212529] mb-3 flex items-center gap-1">
                <Award className="w-4 h-4 text-[#0038A8]" />
                Best Practices
              </h3>
              <ul className="space-y-2 text-sm text-[#6C757D]">
                <li className="flex gap-2">
                  <span className="text-[#00A86B] font-bold">✓</span>
                  <span>Always verify borrower information before generating documents</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00A86B] font-bold">✓</span>
                  <span>Use PDF format for archival and legal documentation</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00A86B] font-bold">✓</span>
                  <span>Maintain digital copies of all generated documents</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00A86B] font-bold">✓</span>
                  <span>Review documents for accuracy before sharing with clients</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#212529] mb-3 flex items-center gap-1">
                <Download className="w-4 h-4 text-[#CE1126]" />
                Export Format Recommendations
              </h3>
              <ul className="space-y-2 text-sm text-[#6C757D]">
                <li><span className="font-medium text-[#0038A8]">PDF:</span> Best for legal documents and archival</li>
                <li><span className="font-medium text-[#00A86B]">PNG:</span> Best for quick previews and sharing on messaging apps</li>
                <li><span className="font-medium text-[#CE1126]">Excel:</span> Best for data analysis and bulk processing</li>
                <li><span className="font-medium text-[#FF6B00]">Multiple:</span> Generate in all formats for flexibility</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
