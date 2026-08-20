import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { HelpCircle, Plus, Edit, Trash2, Search, Filter, Check, X, Tag } from 'lucide-react';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    level: '',
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    difficulty: 'medium',
    tags: '',
    explanation: ''
  });

  useEffect(() => {
    fetchLevels();
    fetchQuestions();
  }, [selectedLevel, selectedDifficulty]);

  const fetchLevels = async () => {
    try {
      const res = await api.get('/levels');
      setLevels(res.data);
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedLevel) params.levelId = selectedLevel;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const res = await api.get('/admin/questions', { params });
      setQuestions(res.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (q = null) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({
        level: q.level?._id || q.level,
        questionText: q.questionText,
        options: [...q.options],
        correctOptionIndex: q.correctOptionIndex,
        difficulty: q.difficulty,
        tags: q.tags ? q.tags.join(', ') : '',
        explanation: q.explanation || ''
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        level: levels.length > 0 ? levels[0]._id : '',
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        difficulty: 'medium',
        tags: 'technique, safety',
        explanation: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion._id}`, payload);
      } else {
        await api.post('/admin/questions', payload);
      }

      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting question');
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Admin Management
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Question Bank Portal</h1>
          <p className="text-gray-600 text-sm">
            Create, edit, tag, and filter MCQ assessment questions across all First-Aid levels.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Question
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-md flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Levels</option>
            {levels.map(l => (
              <option key={l._id} value={l._id}>Level {l.order}: {l.title.substring(0, 20)}...</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500 font-medium">Loading question bank...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No questions found matching your filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold uppercase">
                  <th className="p-4">Level</th>
                  <th className="p-4">Question Text</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuestions.map((q) => (
                  <tr key={q._id} className="hover:bg-gray-50/80">
                    <td className="p-4 font-bold text-gray-900 whitespace-nowrap">
                      Level {q.level?.order || 1}
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">{q.questionText}</p>
                      <p className="text-[11px] text-emerald-700 font-mono mt-1">
                        Correct: Option {String.fromCharCode(65 + q.correctOptionIndex)} ({q.options[q.correctOptionIndex]})
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full uppercase font-bold text-[10px] border ${
                        q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        q.difficulty === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-purple-100 text-purple-800 border-purple-300'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {q.tags && q.tags.map((t, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded text-[10px] border">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleOpenModal(q)}
                        className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                        title="Edit Question"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Question Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingQuestion ? 'Edit Question' : 'Create New MCQ Question'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  >
                    {levels.map(l => (
                      <option key={l._id} value={l._id}>Level {l.order}: {l.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Question Prompt</label>
                <textarea
                  rows="2"
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter clear first-aid question..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700">4 Multiple Choice Options</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-7 text-center font-bold text-gray-500">{String.fromCharCode(65 + idx)}:</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[idx] = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                      className="flex-grow p-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correctOptionIndex === idx}
                      onChange={() => setFormData({ ...formData, correctOptionIndex: idx })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] text-gray-500 font-semibold">Correct</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="sequence, technique, target-area, safety, timing"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Explanation Note</label>
                <input
                  type="text"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain why the correct answer is right..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow transition"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
