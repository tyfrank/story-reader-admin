'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { UserCheck, BookOpen, TrendingUp, Users } from 'lucide-react'

export default function AuthorsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Author Management</h1>
          <p className="text-gray-600 mt-1">Manage authors and their content</p>
        </div>

        {/* Coming Soon */}
        <div className="card">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
              <UserCheck size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Author management features are being developed. You'll be able to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
              <div className="p-4 bg-gray-50 rounded-lg">
                <BookOpen className="text-purple-600 mb-2" size={24} />
                <h3 className="font-medium mb-1">Manage Author Content</h3>
                <p className="text-sm text-gray-600">Review and manage books uploaded by authors</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="text-purple-600 mb-2" size={24} />
                <h3 className="font-medium mb-1">Track Performance</h3>
                <p className="text-sm text-gray-600">Monitor author earnings and reader engagement</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Users className="text-purple-600 mb-2" size={24} />
                <h3 className="font-medium mb-1">Author Community</h3>
                <p className="text-sm text-gray-600">Manage author communications and support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}