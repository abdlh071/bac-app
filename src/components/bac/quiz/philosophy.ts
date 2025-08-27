// src/components/bac/quiz/philosophy.ts

import { Question, shuffleArray } from './types';

// أسئلة الأقوال الفلسفية
const philosophicalQuotesQuestions: Question[] = [
  {
    id: 'phil-quotes-q1',
    type: 'grammar-mcq',
    questionText: 'من قال: "أعرف أنني لا أعرف شيئاً"؟',
    options: ['سقراط', 'أفلاطون', 'أرسطو', 'ديكارت'],
    correct: 'سقراط'
  },
  {
    id: 'phil-quotes-q2',
    type: 'grammar-mcq',
    questionText: 'من قال: "أنا أفكر، إذن أنا موجود"؟',
    options: ['ديكارت', 'كانط', 'نيتشه', 'هيجل'],
    correct: 'ديكارت'
  },
  {
    id: 'phil-quotes-q3',
    type: 'grammar-mcq',
    questionText: 'من قال: "الإنسان محكوم عليه أن يكون حراً"؟',
    options: ['سارتر', 'كامو', 'كيركغارد', 'هايدغر'],
    correct: 'سارتر'
  },
  {
    id: 'phil-quotes-q4',
    type: 'grammar-mcq',
    questionText: 'من قال: "لا يمكن للمرء أن ينزل في النهر نفسه مرتين"؟',
    options: ['هيراقليطس', 'بارمنيدس', 'طاليس', 'فيثاغورس'],
    correct: 'هيراقليطس'
  },
  {
    id: 'phil-quotes-q5',
    type: 'grammar-mcq',
    questionText: 'من قال: "الدين أفيون الشعوب"؟',
    options: ['كارل ماركس', 'فرويد', 'نيتشه', 'فولتير'],
    correct: 'كارل ماركس'
  },
  {
    id: 'phil-quotes-q6',
    type: 'grammar-mcq',
    questionText: 'من قال: "الله مات"؟',
    options: ['نيتشه', 'شوبنهاور', 'كيركغارد', 'دوستويفسكي'],
    correct: 'نيتشه'
  },
  {
    id: 'phil-quotes-q7',
    type: 'grammar-mcq',
    questionText: 'من قال: "التاريخ هو مقبرة الأرستقراطيات"؟',
    options: ['باريتو', 'توكفيل', 'ماكس فيبر', 'دوركهايم'],
    correct: 'باريتو'
  },
  {
    id: 'phil-quotes-q8',
    type: 'grammar-mcq',
    questionText: 'من قال: "الحياة سون وغضب"؟',
    options: ['شكسبير', 'بايرون', 'شوبنهاور', 'غوته'],
    correct: 'شكسبير'
  },
  {
    id: 'phil-quotes-q9',
    type: 'grammar-mcq',
    questionText: 'من قال: "السلطة تفسد، والسلطة المطلقة تفسد مطلقاً"؟',
    options: ['اللورد أكتون', 'مونتسكيو', 'روسو', 'لوك'],
    correct: 'اللورد أكتون'
  },
  {
    id: 'phil-quotes-q10',
    type: 'grammar-mcq',
    questionText: 'من قال: "الإنسان حيوان سياسي"؟',
    options: ['أرسطو', 'أفلاطون', 'سقراط', 'هوبز'],
    correct: 'أرسطو'
  },
  {
    id: 'phil-quotes-q11',
    type: 'grammar-mcq',
    questionText: 'من قال: "الجحيم هو الآخرون"؟',
    options: ['سارتر', 'كامو', 'بوفوار', 'ميرلو بونتي'],
    correct: 'سارتر'
  },
  {
    id: 'phil-quotes-q12',
    type: 'grammar-mcq',
    questionText: 'من قال: "يجب قتل الفيلسوف في داخلنا"؟',
    options: ['باشلار', 'ألتوسير', 'فوكو', 'ديريدا'],
    correct: 'باشلار'
  },
  {
    id: 'phil-quotes-q13',
    type: 'grammar-mcq',
    questionText: 'من قال: "الوجود يسبق الماهية"؟',
    options: ['سارتر', 'هايدغر', 'هوسرل', 'ياسبرز'],
    correct: 'سارتر'
  },
  {
    id: 'phil-quotes-q14',
    type: 'grammar-mcq',
    questionText: 'من قال: "لا أتفق مع ما تقول، ولكنني سأدافع حتى الموت عن حقك في قوله"؟',
    options: ['فولتير', 'روسو', 'ديدرو', 'دالمبير'],
    correct: 'فولتير'
  },
  {
    id: 'phil-quotes-q15',
    type: 'grammar-mcq',
    questionText: 'من قال: "التفلسف هو تعلم كيفية الموت"؟',
    options: ['مونتين', 'باسكال', 'ديكارت', 'سبينوزا'],
    correct: 'مونتين'
  }
];

export const philosophyQuizData = {
  sections: {
    'philosophical-quotes': {
      questions: shuffleArray([...philosophicalQuotesQuestions])
    }
  }
};
