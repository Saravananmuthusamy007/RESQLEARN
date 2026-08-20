const { recommendQuestionSet } = require('../services/ruleEngine');

describe('Adaptive Rule Engine Tests', () => {
  const defaultLevel = { practicalThreshold: 80, mcqThreshold: 70 };

  test('Strong performer (95% practical, 1 attempt) returns hard-weighted difficulty mix', () => {
    const practicalAttempt = {
      compositeScore: 95,
      attemptNumber: 1,
      responseTimeMs: 30000,
      sequenceCorrect: true,
      actionCorrectness: 95,
      targetAccuracy: 95
    };
    const previousMcqAttempts = [];

    const result = recommendQuestionSet(practicalAttempt, previousMcqAttempts, defaultLevel);

    expect(result.difficultyMix).toEqual({ easy: 0.15, medium: 0.35, hard: 0.50 });
    expect(result.reason).toContain('Difficulty skewed toward hard');
  });

  test('Weak performer (65% practical, 3 attempts) returns easy-weighted difficulty mix', () => {
    const practicalAttempt = {
      compositeScore: 65,
      attemptNumber: 3,
      responseTimeMs: 75000,
      sequenceCorrect: false,
      actionCorrectness: 60,
      targetAccuracy: 55
    };
    const previousMcqAttempts = [];

    const result = recommendQuestionSet(practicalAttempt, previousMcqAttempts, defaultLevel);

    expect(result.difficultyMix).toEqual({ easy: 0.60, medium: 0.30, hard: 0.10 });
    expect(result.reason).toContain('Difficulty skewed toward easy');
    expect(result.focusTags).toContain('sequence');
  });

  test('MCQ retry includes tags from previously missed MCQ questions', () => {
    const practicalAttempt = {
      compositeScore: 85,
      attemptNumber: 1,
      responseTimeMs: 45000,
      sequenceCorrect: true,
      actionCorrectness: 85,
      targetAccuracy: 85
    };
    const previousMcqAttempts = [
      {
        score: 50,
        questions: [
          { correct: false, tagsFromQuestion: ['target-area', 'safety'] },
          { correct: true, tagsFromQuestion: ['timing'] }
        ]
      }
    ];

    const result = recommendQuestionSet(practicalAttempt, previousMcqAttempts, defaultLevel);

    expect(result.focusTags).toContain('target-area');
    expect(result.focusTags).toContain('safety');
    expect(result.reason).toContain('Focusing on:');
  });

  test('Sequence error in practical always prioritizes "sequence" tag', () => {
    const practicalAttempt = {
      compositeScore: 82,
      attemptNumber: 1,
      sequenceCorrect: false,
      actionCorrectness: 85,
      targetAccuracy: 85
    };
    const result = recommendQuestionSet(practicalAttempt, [], defaultLevel);

    expect(result.focusTags).toContain('sequence');
  });
});
