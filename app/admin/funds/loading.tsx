export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f5f7fa] via-blue-50 to-red-50">
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="w-16 h-16 relative mb-2">
          <img
            src="/logos/BP.png"
            alt="KabayanLoan"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Brand Name */}
        <div className="flex items-baseline justify-center gap-1 mb-4">
          <span className="text-2xl font-black tracking-tight text-[#0038A8]">KABAYAN</span>
          <span className="text-2xl font-black tracking-tight text-[#CE1126]">LOAN</span>
        </div>
        
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-[#0038A8] border-t-[#CE1126] rounded-full animate-spin" />
        
        {/* Loading Text */}
        <p className="text-[#212529] font-medium text-lg">Loading Funds Management...</p>
        <p className="text-[#6C757D] text-sm">Please wait while we fetch withdrawal data</p>
        
        {/* Government Logos */}
        <div className="flex justify-center gap-3 mt-4">
          <div className="w-8 h-8 relative opacity-70">
            <img src="/logos/SEC.png" alt="SEC" className="w-full h-full object-contain" />
          </div>
          <div className="w-8 h-8 relative opacity-70">
            <img src="/logos/BSP.png" alt="BSP" className="w-full h-full object-contain" />
          </div>
          <div className="w-8 h-8 relative opacity-70">
            <img src="/logos/dmw.png" alt="DMW" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}
