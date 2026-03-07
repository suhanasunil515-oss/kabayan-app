'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  CheckCircle, 
  Phone, 
  Home,
  FileText,
  Shield,
  Mail,
  Copy
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPHP } from '@/lib/currency'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface ApplicationDetails {
  id: string
  document_number: string
  amount_requested: number
  loan_term_months: number
  submitted_at: string
  user_email: string
  user_phone: string
  purpose: string
}

export default function ApplicationCompletePage() {
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch('/api/loans?action=get_user_application')
        if (response.ok) {
          const data = await response.json()
          if (data.application) {
            setApplication(data.application)
          } else {
            router.push('/loan-application')
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching application:', error)
        toast.error('Failed to load application details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplication()
  }, [router])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Document number copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#0038A8] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#6C757D]">Loading your application...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#212529] mb-2">Application Not Found</h2>
            <p className="text-[#6C757D] mb-6">
              We couldn't find your loan application. Please start a new application.
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-semibold py-3 rounded-xl"
              onClick={() => router.push('/loan-application')}
            >
              Apply for a Loan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef]">
      {/* Simple Header - Only Logo on Left */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 relative">
              <Image src={GOVERNMENT_LOGOS.bp} alt="KabayanLoan" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-lg font-black tracking-tight">
              <span className="text-[#0038A8]">KABAYAN</span>
              <span className="text-[#CE1126]">LOAN</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content - Clean and Simple */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Icon - Updated to Blue-to-Red Gradient */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#212529] mb-2">Application Submitted!</h1>
          <p className="text-[#6C757D] max-w-md mx-auto">
            Your loan application has been successfully submitted and is now being processed.
          </p>
        </div>

        {/* Document Number Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Document Number</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-xl font-mono font-bold text-[#0038A8]">{application.document_number}</p>
            <button
              onClick={() => copyToClipboard(application.document_number)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              <Copy className={`w-4 h-4 ${copied ? 'text-[#00A86B]' : 'text-gray-400'}`} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Keep this number for reference</p>
        </div>

        {/* Next Steps - Clean List */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-[#212529] mb-4">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#0038A8]">1</span>
              </div>
              <div>
                <p className="font-medium text-[#212529]">Document Verification</p>
                <p className="text-sm text-gray-500">We'll review your submitted documents within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#0038A8]">2</span>
              </div>
              <div>
                <p className="font-medium text-[#212529]">Credit Assessment</p>
                <p className="text-sm text-gray-500">Our team will evaluate your application</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#0038A8]">3</span>
              </div>
              <div>
                <p className="font-medium text-[#212529]">Final Decision</p>
                <p className="text-sm text-gray-500">
                  You'll receive a message confirmation of your loan status from our partner finance company.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Side by Side */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/home" className="w-full sm:w-auto sm:flex-1 max-w-xs">
            <Button 
              className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </Link>
          <Link href="/my-account/support" className="w-full sm:w-auto sm:flex-1 max-w-xs">
            <Button 
              variant="outline" 
              className="w-full border-2 border-[#0038A8] text-[#0038A8] hover:bg-[#f0f7ff] font-semibold py-3 rounded-xl bg-transparent"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </Link>
        </div>

        {/* Simple Footer Note */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              SEC Registered
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              support@kabayanloan.com
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            © 2024 KabayanLoan. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  )
}
