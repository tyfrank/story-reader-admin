'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, BookOpen, Users, UserCheck, 
  DollarSign, Shield, Settings, LogOut, Menu, X,
  FileText, Bell, TrendingUp
} from 'lucide-react'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState(0)
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'applications', label: 'Author Applications', icon: FileText, path: '/applications', badge: 'new' },
    { id: 'books', label: 'Book Management', icon: BookOpen, path: '/books' },
    { id: 'users', label: 'User Management', icon: Users, path: '/users' },
    { id: 'authors', label: 'Author Management', icon: UserCheck, path: '/authors' },
    { id: 'revenue', label: 'Revenue & Analytics', icon: TrendingUp, path: '/revenue' },
    { id: 'moderation', label: 'Content Moderation', icon: Shield, path: '/moderation' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ]

  useEffect(() => {
    // Check for new author applications
    checkNotifications()
  }, [])

  const checkNotifications = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/author-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        const pending = data.data?.filter((app: any) => app.status === 'PENDING').length || 0
        setNotifications(pending)
      }
    } catch (error) {
      console.error('Failed to check notifications:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              RomanceMe Admin
            </h1>
            <p className="text-xs text-gray-500">Management Portal</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
              >
                <Icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge === 'new' && notifications > 0 && (
                  <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    {notifications}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="sidebar-item sidebar-item-inactive w-full"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded hover:bg-gray-100">
                <Bell size={20} />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <div className="text-sm text-gray-600">
                admin@romanceme.com
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}