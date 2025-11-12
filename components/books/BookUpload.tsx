'use client'

import { useState, useEffect } from 'react'
import { Upload, LogIn, LogOut } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'

export function BookUpload() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  
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
  const [uploadMode, setUploadMode] = useState<'simple' | 'bulk'>('bulk')
  const [parsedChapters, setParsedChapters] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      })
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token)
        setIsLoggedIn(true)
        setEmail('')
        setPassword('')
      }
    } catch (error: any) {
      setLoginError(error.response?.data?.message || 'Login failed. Please check your credentials.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsLoggedIn(false)
  }

  const parseChapters = async () => {
    if (!chapterText.trim()) {
      setMessage('Please enter chapter content')
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      
      // Use the new parse endpoint
      const response = await axios.post(
        `${API_URL}/api/admin/parse-chapters`,
        { content: chapterText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        setParsedChapters(response.data.data)
        setShowPreview(true)
        
        // Show validation issues if any
        if (response.data.validation && response.data.validation.issues?.length > 0) {
          setMessage(`Parsed ${response.data.data.length} chapters with warnings: ${response.data.validation.issues.join(', ')}`)
        } else if (response.data.data.length === 0) {
          setMessage('No chapters found. Make sure each chapter title starts with # (e.g., #Welcome to Nowhere)')
          setShowPreview(false)
        } else {
          setMessage(`Parsed ${response.data.data.length} chapters successfully!`)
        }
      }
    } catch (error: any) {
      setMessage(`Error parsing chapters: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setMessage('')

    try {
      let bookData: any = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        setMessage('Please login again - session expired')
        setIsLoggedIn(false)
        return
      }
      
      if (uploadMode === 'bulk' && chapterText.trim()) {
        // Use the new import endpoint for bulk text with auto-parsing
        const response = await axios.post(
          `${API_URL}/api/admin/import-book`,
          {
            content: chapterText,
            title: formData.title || undefined,
            authorName: formData.authorName || undefined,
            description: formData.description || undefined,
            genre: formData.genre ? [formData.genre] : undefined,
            parseChapters: true
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.data.success) {
          setMessage(`Book uploaded successfully with ${response.data.data.chapters?.length || 0} chapters!`)
          resetForm()
        } else {
          throw new Error(response.data.message || 'Upload failed')
        }
      } else {
        // Use existing endpoint for manual chapter entry
        const chaptersArray = parsedChapters.length > 0 ? parsedChapters : []
        
        bookData.chapters = chaptersArray

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
          resetForm()
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      
      // Check if it's an auth error
      if (error.response?.status === 401 || error.response?.data?.message?.includes('token')) {
        setMessage('Session expired. Please login again.')
        setIsLoggedIn(false)
        localStorage.removeItem('adminToken')
      } else {
        setMessage(`Error: ${error.response?.data?.message || error.message}`)
      }
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
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
    setParsedChapters([])
    setShowPreview(false)
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
          
          {loginError && (
            <div className="p-4 mb-4 rounded bg-red-100 text-red-700">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@romanceme.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin123"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <LogIn className="mr-2" size={20} />
              Login
            </button>
          </form>

          <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600">
            <p>Default credentials:</p>
            <p className="font-mono">admin@romanceme.com / admin123</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upload New Book</h2>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <LogOut className="mr-1" size={20} />
            Logout
          </button>
        </div>
        
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

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Mode
            </label>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="bulk"
                  checked={uploadMode === 'bulk'}
                  onChange={(e) => setUploadMode(e.target.value as 'bulk')}
                  className="mr-2"
                />
                <span>Bulk Upload (Paste Full Book Text)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="simple"
                  checked={uploadMode === 'simple'}
                  onChange={(e) => setUploadMode(e.target.value as 'simple')}
                  className="mr-2"
                />
                <span>Simple (Title | Content per line)</span>
              </label>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              {uploadMode === 'bulk' ? 'Book Content' : 'Chapters (one per line, format: Title | Content)'}
            </label>
            <div className="text-xs text-gray-500 mb-2">
              {uploadMode === 'bulk' ? (
                <>
                  <p>Paste your entire book text below. The system automatically detects chapters:</p>
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="font-semibold text-green-800">✅ RECOMMENDED: Use # for chapter titles</p>
                    <pre className="bg-white p-2 rounded mt-1 text-xs border">
{`#Welcome to Nowhere

Sarah walked into the coffee shop...
[content continues...]

#Unexpected Meeting

The next morning brought...
[content continues...]`}
                    </pre>
                    <p className="text-xs mt-1 text-green-700">This prevents subtitles from being detected as chapters!</p>
                  </div>
                  
                  <p className="mt-3">Also supports:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li><strong>Numbered format:</strong> Chapter 1: Title, CHAPTER 1, Part 1</li>
                    <li><strong>Title-only format:</strong> Short titles followed by content</li>
                    <li><strong>Plain text:</strong> Will be treated as a single chapter</li>
                  </ul>
                  
                  <p className="mt-2">Optional: Include metadata at the top:</p>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
{`Title: Your Book Title
Author: Author Name

#Welcome to Nowhere
Content here...`}
                  </pre>
                </>
              ) : (
                <p>Enter each chapter on a new line using format: Chapter Title | Chapter content...</p>
              )}
            </div>
            <textarea
              value={chapterText}
              onChange={(e) => setChapterText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={uploadMode === 'bulk' ? 12 : 6}
              placeholder={uploadMode === 'bulk' ? 
                'Paste your entire book text here...\n\nChapter 1: The Beginning\n\nIt was a dark and stormy night...' :
                'Chapter 1: The Beginning | It was a dark and stormy night...'}
              required={uploadMode === 'bulk'}
            />
            
            {uploadMode === 'bulk' && (
              <button
                type="button"
                onClick={parseChapters}
                className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Preview Parsed Chapters
              </button>
            )}
          </div>

          {showPreview && parsedChapters.length > 0 && (
            <div className="border rounded p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Parsed Chapters Preview:</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {parsedChapters.map((chapter, idx) => (
                  <div key={idx} className="border-b pb-2">
                    <p className="font-medium">Chapter {chapter.number}: {chapter.title}</p>
                    <p className="text-sm text-gray-600">Words: {chapter.wordCount}</p>
                    <p className="text-xs text-gray-500 truncate">{chapter.content.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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