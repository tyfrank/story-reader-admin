'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DollarSign, TrendingUp, Users, BookOpen, Calendar } from 'lucide-react'

export default function RevenuePage() {
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  })

  useEffect(() => {
    // Mock data for now
    setStats({
      today: 0,
      week: 0,
      month: 0,
      total: 0
    })
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue & Analytics</h1>
          <p className="text-gray-600 mt-1">Track platform revenue and performance metrics</p>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-400 to-teal-500 p-6 rounded-xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Today's Revenue</p>
                <p className="text-3xl font-bold mt-2">${stats.today.toFixed(2)}</p>
              </div>
              <DollarSign size={24} className="opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-6 rounded-xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">This Week</p>
                <p className="text-3xl font-bold mt-2">${stats.week.toFixed(2)}</p>
              </div>
              <Calendar size={24} className="opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-6 rounded-xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">This Month</p>
                <p className="text-3xl font-bold mt-2">${stats.month.toFixed(2)}</p>
              </div>
              <TrendingUp size={24} className="opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-6 rounded-xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">${stats.total.toFixed(2)}</p>
              </div>
              <DollarSign size={24} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="card">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-4">
              <TrendingUp size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Analytics Coming Soon</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Advanced analytics and revenue tracking features are being developed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
              <div className="p-4 bg-gray-50 rounded-lg">
                <DollarSign className="text-green-600 mb-2" size={24} />
                <h3 className="font-medium mb-1">Revenue Tracking</h3>
                <p className="text-sm text-gray-600">Track coin purchases, subscriptions, and author payouts</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Users className="text-green-600 mb-2" size={24} />
                <h3 className="font-medium mb-1">User Analytics</h3>
                <p className="text-sm text-gray-600">Monitor user engagement and reading patterns</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <BookOpen className="text-green-600 mb-2" size={24} />
                <h3 className="font-medium mb-1">Content Performance</h3>
                <p className="text-sm text-gray-600">Analyze which books and genres perform best</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}