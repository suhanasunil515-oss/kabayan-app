export default function LoadingLoans() {
  return (
    <>
      {/* Header Skeleton */}
      <header className="bg-gradient-to-r from-white to-blue-50/30 border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="h-8 w-64 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Filter Card Skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded-lg animate-pulse" />
            <div className="h-5 w-32 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-2">
                <div className="h-4 w-16 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
                <div className="h-10 w-full bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
                <div className="h-10 w-full bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
                <div className="h-10 w-full bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 w-24 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 border-b border-gray-200">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-4 w-20 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                  <tr key={row} className="border-b border-gray-100">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                      <td key={col} className="px-4 py-4">
                        <div className="h-4 w-24 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
            <div className="h-9 w-24 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
            <div className="h-9 w-24 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
          </div>
        </div>

        {/* Government Logos Skeleton */}
        <div className="mt-6 bg-gradient-to-r from-blue-50/50 to-red-50/50 rounded-xl p-4 border border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
