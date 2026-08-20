import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const ManageLevels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    videoUrl: '',
    instructionsText: '',
    practicalThreshold: 80,
    mcqThreshold: 70
  });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/levels');
      setLevels(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch levels');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (level = null) => {
    if (level) {
      setEditingLevel(level);
      setFormData({
        title: level.title || '',
        description: level.description || '',
        order: level.order || 1,
        videoUrl: level.videoUrl || '',
        instructionsText: level.instructions ? level.instructions.join('\n') : '',
        practicalThreshold: level.practicalThreshold || 80,
        mcqThreshold: level.mcqThreshold || 70
      });
    } else {
      setEditingLevel(null);
      setFormData({
        title: '',
        description: '',
        order: levels.length + 1,
        videoUrl: '',
        instructionsText: '',
        practicalThreshold: 80,
        mcqThreshold: 70
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      title: formData.title,
      description: formData.description,
      order: Number(formData.order),
      videoUrl: formData.videoUrl,
      instructions: formData.instructionsText.split('\n').filter(line => line.trim().length > 0),
      practicalThreshold: Number(formData.practicalThreshold),
      mcqThreshold: Number(formData.mcqThreshold)
    };

    try {
      if (editingLevel) {
        await api.put(`/levels/${editingLevel._id}`, payload);
        setSuccess('Level updated successfully');
      } else {
        await api.post('/levels', payload);
        setSuccess('Level created successfully');
      }
      setShowModal(false);
      fetchLevels();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save level');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this level?')) return;
    try {
      await api.delete(`/levels/${id}`);
      setSuccess('Level deleted successfully');
      fetchLevels();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete level');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manage First-Aid Levels</h1>
          <p className="text-gray-500 mt-1">Admin level creation, ordering, and content management.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
        >
          <Plus className="w-5 h-5 mr-1" /> Add New Level
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <XCircle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" /> {success}
        </div>
      )}

      {/* Levels Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practical Threshold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MCQ Threshold</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {levels.map((level) => (
              <tr key={level._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                  Level {level.order}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{level.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">{level.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                  {level.practicalThreshold}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                  {level.mcqThreshold}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleOpenModal(level)}
                    className="text-blue-600 hover:text-blue-900 font-semibold inline-flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(level._id)}
                    className="text-red-600 hover:text-red-900 font-semibold inline-flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingLevel ? 'Edit Level' : 'Create New Level'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Order Number</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Video Embed URL</label>
                <input
                  type="url"
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Practical Pass Threshold (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                    value={formData.practicalThreshold}
                    onChange={(e) => setFormData({ ...formData, practicalThreshold: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">MCQ Pass Threshold (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                    value={formData.mcqThreshold}
                    onChange={(e) => setFormData({ ...formData, mcqThreshold: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Step-by-Step Instructions (One per line)</label>
                <textarea
                  rows="5"
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  placeholder="Enter step 1&#10;Enter step 2&#10;Enter step 3"
                  value={formData.instructionsText}
                  onChange={(e) => setFormData({ ...formData, instructionsText: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow"
                >
                  Save Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLevels;
