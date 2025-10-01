'use client'

import { BookUpload } from '@/components/books/BookUpload'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Story Reader Admin</h1>
          <div className="text-sm text-gray-600">
            <p>Backend: {process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Login Instructions</h2>
          <div className="bg-blue-50 p-4 rounded">
            <p className="mb-2"><strong>Email:</strong> admin@romanceme.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
        </div>
        <BookUpload />
      </div>
    </div>
  )
}