'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle, CheckCircle, X, Book, Download } from 'lucide-react'
import { parse } from 'papaparse'
import * as XLSX from 'xlsx'

interface BookData {
  title: string
  author: string
  description: string
  genre: string
  tags: string
  coverUrl?: string
  chapters?: number
  price?: number
  status: 'draft' | 'published'
}

export function BookUpload() {
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single')
  const [books, setBooks] = useState<BookData[]>([])
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      
      if (file.name.endsWith('.csv')) {
        reader.onload = (e) => {
          const text = e.target?.result as string
          parse(text, {
            header: true,
            complete: (results) => {
              const parsedBooks = results.data as BookData[]
              setBooks(parsedBooks)
            },
            error: (error) => {
              setErrors([error.message])
            }
          })
        }
        reader.readAsText(file)
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.onload = (e) => {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(worksheet) as BookData[]
          setBooks(json)
        }
        reader.readAsBinaryString(file)
      } else if (file.name.endsWith('.json')) {
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target?.result as string)
            setBooks(Array.isArray(json) ? json : [json])
          } catch (error) {
            setErrors(['Invalid JSON format'])
          }
        }
        reader.readAsText(file)
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json']
    }
  })

  const handleUpload = async () => {
    setUploading(true)
    setErrors([])
    setSuccess([])

    try {
      const response = await fetch('/api/admin/books/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ books })
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      setSuccess([`Successfully uploaded ${result.count} books`])
      setBooks([])
    } catch (error) {
      setErrors(['Failed to upload books. Please try again.'])
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        title: 'Example Book Title',
        author: 'Author Name',
        description: 'Book description here',
        genre: 'Romance,Fantasy',
        tags: 'tag1,tag2,tag3',
        coverUrl: 'https://example.com/cover.jpg',
        chapters: 20,
        price: 0,
        status: 'draft'
      }
    ]
    
    const csv = parse.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'book-upload-template.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Upload Mode Selector */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setUploadMode('single')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadMode === 'single'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Single Book
        </button>
        <button
          onClick={() => setUploadMode('bulk')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadMode === 'bulk'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bulk Upload
        </button>
      </div>

      {uploadMode === 'single' ? (
        /* Single Book Upload Form */
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter book title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter author name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter book description"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Romance</option>
                  <option>Fantasy</option>
                  <option>Mystery</option>
                  <option>Sci-Fi</option>
                  <option>Thriller</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0 for free"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Book
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Bulk Upload */
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Bulk Book Upload</h2>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                <span>Download Template</span>
              </button>
            </div>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                {isDragActive
                  ? 'Drop the file here...'
                  : 'Drag & drop your file here, or click to select'}
              </p>
              <p className="text-sm text-gray-500">
                Supports CSV, Excel (XLS, XLSX), and JSON formats
              </p>
            </div>
          </div>

          {/* Preview uploaded books */}
          {books.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Preview ({books.length} books)
                </h3>
                <button
                  onClick={() => setBooks([])}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Genre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {books.slice(0, 10).map((book, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {book.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {book.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {book.genre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            book.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {book.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => {
                              setBooks(books.filter((_, i) => i !== index))
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {books.length > 10 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    ...and {books.length - 10} more books
                  </p>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : `Upload ${books.length} Books`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {success.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <div>
              {success.map((msg, index) => (
                <p key={index}>{msg}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}