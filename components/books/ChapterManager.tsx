'use client'

import { useState, useEffect } from 'react'
import { X, Edit, Trash2, Save, Plus, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'

interface Chapter {
  id: string
  chapterNumber: number
  title: string
  content: string
  wordCount?: number
  isFree?: boolean
  price?: number
}

interface ChapterManagerProps {
  bookId: string
  bookTitle: string
  onClose: () => void
}

export function ChapterManager({ bookId, bookTitle, onClose }: ChapterManagerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [editingChapter, setEditingChapter] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{title: string, content: string}>({ title: '', content: '' })
  const [showContent, setShowContent] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchChapters()
  }, [bookId])

  const fetchChapters = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(
        `${API_URL}/api/admin/books/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      if (response.data.success && response.data.data.chapters) {
        setChapters(response.data.data.chapters.sort((a: Chapter, b: Chapter) => a.chapterNumber - b.chapterNumber))
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setMessage('Failed to load chapters')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter.id)
    setEditForm({ title: chapter.title, content: chapter.content })
    setShowContent(null)
  }

  const handleSave = async (chapterId: string, chapterNumber: number) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.put(
        `${API_URL}/api/admin/chapters/${chapterId}`,
        {
          title: editForm.title,
          content: editForm.content
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data.success) {
        setMessage(`Chapter ${chapterNumber} updated successfully`)
        setEditingChapter(null)
        fetchChapters()
      }
    } catch (error) {
      console.error('Error updating chapter:', error)
      setMessage('Failed to update chapter')
    }
  }

  const handleDelete = async (chapterId: string, chapterNumber: number) => {
    if (!confirm(`Delete Chapter ${chapterNumber}? This cannot be undone.`)) return
    
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.delete(
        `${API_URL}/api/admin/chapters/${chapterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      if (response.data.success) {
        setMessage(`Chapter ${chapterNumber} deleted`)
        fetchChapters()
      }
    } catch (error) {
      console.error('Error deleting chapter:', error)
      setMessage('Failed to delete chapter')
    }
  }

  const getNextChapterNumber = () => {
    if (chapters.length === 0) return 1
    return Math.max(...chapters.map(ch => ch.chapterNumber)) + 1
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Chapter Manager: {bookTitle}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {chapters.length} chapters • Next chapter number: {getNextChapterNumber()}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {message && (
            <div className={`p-3 mb-4 rounded ${
              message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Loading chapters...</div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No chapters found. Add chapters using the "Add Chapters" button.
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingChapter === chapter.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Chapter title"
                          />
                          <textarea
                            value={editForm.content}
                            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            rows={10}
                            placeholder="Chapter content"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(chapter.id, chapter.chapterNumber)}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              <Save size={16} className="inline mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingChapter(null)}
                              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-semibold text-lg">
                            Chapter {chapter.chapterNumber}: {chapter.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {chapter.wordCount || chapter.content?.split(/\s+/).length || 0} words
                            {chapter.isFree ? ' • Free' : ` • ${chapter.price || 20} coins`}
                          </div>
                          
                          {showContent === chapter.id ? (
                            <div className="mt-3">
                              <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-sm font-mono">
                                  {chapter.content.substring(0, 1000)}
                                  {chapter.content.length > 1000 && '...'}
                                </pre>
                              </div>
                              <button
                                onClick={() => setShowContent(null)}
                                className="text-blue-600 text-sm mt-2"
                              >
                                <EyeOff size={14} className="inline mr-1" />
                                Hide content
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowContent(chapter.id)}
                              className="text-blue-600 text-sm mt-2"
                            >
                              <Eye size={14} className="inline mr-1" />
                              Show content preview
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    
                    {editingChapter !== chapter.id && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(chapter)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Edit chapter"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(chapter.id, chapter.chapterNumber)}
                          className="p-2 hover:bg-red-100 rounded text-red-600"
                          title="Delete chapter"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Tip: Use the "Add Chapters" button to add more chapters starting from Chapter {getNextChapterNumber()}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}