'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Filter, Check, X, Eye, 
  Calendar, Mail, FileText, Award,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'

interface AuthorApplication {
  id: string
  firstName: string
  lastName: string
  email: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  experience?: string
  genres?: string[]
  writingSample?: string
  portfolio?: string
  socialMedia?: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<AuthorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<AuthorApplication | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/author-applications`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (appId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/author-applications/${appId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      )

      if (response.ok) {
        // Update local state
        setApplications(prev => prev.map(app => 
          app.id === appId ? { ...app, status: newStatus } : app
        ))
        
        // If approved, create author account
        if (newStatus === 'APPROVED') {
          const app = applications.find(a => a.id === appId)
          if (app) {
            await createAuthorAccount(app)
          }
        }
        
        setSelectedApp(null)
        alert(`Application ${newStatus.toLowerCase()}!`)
      }
    } catch (error) {
      console.error('Failed to update application:', error)
      alert('Failed to update application status')
    }
  }

  const createAuthorAccount = async (app: AuthorApplication) => {
    try {
      const token = localStorage.getItem('adminToken')
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/auth/create-author`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: app.email,
            firstName: app.firstName,
            lastName: app.lastName,
            password: Math.random().toString(36).slice(-8) // Temp password
          })
        }
      )
    } catch (error) {
      console.error('Failed to create author account:', error)
    }
  }

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const paginatedApps = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Author Applications</h1>
          <p className="text-gray-600 mt-1">Review and manage author applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Pending Review</p>
            <p className="text-2xl font-bold">
              {applications.filter(a => a.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-teal-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Approved</p>
            <p className="text-2xl font-bold">
              {applications.filter(a => a.status === 'APPROVED').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-pink-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Rejected</p>
            <p className="text-2xl font-bold">
              {applications.filter(a => a.status === 'REJECTED').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Total Applications</p>
            <p className="text-2xl font-bold">{applications.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Applicant</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Submitted</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApps.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{app.firstName} {app.lastName}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{app.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <Eye size={18} className="text-gray-600" />
                        </button>
                        {app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                              className="p-1 hover:bg-green-100 rounded"
                              title="Approve"
                            >
                              <Check size={18} className="text-green-600" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                              className="p-1 hover:bg-red-100 rounded"
                              title="Reject"
                            >
                              <X size={18} className="text-red-600" />
                            </button>
                          </>
                        )}
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of{' '}
                {filteredApplications.length} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-pink-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
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

        {/* Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold">Application Details</h2>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedApp.firstName} {selectedApp.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedApp.email}</p>
                    </div>
                  </div>
                </div>

                {selectedApp.experience && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Writing Experience</h3>
                    <p className="text-gray-600">{selectedApp.experience}</p>
                  </div>
                )}

                {selectedApp.genres && selectedApp.genres.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Preferred Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.genres.map((genre, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApp.writingSample && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Writing Sample</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedApp.writingSample}</p>
                    </div>
                  </div>
                )}

                {selectedApp.status === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleStatusUpdate(selectedApp.id, 'APPROVED')}
                      className="btn-primary flex-1"
                    >
                      Approve Application
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApp.id, 'REJECTED')}
                      className="btn-secondary flex-1"
                    >
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}