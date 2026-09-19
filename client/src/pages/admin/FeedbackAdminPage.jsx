import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { MessageSquare, Star, User, Clock, CheckCircle } from 'lucide-react';

export const FeedbackAdminPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await api.get('/feedback');
        if (res.success) {
          setFeedbacks(res.feedbacks);
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-blue-300 text-xs font-mono font-semibold mb-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>TRAINEE CADET REVIEWS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Simulation Feedback Registry</h1>
        <p className="text-xs text-slate-400 mt-0.5">Review cadet satisfaction scores, bug reports, and UX recommendations.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            Loading feedback entries...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-8 rounded-2xl glass-card text-center text-slate-500 font-mono text-xs">
            No feedback entries received yet.
          </div>
        ) : (
          feedbacks.map((f) => (
            <div
              key={f._id}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400">
                    {f.learner?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{f.learner?.name || 'Anonymous Cadet'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{f.learner?.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 font-semibold text-[10px]">
                    {f.category}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[...Array(f.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                "{f.message}"
              </p>

              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>Submitted: {new Date(f.createdAt).toLocaleString()}</span>
                <span className="text-emerald-400">✓ Logged in Clinical Audit</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackAdminPage;
