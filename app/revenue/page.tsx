'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DollarSign, TrendingUp, Users, BookOpen, Calendar, RefreshCw } from 'lucide-react'

type Currency = { currency: string; today: number; week: number; month: number; total: number; period: number; purchases: number }
type Breakdown = { currency: string; count: number; total: number; period: number; platform?: string; productId?: string }
interface Analytics {
  generatedAt: string; timezone: string; days: number; since: string
  revenue: { currencies: Currency[]; platforms: Breakdown[]; products: Breakdown[]; excluded: { test: number; unclassified: number; pending: number; failed: number; refunded: number }; daily: { date: string; amount: number; purchases: number }[] }
  engagement: { accounts: number; newAccounts: number; activeAccounts: number; premiumAccounts: number; readers: number; recentReaders: number; readerBookRecords: number; comments: number; recentComments: number }
  books: { id: string; title: string; genre: string[]; isPublished: boolean; readers: number; recentReaders: number; favorites: number; comments: number; viewCount: number; ratingCount: number; ratingAverage: number }[]
  genres: { genre: string; books: number; readerBookRecords: number; recentReaderBookRecords: number }[]
}
const money = (value: number, currency = 'USD') => {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value) }
  catch { return `${Number(value).toFixed(2)} ${currency}` }
}
const number = (value: number) => value.toLocaleString('en-US')
const productName = (id = '') => id.includes('coins.500') ? '500 coins' : id.includes('coins.1000') ? '1,000 coins' : id.includes('unlimited.monthly') ? 'Unlimited Monthly' : id
const storeName = (id = '') => ({ IOS: 'Apple', ANDROID: 'Google Play', WEB: 'Web' }[id] || id)

export default function RevenuePage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [days, setDays] = useState(30)
  const [currency, setCurrency] = useState('USD')
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    ;(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/analytics?days=${days}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }, signal: controller.signal, cache: 'no-store'
        })
        const result = await response.json()
        if (!response.ok || !result.success || !Array.isArray(result.data?.revenue?.currencies) || !Array.isArray(result.data?.books)) {
          throw new Error(response.status === 401 || response.status === 403 ? 'Your administrator session has expired. Please sign in again.' : 'The report could not be loaded. Please retry.')
        }
        if (!controller.signal.aborted) setData(result.data)
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'The report could not be loaded. Please retry.')
      } finally { if (!controller.signal.aborted) setLoading(false) }
    })()
    return () => controller.abort()
  }, [days, refresh])
  const selected = data?.revenue.currencies.find(c => c.currency === currency) || data?.revenue.currencies[0]
  const shown = !loading && !error && data && selected
  const cards = [
    { title: "Today's recorded sales", value: selected?.today, color: 'from-green-400 to-teal-500', icon: DollarSign },
    { title: 'This week · Monday onward', value: selected?.week, color: 'from-blue-400 to-purple-500', icon: Calendar },
    { title: 'This month', value: selected?.month, color: 'from-purple-400 to-pink-500', icon: TrendingUp },
    { title: 'All-time recorded sales', value: selected?.total, color: 'from-pink-400 to-rose-500', icon: DollarSign },
  ]
  return <AdminLayout><div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-3xl font-bold text-gray-900">Revenue &amp; Analytics</h1><p className="text-gray-600 mt-1">Recorded sales, reader engagement, and book performance</p></div>
      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm font-medium">Activity period<select aria-label="Activity period" className="ml-2 border rounded-lg p-2 bg-white" value={days} onChange={e => setDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></label>
        <button className="btn-primary inline-flex gap-2 items-center" disabled={loading} onClick={() => setRefresh(v => v + 1)}><RefreshCw size={16} />{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
    </div>
    <p className="text-sm text-gray-500">Calendar dates use Hawaii time (HST). The activity period includes today. Week starts Monday.</p>
    {error && <div role="alert" className="card border border-red-200 text-red-700"><p>{error}</p><button className="underline mt-2" onClick={() => setRefresh(v => v + 1)}>Retry report</button></div>}
    {loading && <p role="status" className="text-gray-600">Loading the latest recorded data…</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{cards.map(({ title, value, color, icon: Icon }) => <div key={title} className={`bg-gradient-to-br ${color} p-6 rounded-xl text-white`}><div className="flex justify-between gap-2"><div><p className="text-sm opacity-95">{title}</p><p className="text-3xl font-bold mt-2">{shown ? money(value || 0, selected!.currency) : '—'}</p></div><Icon size={24} className="opacity-80 shrink-0" /></div></div>)}</div>
    {shown && <>
      <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">What these sales totals mean</h2><label className="text-sm">Currency<select aria-label="Revenue currency" className="ml-2 border rounded p-2" value={selected!.currency} onChange={e => setCurrency(e.target.value)}>{data.revenue.currencies.map(c => <option key={c.currency}>{c.currency}</option>)}</select></label></div>
        <p className="text-sm text-gray-600">Completed, verified production purchases recorded by the app backend. Mobile amounts use configured USD product prices, so these are estimates—not localized customer charges, store payouts, or net earnings. Subscription renewals and refunds may not be fully represented. Reconcile financial totals with Apple, Google Play, and RevenueCat.</p>
        <p className="text-sm text-gray-600"><strong>{number(data.revenue.excluded.test)} test purchase records excluded.</strong> {number(data.revenue.excluded.unclassified)} records with unconfirmed production provenance excluded. These exclusion counts cover all recorded dates.</p>
        <p className="text-sm text-gray-600">Confirmed production records excluded by status: {data.revenue.excluded.pending} pending · {data.revenue.excluded.failed} failed · {data.revenue.excluded.refunded} refunded. This is not a complete refund ledger.</p>
        <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 text-sm"><span><strong>{selected!.purchases}</strong> completed production purchases, all time</span><span><strong>{money(selected!.period, selected!.currency)}</strong> recorded in selected {days} days</span></div>
        {data.revenue.currencies.every(c => c.purchases === 0) && <p className="rounded-lg bg-gray-50 p-3 text-sm">No completed, verified production purchases have been recorded. Test purchases do not count as revenue.</p>}
      </div>
      <section className="space-y-4"><div className="flex items-center gap-2"><Users size={22} className="text-pink-600" /><h2 className="text-xl font-semibold">Reader engagement</h2></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[
          ['Registered accounts', data.engagement.accounts], ['New accounts in period', data.engagement.newAccounts], ['Accounts active in period', data.engagement.activeAccounts], ['Current premium accounts', data.engagement.premiumAccounts],
          ['Readers with saved activity · all time', data.engagement.readers], ['Readers with a recent saved record', data.engagement.recentReaders], ['Saved reader/book pairs · all time', data.engagement.readerBookRecords], ['Comments posted in period', data.engagement.recentComments],
        ].map(([label, value]) => <div className="card" key={label}><p className="text-sm text-gray-600">{label}</p><p className="text-3xl font-bold mt-2">{number(Number(value))}</p></div>)}</div>
        <p className="text-sm text-gray-500">Includes test and administrator accounts. Active accounts use the last-active timestamp. Reading records store only the latest saved chapter for each reader/book pair; they do not measure completed chapters, reading time, or every reading session. Current premium accounts can include test access. Comments include hidden comments; {data.engagement.comments} recorded all time.</p>
      </section>
      <section className="card overflow-x-auto"><div className="flex flex-wrap justify-between items-center gap-3 mb-3"><h2 className="text-xl font-semibold flex gap-2 items-center"><BookOpen size={22} className="text-purple-600" />Book performance</h2><Link href="/reading" className="text-purple-700 underline text-sm">View latest saved chapters</Link></div>
        <p className="text-sm text-gray-500 mb-4">Readers are distinct accounts with a saved record for that book. Recent readers have a record last saved within the selected period. Views are cumulative views, not unique readers. Includes unpublished books and test activity; comments here are visible comments only.</p>
        <table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Book</th><th className="p-3">Readers</th><th className="p-3">Recent readers</th><th className="p-3">Views</th><th className="p-3">Favorites</th><th className="p-3">Comments</th><th className="p-3">Rating</th></tr></thead><tbody>{data.books.map(b => <tr key={b.id} className="border-b"><td className="p-3 font-medium">{b.title}{!b.isPublished && <span className="block text-xs text-gray-500">Unpublished</span>}</td><td className="p-3">{b.readers}</td><td className="p-3">{b.recentReaders}</td><td className="p-3">{number(b.viewCount)}</td><td className="p-3">{b.favorites}</td><td className="p-3">{b.comments}</td><td className="p-3">{b.ratingCount ? `${Number(b.ratingAverage).toFixed(1)} / 5 (${b.ratingCount})` : 'No ratings'}</td></tr>)}</tbody></table>{data.books.length === 0 && <p className="py-4 text-gray-500">No books recorded yet.</p>}
      </section>
      <section className="card overflow-x-auto"><h2 className="text-xl font-semibold mb-2">Genre performance</h2><p className="text-sm text-gray-500 mb-4">Counts are reader/book pairs, not unique people across books. A book can belong to multiple genres, so genre totals overlap.</p><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Genre</th><th className="p-3">Books</th><th className="p-3">Reader/book pairs</th><th className="p-3">Recent pairs</th></tr></thead><tbody>{data.genres.map(g => <tr key={g.genre} className="border-b"><td className="p-3">{g.genre}</td><td className="p-3">{g.books}</td><td className="p-3">{g.readerBookRecords}</td><td className="p-3">{g.recentReaderBookRecords}</td></tr>)}</tbody></table></section>
      <div className="grid lg:grid-cols-2 gap-6">{(['platforms','products'] as const).map(kind => <section className="card overflow-x-auto" key={kind}><h2 className="text-xl font-semibold mb-3">Recorded sales by {kind === 'platforms' ? 'store' : 'product'}</h2><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-2">{kind === 'platforms' ? 'Store' : 'Product'}</th><th className="p-2">Purchases · all time</th><th className="p-2">Selected period</th><th className="p-2">All time</th></tr></thead><tbody>{data.revenue[kind].map((r,i) => <tr key={i} className="border-b"><td className="p-2">{kind === 'platforms' ? storeName(r.platform) : productName(r.productId)}</td><td className="p-2">{r.count}</td><td className="p-2">{money(r.period,r.currency)}</td><td className="p-2">{money(r.total,r.currency)}</td></tr>)}</tbody></table>{data.revenue[kind].length === 0 && <p className="text-sm text-gray-500 py-4">No completed production purchases recorded.</p>}</section>)}</div>
      <section className="card"><h2 className="text-xl font-semibold mb-2">Daily recorded sales · USD</h2><p className="text-sm text-gray-500 mb-4">Selected {days} calendar days in HST. Other currencies remain separate in the summaries above.</p><div className="max-h-72 overflow-y-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Date · HST</th><th className="p-2">Purchases</th><th className="p-2">Recorded sales</th></tr></thead><tbody>{[...data.revenue.daily].reverse().map(d => <tr key={d.date} className="border-t"><td className="p-2">{d.date}</td><td className="p-2">{d.purchases}</td><td className="p-2">{money(d.amount)}</td></tr>)}</tbody></table></div></section>
      <section className="card"><h2 className="text-lg font-semibold mb-2">Not measured by this report</h2><p className="text-sm text-gray-600">App Store / Google Play downloads, ad revenue, author payouts, net earnings, full subscription-renewal revenue, and chapter-completion funnels need additional data sources. Account registrations, book views, and saved reading records are not downloads. This report does not estimate those missing measures.</p></section>
      <p className="text-xs text-gray-500">Updated {new Date(data.generatedAt).toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' })} HST · Refresh to request a new snapshot.</p>
    </>}
  </div></AdminLayout>
}
