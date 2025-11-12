'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Save, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, 
  BookOpen, Upload, AlertCircle, Check, X, FileText, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
  isFree: boolean;
  coinCost: number;
}

interface Book {
  id: string;
  title: string;
  authorName: string;
  description: string;
  coverUrl: string;
  genre: string[];
  status: string;
  chapters: Chapter[];
}

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'chapters' | 'upload'>('chapters');
  
  // Chapter editing state
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Upload state
  const [bulkChapters, setBulkChapters] = useState('');
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Book metadata state
  const [bookMetadata, setBookMetadata] = useState({
    title: '',
    authorName: '',
    description: '',
    coverUrl: '',
    genre: [] as string[],
    status: ''
  });

  useEffect(() => {
    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app'}/api/admin/books/${bookId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const bookData = data.success ? data.data : data;
        setBook(bookData);
        setBookMetadata({
          title: bookData.title,
          authorName: bookData.authorName,
          description: bookData.description || '',
          coverUrl: bookData.coverUrl || '',
          genre: bookData.genre || [],
          status: bookData.status
        });
        // Auto-select first chapter if available
        if (bookData.chapters && bookData.chapters.length > 0) {
          setSelectedChapter(bookData.chapters[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch book:', error);
      setUploadStatus({ type: 'error', message: 'Failed to load book data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMetadata = async () => {
    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/books/update-metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          bookId,
          ...bookMetadata
        })
      });

      if (response.ok) {
        setUploadStatus({ type: 'success', message: 'Book metadata updated successfully!' });
        fetchBook();
      } else {
        throw new Error('Failed to update metadata');
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Failed to update book metadata' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter({ ...chapter });
  };

  const handleSaveChapter = async () => {
    if (!editingChapter) return;

    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/chapters/${editingChapter.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          title: editingChapter.title,
          content: editingChapter.content,
          formatContent: false  // Don't auto-format to preserve your spacing
        })
      });

      if (response.ok) {
        setUploadStatus({ type: 'success', message: 'Chapter updated successfully!' });
        setEditingChapter(null);
        fetchBook();
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to update chapter');
      }
    } catch (error: any) {
      setUploadStatus({ type: 'error', message: error.message || 'Failed to update chapter' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (chapterNumber: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/books/${bookId}/chapters/${chapterNumber}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setUploadStatus({ type: 'success', message: `Chapter ${chapterNumber} deleted successfully!` });
        setShowDeleteConfirm(null);
        fetchBook();
      } else {
        throw new Error('Failed to delete chapter');
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Failed to delete chapter' });
    }
  };

  const parseChapters = (text: string) => {
    // Look for chapter markers and split ONLY at those points
    // This preserves all spacing within chapters
    const lines = text.split('\n');
    const chapters = [];
    let currentChapter = null;
    let contentLines = [];
    const baseNumber = (book?.chapters?.length || 0) + 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Check if this line is a chapter marker
      const chapterMatch = trimmedLine.match(/^Chapter\s+(\d+)[:\-\s]*(.*)?$/i);
      
      if (chapterMatch) {
        // Save previous chapter if exists
        if (currentChapter && contentLines.length > 0) {
          currentChapter.content = contentLines.join('\n').trim();
          if (currentChapter.content) {
            chapters.push(currentChapter);
          }
        }
        
        // Start new chapter
        const chapterNum = parseInt(chapterMatch[1]);
        const chapterTitle = chapterMatch[2]?.trim();
        currentChapter = {
          number: chapterNum,
          title: chapterTitle || `Chapter ${chapterNum}`,
          content: ''
        };
        contentLines = [];
      } else {
        // This is content, not a chapter marker
        // Add it to current chapter content (preserving blank lines)
        contentLines.push(line);
      }
    }
    
    // Don't forget the last chapter
    if (currentChapter && contentLines.length > 0) {
      currentChapter.content = contentLines.join('\n').trim();
      if (currentChapter.content) {
        chapters.push(currentChapter);
      }
    }
    
    // If no chapters were found with markers, treat entire text as one chapter
    if (chapters.length === 0 && text.trim()) {
      chapters.push({
        number: baseNumber,
        title: `Chapter ${baseNumber}`,
        content: text.trim()
      });
    }
    
    return chapters;
  };

  const handleBulkUpload = async () => {
    try {
      setSaving(true);
      
      // Parse the chapters
      const parsedChapters = parseChapters(bulkChapters);
      
      if (parsedChapters.length === 0) {
        setUploadStatus({ type: 'error', message: 'No chapters could be parsed. Please check the format.' });
        return;
      }

      // Upload chapters one at a time using the working endpoint on Railway
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app';
      
      let successCount = 0;
      const failedChapters = [];
      
      // Get current chapter count to determine starting chapter number
      const currentChapterCount = book?.chapters?.length || 0;
      
      for (let i = 0; i < parsedChapters.length; i++) {
        const chapter = parsedChapters[i];
        const chapterNumber = currentChapterCount + i + 1;
        
        try {
          const response = await fetch(`${apiUrl}/api/admin/books/${bookId}/chapters`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              title: chapter.title,
              content: chapter.content,
              chapterNumber: chapterNumber,
              wordCount: chapter.content.split(/\s+/).length,
              isFree: chapterNumber <= 5,
              coinCost: chapterNumber <= 5 ? 0 : 20
            })
          });
          
          if (response.ok) {
            successCount++;
          } else {
            const error = await response.text();
            console.error(`Failed to upload chapter ${chapterNumber}:`, error);
            failedChapters.push(chapterNumber);
          }
        } catch (error) {
          console.error(`Error uploading chapter ${chapterNumber}:`, error);
          failedChapters.push(chapterNumber);
        }
      }
      
      if (successCount > 0) {
        const message = failedChapters.length > 0 
          ? `Added ${successCount} chapters. Failed: ${failedChapters.join(', ')}`
          : `Successfully added ${successCount} chapters!`;
        
        setUploadStatus({ 
          type: failedChapters.length > 0 ? 'error' : 'success', 
          message 
        });
        setBulkChapters('');
        fetchBook();
        setActiveTab('chapters');
      } else {
        throw new Error('Failed to upload any chapters');
      }
    } catch (error: any) {
      setUploadStatus({ type: 'error', message: error.message || 'Failed to upload chapters' });
    } finally {
      setSaving(false);
    }
  };

  const navigateChapter = (direction: number) => {
    if (!book?.chapters || !selectedChapter) return;
    
    const currentIndex = book.chapters.findIndex(ch => ch.id === selectedChapter.id);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < book.chapters.length) {
      setSelectedChapter(book.chapters[newIndex]);
      setEditingChapter(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/books" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{book?.title}</h1>
                  <p className="text-gray-600">by {book?.authorName}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('metadata')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'metadata' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Book Info
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'chapters' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Chapters
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'upload' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Add Chapters
                </button>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {uploadStatus.type && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              uploadStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {uploadStatus.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {uploadStatus.message}
            </div>
          )}

          {/* Metadata Tab */}
          {activeTab === 'metadata' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Book Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={bookMetadata.title}
                    onChange={(e) => setBookMetadata({ ...bookMetadata, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    value={bookMetadata.authorName}
                    onChange={(e) => setBookMetadata({ ...bookMetadata, authorName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={bookMetadata.description}
                    onChange={(e) => setBookMetadata({ ...bookMetadata, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover URL</label>
                  <input
                    type="text"
                    value={bookMetadata.coverUrl}
                    onChange={(e) => setBookMetadata({ ...bookMetadata, coverUrl: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <button
                  onClick={handleSaveMetadata}
                  disabled={saving}
                  className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Book Info'}
                </button>
              </div>
            </div>
          )}

          {/* Chapters Tab */}
          {activeTab === 'chapters' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Chapter List */}
              <div className="col-span-4 bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Chapters ({book?.chapters?.length || 0})</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {book?.chapters?.map((chapter) => (
                    <div
                      key={chapter.id}
                      onClick={() => {
                        setSelectedChapter(chapter);
                        setEditingChapter(null);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChapter?.id === chapter.id
                          ? 'bg-pink-100 border-2 border-pink-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-semibold">Chapter {chapter.chapterNumber}</div>
                      <div className="text-sm text-gray-600 truncate">{chapter.title}</div>
                      <div className="text-xs text-gray-500">{chapter.wordCount} words</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chapter Editor */}
              <div className="col-span-8 bg-white rounded-lg shadow-lg p-6">
                {selectedChapter ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">
                        Chapter {selectedChapter.chapterNumber}: {editingChapter ? 'Editing' : selectedChapter.title}
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigateChapter(-1)}
                          disabled={!book?.chapters || book.chapters[0].id === selectedChapter.id}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigateChapter(1)}
                          disabled={!book?.chapters || book.chapters[book.chapters.length - 1].id === selectedChapter.id}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingChapter ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Title</label>
                          <input
                            type="text"
                            value={editingChapter.title}
                            onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content ({editingChapter.content.split(/\s+/).length} words)
                          </label>
                          <textarea
                            value={editingChapter.content}
                            onChange={(e) => setEditingChapter({ ...editingChapter, content: e.target.value })}
                            rows={20}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 font-mono text-sm whitespace-pre-wrap"
                            placeholder="Add your chapter content here...

Use multiple line breaks for spacing between paragraphs or dialogue."
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Tip: Use multiple line breaks (press Enter multiple times) to create spacing between paragraphs or dialogue sections.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveChapter}
                            disabled={saving}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => setEditingChapter(null)}
                            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-700 mb-2">{selectedChapter.title}</h3>
                          <div className="text-sm text-gray-500 mb-4">
                            {selectedChapter.wordCount} words • 
                            {selectedChapter.isFree ? ' Free' : ` ${selectedChapter.coinCost} coins`}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-[400px] overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-serif text-gray-800">
                            {selectedChapter.content}
                          </pre>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditChapter(selectedChapter)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          >
                            <Edit2 className="w-4 h-4 inline mr-2" />
                            Edit Chapter
                          </button>
                          {showDeleteConfirm === selectedChapter.id ? (
                            <>
                              <button
                                onClick={() => handleDeleteChapter(selectedChapter.chapterNumber)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                              >
                                Confirm Delete
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setShowDeleteConfirm(selectedChapter.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4 inline mr-2" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a chapter to view or edit</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Add New Chapters</h2>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Current book has {book?.chapters?.length || 0} chapters.</strong>
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      New chapters will continue from Chapter {(book?.chapters?.length || 0) + 1}.
                      Paste all chapters below, separated by blank lines. Format: Chapter X: Title
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulk Chapter Upload
                </label>
                <textarea
                  value={bulkChapters}
                  onChange={(e) => setBulkChapters(e.target.value)}
                  placeholder={`Paste all chapters here. Separate each chapter with one blank line.
Format: Chapter ${(book?.chapters?.length || 0) + 1}: Title
Content...

Chapter ${(book?.chapters?.length || 0) + 2}: Title
Content...

OR just paste the full text and click "Parse Chapters"`}
                  rows={15}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 font-mono text-sm"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleBulkUpload}
                    disabled={saving || !bulkChapters.trim()}
                    className="flex-1 bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
                  >
                    {saving ? 'Uploading...' : 'Parse & Add Chapters'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}