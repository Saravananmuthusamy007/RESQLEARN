import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Award, ArrowRight, RotateCcw, HelpCircle, Check, X } from 'lucide-react';

const MCQResultSummary = ({ result, level, onRetry }) => {
  const navigate = useNavigate();

  if (!result) return null;

  const { score, passed, mcqThreshold, correctCount, totalQuestions, results, levelCompleted, nextLevelUnlocked } = result;

  return (
    <div className="space-y-8 mt-6">
      {/* Result Hero Banner */}
      <div
        className={`rounded-2xl p-6 sm:p-8 text-white shadow-lg ${
          passed
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700'
            : 'bg-gradient-to-r from-red-600 via-amber-600 to-rose-700'
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
                Adaptive MCQ Assessment Result
              </span>
              <h2 className="text-3xl font-extrabold">
                {passed ? 'MCQ Assessment Passed!' : 'Pass Threshold Not Met'}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                Score: <strong>{score}%</strong> ({correctCount} / {totalQuestions} correct) | Required: {mcqThreshold}%
              </p>

              {levelCompleted && (
                <div className="mt-3 inline-flex items-center bg-yellow-400 text-yellow-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                  <Award className="w-4 h-4 mr-1" /> Level {level?.order} Complete! {nextLevelUnlocked && '• Next Level Unlocked'}
                </div>
              )}
            </div>
          </div>

          <div className="text-center sm:text-right bg-white/10 px-6 py-4 rounded-xl backdrop-blur-md border border-white/20">
            <span className="text-xs font-semibold uppercase text-white/80 block">MCQ Score</span>
            <span className="text-4xl font-extrabold">{score}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Retry Adaptive Quiz
        </button>

        {passed ? (
          <button
            onClick={() => navigate('/levels')}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            Return to Levels Dashboard <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <span className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
            Review detailed question explanations below and retry the quiz.
          </span>
        )}
      </div>

      {/* Detailed Question Review */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-3 flex items-center">
          <HelpCircle className="w-5 h-5 text-blue-600 mr-2" /> Detailed Answer Explanations
        </h3>

        <div className="space-y-6">
          {results && results.map((item, idx) => (
            <div
              key={item.questionId || idx}
              className={`p-5 rounded-2xl border-2 transition ${
                item.correct ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="font-bold text-gray-900 text-base">
                  {idx + 1}. {item.questionText}
                </h4>
                {item.correct ? (
                  <span className="inline-flex items-center text-xs bg-green-600 text-white font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                    <Check className="w-3.5 h-3.5 mr-1" /> Correct (+1)
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs bg-red-600 text-white font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                    <X className="w-3.5 h-3.5 mr-1" /> Incorrect (0)
                  </span>
                )}
              </div>

              {/* Options Review List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
                {item.options.map((optText, optIdx) => {
                  const isSelected = item.selectedOption === optIdx;
                  const isCorrectOpt = item.correctOptionIndex === optIdx;

                  let optStyle = 'bg-gray-100 text-gray-700 border-gray-200';
                  if (isCorrectOpt) {
                    optStyle = 'bg-green-600 text-white border-green-600 font-bold';
                  } else if (isSelected && !item.correct) {
                    optStyle = 'bg-red-600 text-white border-red-600 font-bold';
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                    >
                      <span>
                        <strong>{String.fromCharCode(65 + optIdx)}.</strong> {optText}
                      </span>
                      {isCorrectOpt && <Check className="w-4 h-4 ml-1 flex-shrink-0" />}
                      {isSelected && !isCorrectOpt && <X className="w-4 h-4 ml-1 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Note */}
              <div className="mt-3 p-3 bg-white/80 rounded-xl border border-gray-200 text-xs text-gray-700">
                <span className="font-bold text-gray-900">Explanation: </span>
                {item.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MCQResultSummary;
