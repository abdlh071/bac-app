// src/components/bac/quiz/arabic.ts

import { Question, shuffleArray } from './types';

// دالة مساعدة لإنشاء أسئلة اللغة العربية
const generateArabicQuestions = (section: string, levelNum: number): Question[] => {
  const sectionData: Record<string, any[]> = {
    'linguistic-structure': [
      { question: 'ما هو الفعل المضارع من "كتب"؟', options: ['يكتب', 'كاتب', 'مكتوب', 'كتابة'], correct: 'يكتب' }
    ],
    'intellectual-structure': [
      { question: 'ما هي الفكرة الأساسية في النص؟', options: ['المعنى الرئيسي', 'التفاصيل', 'الأمثلة', 'الخاتمة'], correct: 'المعنى الرئيسي' }
    ],
    'bac-parsing': [
      { question: 'ما إعراب كلمة "طالبٌ" في جملة "هذا طالبٌ مجتهدٌ"؟', options: ['خبر مرفوع', 'مبتدأ مرفوع', 'نعت مرفوع', 'فاعل مرفوع'], correct: 'خبر مرفوع' }
    ],
    'bac-metaphors': [
      { question: 'ما نوع الاستعارة في "بحر من العلم"؟', options: ['استعارة مكنية', 'استعارة تصريحية', 'استعارة تبعية', 'كناية'], correct: 'استعارة تصريحية' }
    ],
    'bac-questions': [
      { question: 'ما هو البحر الشعري للبيت التالي: فعولن مفاعيلن فعولن مفاعلن؟', options: ['البحر الطويل', 'البحر البسيط', 'البحر الكامل', 'البحر الوافر'], correct: 'البحر الطويل' }
    ]
  };

  const questions = sectionData[section] || [];
  if (questions.length === 0) {
    return [{
      id: `ar-${section}-l${levelNum}-q1`,
      type: 'grammar-mcq' as const,
      questionText: `سؤال ${section} - المستوى ${levelNum}`,
      options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
      correct: 'خيار 1'
    }];
  }

  return questions.slice(0, 1).map((item, index) => ({
    id: `ar-${section}-l${levelNum}-q${index + 1}`,
    type: 'grammar-mcq' as const,
    questionText: item.question,
    options: shuffleArray([...item.options]),
    correct: item.correct
  }));
};

export const arabicQuizData = {
  sections: {
    'linguistic-structure': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateArabicQuestions('linguistic-structure', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'intellectual-structure': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateArabicQuestions('intellectual-structure', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'bac-parsing': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateArabicQuestions('bac-parsing', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'bac-metaphors': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateArabicQuestions('bac-metaphors', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'bac-questions': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateArabicQuestions('bac-questions', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
  },
};
