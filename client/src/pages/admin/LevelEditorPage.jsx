import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookOpen, Save, CheckCircle2, History, AlertCircle, Layers } from 'lucide-react';

export const LevelEditorPage = () => {
  const [levels, setLevels] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [currentLevel, setCurrentLevel] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [overview, setOverview] = useState('');
  const [actionAccuracyWeight, setActionAccuracyWeight] = useState(0.40);
  const [sequenceScoreWeight, setSequenceScoreWeight] = useState(0.35);
  const [timeScoreWeight, setTimeScoreWeight] = useState(0.25);
  const [mistakePenalty, setMistakePenalty] = useState(5);
  const [changeSummary, setChangeSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await api.get('/levels');
        if (res.success && res.levels.length > 0) {
          setLevels(res.levels);
          setSelectedLevelId(res.levels[0].id || res.levels[0].levelNumber.toString());
        }
      } catch (err) {
        console.error('Error fetching levels:', err);
      }
    };

    fetchLevels();
  }, []);

  useEffect(() => {
    if (!selectedLevelId) return;

    const fetchLevelDetail = async () => {
      try {
        const res = await api.get(`/levels/${selectedLevelId}`);
        if (res.success && res.level) {
          const lvl = res.level;
          setCurrentLevel(lvl);
          setTitle(lvl.title);
          setDescription(lvl.description);
          setOverview(lvl.learningContent?.overview || '');
          setActionAccuracyWeight(lvl.scoringConfig?.actionAccuracyWeight || 0.40);
          setSequenceScoreWeight(lvl.scoringConfig?.sequenceScoreWeight || 0.35);
          setTimeScoreWeight(lvl.scoringConfig?.timeScoreWeight || 0.25);
          setMistakePenalty(lvl.scoringConfig?.mistakePenalty || 5);
          setChangeSummary(`Updated configuration for Level ${lvl.levelNumber}`);
        }
      } catch (err) {
        console.error('Error fetching level details:', err);
      }
    };

    fetchLevelDetail();
  }, [selectedLevelId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentLevel || isSaving) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        title,
        description,
        learningContent: {
          ...currentLevel.learningContent,
          overview,
        },
        scoringConfig: {
          actionAccuracyWeight: Number(actionAccuracyWeight),
          sequenceScoreWeight: Number(sequenceScoreWeight),
          timeScoreWeight: Number(timeScoreWeight),
          mistakePenalty: Number(mistakePenalty),
          passingThreshold: 75,
        },
        changeSummary: changeSummary.trim() || `Config updated by Medical Director`,
      };

      const res = await api.put(`/levels/${currentLevel._id}`, payload);
      if (res.success) {
        setSaveSuccess(true);
        setCurrentLevel(res.level);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      alert(err.message || 'Error updating level configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-mono font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CURRICULUM VERSION CONTROL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Level Configuration & Versioning</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Modifying scoring weights, instructions, or thresholds automatically creates an immutable <strong>LevelVersion</strong> snapshot preserving historical attempt validity.
        </p>
      </div>

      {/* Level Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {levels.map((lvl) => (
          <button
            key={lvl.id || lvl.levelNumber}
            onClick={() => setSelectedLevelId(lvl.id || lvl.levelNumber.toString())}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all flex items-center space-x-2 ${
              selectedLevelId === (lvl.id || lvl.levelNumber.toString())
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-950/30'
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
            }`}
          >
            <span>LEVEL 0{lvl.levelNumber}</span>
            <span className="text-[10px] opacity-80">v{lvl.currentVersion || 1}.0</span>
          </button>
        ))}
      </div>

      {/* Editor Form */}
      {currentLevel && (
        <form onSubmit={handleSave} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="text-sm font-bold text-white font-mono">
                Level {currentLevel.levelNumber}: {title}
              </div>
              <div className="text-xs text-amber-400 font-mono flex items-center space-x-1.5 mt-0.5">
                <History className="w-3.5 h-3.5" />
                <span>Current Active Version: v{currentLevel.currentVersion || 1}.0</span>
              </div>
            </div>

            {saveSuccess && (
              <div className="flex items-center space-x-1 text-xs text-emerald-400 font-mono font-bold bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>New Version Created!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Level Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description (Summary)</label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Clinical Overview & Pathophysiology</label>
              <textarea
                rows={4}
                required
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Scoring Formula Weights Configuration */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              Scoring Weights Configuration (Must sum to 1.00)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Action Accuracy (0.40)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={actionAccuracyWeight}
                  onChange={(e) => setActionAccuracyWeight(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Sequence Adherence (0.35)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={sequenceScoreWeight}
                  onChange={(e) => setSequenceScoreWeight(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Time Pacing (0.25)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={timeScoreWeight}
                  onChange={(e) => setTimeScoreWeight(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mistake Penalty (-5 pts)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={mistakePenalty}
                  onChange={(e) => setMistakePenalty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Change Summary / Version Notes (Auditing)
            </label>
            <input
              type="text"
              required
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Explain why this level configuration is being updated..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Saving will increment to version {(currentLevel.currentVersion || 1) + 1}.0 without altering past attempts.</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all font-mono"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Publishing Version...' : 'Deploy New Level Version'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LevelEditorPage;
