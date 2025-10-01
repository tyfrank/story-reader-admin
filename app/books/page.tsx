'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Search, Filter, Plus, Edit, Trash2, 
  Eye, BookOpen, User, Calendar,
  TrendingUp, ChevronLeft, ChevronRight,
  Upload, X, Save, Image
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'

interface Book {
  id: string
  title: string
  author?: string
  authorName?: string
  slug: string
  coverImage?: string
  coverUrl?: string
  description: string
  maturityRating: string
  isPublished: boolean
  uploadedBy?: 'ADMIN' | 'AUTHOR'
  createdAt: string
  chapters?: any[]
  _count?: {
    chapters?: number
    favorites?: number
  }
  reads?: number
  revenue?: number
  authorId?: string
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  
  // Autocomplete state
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([])
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false)
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    author: '',
    description: '',
    genre: 'WEREWOLF',
    tags: '',
    coverImage: '',
    coverImageFile: null as File | null,
    chapters: [] as { title: string; content: string }[],
    bulkChapters: ''
  })

  useEffect(() => {
    fetchBooks()
    loadAutocompleteData()
  }, [])
  
  const loadAutocompleteData = () => {
    // Load saved authors and tags from localStorage
    const savedAuthors = JSON.parse(localStorage.getItem('savedAuthors') || '[]')
    const savedTags = JSON.parse(localStorage.getItem('savedTags') || '[]')
    setAuthorSuggestions(savedAuthors)
    setTagSuggestions(savedTags)
  }
  
  const saveAutocompleteData = (author: string, tags: string) => {
    // Save author
    const savedAuthors = JSON.parse(localStorage.getItem('savedAuthors') || '[]')
    if (author && !savedAuthors.includes(author)) {
      savedAuthors.push(author)
      localStorage.setItem('savedAuthors', JSON.stringify(savedAuthors))
      setAuthorSuggestions(savedAuthors)
    }
    
    // Save tags
    const savedTags = JSON.parse(localStorage.getItem('savedTags') || '[]')
    const newTags = tags.split(',').map(t => t.trim()).filter(Boolean)
    newTags.forEach(tag => {
      if (!savedTags.includes(tag)) {
        savedTags.push(tag)
      }
    })
    localStorage.setItem('savedTags', JSON.stringify(savedTags))
    setTagSuggestions(savedTags)
  }

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.log('No admin token found, redirecting to login')
        window.location.href = '/login'
        return
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/books`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      if (response.status === 401) {
        console.log('Token expired or invalid, redirecting to login')
        localStorage.removeItem('adminToken')
        window.location.href = '/login'
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setBooks(data.data || [])
      } else {
        console.error('Failed to fetch books:', response.status)
        // Even if no books, don't error out - just show empty list
        setBooks([])
      }
    } catch (error) {
      console.error('Failed to fetch books:', error)
      // Don't fail completely, just show empty list
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const handleUploadBook = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      // Save autocomplete data
      saveAutocompleteData(uploadForm.author, uploadForm.tags)
      
      // Handle cover image upload if file is selected
      let coverUrl = uploadForm.coverImage
      if (uploadForm.coverImageFile) {
        // For now, just use the URL field - base64 images can be too large
        if (!uploadForm.coverImage || uploadForm.coverImage.startsWith('blob:')) {
          coverUrl = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop'
        }
      }
      
      // First create the book without chapters (to handle large content)
      const bookData = {
        title: uploadForm.title,
        authorName: uploadForm.author,
        description: uploadForm.description,
        maturityRating: 'ADULT',
        genre: uploadForm.genre,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop',
        status: 'PUBLISHED',
        chapters: [] // Start with empty chapters
      }
      
      // Create the book first
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/books`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookData)
        }
      )

      if (response.ok) {
        const createdBook = await response.json()
        const bookId = createdBook.data?.id || createdBook.id
        
        if (bookId && uploadForm.chapters.length > 0) {
          // Upload chapters one by one to avoid size limits
          let successCount = 0
          for (let i = 0; i < uploadForm.chapters.length; i++) {
            const chapter = uploadForm.chapters[i]
            const chapterData = {
              title: chapter.title || `Chapter ${i + 1}`,
              content: chapter.content || '',
              chapterNumber: i + 1,
              isPremium: false,
              coinCost: 0
            }
            
            try {
              const chapterResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/books/${bookId}/chapters`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(chapterData)
                }
              )
              
              if (chapterResponse.ok) {
                successCount++
              } else {
                console.error(`Failed to upload chapter ${i + 1}`)
              }
            } catch (err) {
              console.error(`Error uploading chapter ${i + 1}:`, err)
            }
          }
          
          await fetchBooks()
          setShowUploadModal(false)
          resetUploadForm()
          alert(`Book uploaded successfully! ${successCount} of ${uploadForm.chapters.length} chapters uploaded.`)
        } else {
          await fetchBooks()
          setShowUploadModal(false)
          resetUploadForm()
          alert('Book created successfully!')
        }
      } else {
        const errorText = await response.text()
        console.error('Upload error:', errorText)
        alert(`Failed to upload book: ${errorText}`)
      }
    } catch (error) {
      console.error('Failed to upload book:', error)
      alert('Failed to upload book')
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/books/${bookId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (response.ok) {
        await fetchBooks()
        alert('Book deleted successfully')
      }
    } catch (error) {
      console.error('Failed to delete book:', error)
      alert('Failed to delete book')
    }
  }

  const handleTogglePublish = async (book: Book) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/books/${book.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isPublished: !book.isPublished })
        }
      )

      if (response.ok) {
        await fetchBooks()
      }
    } catch (error) {
      console.error('Failed to toggle publish status:', error)
    }
  }

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      author: '',
      description: '',
      genre: 'WEREWOLF',
      tags: '',
      coverImage: '',
      coverImageFile: null,
      chapters: [],
      bulkChapters: ''
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const parseChapters = (text: string) => {
    // Parse chapters separated by single blank line
    // Split by double newlines (one blank line between chapters)
    const chapterBlocks = text.split(/\n\s*\n/)
    
    const chapters = chapterBlocks.map((block, index) => {
      const trimmedBlock = block.trim()
      if (!trimmedBlock) return null
      
      const lines = trimmedBlock.split('\n')
      let title = `Chapter ${index + 1}`
      let content = trimmedBlock
      
      // Check if first line looks like a chapter title
      if (lines.length > 0) {
        const firstLine = lines[0].trim()
        // Check for patterns like "Chapter 1", "Chapter 1: Title", "Chapter 1 - Title"
        const chapterMatch = firstLine.match(/^Chapter\s+(\d+)[:\-\s]*(.*)?$/i)
        if (chapterMatch) {
          const chapterNum = chapterMatch[1]
          const chapterTitle = chapterMatch[2]?.trim()
          title = chapterTitle ? `Chapter ${chapterNum}: ${chapterTitle}` : `Chapter ${chapterNum}`
          // Remove title line from content
          content = lines.slice(1).join('\n').trim()
        } else if (firstLine.length < 100 && !firstLine.includes('.')) {
          // If first line is short and doesn't look like a sentence, treat as title
          title = firstLine
          content = lines.slice(1).join('\n').trim()
        }
      }
      
      return { title, content }
    }).filter((ch): ch is { title: string; content: string } => ch !== null && ch.content !== '') // Filter out null/empty chapters
    
    return chapters
  }
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadForm(prev => ({ ...prev, coverImageFile: file }))
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setUploadForm(prev => ({ ...prev, coverImage: previewUrl }))
    }
  }

  const handleBulkChapterParse = () => {
    if (!uploadForm.bulkChapters.trim()) {
      alert('Please enter chapter content to parse')
      return
    }
    
    const parsedChapters = parseChapters(uploadForm.bulkChapters)
    
    if (parsedChapters.length === 0) {
      alert('No chapters could be parsed. Please check the format.')
      return
    }
    
    setUploadForm(prev => ({
      ...prev,
      chapters: parsedChapters,
      bulkChapters: '' // Clear bulk input after parsing
    }))
    
    alert(`Successfully parsed ${parsedChapters.length} chapters!`)
  }

  const addChapter = () => {
    setUploadForm(prev => ({
      ...prev,
      chapters: [...prev.chapters, { title: '', content: '' }]
    }))
  }

  const removeChapter = (index: number) => {
    setUploadForm(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index)
    }))
  }

  const updateChapter = (index: number, field: 'title' | 'content', value: string) => {
    setUploadForm(prev => ({
      ...prev,
      chapters: prev.chapters.map((ch, i) => 
        i === index ? { ...ch, [field]: value } : ch
      )
    }))
  }

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (book.author?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'ALL' || 
                         (filterType === 'ADMIN' && book.uploadedBy === 'ADMIN') ||
                         (filterType === 'AUTHOR' && book.uploadedBy === 'AUTHOR') ||
                         (filterType === 'PUBLISHED' && book.isPublished) ||
                         (filterType === 'DRAFT' && !book.isPublished)
    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Management</h1>
            <p className="text-gray-600 mt-1">Manage all books in the platform</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Upload Book
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Total Books</p>
            <p className="text-2xl font-bold">{books.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-teal-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Published</p>
            <p className="text-2xl font-bold">
              {books.filter(b => b.isPublished).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Admin Uploads</p>
            <p className="text-2xl font-bold">
              {books.filter(b => b.uploadedBy === 'ADMIN').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Author Uploads</p>
            <p className="text-2xl font-bold">
              {books.filter(b => b.uploadedBy === 'AUTHOR').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="ALL">All Books</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Drafts</option>
              <option value="ADMIN">Admin Uploads</option>
              <option value="AUTHOR">Author Uploads</option>
            </select>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedBooks.map((book) => (
            <div key={book.id} className="card hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4 overflow-hidden">
                {(book.coverImage || book.coverUrl) ? (
                  <img 
                    src={book.coverImage || book.coverUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-lg line-clamp-1">{book.title}</h3>
                <p className="text-sm text-gray-600">by {book.authorName || book.author || 'Unknown'}</p>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    book.uploadedBy === 'ADMIN' 
                      ? 'bg-blue-100 text-blue-700' 
                      : book.uploadedBy === 'AUTHOR'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {book.uploadedBy || 'ADMIN'}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    book.isPublished 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {book.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>{book._count?.chapters || book.chapters?.length || 0} chapters</p>
                  <p>{book._count?.favorites || book.reads || 0} reads</p>
                  {book.revenue && <p>${book.revenue.toFixed(2)} revenue</p>}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleTogglePublish(book)}
                    className="flex-1 text-xs py-1 px-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {book.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => setEditingBook(book)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="p-1 hover:bg-red-100 rounded"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-pink-500 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Upload New Book</h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      resetUploadForm()
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">Author</label>
                    <input
                      type="text"
                      value={uploadForm.author}
                      onChange={(e) => {
                        const value = e.target.value
                        setUploadForm(prev => ({ ...prev, author: value }))
                        setShowAuthorSuggestions(value.length > 0)
                      }}
                      onBlur={() => setTimeout(() => setShowAuthorSuggestions(false), 200)}
                      className="input-field"
                      autoComplete="off"
                    />
                    {showAuthorSuggestions && uploadForm.author && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {authorSuggestions
                          .filter(s => s.toLowerCase().startsWith(uploadForm.author.toLowerCase()))
                          .map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-pink-50 text-sm"
                              onClick={() => {
                                setUploadForm(prev => ({ ...prev, author: suggestion }))
                                setShowAuthorSuggestions(false)
                              }}
                            >
                              {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Genre</label>
                  <select
                    value={uploadForm.genre}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, genre: e.target.value }))}
                    className="input-field"
                  >
                    <option value="WEREWOLF">Werewolf</option>
                    <option value="VAMPIRE">Vampire</option>
                    <option value="BILLIONAIRE_CEO">Billionaire CEO</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => {
                      const value = e.target.value
                      setUploadForm(prev => ({ ...prev, tags: value }))
                      const lastTag = value.split(',').pop()?.trim()
                      setShowTagSuggestions(!!lastTag && lastTag.length > 0)
                    }}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                    className="input-field"
                    placeholder="alpha, romance, supernatural, etc..."
                    autoComplete="off"
                  />
                  {showTagSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {(() => {
                        const currentTags = uploadForm.tags.split(',').map(t => t.trim())
                        const lastTag = currentTags[currentTags.length - 1]
                        return tagSuggestions
                          .filter(s => s.toLowerCase().startsWith(lastTag.toLowerCase()) && !currentTags.slice(0, -1).includes(s))
                          .map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-pink-50 text-sm"
                              onClick={() => {
                                const tags = uploadForm.tags.split(',').map(t => t.trim())
                                tags[tags.length - 1] = suggestion
                                setUploadForm(prev => ({ ...prev, tags: tags.join(', ') }))
                                setShowTagSuggestions(false)
                              }}
                            >
                              {suggestion}
                            </button>
                          ))
                      })()}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cover Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={uploadForm.coverImage}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, coverImage: e.target.value, coverImageFile: null }))}
                      className="input-field flex-1"
                      placeholder="Enter URL or upload file"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 flex items-center gap-2"
                    >
                      <Image size={18} />
                      Upload
                    </button>
                  </div>
                  {uploadForm.coverImage && (
                    <div className="mt-2">
                      <img src={uploadForm.coverImage} alt="Cover preview" className="h-32 rounded" />
                    </div>
                  )}
                </div>

                {/* Bulk Chapter Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">Bulk Chapter Upload</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Paste all chapters below. Separate each chapter with one blank line.
                    Format: Chapter 1: Title<br/>Content...<br/><br/>Chapter 2: Title<br/>Content...
                  </p>
                  <textarea
                    value={uploadForm.bulkChapters}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, bulkChapters: e.target.value }))}
                    placeholder="Paste all chapters here..."
                    className="input-field font-mono text-sm"
                    rows={8}
                  />
                  <button
                    onClick={handleBulkChapterParse}
                    className="mt-3 w-full btn-primary"
                    type="button"
                  >
                    Parse Chapters
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">
                      Chapters {uploadForm.chapters.length > 0 && `(${uploadForm.chapters.length})`}
                    </label>
                    <button
                      onClick={addChapter}
                      className="text-pink-600 hover:text-pink-700 text-sm flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add Manual Chapter
                    </button>
                  </div>
                  
                  {uploadForm.chapters.map((chapter, index) => (
                    <div key={index} className="border rounded-lg p-4 mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">Chapter {index + 1}</span>
                        <button
                          onClick={() => removeChapter(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={chapter.title}
                        onChange={(e) => updateChapter(index, 'title', e.target.value)}
                        placeholder="Chapter title"
                        className="input-field mb-2"
                      />
                      <textarea
                        value={chapter.content}
                        onChange={(e) => updateChapter(index, 'content', e.target.value)}
                        placeholder="Chapter content..."
                        className="input-field"
                        rows={4}
                      />
                    </div>
                  ))}
                  
                  {uploadForm.chapters.length === 0 && (
                    <p className="text-gray-500 text-center py-4 border rounded-lg">
                      No chapters added yet
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={handleUploadBook}
                    disabled={!uploadForm.title || !uploadForm.author || uploadForm.chapters.length === 0}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    Upload Book
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      resetUploadForm()
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}