import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  MessageSquare,
  Star,
  Filter,
  Search,
  CheckCircle,
  Archive,
  Eye,
  Mail,
  Calendar,
  AlertCircle,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { useToast } from '../../components/common/Toast';

const FeedbackInbox = () => {
  const { addToast } = useToast();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalCount: 0, avgOverallRating: 0, unreadCount: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFeedback();
  }, [levelFilter, ratingFilter, statusFilter, page]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        levelId: levelFilter,
        rating: ratingFilter,
        status: statusFilter,
        search: searchTerm
      };

      const res = await api.get('/admin/feedback', { params });
      setFeedbackList(res.data.feedback || []);
      setTotalPages(res.data.totalPages || 1);
      setStats({
        totalCount: res.data.totalCount || 0,
        avgOverallRating: res.data.avgOverallRating || 0,
        unreadCount: res.data.unreadCount || 0
      });
    } catch (err) {
      console.error('Error fetching admin feedback:', err);
      addToast('Failed to load learner feedback.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFeedback();
  };

  const handleToggleStatus = async (feedbackId, newStatus) => {
    try {
      await api.put(`/admin/feedback/${feedbackId}`, { status: newStatus });
      setFeedbackList(prev =>
        prev.map(f => (f._id === feedbackId ? { ...f, status: newStatus } : f))
      );
      addToast(`Feedback marked as ${newStatus}`, 'success');
      // Update unread count if needed
      if (newStatus === 'read') {
        setStats(prev => ({ ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) }));
      }
    } catch (err) {
      console.error('Error updating feedback status:', err);
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
            Admin Feedback Module
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-indigo-600" /> Learner Feedback Inbox
          </h1>
          <p className="text-gray-500 text-sm">
            Review end-of-level evaluations, star ratings, and clinical scenario perceptions submitted by learners.
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Inbox
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Total Submissions</span>
            <span className="text-3xl font-extrabold text-gray-900 mt-1 block">{stats.totalCount}</span>
            <span className="text-xs text-gray-400">across all 5 training levels</span>
          </div>
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
            <MessageSquare className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Average Satisfaction</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-amber-500">{stats.avgOverallRating}</span>
              <span className="text-xs text-gray-500 font-bold">/ 5.0</span>
            </div>
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Overall Rating
            </span>
          </div>
          <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl">
            <Star className="w-7 h-7 fill-amber-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Unread / Pending</span>
            <span className="text-3xl font-extrabold text-blue-600 mt-1 block">{stats.unreadCount}</span>
            <span className="text-xs text-gray-400">requires review</span>
          </div>
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <Clock className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-md space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search learner name, email, or comment keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-gray-600">
            <Filter className="w-4 h-4 text-gray-400" /> Filters:
          </div>

          {/* Filter by Level */}
          <select
            value={levelFilter}
            onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
            className="p-2 rounded-xl border border-gray-300 font-medium text-gray-700 focus:ring-indigo-500"
          >
            <option value="all">All Levels</option>
            <option value="1">Level 1 (CPR)</option>
            <option value="2">Level 2 (Wound Care)</option>
            <option value="3">Level 3 (Burns)</option>
            <option value="4">Level 4 (Choking)</option>
            <option value="5">Level 5 (Fracture)</option>
          </select>

          {/* Filter by Rating */}
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            className="p-2 rounded-xl border border-gray-300 font-medium text-gray-700 focus:ring-indigo-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
            <option value="4">⭐⭐⭐⭐ 4 Stars</option>
            <option value="3">⭐⭐⭐ 3 Stars</option>
            <option value="2">⭐⭐ 2 Stars</option>
            <option value="1">⭐ 1 Star</option>
          </select>

          {/* Filter by Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="p-2 rounded-xl border border-gray-300 font-medium text-gray-700 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Feedback Item Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-extrabold text-gray-800 text-lg">No Feedback Found</h3>
            <p className="text-gray-500 text-xs max-w-sm mx-auto">
              No learner feedback matches the selected filters. Change filters or search terms.
            </p>
          </div>
        ) : (
          feedbackList.map((item) => {
            const isUnread = item.status === 'unread';

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 transition shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isUnread
                    ? 'border-indigo-300 bg-indigo-50/20 ring-1 ring-indigo-500/20'
                    : item.status === 'archived'
                    ? 'border-gray-200 opacity-70 bg-gray-50/50'
                    : 'border-gray-200'
                }`}
              >
                {/* Left Col: User info & rating */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Level {item.levelId}
                    </span>

                    {/* Star Rating Icons */}
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= item.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Difficulty Badge */}
                    {item.difficulty && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Difficulty: {item.difficulty}
                      </span>
                    )}

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.status === 'unread'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'archived'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-gray-800 font-medium leading-relaxed bg-gray-50/80 p-3 rounded-xl border border-gray-100 italic">
                    "{item.comment || 'No textual comment provided.'}"
                  </p>

                  {/* User details */}
                  <div className="flex items-center gap-4 text-[11px] text-gray-500 flex-wrap">
                    <span className="font-bold text-gray-700">{item.userName}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {item.userEmail}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Right Col: Status Toggles */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {item.status !== 'read' && (
                    <button
                      onClick={() => handleToggleStatus(item._id, 'read')}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center gap-1"
                      title="Mark as Read"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Read
                    </button>
                  )}

                  {item.status === 'read' && (
                    <button
                      onClick={() => handleToggleStatus(item._id, 'unread')}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition flex items-center gap-1"
                      title="Mark as Unread"
                    >
                      <Eye className="w-3.5 h-3.5" /> Mark Unread
                    </button>
                  )}

                  {item.status !== 'archived' ? (
                    <button
                      onClick={() => handleToggleStatus(item._id, 'archived')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl border border-gray-200 transition flex items-center gap-1"
                      title="Archive Feedback"
                    >
                      <Archive className="w-3.5 h-3.5" /> Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(item._id, 'read')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl border border-gray-200 transition flex items-center gap-1"
                      title="Restore from Archive"
                    >
                      Unarchive
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-xl border border-gray-300 font-bold bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="font-bold text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-xl border border-gray-300 font-bold bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackInbox;
