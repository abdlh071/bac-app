// src/components/bac/quiz/types.ts

// تعريف واجهة السؤال لتشمل أنواع مختلفة
export interface Question {
  id: string; // معرف فريد للسؤال
  type: 'word-translation' | 'date-event' | 'event-date' | 'grammar-transform' | 'grammar-mcq' | 'grammar-sound';
  questionText: string; // الكلمة أو الجملة أو التاريخ/الحدث المطروح
  options: string[]; // الخيارات المتاحة
  correct: string; // الإجابة الصحيحة
  context?: string; // سياق إضافي لأسئلة القواعد (مثل نوع الصوت)
}

// دالة لخلط مصفوفة
export const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};
