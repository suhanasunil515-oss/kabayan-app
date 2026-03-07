'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Headphones, 
  Home, 
  Wallet, 
  UserCircle, 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Move, 
  X,
  Shield,
  Clock,
  CheckCircle,
  HelpCircle,
  Facebook,
  Twitter,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

export default function SupportPage() {
  const [chatLoaded, setChatLoaded] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [customButtonPosition, setCustomButtonPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 100 : 300, 
    y: 100 
  })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })

  // Initialize Tawk.to chat widget
  useEffect(() => {
    if (chatLoaded || isInitializing) return

    setIsInitializing(true)

    // Load Tawk.to script but hide the default button
    const scriptId = 'tawk-to-support-script'
    const existingScript = document.getElementById(scriptId)
    
    if (!existingScript) {
      // Custom Tawk.to configuration to hide default button
      const tawkToScript = `
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        
        // Hide the default widget button
        Tawk_API = Tawk_API || {};
        Tawk_API.customStyle = {
          visibility : {
            desktop : {
              position : 'br',
              xOffset : 20,
              yOffset : 20,
              visible : false // Hide the default button
            },
            mobile : {
              position : 'br',
              xOffset : 10,
              yOffset : 10,
              visible : false // Hide the default button
            }
          }
        };
        
        (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/6988bf432fb5be1c3a2b1c69/1jgv2m84j';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
        })();
      `
      
      const script = document.createElement('script')
      script.id = scriptId
      script.innerHTML = tawkToScript
      document.head.appendChild(script)

      // Listen for Tawk.to to load
      const checkTawkLoaded = setInterval(() => {
        if (window.Tawk_API) {
          // Hide the widget completely
          if (window.Tawk_API.hideWidget) {
            window.Tawk_API.hideWidget()
          }
          
          setChatLoaded(true)
          setIsInitializing(false)
          clearInterval(checkTawkLoaded)
        }
      }, 100)

      setTimeout(() => {
        if (!chatLoaded) {
          clearInterval(checkTawkLoaded)
          setIsInitializing(false)
        }
      }, 10000)

      return () => {
        clearInterval(checkTawkLoaded)
      }
    } else {
      setIsInitializing(false)
    }
  }, [chatLoaded, isInitializing])

  const openChat = () => {
    if (window.Tawk_API) {
      // First show the widget
      if (window.Tawk_API.showWidget) {
        window.Tawk_API.showWidget()
      }
      
      // Then maximize it
      if (typeof window.Tawk_API.maximize === 'function') {
        window.Tawk_API.maximize()
      } else if (typeof window.Tawk_API.showWidget === 'function') {
        window.Tawk_API.showWidget()
      }
    } else {
      setChatLoaded(false)
      setIsInitializing(false)
      alert('Chat widget is loading. Please try again in a moment.')
    }
  }

  // Handle drag for custom button
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartPos.current = {
      x: e.clientX - customButtonPosition.x,
      y: e.clientY - customButtonPosition.y
    }
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 80, moveEvent.clientX - dragStartPos.current.x))
        const newY = Math.max(0, Math.min(window.innerHeight - 80, moveEvent.clientY - dragStartPos.current.y))
        
        setCustomButtonPosition({
          x: newX,
          y: newY
        })
      }
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleStartChat = () => {
    if (isInitializing) {
      alert('Chat widget is initializing. Please wait...')
      return
    }
    
    if (!chatLoaded) {
      alert('Chat widget is still loading. Please wait a moment.')
      return
    }
    
    openChat()
  }

  const faqItems = [
    {
      question: "How do I apply for a loan?",
      answer: "Navigate to the Home page and click on 'Apply for a Loan'. Follow the step-by-step process to submit your application.",
    },
    {
      question: "How can I check my credit score?",
      answer: "Your credit score is displayed on your Account page. It updates automatically based on your repayment behavior.",
    },
    {
      question: "What are the requirements for OFW loan?",
      answer: "Valid passport, employment contract, proof of income, and valid government ID. You can apply from anywhere in the world.",
    },
    {
      question: "How long does loan approval take?",
      answer: "Most applications are approved within 24 hours. OFW applications may take up to 48 hours for verification.",
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-24">
      {/* Header - Redesigned with KabayanLoan branding */}
      <header className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/my-account" className="mr-2">
              <ArrowLeft className="w-6 h-6 text-[#0038A8] hover:text-[#002c86]" />
            </Link>
            
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
                <p className="text-xs text-gray-500">Customer Support • 24/7</p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-[#0038A8]" />
            <span className="text-xs font-medium text-[#0038A8]">SEC Registered</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Hero Section - Redesigned with flag gradient */}
        <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-3xl p-8 text-white shadow-2xl mb-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-8"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Headphones className="w-6 h-6" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">24/7 Available</span>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <MessageCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Live Chat Support</h2>
              <p className="text-lg opacity-90 mb-2">Chat with our support agents in real-time</p>
              <p className="text-sm opacity-80">Makipag-chat sa aming support agents real-time</p>
            </div>

            <div className="text-center">
              <Button
                onClick={handleStartChat}
                disabled={!chatLoaded || isInitializing}
                className={`bg-white text-[#0038A8] hover:bg-white/90 hover:text-[#002c86] text-lg font-semibold py-6 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  (!chatLoaded || isInitializing) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isInitializing ? 'Loading...' : 'Start Live Chat'}
              </Button>
              
              <div className="mt-6 p-4 bg-white/10 rounded-xl">
                <p className="text-sm opacity-90 mb-2">💡 <strong>Custom Chat Button:</strong></p>
                <p className="text-xs opacity-80">
                  Drag the floating chat button anywhere on screen<br />
                  I-drag ang floating chat button kahit saan sa screen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Government Logos Strip */}
        <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl p-4 mb-6 border border-[#0038A8]/20">
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

        {/* Contact Cards - Redesigned with flag colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-[#0038A8]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#0038A8] rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#212529]">Phone Support</h3>
                <p className="text-xs text-[#6C757D]">24/7 Hotline</p>
              </div>
            </div>
            <p className="text-lg font-bold text-[#0038A8] mb-2">+63 917 123 4567</p>
            <p className="text-sm text-[#6C757D]">Tumawag kahit anong oras</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-6 border border-[#CE1126]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#CE1126] rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#212529]">Email Support</h3>
                <p className="text-xs text-[#6C757D]">24hr Response Time</p>
              </div>
            </div>
            <p className="text-lg font-bold text-[#CE1126] mb-2">support@kabayanloan.com</p>
            <p className="text-sm text-[#6C757D]">Response within 24 hours</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-lg flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-[#212529] mb-2">{item.question}</h3>
                <p className="text-sm text-[#6C757D] mb-2">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl p-6 border border-[#0038A8]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[#212529]">Support Hours</h3>
              <p className="text-sm text-[#6C757D]">24/7</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="font-semibold text-[#0038A8]">Live Chat</p>
              <p className="text-sm text-[#6C757D]">24/7 Available</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="font-semibold text-[#CE1126]">Phone Support</p>
              <p className="text-sm text-[#6C757D]">8:00 AM - 8:00 PM PHT</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <Link href="/my-account" className="block mt-6">
          <Button className="w-full bg-gradient-to-r from-[#0038A8] to-[#CE1126] hover:from-[#002c86] hover:to-[#b80f20] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Account
          </Button>
        </Link>
      </main>

      {/* Custom Movable Chat Button */}
      {chatLoaded && (
        <div
          style={{
            position: 'fixed',
            left: `${customButtonPosition.x}px`,
            top: `${customButtonPosition.y}px`,
            zIndex: 10000,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          className="select-none"
        >
          <div className="relative group">
            {/* Draggable Handle */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-full flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Move className="w-3 h-3 text-white" />
            </div>
            
            {/* Main Chat Button */}
            <button
              onClick={openChat}
              className="w-16 h-16 bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
              title="Click to chat, drag to move"
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </button>
            
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Drag to move, click to chat
            </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="text-center mt-6 pb-4">
        <p className="text-xs text-gray-400">
          KabayanLoan is SEC Registered, BSP Supervised, and DMW Accredited. 
          All rights reserved.
        </p>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] py-4 z-40 border-t border-gray-100">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/home" className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#0038A8] hover:bg-[rgba(0,56,168,0.05)] no-underline">
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">HOME</span>
          </Link>
          
          <Link href="/wallet" className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#0038A8] hover:bg-[rgba(0,56,168,0.05)] no-underline">
            <Wallet className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>
          
          <Link href="/my-account" className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[#0038A8] bg-[rgba(0,56,168,0.05)] no-underline">
            <UserCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
