'use client'

import { 
  BarChart, BookOpen, Users, MessageSquare, 
  PenTool, DollarSign, Shield, LogOut 
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'authors', label: 'Authors', icon: PenTool },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'moderation', label: 'Moderation', icon: Shield },
  ]

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    window.location.href = '/login'
  }

  return (
    <div className="w-64 bg-gray-900 text-white h-full">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Story Reader</h2>
        <p className="text-sm text-gray-400">Admin Portal</p>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-800 transition-colors ${
                activeTab === item.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 flex items-center space-x-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}