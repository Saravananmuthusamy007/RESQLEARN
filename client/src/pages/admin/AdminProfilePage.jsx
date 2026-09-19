import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Award, Save, CheckCircle2 } from 'lucide-react';

export const AdminProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [organization, setOrganization] = useState(user?.profile?.organization || '');
  const [certNum, setCertNum] = useState(user?.profile?.emergencyCertificationNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile({
        name,
        bio,
        organization,
        emergencyCertificationNumber: certNum,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Error updating administrator profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Medical Director Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage executive credentials and training director information.</p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-950 border border-purple-800 text-purple-400 font-mono font-black text-2xl flex items-center justify-center">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="text-lg font-bold text-white">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
              <div className="text-[11px] font-mono text-purple-400 uppercase font-bold mt-0.5">
                Role: Medical Simulation Director
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Director profile updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Director Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Institution / Authority</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Instructor License ID</label>
              <input
                type="text"
                value={certNum}
                onChange={(e) => setCertNum(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all font-mono"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Update Director Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;
