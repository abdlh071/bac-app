// src/components/bac/quiz/naturalSciences.ts

import { Question, shuffleArray } from './types';

// دالة مساعدة لإنشاء أسئلة العلوم الطبيعية والحياة
const generateNaturalSciencesQuestions = (section: string, levelNum: number): Question[] => {
  const sectionData: Record<string, any[]> = {
    'protein-synthesis': [
      { question: 'ما هو الأحماض الأمينية الأساسية لتكوين البروتين؟', options: ['20 حمض أميني', '15 حمض أميني', '25 حمض أميني', '10 أحماض أمينية'], correct: '20 حمض أميني' },
      { question: 'أين يحدث تخليق البروتينات في الخلية؟', options: ['الريبوسومات', 'النواة', 'الميتوكوندريا', 'الشبكة الإندوبلازمية'], correct: 'الريبوسومات' },
      { question: 'ما هو دور الـ tRNA في تخليق البروتين؟', options: ['نقل الأحماض الأمينية', 'تخزين المعلومات الوراثية', 'تنظيم النسخ', 'تحفيز التفاعلات'], correct: 'نقل الأحماض الأمينية' },
      { question: 'ما هي المرحلة الأولى من تخليق البروتين؟', options: ['النسخ', 'الترجمة', 'التضاعف', 'التحرير'], correct: 'النسخ' },
      { question: 'أي من التالي يحدث في النواة؟', options: ['النسخ', 'الترجمة', 'تخليق البروتين', 'تجميع الريبوسومات'], correct: 'النسخ' },
      { question: 'ما هو دور الكودون في تخليق البروتين؟', options: ['تحديد الحمض الأميني', 'تنظيم النسخ', 'تحفيز الإنزيمات', 'نقل الطاقة'], correct: 'تحديد الحمض الأميني' },
      { question: 'كم عدد النوكليوتيدات في الكودون الواحد؟', options: ['3', '2', '4', '6'], correct: '3' },
      { question: 'ما هو دور البوليميراز RNA؟', options: ['نسخ الـ DNA إلى RNA', 'ترجمة الـ RNA', 'تضاعف الـ DNA', 'تحرير البروتينات'], correct: 'نسخ الـ DNA إلى RNA' },
      { question: 'أين تحدث عملية الترجمة؟', options: ['السيتوبلازم', 'النواة', 'النوية', 'الغشاء النووي'], correct: 'السيتوبلازم' },
      { question: 'ما هو دور الـ mRNA؟', options: ['نقل المعلومات الوراثية', 'نقل الأحماض الأمينية', 'تخزين الطاقة', 'تنظيم الجينات'], correct: 'نقل المعلومات الوراثية' }
    ],
    'protein-structure-function': [
      { question: 'ما هي البنية الأولية للبروتين؟', options: ['تسلسل الأحماض الأمينية', 'الهيكل ثلاثي الأبعاد', 'الروابط الهيدروجينية', 'التجمعات البروتينية'], correct: 'تسلسل الأحماض الأمينية' },
      { question: 'ما نوع الرابطة بين الأحماض الأمينية؟', options: ['رابطة ببتيدية', 'رابطة هيدروجينية', 'رابطة أيونية', 'رابطة تساهمية'], correct: 'رابطة ببتيدية' },
      { question: 'ما هي البنية الثانوية للبروتين؟', options: ['الحلزون والصفائح', 'تسلسل الأحماض', 'الشكل الكروي', 'التجمع البروتيني'], correct: 'الحلزون والصفائح' },
      { question: 'ما هو دور الروابط الهيدروجينية في البروتين؟', options: ['تثبيت البنية الثانوية', 'ربط الأحماض الأمينية', 'تحديد الوظيفة', 'نقل الطاقة'], correct: 'تثبيت البنية الثانوية' }
    ],
    'enzyme-sharing': [
      { question: 'ما هي المشاطر الإنزيمية؟', options: ['مجموعات غير بروتينية', 'أحماض أمينية', 'فيتامينات', 'سكريات'], correct: 'مجموعات غير بروتينية' }
    ],
    'proteins-defense': [
      { question: 'ما هو دور الأجسام المضادة؟', options: ['الدفاع عن الجسم', 'نقل الأكسجين', 'تخزين الطاقة', 'تنظيم الهرمونات'], correct: 'الدفاع عن الجسم' }
    ],
    'proteins-neural': [
      { question: 'ما هو دور النواقل العصبية؟', options: ['نقل الإشارات العصبية', 'تخزين الذاكرة', 'إنتاج الطاقة', 'تنظيم السكر'], correct: 'نقل الإشارات العصبية' }
    ],
    'photosynthesis': [
      { question: 'أين تحدث عملية التمثيل الضوئي؟', options: ['البلاستيدات الخضراء', 'الميتوكوندريا', 'النواة', 'السيتوبلازم'], correct: 'البلاستيدات الخضراء' }
    ],
    'respiration-fermentation': [
      { question: 'أين يحدث التنفس الخلوي؟', options: ['الميتوكوندريا', 'البلاستيدات', 'النواة', 'الريبوسومات'], correct: 'الميتوكوندريا' }
    ]
  };

  const questions = sectionData[section] || [];
  if (questions.length === 0) {
    return [{
      id: `ns-${section}-l${levelNum}-q1`,
      type: 'grammar-mcq' as const,
      questionText: `سؤال ${section} - المستوى ${levelNum}`,
      options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
      correct: 'خيار 1'
    }];
  }

  return questions.slice(0, 1).map((item, index) => ({
    id: `ns-${section}-l${levelNum}-q${index + 1}`,
    type: 'grammar-mcq' as const,
    questionText: item.question,
    options: shuffleArray([...item.options]),
    correct: item.correct
  }));
};

export const naturalSciencesQuizData = {
  sections: {
    'protein-synthesis': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateNaturalSciencesQuestions('protein-synthesis', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'protein-structure-function': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateNaturalSciencesQuestions('protein-structure-function', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'enzyme-sharing': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateNaturalSciencesQuestions('enzyme-sharing', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'proteins-defense': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateNaturalSciencesQuestions('proteins-defense', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'proteins-neural': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateNaturalSciencesQuestions('proteins-neural', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'photosynthesis': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateNaturalSciencesQuestions('photosynthesis', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
    'respiration-fermentation': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateNaturalSciencesQuestions('respiration-fermentation', idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
  },
};
