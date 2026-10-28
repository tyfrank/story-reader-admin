'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'

interface ReadingData {
  total: number
  recent: number
  books: { id: string; title: string; _count: { readingProgress: number } }[]
  activity: { id: string; lastReadAt: string; user: { displayName: string | null }; book: { title: string }; chapter: { chapterNumber: number; title: string } }[]
}

export default function ReadingPage() {
  const [data, setData] = useState<ReadingData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/reading-activity`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      const result = await response.json()
      if (!response.ok || !result.success || !Array.isArray(result.data?.activity)) throw new Error('Unable to load reading activity. Please retry or sign in again.')
      setData(result.data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load reading activity.')
    } finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])
  return <AdminLayout><div className="space-y-6">
    <div className="flex justify-between items-center"><h1 className="text-3xl font-bold">Reading Activity</h1><button className="btn-primary" disabled={loading} onClick={refresh}>{loading ? 'Loading...' : 'Refresh'}</button></div>
    <p className="text-gray-600">Saved reading activity from the app. Each reader has one latest chapter per book. These records are not downloads, completed reads, or a history of every chapter opened. Test accounts may be included.</p>
    {error && <p role="alert" className="card text-red-700">{error}</p>}
    {loading && <p role="status">Loading reading activity...</p>}
    {!error && data && <>
      <div className="grid md:grid-cols-2 gap-4"><div className="card"><h2 className="font-semibold">Reader/book records</h2><p className="text-3xl">{data.total}</p></div><div className="card"><h2 className="font-semibold">Updated in the last 30 days</h2><p className="text-3xl">{data.recent}</p></div></div>
      <div className="card"><h2 className="text-xl font-semibold mb-4">Readers by book</h2><table className="w-full text-left"><thead><tr><th className="p-2">Book</th><th className="p-2">Readers with saved activity</th></tr></thead><tbody>{data.books.map(book => <tr key={book.id} className="border-t"><td className="p-2">{book.title}</td><td className="p-2">{book._count.readingProgress}</td></tr>)}</tbody></table></div>
      <div className="card overflow-x-auto"><h2 className="text-xl font-semibold mb-2">Latest saved chapters</h2><p className="text-sm text-gray-600 mb-4">Up to 100 most recently updated reader/book records. Dates use your browser’s local time.</p><table className="w-full text-left"><thead><tr><th className="p-2">Reader</th><th className="p-2">Book</th><th className="p-2">Chapter</th><th className="p-2">Last saved</th></tr></thead><tbody>{data.activity.map(item => <tr key={item.id} className="border-t"><td className="p-2">{item.user.displayName || 'Reader'}</td><td className="p-2">{item.book.title}</td><td className="p-2">{item.chapter.chapterNumber}: {item.chapter.title}</td><td className="p-2">{new Date(item.lastReadAt).toLocaleString()}</td></tr>)}</tbody></table>{data.activity.length === 0 && <p className="py-4">No saved reading activity yet.</p>}</div>
    </>}
  </div></AdminLayout>
}
