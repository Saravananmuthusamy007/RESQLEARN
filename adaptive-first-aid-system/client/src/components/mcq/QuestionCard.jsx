import React from 'react';
import { Tag, HelpCircle } from 'lucide-react';

const QuestionCard = ({ question, questionIndex, totalQuestions, selectedOption, onSelectOption }) => {
  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'hard':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8 space-y-6">
      {/* Question Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {questionIndex + 1}
          </span>
          <span className="text-sm font-semibold text-gray-500">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {question.difficulty && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${getDifficultyBadge(question.difficulty)}`}>
              {question.difficulty}
            </span>
          )}
          {question.tags && question.tags.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-mono">
              <Tag className="w-3 h-3 mr-1 text-slate-500" /> #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Question Prompt */}
      <h3 className="text-xl font-bold text-gray-900 leading-snug">
        {question.questionText}
      </h3>

      {/* Options List */}
      <div className="space-y-3 pt-2">
        {question.options.map((optText, optIdx) => {
          const isSelected = selectedOption === optIdx;
          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => onSelectOption(optIdx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm text-blue-900 font-semibold'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-base">{optText}</span>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
