'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Settings, Bell, Lock, Database, Globe, Mail } from 'lucide-react'

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
        </div>

        {/* Platform Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Platform Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Platform Name</p>
              <p className="font-medium">RomanceMe</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Version</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Backend URL</p>
              <p className="font-medium text-sm">story-reader-backend-production.up.railway.app</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Admin Portal</p>
              <p className="font-medium text-sm">admin-zeta-brown.vercel.app</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Configuration Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <Bell className="text-purple-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-600 mt-1">Configure email and push notification settings</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <Lock className="text-purple-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Security</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage admin access and security policies</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <Database className="text-purple-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Database</h3>
                  <p className="text-sm text-gray-600 mt-1">Database backup and maintenance settings</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <Globe className="text-purple-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Localization</h3>
                  <p className="text-sm text-gray-600 mt-1">Language and regional settings</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <Mail className="text-purple-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Email Templates</h3>
                  <p className="text-sm text-gray-600 mt-1">Customize system email templates</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <Settings className="text-purple-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Advanced</h3>
                  <p className="text-sm text-gray-600 mt-1">Advanced platform configuration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}