'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function ModerationPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-1">Review and moderate user-generated content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Pending Review</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-pink-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Flagged Content</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-teal-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Approved Today</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Total Reviewed</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="card">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4">
              <Shield size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Moderation Tools Coming Soon</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Content moderation features are being developed to help maintain quality content.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
              <div className="p-4 bg-gray-50 rounded-lg">
                <AlertTriangle className="text-orange-600 mb-2" size={24} />
                <h3 className="font-medium mb-1">Content Flagging</h3>
                <p className="text-sm text-gray-600">Review user-reported content and comments</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="text-orange-600 mb-2" size={24} />
                <h3 className="font-medium mb-1">Approval Queue</h3>
                <p className="text-sm text-gray-600">Review new books before they go live</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <XCircle className="text-orange-600 mb-2" size={24} />
                <h3 className="font-medium mb-1">Content Removal</h3>
                <p className="text-sm text-gray-600">Remove inappropriate or policy-violating content</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}