// src/components/bac/quiz/geography.ts

import { Question, shuffleArray } from './types';

// أسئلة الوحدة الأولى - الجغرافيا
const unit1Questions: Question[] = [
  {
    id: 'geo-unit1-q1',
    type: 'grammar-mcq',
    questionText: 'ما هي أكبر قارة في العالم من حيث المساحة؟',
    options: ['آسيا', 'أفريقيا', 'أمريكا الشمالية', 'أوروبا'],
    correct: 'آسيا'
  },
  {
    id: 'geo-unit1-q2',
    type: 'grammar-mcq',
    questionText: 'أي من المحيطات التالية هو الأكبر؟',
    options: ['المحيط الهادئ', 'المحيط الأطلسي', 'المحيط الهندي', 'المحيط المتجمد الشمالي'],
    correct: 'المحيط الهادئ'
  },
  {
    id: 'geo-unit1-q3',
    type: 'grammar-mcq',
    questionText: 'ما هو أطول نهر في العالم؟',
    options: ['النيل', 'الأمازون', 'الميسيسيبي', 'اليانغتسي'],
    correct: 'النيل'
  },
  {
    id: 'geo-unit1-q4',
    type: 'grammar-mcq',
    questionText: 'في أي قارة تقع صحراء الصحراء الكبرى؟',
    options: ['أفريقيا', 'آسيا', 'أستراليا', 'أمريكا الشمالية'],
    correct: 'أفريقيا'
  },
  {
    id: 'geo-unit1-q5',
    type: 'grammar-mcq',
    questionText: 'ما هي عاصمة أستراليا؟',
    options: ['كانبرا', 'سيدني', 'ملبورن', 'بيرث'],
    correct: 'كانبرا'
  },
  {
    id: 'geo-unit1-q6',
    type: 'grammar-mcq',
    questionText: 'أي من الدول التالية يقع في قارتين؟',
    options: ['روسيا', 'الصين', 'الولايات المتحدة', 'البرازيل'],
    correct: 'روسيا'
  },
  {
    id: 'geo-unit1-q7',
    type: 'grammar-mcq',
    questionText: 'ما هو أعلى جبل في العالم؟',
    options: ['إفرست', 'كليمنجارو', 'الألب', 'الأنديز'],
    correct: 'إفرست'
  },
  {
    id: 'geo-unit1-q8',
    type: 'grammar-mcq',
    questionText: 'في أي قارة تقع سلسلة جبال الأنديز؟',
    options: ['أمريكا الجنوبية', 'أمريكا الشمالية', 'آسيا', 'أفريقيا'],
    correct: 'أمريكا الجنوبية'
  },
  {
    id: 'geo-unit1-q9',
    type: 'grammar-mcq',
    questionText: 'ما هو أصغر محيط في العالم؟',
    options: ['المحيط المتجمد الشمالي', 'المحيط الهندي', 'المحيط الأطلسي', 'المحيط الهادئ'],
    correct: 'المحيط المتجمد الشمالي'
  },
  {
    id: 'geo-unit1-q10',
    type: 'grammar-mcq',
    questionText: 'في أي قارة يقع نهر الأمازون؟',
    options: ['أمريكا الجنوبية', 'أمريكا الشمالية', 'آسيا', 'أفريقيا'],
    correct: 'أمريكا الجنوبية'
  },
  {
    id: 'geo-unit1-q11',
    type: 'grammar-mcq',
    questionText: 'ما هي أكبر جزيرة في العالم؟',
    options: ['جرينلاند', 'أستراليا', 'بورنيو', 'مدغشقر'],
    correct: 'جرينلاند'
  },
  {
    id: 'geo-unit1-q12',
    type: 'grammar-mcq',
    questionText: 'أي من البحار التالية يقع بين أوروبا وأفريقيا؟',
    options: ['البحر المتوسط', 'البحر الأحمر', 'البحر الأسود', 'بحر الشمال'],
    correct: 'البحر المتوسط'
  },
  {
    id: 'geo-unit1-q13',
    type: 'grammar-mcq',
    questionText: 'ما هو الخط الوهمي الذي يقسم الأرض إلى نصفين شمالي وجنوبي؟',
    options: ['خط الاستواء', 'خط جرينتش', 'مدار السرطان', 'مدار الجدي'],
    correct: 'خط الاستواء'
  },
  {
    id: 'geo-unit1-q14',
    type: 'grammar-mcq',
    questionText: 'في أي قارة تقع هضبة التبت؟',
    options: ['آسيا', 'أفريقيا', 'أمريكا الجنوبية', 'أستراليا'],
    correct: 'آسيا'
  },
  {
    id: 'geo-unit1-q15',
    type: 'grammar-mcq',
    questionText: 'ما هي أكبر دولة في أفريقيا من حيث المساحة؟',
    options: ['الجزائر', 'ليبيا', 'السودان', 'مصر'],
    correct: 'الجزائر'
  }
];

// أسئلة الوحدة الثانية - الجغرافيا
const unit2Questions: Question[] = [
  {
    id: 'geo-unit2-q1',
    type: 'grammar-mcq',
    questionText: 'ما هو المناخ السائد في منطقة البحر المتوسط؟',
    options: ['مناخ معتدل', 'مناخ استوائي', 'مناخ صحراوي', 'مناخ قطبي'],
    correct: 'مناخ معتدل'
  },
  {
    id: 'geo-unit2-q2',
    type: 'grammar-mcq',
    questionText: 'أي من العوامل التالية يؤثر على المناخ؟',
    options: ['جميع ما سبق', 'الارتفاع', 'القرب من البحر', 'خطوط العرض'],
    correct: 'جميع ما سبق'
  },
  {
    id: 'geo-unit2-q3',
    type: 'grammar-mcq',
    questionText: 'ما هي الرياح الموسمية؟',
    options: ['رياح تتغير اتجاهها موسمياً', 'رياح ثابتة الاتجاه', 'رياح باردة', 'رياح محلية'],
    correct: 'رياح تتغير اتجاهها موسمياً'
  },
  {
    id: 'geo-unit2-q4',
    type: 'grammar-mcq',
    questionText: 'في أي منطقة تتركز الغابات الاستوائية المطيرة؟',
    options: ['حول خط الاستواء', 'المناطق القطبية', 'المناطق الصحراوية', 'المناطق الجبلية'],
    correct: 'حول خط الاستواء'
  },
  {
    id: 'geo-unit2-q5',
    type: 'grammar-mcq',
    questionText: 'ما هو السبب الرئيسي لظاهرة الاحتباس الحراري؟',
    options: ['زيادة غازات الدفيئة', 'النشاط البركاني', 'التغيرات الشمسية', 'حركة القارات'],
    correct: 'زيادة غازات الدفيئة'
  },
  {
    id: 'geo-unit2-q6',
    type: 'grammar-mcq',
    questionText: 'أي من النباتات التالية تنمو في المناخ الصحراوي؟',
    options: ['الصبار', 'الأشجار الاستوائية', 'الأشجار المتساقطة', 'النباتات القطبية'],
    correct: 'الصبار'
  },
  {
    id: 'geo-unit2-q7',
    type: 'grammar-mcq',
    questionText: 'ما هو التصحر؟',
    options: ['تحول الأراضي إلى صحراء', 'زراعة الصحراء', 'هطول الأمطار في الصحراء', 'تبريد الصحراء'],
    correct: 'تحول الأراضي إلى صحراء'
  },
  {
    id: 'geo-unit2-q8',
    type: 'grammar-mcq',
    questionText: 'في أي فصل تهطل معظم الأمطار في مناخ البحر المتوسط؟',
    options: ['الشتاء', 'الصيف', 'الربيع', 'الخريف'],
    correct: 'الشتاء'
  },
  {
    id: 'geo-unit2-q9',
    type: 'grammar-mcq',
    questionText: 'ما هي التعرية؟',
    options: ['تآكل الصخور والتربة', 'تكوين الصخور', 'هطول الأمطار', 'نمو النباتات'],
    correct: 'تآكل الصخور والتربة'
  },
  {
    id: 'geo-unit2-q10',
    type: 'grammar-mcq',
    questionText: 'أي من العوامل التالية يسبب التعرية؟',
    options: ['جميع ما سبق', 'الرياح', 'المياه الجارية', 'الأنهار الجليدية'],
    correct: 'جميع ما سبق'
  },
  {
    id: 'geo-unit2-q11',
    type: 'grammar-mcq',
    questionText: 'ما هو الإقليم الحيوي؟',
    options: ['منطقة بمناخ ونباتات متشابهة', 'منطقة جبلية', 'منطقة ساحلية', 'منطقة صناعية'],
    correct: 'منطقة بمناخ ونباتات متشابهة'
  },
  {
    id: 'geo-unit2-q12',
    type: 'grammar-mcq',
    questionText: 'في أي إقليم تنمو أشجار التايغا؟',
    options: ['الإقليم البارد', 'الإقليم الاستوائي', 'الإقليم الصحراوي', 'الإقليم المعتدل'],
    correct: 'الإقليم البارد'
  },
  {
    id: 'geo-unit2-q13',
    type: 'grammar-mcq',
    questionText: 'ما هو أهم عامل مؤثر على توزيع السكان؟',
    options: ['المناخ والموارد المائية', 'الارتفاع فقط', 'نوع التربة فقط', 'الموقع الفلكي فقط'],
    correct: 'المناخ والموارد المائية'
  },
  {
    id: 'geo-unit2-q14',
    type: 'grammar-mcq',
    questionText: 'ما هي الكثافة السكانية؟',
    options: ['عدد السكان في الكيلومتر المربع', 'العدد الكلي للسكان', 'معدل النمو السكاني', 'التوزيع العمري للسكان'],
    correct: 'عدد السكان في الكيلومتر المربع'
  },
  {
    id: 'geo-unit2-q15',
    type: 'grammar-mcq',
    questionText: 'أي من المناطق التالية تتميز بكثافة سكانية عالية؟',
    options: ['السهول الفيضية', 'المناطق الجبلية', 'المناطق الصحراوية', 'المناطق القطبية'],
    correct: 'السهول الفيضية'
  }
];

export const geographyQuizData = {
  sections: {
    'unit-1': {
      questions: shuffleArray([...unit1Questions])
    },
    'unit-2': {
      questions: shuffleArray([...unit2Questions])
    }
  }
};
