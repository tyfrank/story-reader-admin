'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { BookUpload } from '@/components/books/BookUpload'
import { UserFeedback } from '@/components/feedback/UserFeedback'
import { AuthorPortal } from '@/components/authors/AuthorPortal'
import { ContentModeration } from '@/components/moderation/ContentModeration'
import { UserManagement } from '@/components/users/UserManagement'
import { RevenueTracking } from '@/components/revenue/RevenueTracking'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics')

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-7 lg:w-auto">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="books">Books</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="authors">Authors</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analytics" className="space-y-4">
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <AnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="books" className="space-y-4">
              <h1 className="text-3xl font-bold">Book Management</h1>
              <BookUpload />
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <h1 className="text-3xl font-bold">User Management</h1>
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="feedback" className="space-y-4">
              <h1 className="text-3xl font-bold">User Feedback</h1>
              <UserFeedback />
            </TabsContent>
            
            <TabsContent value="authors" className="space-y-4">
              <h1 className="text-3xl font-bold">Author Portal</h1>
              <AuthorPortal />
            </TabsContent>
            
            <TabsContent value="revenue" className="space-y-4">
              <h1 className="text-3xl font-bold">Revenue Tracking</h1>
              <RevenueTracking />
            </TabsContent>
            
            <TabsContent value="moderation" className="space-y-4">
              <h1 className="text-3xl font-bold">Content Moderation</h1>
              <ContentModeration />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}