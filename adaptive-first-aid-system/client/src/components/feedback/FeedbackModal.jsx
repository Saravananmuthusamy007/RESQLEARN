import React, { useState } from 'react';
import api from '../../services/api';
import { Star, X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '../common/Toast';

const DIFFICULTY_OPTIONS = [
  { id: 'Too Easy', label: 'Too Easy', color: 'text-emerald-400 border-emerald-800/40 bg-emerald-950/20' },
  { id: 'Just Right', label: 'Just Right', color: 'text-blue-400 border-blue-800/40 bg-blue-950/20' },
  { id: 'Challenging', label: 'Challenging', color: 'text-amber-400 border-amber-800/40 bg-amber-950/20' },
  { id: 'Too Hard', label: 'Too Hard', color: 'text-rose-400 border-rose-800/40 bg-rose-950/20' }
];

const FeedbackModal = ({
  levelId = 1,
  levelTitle = '',
  isOpen = false,
  onClose = () => {},
  onSubmitted = () => {}
}) => {
  const { addToast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [difficulty, setDifficulty] = useState('Just Right');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/feedback', {
        levelId: String(levelId),
        rating: Number(rating),
        difficulty,
        comment: comment.trim()
      });

      setSubmitted(true);
      addToast('Thank you! Your feedback has been recorded.', 'success');
      onSubmitted();

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      addToast(err.response?.data?.message || 'Failed to submit feedback. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative my-8 text-gray-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">Feedback Submitted!</h3>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">
              Your evaluation helps our clinical education team continually improve simulation fidelity.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> End-of-Level Assessment
              </span>
              <h2 className="text-2xl font-extrabold text-gray-900 pt-1">
                How was Level {levelId}?
              </h2>
              <p className="text-gray-500 text-xs line-clamp-1">
                {levelTitle || `First-Aid Level ${levelId} Training & Simulation`}
              </p>
            </div>

            {/* 5-Star Interactive Rating */}
            <div className="space-y-2 text-center">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                Overall Experience Rating
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-amber-600 block">
                {rating === 5 && 'Outstanding ⭐⭐⭐⭐⭐'}
                {rating === 4 && 'Very Good ⭐⭐⭐⭐'}
                {rating === 3 && 'Average ⭐⭐⭐'}
                {rating === 2 && 'Needs Improvement ⭐⭐'}
                {rating === 1 && 'Difficult / Confusing ⭐'}
              </span>
            </div>

            {/* Difficulty Perception Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                Difficulty Perception
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDifficulty(opt.id)}
                    className={`py-2 px-2.5 rounded-xl font-bold border transition text-center ${
                      difficulty === opt.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                Feedback & Observations (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="What did you learn? Were the simulation steps clear? Any suggestions?"
                className="w-full text-xs p-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
              >
                Skip / Later
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
