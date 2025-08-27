// src/components/bac/quiz/islamicStudies.ts

import { Question, shuffleArray } from './types';

// أسئلة العلوم الإسلامية الشاملة
const islamicStudiesQuestions: Question[] = [
  {
    id: 'is-comprehensive-q1',
    type: 'grammar-mcq',
    questionText: 'كم عدد سور القرآن الكريم؟',
    options: ['114', '113', '115', '116'],
    correct: '114'
  },
  {
    id: 'is-comprehensive-q2',
    type: 'grammar-mcq',
    questionText: 'ما هي أول سورة نزلت في القرآن الكريم؟',
    options: ['العلق', 'الفاتحة', 'البقرة', 'المدثر'],
    correct: 'العلق'
  },
  {
    id: 'is-comprehensive-q3',
    type: 'grammar-mcq',
    questionText: 'كم عدد أركان الإسلام؟',
    options: ['5', '4', '6', '3'],
    correct: '5'
  },
  {
    id: 'is-comprehensive-q4',
    type: 'grammar-mcq',
    questionText: 'ما هو الركن الأول من أركان الإسلام؟',
    options: ['الشهادة', 'الصلاة', 'الزكاة', 'الحج'],
    correct: 'الشهادة'
  },
  {
    id: 'is-comprehensive-q5',
    type: 'grammar-mcq',
    questionText: 'في أي شهر فُرض الصيام؟',
    options: ['رمضان', 'شعبان', 'رجب', 'ذو القعدة'],
    correct: 'رمضان'
  },
  {
    id: 'is-comprehensive-q6',
    type: 'grammar-mcq',
    questionText: 'كم عدد الصلوات المفروضة في اليوم؟',
    options: ['5', '3', '4', '6'],
    correct: '5'
  },
  {
    id: 'is-comprehensive-q7',
    type: 'grammar-mcq',
    questionText: 'ما هي قبلة المسلمين؟',
    options: ['الكعبة المشرفة', 'المسجد النبوي', 'المسجد الأقصى', 'جبل عرفات'],
    correct: 'الكعبة المشرفة'
  },
  {
    id: 'is-comprehensive-q8',
    type: 'grammar-mcq',
    questionText: 'في أي عام هجري توفي الرسول صلى الله عليه وسلم؟',
    options: ['11', '10', '12', '9'],
    correct: '11'
  },
  {
    id: 'is-comprehensive-q9',
    type: 'grammar-mcq',
    questionText: 'كم عدد أركان الإيمان؟',
    options: ['6', '5', '7', '4'],
    correct: '6'
  },
  {
    id: 'is-comprehensive-q10',
    type: 'grammar-mcq',
    questionText: 'ما هو اليوم المقدس عند المسلمين؟',
    options: ['الجمعة', 'السبت', 'الأحد', 'الخميس'],
    correct: 'الجمعة'
  },
  {
    id: 'is-comprehensive-q11',
    type: 'grammar-mcq',
    questionText: 'كم سنة استمرت الدعوة في مكة؟',
    options: ['13', '10', '15', '12'],
    correct: '13'
  },
  {
    id: 'is-comprehensive-q12',
    type: 'grammar-mcq',
    questionText: 'ما هي أطول سورة في القرآن الكريم؟',
    options: ['البقرة', 'آل عمران', 'النساء', 'الأنعام'],
    correct: 'البقرة'
  },
  {
    id: 'is-comprehensive-q13',
    type: 'grammar-mcq',
    questionText: 'في أي غزوة انتصر المسلمون لأول مرة؟',
    options: ['بدر', 'أحد', 'الخندق', 'حنين'],
    correct: 'بدر'
  },
  {
    id: 'is-comprehensive-q14',
    type: 'grammar-mcq',
    questionText: 'من هو أول مؤذن في الإسلام؟',
    options: ['بلال بن رباح', 'عمر بن الخطاب', 'علي بن أبي طالب', 'أبو بكر الصديق'],
    correct: 'بلال بن رباح'
  },
  {
    id: 'is-comprehensive-q15',
    type: 'grammar-mcq',
    questionText: 'ما هي السورة التي تُقرأ في كل ركعة من الصلاة؟',
    options: ['الفاتحة', 'الإخلاص', 'الكافرون', 'الفلق'],
    correct: 'الفاتحة'
  }
];

export const islamicStudiesQuizData = {
  sections: {
    'comprehensive': {
      questions: shuffleArray([...islamicStudiesQuestions])
    }
  }
};
