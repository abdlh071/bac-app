import React, { useState } from 'react';
import { ArrowRight, Users, ArrowLeft } from 'lucide-react';

interface BacCalculatorPageProps {
  onBack: () => void;
}

// تم إضافة جميع الشعب هنا بشكل كامل
const branches = [
  {
    id: 'sciences', name: 'علوم تجريبية', subjects: [
      { name: 'العلوم الطبيعية والحياة', coefficient: 6 },
      { name: 'الرياضيات', coefficient: 5 },
      { name: 'العلوم الفيزيائية', coefficient: 5 },
      { name: 'اللغة العربية', coefficient: 3 },
      { name: 'اللغة الإنجليزية', coefficient: 2 },
      { name: 'اللغة الفرنسية', coefficient: 2 },
      { name: 'الاجتماعيات', coefficient: 2 },
      { name: 'العلوم الإسلامية', coefficient: 2 },
      { name: 'الفلسفة', coefficient: 2 },
      { name: 'اللغة الأمازيغية', coefficient: 2, optional: true },
      { name: 'التربية البدنية', coefficient: 1, optional: true }
    ]
  },
  {
    id: 'math', name: 'رياضيات', subjects: [
      { name: 'الرياضيات', coefficient: 7 },
      { name: 'العلوم الفيزيائية', coefficient: 6 },
      { name: 'العلوم الطبيعية والحياة', coefficient: 2 },
      { name: 'اللغة العربية', coefficient: 3 },
      { name: 'اللغة الإنجليزية', coefficient: 2 },
      { name: 'اللغة الفرنسية', coefficient: 2 },
      { name: 'الاجتماعيات', coefficient: 2 },
      { name: 'العلوم الإسلامية', coefficient: 2 },
      { name: 'الفلسفة', coefficient: 2 },
      { name: 'اللغة الأمازيغية', coefficient: 2, optional: true },
      { name: 'التربية البدنية', coefficient: 1, optional: true }
    ]
  },
  {
    id: 'tech', name: 'تقني رياضي', subjects: [
      { name: 'التكنولوجيا', coefficient: 7 },
      { name: 'الرياضيات', coefficient: 6 },
      { name: 'العلوم الفيزيائية', coefficient: 6 },
      { name: 'اللغة العربية', coefficient: 3 },
      { name: 'اللغة الإنجليزية', coefficient: 2 },
      { name: 'اللغة الفرنسية', coefficient: 2 },
      { name: 'الاجتماعيات', coefficient: 2 },
      { name: 'العلوم الإسلامية', coefficient: 2 },
      { name: 'الفلسفة', coefficient: 2 },
      { name: 'اللغة الأمازيغية', coefficient: 2, optional: true },
      { name: 'التربية البدنية', coefficient: 1, optional: true }
    ]
  },
  {
    id: 'management', name: 'تسيير واقتصاد', subjects: [
      { name: 'التسيير المحاسبي والمالي', coefficient: 6 },
      { name: 'الاقتصاد والمناجمنت', coefficient: 5 },
      { name: 'الرياضيات', coefficient: 5 },
      { name: 'الاجتماعيات', coefficient: 4 },
      { name: 'اللغة العربية', coefficient: 3 },
      { name: 'اللغة الإنجليزية', coefficient: 2 },
      { name: 'اللغة الفرنسية', coefficient: 2 },
      { name: 'العلوم الإسلامية', coefficient: 2 },
      { name: 'الفلسفة', coefficient: 2 },
      { name: 'اللغة الأمازيغية', coefficient: 2, optional: true },
      { name: 'التربية البدنية', coefficient: 1, optional: true }
    ]
  },
  {
    id: 'literature', name: 'آداب وفلسفة', subjects: [
      { name: 'اللغة العربية', coefficient: 6 },
      { name: 'الفلسفة', coefficient: 6 },
      { name: 'الاجتماعيات', coefficient: 4 },
      { name: 'اللغة الإنجليزية', coefficient: 3 },
      { name: 'اللغة الفرنسية', coefficient: 3 },
      { name: 'العلوم الإسلامية', coefficient: 2 },
      { name: 'الرياضيات', coefficient: 2 },
      { name: 'اللغة الأمازيغية', coefficient: 2, optional: true },
      { name: 'التربية البدنية', coefficient: 1, optional: true }
    ]
  },
  {
    id: 'languages', name: 'لغات أجنبية', subjects: [
      { name: 'اللغة العربية', coefficient: 5 },
      { name: 'اللغة الإنجليزية', coefficient: 5 },
      { name: 'اللغة الفرنسية', coefficient: 5 },
      { name: 'اللغة الأجنبية الثالثة', coefficient: 4 },
      { name: 'العلوم الإسلامية', coefficient: 2 },
      { name: 'الاجتماعيات', coefficient: 2 },
      { name: 'الفلسفة', coefficient: 2 },
      { name: 'الرياضيات', coefficient: 2 },
      { name: 'اللغة الأمازيغية', coefficient: 2, optional: true },
      { name: 'التربية البدنية', coefficient: 1, optional: true }
    ]
  }
];

// مكون الحاسبة الداخلي
const GradeCalculator: React.FC<{ branch: any; onBack: () => void }> = ({ branch, onBack }) => {
  const [grades, setGrades] = useState<{ [key: string]: number }>({});
  const [excludedSubjects, setExcludedSubjects] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ general: number; core: number } | null>(null);

  const handleGradeChange = (subject: string, grade: number) => {
    setGrades(prev => ({ ...prev, [subject]: grade }));
  };

  const toggleSubjectExclusion = (subjectName: string) => {
    setExcludedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectName)) {
        newSet.delete(subjectName);
      } else {
        newSet.add(subjectName);
      }
      return newSet;
    });
  };

  const calculateAverage = () => {
    let totalPoints = 0;
    let totalCoefficients = 0;
    let corePoints = 0;
    let coreCoefficients = 0;

    branch.subjects.forEach((subject: any) => {
      if (excludedSubjects.has(subject.name)) return;

      const grade = grades[subject.name] || 0;
      const points = grade * subject.coefficient;

      totalPoints += points;
      totalCoefficients += subject.coefficient;

      // المواد الأساسية هي التي معاملها أكبر من 3
      if (subject.coefficient > 3) {
        corePoints += points;
        coreCoefficients += subject.coefficient;
      }
    });

    const generalAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
    const coreAverage = coreCoefficients > 0 ? corePoints / coreCoefficients : 0;

    setResult({
      general: Math.round(generalAverage * 100) / 100,
      core: Math.round(coreAverage * 100) / 100
    });
  };

  return (
    <div className="p-6 pb-20">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{branch.name}</h2>
      </div>

      <div className="space-y-4 mb-6">
        {branch.subjects.map((subject: any, index: number) => (
          <div key={index} className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-800">{subject.name}</span>
                {subject.optional && (
                  <button
                    onClick={() => toggleSubjectExclusion(subject.name)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      excludedSubjects.has(subject.name)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {excludedSubjects.has(subject.name) ? 'مستثناة' : 'مدرجة'}
                  </button>
                )}
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                معامل {subject.coefficient}
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="20"
              step="0.25"
              placeholder="النقطة من 20"
              disabled={excludedSubjects.has(subject.name)}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                excludedSubjects.has(subject.name) ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              onChange={(e) => handleGradeChange(subject.name, parseFloat(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>

      <button
        onClick={calculateAverage}
        className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
      >
        حساب المعدل
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl text-white">
            <h3 className="text-lg font-bold mb-2">المعدل العام</h3>
            <div className="text-3xl font-bold">{result.general}</div>
          </div>

          {result.core > 0 && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-2xl text-white">
              <h3 className="text-lg font-bold mb-2">معدل المواد الأساسية</h3>
              <div className="text-3xl font-bold">{result.core}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// المكون الرئيسي للصفحة الذي يعرض اختيار الشعبة أولاً
const BacCalculatorPage: React.FC<BacCalculatorPageProps> = ({ onBack }) => {
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  // إذا تم اختيار شعبة، اعرض الحاسبة
  if (selectedBranch) {
    return <GradeCalculator branch={selectedBranch} onBack={() => setSelectedBranch(null)} />;
  }

  // إذا لم يتم اختيار شعبة، اعرض قائمة الشعب
  return (
    <div className="p-6 pb-20">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">حساب معدل البكالوريا</h1>
          <p className="text-gray-600">اختر شعبتك لحساب المعدل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {branches.map((branchItem) => (
          <button
            key={branchItem.id}
            onClick={() => setSelectedBranch(branchItem)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Users size={32} />
                <div className="text-right">
                  <h3 className="text-lg font-bold">{branchItem.name}</h3>
                </div>
              </div>
              <ArrowLeft size={20} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BacCalculatorPage;
