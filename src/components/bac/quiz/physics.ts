// src/components/bac/quiz/physics.ts

import { Question, shuffleArray } from './types';

// دالة مساعدة لإنشاء أسئلة الفيزياء
const generatePhysicsQuestions = (section: string, levelNum: number): Question[] => {
  const sectionData: Record<string, any[]> = {
    'chemical-kinetics': [
      { question: 'ما هي وحدة قياس سرعة التفاعل؟', options: ['mol.L⁻¹.s⁻¹', 'mol.L⁻¹', 's⁻¹', 'mol.s⁻¹'], correct: 'mol.L⁻¹.s⁻¹' }
    ],
    'mechanical-evolution': [
      { question: 'ما هي وحدة قياس الطاقة الحركية؟', options: ['جول (J)', 'نيوتن (N)', 'واط (W)', 'كيلوغرام (kg)'], correct: 'جول (J)' }
    ],
    'electrical-phenomena': [
      { question: 'ما هي وحدة قياس التيار الكهربائي؟', options: ['أمبير (A)', 'فولت (V)', 'أوم (Ω)', 'واط (W)'], correct: 'أمبير (A)' }
    ],
    'chemical-equilibrium': [
      { question: 'ما هو مبدأ لو شاتلييه؟', options: ['التوازن يتحرك ليقاوم التغيير', 'الطاقة تبقى ثابتة', 'الكتلة محفوظة', 'الحجم يتناسب مع الضغط'], correct: 'التوازن يتحرك ليقاوم التغيير' }
    ],
    'chemical-monitoring': [
      { question: 'ما هو الـ pH المحايد؟', options: ['7', '0', '14', '1'], correct: '7' }
    ],
    'nuclear-transformations': [
      { question: 'ما هي جسيمات ألفا؟', options: ['نوى الهيليوم', 'إلكترونات', 'نيوترونات', 'بروتونات'], correct: 'نوى الهيليوم' }
    ]
  };

  const questions = sectionData[section] || [];
  if (questions.length === 0) {
    return [{
      id: `phys-${section}-l${levelNum}-q1`,
      type: 'grammar-mcq' as const,
      questionText: `سؤال ${section} - المستوى ${levelNum}`,
      options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
      correct: 'خيار 1'
    }];
  }

  return questions.slice(0, 1).map((item, index) => ({
    id: `phys-${section}-l${levelNum}-q${index + 1}`,
    type: 'grammar-mcq' as const,
    questionText: item.question,
    options: shuffleArray([...item.options]),
    correct: item.correct
  }));
};

export const physicsQuizData = {
  sections: {
    'chemical-kinetics': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generatePhysicsQuestions('chemical-kinetics', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'mechanical-evolution': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generatePhysicsQuestions('mechanical-evolution', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'electrical-phenomena': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generatePhysicsQuestions('electrical-phenomena', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'chemical-equilibrium': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generatePhysicsQuestions('chemical-equilibrium', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'chemical-monitoring': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generatePhysicsQuestions('chemical-monitoring', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'nuclear-transformations': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generatePhysicsQuestions('nuclear-transformations', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
  },
};
