// src/components/bac/quiz/history.ts

import { Question, shuffleArray } from './types';

export const coldWarDates = [
  { date: '1945/10/24', event: 'هيئة الأمم المتحدة' },
  { date: '1947/06/05', event: 'مشروع مارشال' },
  { date: '5–6 أكتوبر 1947', event: 'تأسيس مكتب الكومنفورم' },
  { date: '1945/02/04', event: 'مؤتمر يالطا' },
  { date: '1949/01/25', event: 'إنشاء الكوميكون' },
  { date: '1949/04/04', event: 'الحلف الأطلسي' },
  { date: '1954/09/08', event: 'تأسيس جنوب شرق آسيا' },
  { date: '1955/02/24', event: 'تأسيس حلف بغداد' },
  { date: '1955/05/14', event: 'تأسيس حلف وارسو' },
  { date: '1947/03/12', event: 'مبدأ ترومان' },
  { date: '1972/05/26', event: 'اتفاقية سالت 01' },
  { date: '1979/06/18', event: 'اتفاقية سالت 02' },
  { date: '1961/08/13', event: 'إنشاء جدار برلين' },
  { date: '1989/11/09', event: 'تحطيم جدار برلين' },
  { date: '1990/10/03', event: 'توحيد ألمانيا' },
  { date: '1989/12/03 إلى 1989/12/04', event: 'قمة مالطا' },
  { date: '1963/06/20', event: 'الخط الأحمر' },
  { date: '1973/09/05 إلى 1973/09/09', event: 'قمة حركة عدم الانحياز (الرابعة)' },
  { date: '1991/06/28', event: 'حل الكوميكون' },
  { date: '1991/07/01', event: 'حل وارسو' },
  { date: '1955/04/18 إلى 1955/04/24', event: 'مؤتمر باندونغ' },
  { date: '1957/01/05', event: 'مشروع إيزنهاور' },
  { date: '1947/09/22', event: 'مبدأ جدانوف' },
  { date: '1956/04/17', event: 'حل مكتب الكومنفورم' },
  { date: '1961/09/01', event: 'تأسيس حركة عدم الانحياز' },
  { date: '1953/03/05', event: 'وفاة ستالين' },
  { date: '1956/10/29', event: 'العدوان الثلاثي' },
  { date: '1956/07/26', event: 'تأميم قناة السويس' },
  { date: '1954/05/07', event: 'معركة ديان بيان فو' },
  { date: '1990/12/23', event: 'مؤتمر باريس ونهاية الحرب الباردة' },
];

export const algerianRevolutionDates = [
  { date: '10 فيفري 1943', event: 'صدور بيان الشعب الجزائري' },
  { date: '08 ماي 1945', event: 'بداية المجازر ضد الشعب الجزائري' },
  { date: '15 فيفري 1947', event: 'إنشاء المنظمة الخاصة (OS)' },
  { date: '20 سبتمبر 1947', event: 'صدور القانون الخاص بالجزائر "دستور الجزائر"' },
  { date: '23 مارس 1954', event: 'إنشاء اللجنة الثورية للوحدة والعمل' },
  { date: '23 جوان 1954', event: 'اجتماع مجموعة 22' },
  { date: '23 أكتوبر 1954', event: 'اجتماع لجنة 6 (اجتماع الحسم)' },
  { date: '01 نوفمبر 1954', event: 'اندلاع الثورة التحريرية' },
  { date: '03 أفريل 1955', event: 'إعلان حالة الطوارئ' },
  { date: '08 جويلية 1955', event: 'إنشاء الاتحاد العام للطلبة المسلمين الجزائريين' },
  { date: '20 أوت 1955', event: 'هجومات الشمال القسنطيني' },
  { date: '24 فيفري 1956', event: 'إنشاء الاتحاد العام للعمال الجزائريين' },
  { date: '19 ماي 1956', event: 'إضراب الطلبة المسلمين الجزائريين' },
  { date: '20 أوت 1956', event: 'مؤتمر الصومام' },
  { date: '22 أكتوبر 1956', event: 'اختطاف الطائرة المقلة للوفد الجزائري (القرصنة الجوية)' },
  { date: '28 جانفي إلى 4 فيفري 1957', event: 'إضراب الثمانية أيام' },
  { date: '08 فيفري 1958', event: 'أحداث ساقية سيدي يوسف' },
  { date: '13 ماي 1958', event: 'تمرد المستوطنين والمطالبة بعودة دوغول' },
  { date: '19 سبتمبر 1958', event: 'الإعلان عن تأسيس الحكومة المؤقتة للجمهورية الجزائرية' },
  { date: '03 أكتوبر 1958', event: 'الإعلان عن مشروع قسنطينة' },
  { date: '23 أكتوبر 1958', event: 'الإعلان عن مشروع "سلم الشجعان"' },
  { date: '11 ديسمبر 1960', event: 'مظاهرات الشعب الجزائري المؤكدة لمطلب الاستقلال' },
  { date: '22 أفريل 1961', event: 'المحاولة الانقلابية الفاشلة ضد دوغول' },
  { date: '17 أكتوبر 1961', event: 'مظاهرات الجالية الجزائرية في فرنسا' },
  { date: '07–18 مارس 1962', event: 'مفاوضات إيفيان الثانية' },
  { date: '19 مارس 1962', event: 'إعلان وقف إطلاق النار' },
  { date: '27 ماي – 2 جوان 1962', event: 'مؤتمر طرابلس' },
  { date: '01 جويلية 1962', event: 'استفتاء تقرير المصير' },
  { date: '05 جويلية 1962', event: 'الإعلان الرسمي عن الاستقلال' },
];

// دالة لإنشاء أسئلة التاريخ
export const generateHistoryQuestions = (data: { date: string; event: string }[], quizIdPrefix: string): Question[] => {
  const generatedQuestions: Question[] = [];
  const allDates = data.map(item => item.date);
  const allEvents = data.map(item => item.event);

  data.forEach((item, index) => {
    // سؤال: تاريخ -> حدث
    const incorrectEvents = shuffleArray(allEvents.filter(e => e !== item.event)).slice(0, 2);
    generatedQuestions.push({
      id: `${quizIdPrefix}-date-q${index}`,
      type: 'date-event',
      questionText: item.date,
      options: shuffleArray([item.event, ...incorrectEvents]),
      correct: item.event,
    });

    // سؤال: حدث -> تاريخ
    const incorrectDates = shuffleArray(allDates.filter(d => d !== item.date)).slice(0, 2);
    generatedQuestions.push({
      id: `${quizIdPrefix}-event-q${index}`,
      type: 'event-date',
      questionText: item.event,
      options: shuffleArray([item.date, ...incorrectDates]),
      correct: item.date,
    });
  });
  return generatedQuestions;
};
