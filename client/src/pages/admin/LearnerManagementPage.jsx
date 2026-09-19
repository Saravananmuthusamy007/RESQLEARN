import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  CheckCircle2,
  Lock,
  Award,
  Eye,
  X,
  Activity,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const LearnerManagementPage = () => {
  const [learners, setLearners] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [learnerDetails, setLearnerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const res = await api.get(`/admin/learners?search=${encodeURIComponent(search)}`);
        if (res.success) {
          setLearners(res.learners);
        }
      } catch (err) {
        console.error('Error fetching learners:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchLearners();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleViewLearner = async (learner) => {
    setSelectedLearner(learner);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/admin/learners/${learner.id}`);
      if (res.success) {
        setLearnerDetails(res);
      }
    } catch (err) {
      console.error('Error loading learner details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-mono font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>TRAINEE CADET ROSTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Learner Management & Auditing</h1>
          <p className="text-xs text-slate-400 mt-0.5">Search, monitor progress, inspect simulation runs, and verify certifications.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by cadet name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Learners Table */}
      <div className="glass-card rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Cadet Name & Email</th>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4 text-center">Completed Levels</th>
                <th className="py-3.5 px-4 text-center">Sim Runs</th>
                <th className="py-3.5 px-4 text-center">Certification</th>
                <th className="py-3.5 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 font-mono">
                    Loading cadet records...
                  </td>
                </tr>
              ) : learners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 font-mono">
                    No learners found matching search criteria.
                  </td>
                </tr>
              ) : (
                learners.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{l.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{l.email}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {l.profile?.organization || 'Independent Cadet'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center space-x-1 font-mono font-bold text-xs">
                        <span className={l.completedCount === 5 ? 'text-emerald-400' : 'text-cyan-400'}>
                          {l.completedCount} / 5
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {l.attemptCount || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {l.isCertified ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>CERTIFIED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800 text-[10px]">
                          <span>In Training</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewLearner(l)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 font-semibold text-xs flex items-center space-x-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Learner Drill-Down Detail Modal */}
      {selectedLearner && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedLearner.name}</h2>
                <div className="text-xs text-slate-400 font-mono">{selectedLearner.email}</div>
              </div>
              <button
                onClick={() => setSelectedLearner(null)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                Fetching telemetry audit history...
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Level Mastery Breakdown */}
                <div>
                  <h3 className="font-bold text-slate-300 font-mono uppercase tracking-wider mb-2">
                    Level Mastery Matrix (1–5)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((lvlNum) => {
                      const m = learnerDetails?.masteries?.find(item => item.levelNumber === lvlNum);
                      const isDone = m?.status === 'completed';
                      return (
                        <div
                          key={lvlNum}
                          className={`p-3 rounded-xl border text-center font-mono ${
                            isDone
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="font-bold text-[11px]">Level {lvlNum}</div>
                          <div className="text-[10px] mt-1">{isDone ? 'COMPLETED' : m?.status || 'LOCKED'}</div>
                          <div className="text-[10px] text-cyan-400 mt-0.5">{m?.practicalScore || 0}% / {m?.assessmentScore || 0}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Simulation Runs */}
                <div>
                  <h3 className="font-bold text-slate-300 font-mono uppercase tracking-wider mb-2">
                    Simulation Attempt Audit Log
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {learnerDetails?.attempts?.length > 0 ? (
                      learnerDetails.attempts.map((att, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-white">Level {att.levelNumber}: </span>
                            <span className={att.isPassed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {att.practicalScore}% ({att.isPassed ? 'Passed' : 'Failed'})
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Accuracy: {att.actionAccuracy}% | Seq: {att.sequenceScore}% | Time: {att.timeScore}% | Mistakes: {att.mistakes}
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {new Date(att.completedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 py-3 text-center">No simulation attempts on record.</div>
                    )}
                  </div>
                </div>

                {/* Certificate Inspection */}
                {learnerDetails?.certificate && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-1 font-mono">
                    <div className="text-amber-400 font-bold flex items-center space-x-1.5">
                      <Award className="w-4 h-4" />
                      <span>OFFICIAL CERTIFICATE: {learnerDetails.certificate.certificateId}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 break-all">
                      SHA-256: {learnerDetails.certificate.sha256Hash}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerManagementPage;
