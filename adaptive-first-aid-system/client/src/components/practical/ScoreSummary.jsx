import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, AlertTriangle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Clock, History } from 'lucide-react';

const ScoreSummary = ({ latestResult, attemptsHistory, level, onRetry }) => {
  const navigate = useNavigate();

  if (!latestResult) return null;

  const { passed, compositeScore, practicalThreshold, feedback, attempt } = latestResult;

  return (
    <div className="space-y-6 mt-8">
      {/* Result Hero Banner */}
      <div
        className={`rounded-2xl p-6 sm:p-8 text-white shadow-lg ${
          passed
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : 'bg-gradient-to-r from-amber-600 to-red-600'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4 text-center sm:text-left">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
              {passed ? (
                <CheckCircle2 className="w-12 h-12 text-white" />
              ) : (
                <XCircle className="w-12 h-12 text-white" />
              )}
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-white/80">
                Practical Attempt #{attempt?.attemptNumber || 1} Result
              </span>
              <h2 className="text-3xl font-extrabold">
                {passed ? 'Practical Assessment Passed!' : 'Assessment Threshold Not Met'}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                Required Pass Threshold: {practicalThreshold}% | Your Score: <strong>{compositeScore}%</strong>
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right bg-white/10 px-6 py-4 rounded-xl backdrop-blur-md border border-white/20">
            <span className="text-xs font-semibold uppercase text-white/80 block">Composite Score</span>
            <span className="text-4xl font-extrabold">{compositeScore}%</span>
          </div>
        </div>
      </div>

      {/* Sub-Metrics Breakdown Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 text-blue-600 mr-2" /> Evaluation Metrics Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action Technique */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-700">Action Technique (40%)</span>
              <span className="text-sm font-bold text-blue-600">{attempt?.actionCorrectness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${attempt?.actionCorrectness || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Target Positioning */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-700">Target Positioning (35%)</span>
              <span className="text-sm font-bold text-indigo-600">{attempt?.targetAccuracy}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${attempt?.targetAccuracy || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Protocol Sequence */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-700">Protocol Sequence (25 pts)</span>
              <span className={`text-sm font-bold ${attempt?.sequenceCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {attempt?.sequenceCorrect ? 'Correct (+25)' : 'Incorrect (+0)'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${attempt?.sequenceCorrect ? 'bg-green-500 w-full' : 'bg-red-400 w-1/4'}`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Feedback Panel */}
      {feedback && feedback.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
          <h3 className="text-base font-bold text-amber-900 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" /> Actionable Performance Recommendations
          </h3>
          <ul className="space-y-2">
            {feedback.map((item, idx) => (
              <li key={idx} className="flex items-start text-sm text-amber-800">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 mr-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Practice Simulation Again
        </button>

        {passed ? (
          <button
            onClick={() => navigate(`/mcq/${level._id}`)}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            Proceed to Adaptive MCQ Assessment <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <span className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
            Practical pass required ({practicalThreshold}%) to unlock MCQ assessment.
          </span>
        )}
      </div>

      {/* Previous Attempt History Log */}
      {attemptsHistory && attemptsHistory.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <History className="w-5 h-5 text-purple-600 mr-2" /> Simulation Attempt History
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Attempt #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Action %</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Target %</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Sequence</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Composite Score</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attemptsHistory.map((att) => (
                  <tr key={att._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-800">#{att.attemptNumber}</td>
                    <td className="px-4 py-3 text-gray-700">{att.actionCorrectness}%</td>
                    <td className="px-4 py-3 text-gray-700">{att.targetAccuracy}%</td>
                    <td className="px-4 py-3">
                      {att.sequenceCorrect ? (
                        <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">Correct</span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-full">Error</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-blue-600">{att.compositeScore}%</td>
                    <td className="px-4 py-3">
                      {att.passed ? (
                        <span className="inline-flex items-center text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full">
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreSummary;
