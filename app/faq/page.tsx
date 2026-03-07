import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'
import { 
  HelpCircle, ChevronDown, ChevronUp,
  FileText, CreditCard, Shield, Clock,
  Globe, Banknote, Phone, Mail,
  Search, CheckCircle, AlertCircle,
  HandCoins, Headphones, MessageCircle,
  Users, Wallet, Star
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-emerald-50/20">
      {/* Navigation Header - Updated with Bagong Pilipinas logo */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-4">
                {/* Bagong Pilipinas Logo */}
                <div className="w-12 h-12 lg:w-14 lg:h-14 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.bp}
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
                    <span className="ml-2 text-[10px] lg:text-xs bg-[#FFD700] text-gray-800 px-2 py-0.5 rounded-full font-semibold">
                      OFW
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[#00A86B]" />
                      DMW Accredited
                    </span>
                  </p>
                </div>
              </Link>
            </div>
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-[#0038A8] font-medium transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-[#0038A8] font-medium transition-colors">
                About Us
              </Link>
              <Link href="/faq" className="text-[#0038A8] font-medium border-b-2 border-[#0038A8] pb-1">
                FAQ
              </Link>
            </nav>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white px-4 sm:px-6 shadow-lg hover:shadow-xl transition-all">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Hero Section - Updated with Tagalog */}
        <section className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200/50">
            <HelpCircle className="w-4 h-4 text-[#FF6B00]" />
            <span>Frequently Asked Questions</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
            What is{' '}
            <span className="bg-gradient-to-r from-[#0038A8] via-[#00A86B] to-[#CE1126] bg-clip-text text-transparent">
              your question?
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 lg:mb-12 max-w-3xl mx-auto">
            Find answers to common questions about our loans, application process, and OFW services.
          </p>

          {/* Government Partners Mini Badge - NEW */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <div className="w-8 h-8 relative">
              <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={32} height={32} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative">
              <Image src={GOVERNMENT_LOGOS.owwa} alt="OWWA" width={32} height={32} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative">
              <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={32} height={32} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative">
              <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-xs text-gray-500 ml-2">Government Accredited</span>
          </div>
        </section>

        {/* Quick Links - Updated colors */}
        <section className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            <a href="#application" className="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#0038A8] hover:shadow-md transition-all group">
              <FileText className="w-8 h-8 text-[#0038A8] mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 text-center">Application Process</span>
              <span className="text-xs text-gray-500 mt-1">How to apply</span>
            </a>
            <a href="#requirements" className="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#0038A8] hover:shadow-md transition-all group">
              <CreditCard className="w-8 h-8 text-[#00A86B] mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 text-center">Loan Requirements</span>
              <span className="text-xs text-gray-500 mt-1">Requirements</span>
            </a>
            <a href="#security" className="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#0038A8] hover:shadow-md transition-all group">
              <Shield className="w-8 h-8 text-[#CE1126] mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 text-center">Security & Safety</span>
              <span className="text-xs text-gray-500 mt-1">Kaligtasan</span>
            </a>
            <a href="#repayment" className="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#0038A8] hover:shadow-md transition-all group">
              <Clock className="w-8 h-8 text-[#FF6B00] mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 text-center">Repayment</span>
              <span className="text-xs text-gray-500 mt-1">Repayment</span>
            </a>
          </div>
        </section>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Application Process */}
          <section id="application">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-[#0038A8]" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Application Process</h2>
              <span className="text-sm text-gray-500 ml-auto">How to apply</span>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {applicationFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white rounded-2xl border border-gray-200 px-6"
                >
                  <AccordionTrigger className="py-6 hover:no-underline">
                    <span className="text-lg font-medium text-left text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-gray-600 mb-4">{faq.answer}</p>
                    {faq.additional && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">{faq.additional}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Loan Requirements */}
          <section id="requirements">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-[#00A86B]" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Loan Requirements</h2>
              <span className="text-sm text-gray-500 ml-auto">Requirements</span>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {requirementsFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`req-${index}`}
                  className="bg-white rounded-2xl border border-gray-200 px-6"
                >
                  <AccordionTrigger className="py-6 hover:no-underline">
                    <span className="text-lg font-medium text-left text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-gray-600 mb-4">{faq.answer}</p>
                    {faq.bullets && (
                      <ul className="space-y-2 mt-4">
                        {faq.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Security & Safety */}
          <section id="security">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-[#CE1126]" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Security & Safety</h2>
              <span className="text-sm text-gray-500 ml-auto">Kaligtasan</span>
            </div>
            
            {/* Government Security Badge */}
            <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={32} height={32} className="object-contain" />
              <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={32} height={32} className="object-contain" />
              <p className="text-sm text-gray-700 ml-2">
                <span className="font-bold">BSP Supervised • SEC Registered</span> - Secure and legitimate
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {securityFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`sec-${index}`}
                  className="bg-white rounded-2xl border border-gray-200 px-6"
                >
                  <AccordionTrigger className="py-6 hover:no-underline">
                    <span className="text-lg font-medium text-left text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Repayment */}
          <section id="repayment">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-[#FF6B00]" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Repayment & Payments</h2>
              <span className="text-sm text-gray-500 ml-auto">Repayment</span>
            </div>
            
            {/* Payment Partners */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-gray-700">Partner Payment Channels:</span>
              <span className="text-xs bg-white px-3 py-1 rounded-full shadow-sm">GCash</span>
              <span className="text-xs bg-white px-3 py-1 rounded-full shadow-sm">Maya</span>
              <span className="text-xs bg-white px-3 py-1 rounded-full shadow-sm">Bank Transfer</span>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {repaymentFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`repay-${index}`}
                  className="bg-white rounded-2xl border border-gray-200 px-6"
                >
                  <AccordionTrigger className="py-6 hover:no-underline">
                    <span className="text-lg font-medium text-left text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        {/* Still Need Help - Updated with Tagalog and government logos */}
        <section className="mt-16 md:mt-20">
          <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24"></div>
            </div>
            
            <div className="relative z-10">
              <Headphones className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">May tanong ka pa?</h2>
              <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Ang aming OFW support team ay laging handang tumulong 24/7 sa iyong mga katanungan.
              </p>
              
              {/* Government Trust Badges */}
              <div className="flex justify-center items-center gap-4 mb-8">
                <div className="bg-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                  <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={20} height={20} className="object-contain" />
                  <span className="text-sm">DMW Accredited</span>
                </div>
                <div className="bg-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                  <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={20} height={20} className="object-contain" />
                  <span className="text-sm">BSP Supervised</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-[#0038A8] hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl shadow-xl">
                  <Phone className="w-5 h-5 mr-2" />
                  Tumawag sa Support
                </Button>
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-2xl bg-transparent">
                  <Mail className="w-5 h-5 mr-2" />
                  Email
                </Button>
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-2xl bg-transparent">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Live Chat
                </Button>
              </div>
              
              <p className="text-sm opacity-80 mt-6">
                Free calls for OFWs
              </p>
            </div>
          </div>
        </section>

        {/* Quick Support Links */}
        <section className="mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Iba pang paraan para humingi ng tulong</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-[#0038A8]" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Live Chat</h4>
                <p className="text-sm text-gray-500">24/7 online</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-[#00A86B]" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Email Support</h4>
                <p className="text-sm text-gray-500">support@kabayanloan.com</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-[#CE1126]" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">OFW Community</h4>
                <p className="text-sm text-gray-500">Facebook group</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Updated with Bagong Pilipinas logo */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 relative">
                  <Image src={GOVERNMENT_LOGOS.bp} alt="Bagong Pilipinas" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-lg font-black tracking-tight">
                  <span className="text-[#0038A8]">KABAYAN</span>
                  <span className="text-[#CE1126]">LOAN</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">
                For OFWs and families. Fast, secure, and accessible loans.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-sm text-gray-600 hover:text-[#0038A8]">Home</Link></li>
                <li><Link href="/about" className="text-sm text-gray-600 hover:text-[#0038A8]">About Us</Link></li>
                <li><Link href="/faq" className="text-sm text-gray-600 hover:text-[#0038A8]">FAQ</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-sm text-gray-600 hover:text-[#0038A8]">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-[#0038A8]">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Accreditation */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Accreditation</h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-blue-50 text-[#0038A8] px-2 py-1 rounded-full">DMW</span>
                <span className="text-xs bg-green-50 text-[#00A86B] px-2 py-1 rounded-full">BSP</span>
                <span className="text-xs bg-orange-50 text-[#CE1126] px-2 py-1 rounded-full">SEC</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-500">
              © 2024 KabayanLoan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const applicationFAQs = [
  {
    question: "How long does the application process take?",
    answer: "Our online application takes only 5-10 minutes to complete. After submission, most applications are reviewed and approved within 24 hours during business days.",
    additional: "Weekend applications are processed on the next business day."
  },
  {
    question: "Can I apply from overseas?",
    answer: "Yes! We are specifically designed for OFWs. You can apply from anywhere in the world as long as you have internet access.",
    additional: "We serve OFWs in over 50 countries including UAE, Saudi Arabia, Singapore, Hong Kong, Qatar, and more."
  },
  {
    question: "Do I need to be in the Philippines to apply?",
    answer: "No, you can apply while working abroad. All processes are done online, and funds can be disbursed to your Philippine bank account or e-wallet.",
  }
]

const requirementsFAQs = [
  {
    question: "What documents do I need to apply?",
    answer: "We keep requirements minimal for OFWs:",
    bullets: [
      "Valid Philippine passport",
      "Proof of employment abroad (employment contract, visa)",
      "Proof of income (latest pay slips or bank statements)",
      "One valid government ID"
    ]
  },
  {
    question: "Is collateral required?",
    answer: "No, we offer unsecured loans specifically designed for OFWs. No collateral or property is required for loan approval.",
  },
  {
    question: "What is the minimum income requirement?",
    answer: "Minimum monthly income requirement varies by country but typically starts at ₱100,000 equivalent in local currency.",
  }
]

const securityFAQs = [
  {
    question: "Is my personal information secure?",
    answer: "Yes, we use bank-level 256-bit SSL encryption and comply with the Philippine Data Privacy Act. Your information is never shared without consent.",
  },
  {
    question: "How do you protect against fraud?",
    answer: "We use advanced fraud detection systems, multi-factor authentication, and regular security audits.",
  },
  {
    question: "Is KabayanLoan regulated?",
    answer: "Yes, we are SEC Registered and BSP Supervised. We comply with all government regulations.",
  }
]

const repaymentFAQs = [
  {
    question: "What are my repayment options?",
    answer: "We offer flexible repayment options including auto-debit from your Philippine bank account, GCash payments, Maya payments, or international bank transfers.",
  },
  {
    question: "Can I pay early without penalty?",
    answer: "Yes, you can pay off your loan early without any prepayment penalties. This can actually save you money on interest.",
  },
  {
    question: "What happens if I miss a payment?",
    answer: "Contact our support team immediately. We offer grace periods and restructuring options for OFWs facing genuine financial challenges.",
  }
]
