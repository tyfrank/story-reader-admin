'use client'

import { useState, useEffect } from 'react'
import { 
  Users, BookOpen, DollarSign, TrendingUp, 
  UserCheck, Clock, Star, ArrowUp, ArrowDown
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({})
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const headers = { 'Authorization': `Bearer ${token}` }
      
      // Fetch stats
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/stats`, { headers })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data || {})
      }

      // Fetch recent author applications
      const appsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/author-applications?limit=5`, { headers })
      if (appsRes.ok) {
        const appsData = await appsRes.json()
        setRecentApplications(appsData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users?.total || 0,
      change: '+12%',
      trend: 'up',
      icon: Users,
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Active Books',
      value: stats.books?.published || 0,
      change: '+8%',
      trend: 'up',
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.revenue?.total || 0).toFixed(2)}`,
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-green-500 to-teal-500'
    },
    {
      title: 'Active Authors',
      value: stats.users?.authors || 0,
      change: '+5%',
      trend: 'up',
      icon: UserCheck,
      gradient: 'from-blue-500 to-purple-500'
    }
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back to RomanceMe Admin Portal</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className={`stat-card bg-gradient-to-br ${stat.gradient}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="flex items-center text-white/90 text-sm">
                    {stat.trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    {stat.change}
                  </span>
                  <span className="text-white/70 text-xs ml-2">vs last month</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Author Applications */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Author Applications</h2>
              <a href="/applications" className="text-pink-600 hover:text-pink-700 text-sm">
                View all →
              </a>
            </div>
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{app.firstName} {app.lastName}</p>
                    <p className="text-sm text-gray-600">{app.email}</p>
                  </div>
                  <span className={`badge-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>
              ))}
              {recentApplications.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent applications</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Platform Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Chapters</span>
                <span className="font-semibold">{stats.chapters?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Premium Users</span>
                <span className="font-semibold">{stats.users?.premium || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users (30d)</span>
                <span className="font-semibold">{stats.users?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Today's Revenue</span>
                <span className="font-semibold">${(stats.revenue?.today || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Books</span>
                <span className="font-semibold">{stats.books?.total || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Revenue chart coming soon...</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}