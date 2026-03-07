import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'
import { 
  Users, Globe, Shield, Award, Target, 
  Heart, TrendingUp, ChevronRight, CheckCircle,
  MapPin, Phone, Mail, Clock, Building, Users2,
  Briefcase, Star, Sparkles, HandHeart, Leaf
} from 'lucide-react'

export default function AboutPage() {
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
              <Link href="/about" className="text-[#0038A8] font-medium border-b-2 border-[#0038A8] pb-1">
                About Us
              </Link>
              <Link href="/faq" className="text-gray-700 hover:text-[#0038A8] font-medium transition-colors">
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
        <section className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200/50">
            <Heart className="w-4 h-4 text-[#FF6B00]" />
            <span>🇵🇭 Serving OFWs since 2015</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
            For{' '}
            <span className="bg-gradient-to-r from-[#0038A8] via-[#002c86] to-[#CE1126] bg-clip-text text-transparent">
              Modernong Bayani
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 lg:mb-12 max-w-4xl mx-auto">
            Kami ay misyon na magbigay ng mabilis, accessible, at ligtas na financial solutions 
            para sa mga OFW, upang matulungan silang makamit ang kanilang mga pangarap para sa pamilya.
          </p>
        </section>

        {/* Government Partners Badge - NEW */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-[#0038A8]" />
                <div>
                  <h3 className="font-bold text-gray-900">Government Accredited</h3>
                  <p className="text-sm text-gray-600">Recognized by Philippine agencies</p>
                </div>
              </div>
              
              {/* Government Logos */}
              <div className="flex items-center gap-6 flex-wrap justify-center">
                <div className="w-12 h-12 relative">
                  <Image src={GOVERNMENT_LOGOS.dmw} alt="DMW" width={48} height={48} className="object-contain" />
                </div>
                <div className="w-12 h-12 relative">
                  <Image src={GOVERNMENT_LOGOS.owwa} alt="OWWA" width={48} height={48} className="object-contain" />
                </div>
                <div className="w-12 h-12 relative">
                  <Image src={GOVERNMENT_LOGOS.bsp} alt="BSP" width={48} height={48} className="object-contain" />
                </div>
                <div className="w-12 h-12 relative">
                  <Image src={GOVERNMENT_LOGOS.sec} alt="SEC" width={48} height={48} className="object-contain" />
                </div>
                <div className="w-12 h-12 relative">
                  <Image src={GOVERNMENT_LOGOS.dof} alt="DOF" width={48} height={48} className="object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story - Updated with OFW context */}
        <section className="mb-16 md:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-[#0038A8]" />
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Ang Aming Kwento</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  Itinatag noong 2015 ng mga dating OFW na mismo ang nakaranas ng hirap sa 
                  pag-access ng financial services habang nagtatrabaho abroad, ang KabayanLoan 
                  ay isinilang mula sa simpleng ideya: bawat OFW ay nararapat sa mabilis, 
                  patas, at transparent na access sa credit.
                </p>
                <p>
                  Nagsimula kami bilang maliit na team sa Maynila, nakatuon sa pag-unawa sa 
                  unique na financial needs ng overseas workers. Ngayon, higit 500,000 OFW na 
                  sa 50+ bansa ang aming napaglilingkuran, tinutulungan silang makamit ang 
                  kanilang mga pangarap at suportahan ang kanilang pamilya.
                </p>
                <p>
                  Patuloy kaming nag-iinnovate upang mas mapabuti ang serbisyo para sa ating 
                  mga kababayan, hindi lang sa pagpapautang kundi sa komprehensibong financial 
                  solutions para sa modernong OFW.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#0038A8]/10 to-[#CE1126]/10 rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                    <div className="text-3xl font-bold text-[#0038A8] mb-2">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission & Vision - Updated with colors */}
        <section className="mb-16 md:mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#0038A8] to-[#CE1126] rounded-3xl p-8 text-white">
              <Target className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Ang Aming Misyon</h3>
              <p className="opacity-90">
                Gawing accessible ang financial services para sa lahat ng OFW sa buong mundo, 
                nagbibigay ng mabilis, transparent, at patas na lending solutions na 
                nagpapalakas sa kanila upang makamit ang magandang kinabukasan para sa pamilya.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#CE1126] to-[#002c86] rounded-3xl p-8 text-white">
              <Globe className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Ang Aming Bisyon</h3>
              <p className="opacity-90">
                Maging pinakapinagkakatiwalaang financial partner ng bawat Overseas Filipino 
                Worker, kilala sa innovation, integridad, at exceptional service sa buong 
                global Filipino community.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values - Updated with OFW-focused values */}
        <section className="mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Ang Aming Pinahahalagahan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Principles guiding our service for the OFW community
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 mb-3">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team & Leadership - Updated with OFW backgrounds */}
        <section className="mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Ang Aming Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dating OFW at financial experts na dedikado sa paglilingkod sa ating komunidad
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#0038A8]/10 to-[#CE1126]/10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users2 className="w-16 h-16 text-[#0038A8]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-[#CE1126] font-medium mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm mb-2">{member.bio}</p>
                <p className="text-xs text-gray-500 italic">{member.ofwExperience}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Regulatory Compliance - Updated with government logos */}
        <section className="mb-16 md:mb-20">
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <Shield className="w-6 h-6 text-[#0038A8]" />
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Government Recognition</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Kami ay kinikilala at rehistrado ng mga ahensya ng gobyerno ng Pilipinas 
                  to ensure the safety and protection of our OFWs.
                </p>
                <ul className="space-y-3">
                  {compliance.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#00A86B]" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <Image
                    src={GOVERNMENT_LOGOS.sec}
                    alt="SEC Logo"
                    width={48}
                    height={48}
                    className="mx-auto mb-4 object-contain"
                  />
                  <h3 className="font-bold text-gray-900 mb-2">SEC Registered</h3>
                  <p className="text-sm text-gray-600">Securities and Exchange Commission</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <Image
                    src={GOVERNMENT_LOGOS.bsp}
                    alt="BSP Logo"
                    width={48}
                    height={48}
                    className="mx-auto mb-4 object-contain"
                  />
                  <h3 className="font-bold text-gray-900 mb-2">BSP Supervised</h3>
                  <p className="text-sm text-gray-600">Bangko Sentral ng Pilipinas</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <Image
                    src={GOVERNMENT_LOGOS.dmw}
                    alt="DMW Logo"
                    width={48}
                    height={48}
                    className="mx-auto mb-4 object-contain"
                  />
                  <h3 className="font-bold text-gray-900 mb-2">DMW Accredited</h3>
                  <p className="text-sm text-gray-600">Department of Migrant Workers</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <Image
                    src={GOVERNMENT_LOGOS.owwa}
                    alt="OWWA Logo"
                    width={48}
                    height={48}
                    className="mx-auto mb-4 object-contain"
                  />
                  <h3 className="font-bold text-gray-900 mb-2">OWWA Partner</h3>
                  <p className="text-sm text-gray-600">Overseas Workers Welfare Admin</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info - Updated with generic info */}
        <section className="mb-12">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Makipag-ugnayan</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Always ready to help with your financial needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 hover:border-[#0038A8] transition-colors">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-[#0038A8]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">24/7 Hotline</h3>
                <p className="text-gray-600 mb-2">Always open</p>
                <p className="text-sm text-gray-500">Tumawag kahit anong oras</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 hover:border-[#0038A8] transition-colors">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-[#00A86B]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-2">support@kabayanloan.com</p>
                <p className="text-sm text-gray-500">Response within 2 hours</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 hover:border-[#0038A8] transition-colors">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-[#CE1126]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Headquarters</h3>
                <p className="text-gray-600 mb-2">Makati City, Philippines</p>
                <p className="text-sm text-gray-500">Servicing OFWs worldwide</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-[#0038A8] to-[#CE1126] rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to apply?</h2>
            <p className="text-lg mb-8 opacity-90">Samahan ang 500,000+ OFW na nagtiwala sa amin</p>
            <Link href="/register">
              <Button className="bg-white text-[#0038A8] hover:bg-gray-100 text-lg py-6 px-12 rounded-2xl shadow-lg">
                Apply Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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
                <span className="text-xs bg-blue-50 text-[#0038A8] px-2 py-1 rounded-full">SEC</span>
                <span className="text-xs bg-green-50 text-[#00A86B] px-2 py-1 rounded-full">BSP</span>
                <span className="text-xs bg-orange-50 text-[#CE1126] px-2 py-1 rounded-full">DMW</span>
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

const stats = [
  { value: '500K+', label: 'OFW Served' },
  { value: '₱5B+', label: 'Loans Disbursed' },
  { value: '50+', label: 'Countries' },
  { value: '2015', label: 'Founded' }
]

const values = [
  {
    icon: <Heart className="w-6 h-6 text-[#FF6B00]" />,
    title: 'Malasakit',
    description: 'Naiintindihan namin ang OFW journey at tinatrato ang bawat client nang may respeto.',
  },
  {
    icon: <Shield className="w-6 h-6 text-[#0038A8]" />,
    title: 'Integridad',
    description: 'Transparent at tapat na serbisyo sa lahat ng oras.',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-[#00A86B]" />,
    title: 'Innovation',
    description: 'Patuloy na pagpapabuti ng serbisyo para sa OFW.',
  },
  {
    icon: <Users className="w-6 h-6 text-[#CE1126]" />,
    title: 'Komunidad',
    description: 'Nagtatayo ng support system para sa ating mga OFW.',
  }
]

const team = [
  {
    name: 'Miguel Santos',
    position: 'CEO & Co-Founder',
    bio: 'Former OFW sa Dubai',
    ofwExperience: '10 years sa financial services'
  },
  {
    name: 'Ana Cruz',
    position: 'Chief Operations Officer',
    bio: 'Former OFW sa Singapore',
    ofwExperience: 'Specializes in digital banking'
  },
  {
    name: 'Robert Lim',
    position: 'Chief Technology Officer',
    bio: 'Fintech expert',
    ofwExperience: '15 years in banking technology'
  }
]

const compliance = [
  'Rehistrado sa SEC ng Pilipinas',
  'Binabantayan ng Bangko Sentral ng Pilipinas',
  'DMW accredited para sa OFW protection',
  'Sumusunod sa Data Privacy Act',
  'Regular na security audits'
]
