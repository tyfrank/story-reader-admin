'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Search, Filter, UserCheck, UserX, 
  Mail, Calendar, Crown, ChevronLeft, ChevronRight
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'

interface User {
  id: string
  email: string
  displayName: string
  role: string
  isPremium: boolean
  isActive: boolean
  createdAt: string
  lastLoginAt: string
  coinBalance: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ total: 0, active: 0, premium: 0, authors: 0 })
  const requestNumber = useRef(0)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm])

  const fetchUsers = async () => {
    const requestId = ++requestNumber.current
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm
      })
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/users?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      if (!response.ok) throw new Error('Unable to load users. Please retry or sign in again.')
      const data = await response.json()
      if (!data.success || !Array.isArray(data.data) || !data.stats) throw new Error('Unexpected user-list response. Please retry.')
      if (requestId !== requestNumber.current) return
      setUsers(data.data)
      setStats(data.stats)
      setTotalPages(Math.max(1, data.pagination?.pages || 1))
    } catch (error) {
      if (requestId === requestNumber.current) setError(error instanceof Error ? error.message : 'Unable to load users.')
    } finally {
      if (requestId === requestNumber.current) setLoading(false)
    }
  }

  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isPremium: !currentStatus })
        }
      )

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isActive: !currentStatus })
        }
      )

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  if (loading && users.length === 0 && !error) {
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all platform users</p>
        </div>

        {error && <div role="alert" className="card text-red-700">{error} <button onClick={fetchUsers} className="underline">Retry</button></div>}
        {loading && <p role="status">Loading users...</p>}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Total Users</p>
            <p className="text-2xl font-bold">{error ? '—' : stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-teal-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Active Users</p>
            <p className="text-2xl font-bold">
              {error ? '—' : stats.active}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Premium Users</p>
            <p className="text-2xl font-bold">
              {error ? '—' : stats.premium}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Authors</p>
            <p className="text-2xl font-bold">
              {error ? '—' : stats.authors}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => { setCurrentPage(1); setSearchTerm(e.target.value) }}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Coins</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Active</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!error && !loading && users.length === 0 && <tr><td colSpan={7} className="p-6 text-center">No matching users found.</td></tr>}
                {!error && users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{user.displayName || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        user.role === 'AUTHOR' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {user.isPremium && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                            <Crown size={12} />
                            Premium
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.coinBalance || 0}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTogglePremium(user.id, user.isPremium)}
                          className="text-xs px-2 py-1 border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-50"
                        >
                          {user.isPremium ? 'Remove Premium' : 'Make Premium'}
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className="text-xs px-2 py-1 border border-gray-500 text-gray-600 rounded hover:bg-gray-50"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}