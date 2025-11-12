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

  const parseChapters = async () => {
    if (!chaptersText.trim()) {
      setMessage('Please enter chapter content')
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      
      // Parse the chapters
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

      if (response.data.success) {
        // Adjust chapter numbers based on starting number
        const adjustedChapters = response.data.data.map((ch: any, idx: number) => ({
          ...ch,
          chapterNumber: startingChapterNumber + idx,
          title: ch.title.replace(/Chapter \d+/i, `Chapter ${startingChapterNumber + idx}`)
        }))
        setParsedChapters(adjustedChapters)
        setShowPreview(true)
        setMessage(`Parsed ${response.data.data.length} chapters successfully!`)
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
    setMessage('')

    try {
      const token = localStorage.getItem('adminToken')
      
      // Add chapters to the book
      const response = await axios.post(
        `${API_URL}/api/admin/books/${bookId}/chapters/bulk`,
        { 
          chapters: parsedChapters.map(ch => ({
            title: ch.title,
            content: ch.content,
            chapterNumber: ch.chapterNumber || ch.number,
            coinCost: ch.chapterNumber <= 5 ? 0 : 20,
            isPremium: ch.chapterNumber > 5
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
      }
    } catch (error: any) {
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