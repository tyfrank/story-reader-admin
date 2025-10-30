'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Trash2, 
  MessageSquare,
  AlertCircle,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react'

interface Comment {
  id: string;
  content: string;
  type: 'FEEDBACK' | 'SUGGESTION' | 'APPRECIATION';
  createdAt: string;
  isVisible: boolean;
  likeCount: number;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
  chapter: {
    id: string;
    title: string;
    chapterNumber: number;
    book: {
      id: string;
      title: string;
    };
  };
}

export default function ModerationPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [books, setBooks] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
    today: 0,
    flagged: 0
  });

  useEffect(() => {
    fetchComments();
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook, selectedStatus]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedBook !== 'all') params.append('bookId', selectedBook);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await fetch(
        `https://story-reader-backend-production.up.railway.app/api/admin/comments?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setComments(data.data || []);
        calculateStats(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(
        `https://story-reader-backend-production.up.railway.app/api/admin/books`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setBooks(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  const calculateStats = (commentList: Comment[]) => {
    const today = new Date().toDateString();
    setStats({
      total: commentList.length,
      visible: commentList.filter(c => c.isVisible).length,
      hidden: commentList.filter(c => !c.isVisible).length,
      today: commentList.filter(c => new Date(c.createdAt).toDateString() === today).length,
      flagged: commentList.filter(c => !c.isVisible).length
    });
  };

  const toggleVisibility = async (commentId: string) => {
    try {
      const response = await fetch(
        `https://story-reader-backend-production.up.railway.app/api/admin/comments/${commentId}/visibility`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to permanently delete this comment?')) return;

    try {
      const response = await fetch(
        `https://story-reader-backend-production.up.railway.app/api/admin/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'APPRECIATION': return 'bg-green-100 text-green-800';
      case 'SUGGESTION': return 'bg-blue-100 text-blue-800';
      case 'FEEDBACK': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComments = comments.filter(comment => {
    if (selectedTab === 'flagged') return !comment.isVisible;
    if (selectedTab === 'visible') return comment.isVisible;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-1">Review and moderate user comments from chapters</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Total Comments</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-teal-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Visible</p>
            <p className="text-2xl font-bold">{stats.visible}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Hidden</p>
            <p className="text-2xl font-bold">{stats.hidden}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Today's Comments</p>
            <p className="text-2xl font-bold">{stats.today}</p>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-pink-500 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Flagged</p>
            <p className="text-2xl font-bold">{stats.flagged}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-500" />
              
              <select 
                value={selectedBook} 
                onChange={(e) => setSelectedBook(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Books</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>

              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Comments</option>
                <option value="visible">Visible Only</option>
                <option value="hidden">Hidden Only</option>
              </select>
            </div>

            <button 
              onClick={fetchComments}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs and Comments */}
        <div className="card">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  selectedTab === 'all'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Comments ({comments.length})
              </button>
              <button
                onClick={() => setSelectedTab('visible')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  selectedTab === 'visible'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Visible ({stats.visible})
              </button>
              <button
                onClick={() => setSelectedTab('flagged')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  selectedTab === 'flagged'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Flagged ({stats.flagged})
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <p className="mt-2 text-gray-600">Loading comments...</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>No comments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border ${
                      !comment.isVisible ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        {/* Book and Chapter Info */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">
                            {comment.chapter.book.title}
                          </span>
                          <span className="text-gray-500 text-sm">•</span>
                          <span className="text-sm text-gray-600">
                            Chapter {comment.chapter.chapterNumber}: {comment.chapter.title}
                          </span>
                        </div>
                        
                        {/* User Info */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {comment.user.displayName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.user.email}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {/* Comment Content */}
                        <p className="text-sm text-gray-700 mb-3">{comment.content}</p>
                        
                        {/* Tags */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCommentTypeColor(comment.type)}`}>
                            {comment.type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            comment.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {comment.isVisible ? 'Visible' : 'Hidden'}
                          </span>
                          {comment.likeCount > 0 && (
                            <span className="text-xs text-gray-500">
                              ❤️ {comment.likeCount} likes
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => toggleVisibility(comment.id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1 ${
                            comment.isVisible 
                              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' 
                              : 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600'
                          }`}
                        >
                          {comment.isVisible ? (
                            <>
                              <EyeOff className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Show
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium rounded hover:from-red-600 hover:to-pink-600 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}