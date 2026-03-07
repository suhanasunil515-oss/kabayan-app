'use client'

import { useState } from 'react'
import Image from 'next/image'

const banks = [
  { name: 'PNB', type: 'Bank', logo: '/logos/PNB.png' },
  { name: 'BDO', type: 'Bank', logo: '/logos/BDOBank.png' },
  { name: 'BPI', type: 'Bank', logo: '/logos/BPIBank.png' },
  { name: 'CIMB', type: 'Bank', logo: '/logos/CIMBBank.png' },
  { name: 'Metrobank', type: 'Bank', logo: '/logos/MetroBank.png' },
  { name: 'GoTyme', type: 'E-Wallet', logo: '/logos/Gotyme.png' },
  { name: 'UnionBank', type: 'Bank', logo: '/logos/UnionBank.png' },
  { name: 'China Bank', type: 'Bank', logo: '/logos/ChinaBank.png' },
  { name: 'GCash', type: 'E-Wallet', logo: '/logos/GCashWallet.png' },
  { name: 'Maya', type: 'E-Wallet', logo: '/logos/maya.png' },
  { name: 'ADCB', type: 'Bank', logo: '/logos/ADCB.jpg' },
  { name: 'MashreqBank', type: 'Bank', logo: '/logos/MashreqBank.jpg' },
  { name: 'STCPay', type: 'E-Wallet', logo: '/logos/Stcpay.png' },
  { name: 'TapTapSend', type: 'Remittance', logo: '/logos/TapTapSend.png' },
  { name: 'Western Union', type: 'Remittance', logo: '/logos/WesternUnion.png' },
  { name: 'ANB', type: 'Bank', logo: '/logos/Anb.png' },
  { name: 'AlAnasari', type: 'Exchange', logo: '/logos/AlAnasari.jpg' },
]

const getTextColor = (type: string) => {
  switch (type) {
    case 'Bank':
      return 'text-[#0038A8]' // Philippine flag blue
    case 'E-Wallet':
      return 'text-[#00A86B]' // Green for e-wallets
    case 'Remittance':
      return 'text-[#FF6B00]' // Orange for remittance
    case 'Exchange':
      return 'text-[#CE1126]' // Philippine flag red
    default:
      return 'text-[#0038A8]'
  }
}

export default function BankCarousel() {
  const [isHovering, setIsHovering] = useState(false)

  // Double the banks array for seamless infinite scroll
  const extendedBanks = [...banks, ...banks]

  return (
    <div className="w-full overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .bank-carousel {
          display: flex;
          gap: 1.5rem;
          animation: scroll 30s linear infinite;
          width: fit-content;
          padding: 0 1.5rem;
        }

        .bank-carousel.paused {
          animation-play-state: paused;
        }

        .bank-card {
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .bank-card:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 56, 168, 0.15); /* Updated to blue shadow */
        }

        /* Gradient overlays for seamless fade effect - Updated to use flag colors */
        .carousel-container::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 80px;
          background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
          z-index: 10;
          pointer-events: none;
        }

        .carousel-container::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 80px;
          background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
          z-index: 10;
          pointer-events: none;
        }
      `}</style>

      <div
        className="carousel-container relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="bank-carousel" style={{ animationPlayState: isHovering ? 'paused' : 'running' }}>
          {extendedBanks.map((bank, index) => (
            <div
              key={index}
              className="bank-card w-40 h-40"
            >
              <div className="bg-white rounded-2xl p-6 h-full w-full flex flex-col items-center justify-center shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:border-[#0038A8]">
                <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                  <Image
                    src={bank.logo || "/placeholder.svg"}
                    alt={bank.name}
                    width={80}
                    height={80}
                    className="object-contain"
                    priority={false}
                  />
                </div>
                <h4 className="font-bold text-gray-900 text-center text-sm leading-tight line-clamp-2">
                  {bank.name}
                </h4>
                <p className={`text-xs mt-2 font-medium ${getTextColor(bank.type)}`}>
                  {bank.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
