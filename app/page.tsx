'use client'

import { BookUpload } from '@/components/books/BookUpload'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Story Reader Admin</h1>
        <BookUpload />
      </div>
    </div>
  )
}