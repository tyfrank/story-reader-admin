'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'

export function BookUpload() {
  const [formData, setFormData] = useState({
    title: '',
    authorName: '',
    description: '',
    genre: '',
    tags: '',
    coverUrl: '',
    status: 'draft' as 'draft' | 'published',
    chapters: [] as any[]
  })
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [chapterText, setChapterText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setMessage('')

    try {
      // Parse chapters from text area (each chapter on a new line)
      const chaptersArray = chapterText.split('\n').filter(line => line.trim()).map((line, index) => {
        const [title, ...contentParts] = line.split('|')
        return {
          chapterNumber: index + 1,
          title: title.trim(),
          content: contentParts.join('|').trim() || 'Chapter content here...',
          isFree: index === 0,
          coinCost: index === 0 ? 0 : 2
        }
      })

      const bookData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        chapters: chaptersArray
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('adminToken')
      
      const response = await axios.post(
        `${API_URL}/api/admin/books`,
        bookData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        setMessage('Book uploaded successfully!')
        setFormData({
          title: '',
          authorName: '',
          description: '',
          genre: '',
          tags: '',
          coverUrl: '',
          status: 'draft',
          chapters: []
        })
        setChapterText('')
      }
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Upload New Book</h2>
        
        {message && (
          <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({...formData, authorName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({...formData, genre: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select genre</option>
              <option value="romance">Romance</option>
              <option value="fantasy">Fantasy</option>
              <option value="mystery">Mystery</option>
              <option value="thriller">Thriller</option>
              <option value="scifi">Sci-Fi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="werewolf, alpha, mate"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({...formData, coverUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chapters (one per line, format: Title | Content)
            </label>
            <textarea
              value={chapterText}
              onChange={(e) => setChapterText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Chapter 1: The Beginning | It was a dark and stormy night..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'draft' | 'published'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
          >
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <Upload className="mr-2" size={20} />
                Upload Book
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}