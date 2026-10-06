export const applicationApiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app').trim().replace(/\/$/, '').replace(/\/api$/, '')

export function normalizeApplication(record: any) {
  return { ...record, status: record.status === 'ACCEPTED' ? 'APPROVED' : record.status,
    submittedAt: record.createdAt, experience: record.writingExperience,
    writingSample: record.publishedWorks, portfolio: record.portfolioUrl,
    socialMedia: record.currentPlatforms }
}

export async function fetchApplications(token: string | null, limit?: number) {
  const result: any[] = []
  let page = 1, totalPages = 1
  do {
    const response = await fetch(`${applicationApiBase}/api/author-applications/all?page=${page}&limit=${limit || 100}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store'
    })
    if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Please sign in again to view applications.' : 'Could not load applications. Please try again.')
    const data = await response.json()
    if (!Array.isArray(data.applications)) throw new Error('The application list could not be read.')
    result.push(...data.applications.map(normalizeApplication))
    totalPages = data.totalPages || 0
    page++
  } while (!limit && page <= totalPages)
  return result
}
