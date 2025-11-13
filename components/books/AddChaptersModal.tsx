'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'

interface AddChaptersModalProps {
  bookId: string
  bookTitle: string
  onClose: () => void
  onSuccess: () => void
}

export function AddChaptersModal({ bookId, bookTitle, onClose, onSuccess }: AddChaptersModalProps) {
  const [chaptersText, setChaptersText] = useState('')
  const [startingChapterNumber, setStartingChapterNumber] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [parsedChapters, setParsedChapters] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const parseChaptersLocally = (text: string) => {
    const chapters: any[] = []
    
    // First, try to detect chapters with # markers (recommended)
    if (text.includes('#')) {
      const parts = text.split(/^#(?!#)/gm).filter(part => part.trim())
      parts.forEach((part, idx) => {
        const lines = part.trim().split('\n')
        const title = lines[0].trim()
        const content = lines.slice(1).join('\n').trim()
        
        if (content) {
          chapters.push({
            title: title || `Chapter ${startingChapterNumber + idx}`,
            content: content,
            chapterNumber: startingChapterNumber + idx,
            number: startingChapterNumber + idx
          })
        }
      })
    }
    
    // If no # markers, try Chapter X patterns
    if (chapters.length === 0) {
      const chapterRegex = /^(?:Chapter|CHAPTER|Chap|Ch\.?)\s+(\d+)[:\-\s]*(.*?)(?=^(?:Chapter|CHAPTER|Chap|Ch\.?)\s+\d+|$)/gims
      const matches = Array.from(text.matchAll(chapterRegex))
      
      if (matches.length > 0) {
        matches.forEach((match, idx) => {
          const chapterNum = parseInt(match[1])
          const titlePart = match[2]?.trim() || ''
          const startIdx = match.index! + match[0].indexOf('\n')
          const endIdx = idx < matches.length - 1 ? matches[idx + 1].index! : text.length
          const content = text.substring(startIdx, endIdx).trim()
          
          if (content) {
            chapters.push({
              title: titlePart ? `Chapter ${chapterNum}: ${titlePart}` : `Chapter ${chapterNum}`,
              content: content,
              chapterNumber: startingChapterNumber + idx,
              number: startingChapterNumber + idx
            })
          }
        })
      }
    }
    
    // If still no chapters, split by double newlines
    if (chapters.length === 0) {
      const blocks = text.split(/\n\s*\n+/).filter(block => block.trim())
      blocks.forEach((block, idx) => {
        chapters.push({
          title: `Chapter ${startingChapterNumber + idx}`,
          content: block.trim(),
          chapterNumber: startingChapterNumber + idx,
          number: startingChapterNumber + idx
        })
      })
    }
    
    return chapters
  }

  const parseChapters = async () => {
    if (!chaptersText.trim()) {
      setMessage('Please enter chapter content')
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      
      // Try server-side parsing first
      try {
        const response = await axios.post(
          `${API_URL}/api/admin/parse-chapters`,
          { content: chaptersText },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.data.success && response.data.data.length > 0) {
          // Adjust chapter numbers based on starting number
          const adjustedChapters = response.data.data.map((ch: any, idx: number) => ({
            ...ch,
            chapterNumber: startingChapterNumber + idx,
            number: startingChapterNumber + idx,
            title: ch.title.replace(/Chapter \d+/i, `Chapter ${startingChapterNumber + idx}`)
          }))
          setParsedChapters(adjustedChapters)
          setShowPreview(true)
          setMessage(`Parsed ${response.data.data.length} chapters successfully!`)
          return
        }
      } catch (serverError) {
        console.log('Server parsing failed, using local parser')
      }
      
      // Fall back to local parsing
      const localChapters = parseChaptersLocally(chaptersText)
      
      if (localChapters.length > 0) {
        setParsedChapters(localChapters)
        setShowPreview(true)
        setMessage(`Parsed ${localChapters.length} chapters successfully!`)
      } else {
        setMessage('Could not parse chapters. Please check the format.')
      }
    } catch (error: any) {
      setMessage(`Error parsing chapters: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleSubmit = async () => {
    if (parsedChapters.length === 0 && chaptersText.trim()) {
      await parseChapters()
      return
    }

    if (parsedChapters.length === 0) {
      setMessage('No chapters to add')
      return
    }

    setUploading(true)
    setMessage('Uploading chapters...')

    try {
      const token = localStorage.getItem('adminToken')
      
      console.log('Submitting chapters:', parsedChapters)
      
      // Try bulk upload first
      try {
        const response = await axios.post(
          `${API_URL}/api/admin/books/${bookId}/chapters/bulk`,
          { 
            chapters: parsedChapters.map(ch => ({
              title: ch.title,
              content: ch.content,
              chapterNumber: ch.chapterNumber || ch.number,
              coinCost: (ch.chapterNumber || ch.number) <= 5 ? 0 : 20,
              isPremium: (ch.chapterNumber || ch.number) > 5
            }))
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.data.success) {
          setMessage(`Successfully added ${response.data.data.length} chapters!`)
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 1500)
          return
        }
      } catch (bulkError: any) {
        console.log('Bulk upload failed, trying individual uploads:', bulkError.message)
        
        // Fall back to individual uploads
        let successCount = 0
        let failedChapters: string[] = []
        
        for (const chapter of parsedChapters) {
          try {
            await axios.post(
              `${API_URL}/api/admin/books/${bookId}/chapters`,
              {
                title: chapter.title,
                content: chapter.content,
                chapterNumber: chapter.chapterNumber || chapter.number,
                coinCost: (chapter.chapterNumber || chapter.number) <= 5 ? 0 : 20,
                isPremium: (chapter.chapterNumber || chapter.number) > 5
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            )
            successCount++
            setMessage(`Uploaded ${successCount}/${parsedChapters.length} chapters...`)
          } catch (err: any) {
            console.error(`Failed to upload chapter ${chapter.chapterNumber}:`, err)
            failedChapters.push(chapter.title)
          }
        }
        
        if (successCount === parsedChapters.length) {
          setMessage(`Successfully added all ${successCount} chapters!`)
        } else if (successCount > 0) {
          setMessage(`Added ${successCount} chapters. Failed: ${failedChapters.join(', ')}`)
        } else {
          throw new Error('Failed to upload any chapters')
        }
        
        if (successCount > 0) {
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 1500)
        }
      }
    } catch (error: any) {
      console.error('Chapter upload error:', error)
      setMessage(`Error: ${error.response?.data?.message || error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Add Chapters to "{bookTitle}"</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {message && (
            <div className={`p-3 mb-4 rounded ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 
              message.includes('Successfully') ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting Chapter Number
              </label>
              <input
                type="number"
                min="1"
                value={startingChapterNumber}
                onChange={(e) => setStartingChapterNumber(parseInt(e.target.value) || 1)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                New chapters will be numbered starting from this value
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chapter Content
              </label>
              <div className="text-xs text-gray-500 mb-2">
                <p>Paste your chapters below. The system automatically detects:</p>
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="font-semibold text-green-800">✅ RECOMMENDED: Use # for chapter titles</p>
                  <pre className="text-xs bg-white p-1 mt-1 rounded border">
{`#New Revelations

The truth came out slowly...

#The Confrontation

She couldn't avoid him...`}</pre>
                  <p className="text-xs mt-1 text-green-700">Adding # ensures only chapter titles are detected!</p>
                </div>
                <p className="mt-2">Also supports: Chapter X format, numbered format, or plain text</p>
              </div>
              <textarea
                value={chaptersText}
                onChange={(e) => setChaptersText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={12}
                placeholder="Chapter 21: New Beginnings

The story continues..."
              />
            </div>

            <button
              type="button"
              onClick={parseChapters}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Preview Chapters
            </button>

            {showPreview && parsedChapters.length > 0 && (
              <div className="border rounded p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Chapters to Add:</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {parsedChapters.map((chapter, idx) => (
                    <div key={idx} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            Chapter {chapter.chapterNumber}: {chapter.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {chapter.wordCount} words • {chapter.chapterNumber <= 5 ? 'Free' : '20 coins'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setParsedChapters(parsedChapters.filter((_, i) => i !== idx))
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {chapter.content.substring(0, 150)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || (!parsedChapters.length && !chaptersText.trim())}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? 'Adding Chapters...' : 'Add Chapters'}
          </button>
        </div>
      </div>
    </div>
  )
}