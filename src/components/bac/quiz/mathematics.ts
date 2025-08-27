// src/components/bac/quiz/mathematics.ts

import { Question, shuffleArray } from './types';

// دالة مساعدة لإنشاء أسئلة الرياضيات
const generateMathematicsQuestions = (section: string, levelNum: number): Question[] => {
  const sectionData: Record<string, any[]> = {
    'functions': [
      { question: 'ما هو مجال الدالة f(x) = 1/x؟', options: ['ℝ - {0}', 'ℝ', '[0, +∞[', ']-∞, 0]'], correct: 'ℝ - {0}' }
    ],
    'sequences': [
      { question: 'ما هو الحد العام للمتتالية الحسابية؟', options: ['Un = U₁ + (n-1)r', 'Un = U₁ × rⁿ⁻¹', 'Un = n²', 'Un = 2n + 1'], correct: 'Un = U₁ + (n-1)r' }
    ],
    'probability': [
      { question: 'ما هو مجموع احتماليات جميع النواتج الممكنة؟', options: ['1', '0', '0.5', 'غير محدد'], correct: '1' }
    ],
    'complex-numbers': [
      { question: 'ما هو الشكل الجبري للعدد المركب؟', options: ['z = a + bi', 'z = r(cos θ + i sin θ)', 'z = re^(iθ)', 'z = |z|'], correct: 'z = a + bi' }
    ],
    'numbers-calculation': [
      { question: 'ما هو أصغر عدد أولي؟', options: ['2', '1', '3', '0'], correct: '2' }
    ],
    'space-geometry': [
      { question: 'كم عدد أوجه المكعب؟', options: ['6', '8', '12', '4'], correct: '6' }
    ]
  };

  const questions = sectionData[section] || [];
  if (questions.length === 0) {
    return [{
      id: `math-${section}-l${levelNum}-q1`,
      type: 'grammar-mcq' as const,
      questionText: `سؤال ${section} - المستوى ${levelNum}`,
      options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
      correct: 'خيار 1'
    }];
  }

  return questions.slice(0, 1).map((item, index) => ({
    id: `math-${section}-l${levelNum}-q${index + 1}`,
    type: 'grammar-mcq' as const,
    questionText: item.question,
    options: shuffleArray([...item.options]),
    correct: item.correct
  }));
};

export const mathematicsQuizData = {
  sections: {
    'functions': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateMathematicsQuestions('functions', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'sequences': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateMathematicsQuestions('sequences', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'probability': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateMathematicsQuestions('probability', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'complex-numbers': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateMathematicsQuestions('complex-numbers', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'numbers-calculation': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateMathematicsQuestions('numbers-calculation', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'space-geometry': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateMathematicsQuestions('space-geometry', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
  },
};
