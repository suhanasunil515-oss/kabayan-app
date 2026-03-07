import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'KabayanLoan - For OFWs Worldwide',
    template: '%s | KabayanLoan'
  },
  description: 'Instant loans for OFWs worldwide. No collateral required, approved in 24 hours, direct to your e-wallet. SEC Registered, BSP Supervised, DMW Accredited.',
  keywords: [
    'OFW loan',
    'online loan Philippines',
    'instant loan for OFW',
    'OFW financial assistance',
    'loan for overseas Filipino workers',
    'GCash loan for OFW',
    'Maya loan for OFW',
    'emergency loan OFW',
    'KabayanLoan',
    'Pinoy loan abroad',
  ],
  authors: [{ name: 'KabayanLoan' }],
  icons: {
    icon: '/logos/BP.png', // Changed to Bagong Pilipinas logo
    shortcut: '/logos/BP.png',
    apple: '/logos/BP.png',
  },
  openGraph: {
    title: 'KabayanLoan - For OFWs Worldwide',
    description: 'Instant loans para sa OFW worldwide. Approved in 24 hours!',
    siteName: 'KabayanLoan',
    type: 'website',
    locale: 'en_PH',
    images: [
      {
        url: '/logos/BP.png',
        width: 1200,
        height: 630,
        alt: 'KabayanLoan - For OFWs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KabayanLoan - For OFWs',
    description: 'Instant loans para sa OFW worldwide',
    images: ['/logos/BP.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google verification code if you have one
  },
  category: 'finance',
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="next-head-count" content="3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0038A8" />
        <meta name="application-name" content="KabayanLoan" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KabayanLoan" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Additional SEO meta tags for OFW audience */}
        <meta name="geo.region" content="PH" />
        <meta name="geo.placename" content="Philippines" />
        <meta name="target" content="OFW, Overseas Filipino Workers" />
      </head>
      <body className={`${geist.className} font-sans antialiased bg-[#f5f7fa] text-[#212529] min-h-screen`} suppressHydrationWarning>
        <main className="min-h-screen">
          {children}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
