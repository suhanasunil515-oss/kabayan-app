export default function AdminUsersLoading() {
  return (
    <>
      {/* Header Skeleton */}
      <header className="bg-gradient-to-r from-white to-blue-50/30 border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="h-8 w-64 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Filters Skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded-lg animate-pulse" />
            <div className="h-5 w-32 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
          </div>
          
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[250px]">
              <div className="h-4 w-32 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded mb-2 animate-pulse" />
              <div className="h-10 w-full bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
            </div>
            <div className="min-w-[200px]">
              <div className="h-4 w-20 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded mb-2 animate-pulse" />
              <div className="h-10 w-full bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 border-b border-gray-200">
                <tr>
                  {['Phone', 'Name', 'Loan Amount', 'Join Date', 'Loan App Date', 'Status', 'Actions'].map((header, i) => (
                    <th key={i} className="px-6 py-3 text-left">
                      <div className="h-4 w-20 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded-full animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-12 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
            <div className="h-9 w-24 bg-gradient-to-r from-[#0038A8]/20 to-[#CE1126]/20 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gradient-to-r from-[#0038A8]/10 to-[#CE1126]/10 rounded animate-pulse" />
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
