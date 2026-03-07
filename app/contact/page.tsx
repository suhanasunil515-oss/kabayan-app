import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <Link href="/" className="text-[#0038A8] hover:underline">← Back to Home</Link>
          <h1 className="text-3xl font-bold mt-4 text-gray-900">Contact Support</h1>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">Contact page coming soon. For support, please use the in-app messaging.</p>
        </div>
      </div>
    </div>
  )
}
