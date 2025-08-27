// src/components/bac/QuizPage.tsx

import React, { useState, useMemo } from 'react';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import QuizComponent from './quiz/QuizComponent'; 

interface QuizPageProps {
  userData?: { id: number; points?: number } | null;
  onBack: () => void;
}

const QuizPage: React.FC<QuizPageProps> = ({ userData, onBack }) => {
  const [selectedQuizSubject, setSelectedQuizSubject] = useState<string>('');
  const [selectedQuizSection, setSelectedQuizSection] = useState<string>('');
  const [selectedQuizLevel, setSelectedQuizLevel] = useState<string>('');

  const userPoints = useMemo(() => userData?.points || 0, [userData?.points]);

  const getRequiredPoints = (level: string) => {
    if (level === 'all-levels') {
      return 5000;
    }
    const levelNumber = parseInt(level.replace('level', ''), 10);
    return levelNumber * 500;
  };

  const memoizedQuizConfig = useMemo(() => ({
    subject: selectedQuizSubject,
    section: selectedQuizSection,
    level: selectedQuizLevel
  }), [selectedQuizSubject, selectedQuizSection, selectedQuizLevel]);

  const handleBackToSubjects = () => {
    setSelectedQuizSubject('');
    setSelectedQuizSection('');
    setSelectedQuizLevel('');
  };

  const handleBackToSections = () => {
    setSelectedQuizSection('');
    setSelectedQuizLevel('');
  };

  const handleBackToLevels = () => {
    setSelectedQuizLevel('');
  };

  if (selectedQuizSubject && selectedQuizSection && selectedQuizLevel) {
    return (
      <QuizComponent
        quizConfig={memoizedQuizConfig}
        onBack={handleBackToLevels}
      />
    );
  }

  // Level selection for subjects with multiple levels
  if (selectedQuizSubject && selectedQuizSection && !selectedQuizLevel) {
    const subjectsWithLevels = ['english', 'french', 'natural-sciences', 'mathematics', 'physics', 'arabic'];
    const subjectsWithSingleLevel = ['islamic-studies', 'geography', 'philosophy'];
    
    if (subjectsWithLevels.includes(selectedQuizSubject)) {
      const subjectTitles: Record<string, string> = {
        'english': 'اللغة الإنجليزية',
        'french': 'اللغة الفرنسية',
        'natural-sciences': 'العلوم الطبيعية والحياة',
        'mathematics': 'الرياضيات',
        'physics': 'العلوم الفيزيائية',
        'arabic': 'اللغة العربية'
      };

      const sectionTitles: Record<string, string> = {
        // English sections
        'grammar': 'القواعد',
        'ethics': 'أخلاقيات العمل',
        'safety': 'السلامة أولاً',
        'astronomy': 'الفلك',
        // French sections
        'texte-historique': 'نصوص تاريخية',
        // Natural Sciences sections
        'protein-synthesis': 'تركيب البروتين',
        'protein-structure-function': 'العلاقة بين بنية ووظيفة البروتين',
        'enzyme-sharing': 'المشاطر الإنزيمية',
        'proteins-defense': 'دور البروتينات في الدفاع عن الذات',
        'proteins-neural': 'دور البروتينات في الاتصال العصبي',
        'photosynthesis': 'تحويل الطاقة الضوئية إلى طاقة كيميائية كاملة',
        'respiration-fermentation': 'التنفس والتخمر',
        // Mathematics sections
        'functions': 'الدوال',
        'sequences': 'المتتاليات',
        'probability': 'الاحتمالات',
        'complex-numbers': 'الأعداد المركبة',
        'numbers-calculation': 'الأعداد والحساب',
        'space-geometry': 'الهندسة في الفضاء',
        // Physics sections
        'chemical-kinetics': 'المتابعة الزمنية للتحول الكيميائي',
        'mechanical-evolution': 'تطور جملة ميكانيكية',
        'electrical-phenomena': 'الظواهر الكهربائية',
        'chemical-equilibrium': 'تطور جملة كيميائية نحو التوازن',
        'chemical-monitoring': 'مناقبة تطور جملة كيميائية',
        'nuclear-transformations': 'التحويلات النووية',
        // Arabic sections
        'linguistic-structure': 'البناء اللغوي',
        'intellectual-structure': 'البناء الفكري',
        'bac-parsing': 'إعراب من البكالوريات',
        'bac-metaphors': 'استعارات من البكالوريات',
        'bac-questions': 'أسئلة من البكالوريا'
      };

      return (
        <div className="p-6 pb-20">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToSections}
              className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowRight size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {subjectTitles[selectedQuizSubject]} - {sectionTitles[selectedQuizSection]}
              </h1>
              <p className="text-gray-600">نقاطك الحالية: <span className="font-bold text-blue-600">{userPoints}</span> نقطة</p>
              <p className="text-gray-600">اختر المستوى</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(() => {
              const requiredPoints = getRequiredPoints('all-levels');
              const isLocked = userPoints < requiredPoints;
              return (
                <button
                  onClick={() => setSelectedQuizLevel('all-levels')}
                  disabled={isLocked}
                  className={`bg-gradient-to-r p-6 rounded-2xl text-white shadow-lg transition-all
                    ${isLocked
                      ? 'from-yellow-400 to-orange-500 cursor-not-allowed'
                      : 'from-red-500 to-pink-600 hover:shadow-xl'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Brain size={32} />
                      <div className="text-right">
                        <h3 className="text-lg font-bold">كل المستويات</h3>
                        <p className="text-sm opacity-90">30 سؤال - 30 دقيقة</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isLocked ? (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          مغلق: تحتاج {requiredPoints} نقطة
                        </span>
                      ) : (
                        <ArrowLeft size={20} />
                      )}
                    </div>
                  </div>
                </button>
              );
            })()}

            {Array.from({ length: 10 }, (_, i) => `level${i + 1}`).map((level) => {
              const levelRequiredPoints = getRequiredPoints(level);
              const isLevelLocked = userPoints < levelRequiredPoints;
              const levelNumber = level.replace('level', '');
              return (
                <button
                  key={level}
                  onClick={() => setSelectedQuizLevel(level)}
                  disabled={isLevelLocked}
                  className={`bg-gradient-to-r p-6 rounded-2xl text-white shadow-lg transition-all
                    ${isLevelLocked
                      ? 'from-gray-400 to-gray-500 cursor-not-allowed'
                      : 'from-blue-500 to-indigo-600 hover:shadow-xl'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Brain size={32} />
                      <div className="text-right">
                        <h3 className="text-lg font-bold">المستوى {levelNumber}</h3>
                        <p className="text-sm opacity-90">15 سؤال - 15 دقيقة</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isLevelLocked ? (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          مغلق: تحتاج {levelRequiredPoints} نقطة
                        </span>
                      ) : (
                        <ArrowLeft size={20} />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    
    // For subjects with single level or specific handling
    if (selectedQuizSubject === 'history' && (selectedQuizSection === 'cold-war' || selectedQuizSection === 'algerian-revolution')) {
      return (
        <div className="p-6 pb-20">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToSections}
              className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowRight size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedQuizSection === 'cold-war' ? 'وحدة الحرب الباردة' : 'وحدة الثورة الجزائرية'}
              </h1>
              <p className="text-gray-600">اختر المستوى</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map((levelNum) => (
              <button
                key={`history-level-${levelNum}`}
                onClick={() => setSelectedQuizLevel(`level${levelNum}`)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Brain size={32} />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">المستوى {levelNum}</h3>
                      <p className="text-sm opacity-90">15 سؤال - 15 دقيقة</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // For single-level subjects (Islamic Studies, Geography, Philosophy)
    if (subjectsWithSingleLevel.includes(selectedQuizSubject)) {
      return (
        <div className="p-6 pb-20">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToSections}
              className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowRight size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedQuizSubject === 'islamic-studies' ? 'العلوم الإسلامية - كويزات شاملة' : 
                 selectedQuizSubject === 'geography' ? `الجغرافيا - ${selectedQuizSection === 'unit-1' ? 'الوحدة 1' : 'الوحدة 2'}` :
                 'الفلسفة - أقوال فلسفية'}
              </h1>
              <p className="text-gray-600">اختر المستوى</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setSelectedQuizLevel('level1')}
              className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Brain size={32} />
                  <div className="text-right">
                    <h3 className="text-lg font-bold">ابدأ الكويز</h3>
                    <p className="text-sm opacity-90">15 سؤال - 15 دقيقة</p>
                  </div>
                </div>
                <ArrowLeft size={20} />
              </div>
            </button>
          </div>
        </div>
      );
    }
  }

  // Section selection
  if (selectedQuizSubject && !selectedQuizSection) {
    const subjectSections: Record<string, string[]> = {
      'english': ['grammar', 'ethics', 'safety', 'astronomy'],
      'french': ['texte-historique'],
      'history': ['cold-war', 'algerian-revolution'],
      'natural-sciences': ['protein-synthesis', 'protein-structure-function', 'enzyme-sharing', 'proteins-defense', 'proteins-neural', 'photosynthesis', 'respiration-fermentation'],
      'mathematics': ['functions', 'sequences', 'probability', 'complex-numbers', 'numbers-calculation', 'space-geometry'],
      'physics': ['chemical-kinetics', 'mechanical-evolution', 'electrical-phenomena', 'chemical-equilibrium', 'chemical-monitoring', 'nuclear-transformations'],
      'arabic': ['linguistic-structure', 'intellectual-structure', 'bac-parsing', 'bac-metaphors', 'bac-questions'],
      'islamic-studies': ['comprehensive'],
      'geography': ['unit-1', 'unit-2'],
      'philosophy': ['philosophical-quotes']
    };

    const sectionTitles: Record<string, string> = {
      // English sections
      'grammar': 'القواعد',
      'ethics': 'أخلاقيات العمل',
      'safety': 'السلامة أولاً',
      'astronomy': 'الفلك',
      // French sections
      'texte-historique': 'نصوص تاريخية',
      // History sections
      'cold-war': 'وحدة الحرب الباردة',
      'algerian-revolution': 'وحدة الثورة الجزائرية',
      // Natural Sciences sections
      'protein-synthesis': 'تركيب البروتين',
      'protein-structure-function': 'العلاقة بين بنية ووظيفة البروتين',
      'enzyme-sharing': 'المشاطر الإنزيمية',
      'proteins-defense': 'دور البروتينات في الدفاع عن الذات',
      'proteins-neural': 'دور البروتينات في الاتصال العصبي',
      'photosynthesis': 'تحويل الطاقة الضوئية إلى طاقة كيميائية كاملة',
      'respiration-fermentation': 'التنفس والتخمر',
      // Mathematics sections
      'functions': 'الدوال',
      'sequences': 'المتتاليات',
      'probability': 'الاحتمالات',
      'complex-numbers': 'الأعداد المركبة',
      'numbers-calculation': 'الأعداد والحساب',
      'space-geometry': 'الهندسة في الفضاء',
      // Physics sections
      'chemical-kinetics': 'المتابعة الزمنية للتحول الكيميائي',
      'mechanical-evolution': 'تطور جملة ميكانيكية',
      'electrical-phenomena': 'الظواهر الكهربائية',
      'chemical-equilibrium': 'تطور جملة كيميائية نحو التوازن',
      'chemical-monitoring': 'مناقبة تطور جملة كيميائية',
      'nuclear-transformations': 'التحويلات النووية',
      // Arabic sections
      'linguistic-structure': 'البناء اللغوي',
      'intellectual-structure': 'البناء الفكري',
      'bac-parsing': 'إعراب من البكالوريات',
      'bac-metaphors': 'استعارات من البكالوريات',
      'bac-questions': 'أسئلة من البكالوريا',
      // Other sections
      'comprehensive': 'كويزات شاملة',
      'unit-1': 'الوحدة 1',
      'unit-2': 'الوحدة 2',
      'philosophical-quotes': 'أقوال فلسفية'
    };

    const sections = subjectSections[selectedQuizSubject] || [];
    
    const subjectTitles: Record<string, string> = {
      'english': 'اللغة الإنجليزية',
      'french': 'اللغة الفرنسية',
      'history': 'التاريخ',
      'natural-sciences': 'العلوم الطبيعية والحياة',
      'mathematics': 'الرياضيات',
      'physics': 'العلوم الفيزيائية',
      'arabic': 'اللغة العربية',
      'islamic-studies': 'العلوم الإسلامية',
      'geography': 'الجغرافيا',
      'philosophy': 'الفلسفة'
    };

    return (
      <div className="p-6 pb-20">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToSubjects}
            className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {subjectTitles[selectedQuizSubject]}
            </h1>
            <p className="text-gray-600">اختر القسم</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setSelectedQuizSection(section)}
              className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Brain size={32} />
                  <div className="text-right">
                    <h3 className="text-lg font-bold">{sectionTitles[section]}</h3>
                    <p className="text-sm opacity-90">
                      {selectedQuizSubject === 'history' ? 'مستويان' : 
                       ['islamic-studies', 'geography', 'philosophy'].includes(selectedQuizSubject) ? 'مستوى واحد' : 
                       '10 مستويات'}
                    </p>
                  </div>
                </div>
                <ArrowLeft size={20} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Main subject selection
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
          <h1 className="text-2xl font-bold text-gray-800">الكويز</h1>
          <p className="text-gray-600">اختر المادة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => {
            setSelectedQuizSubject('english');
            setSelectedQuizSection('');
            setSelectedQuizLevel('');
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">اللغة الإنجليزية</h3>
                <p className="text-sm opacity-90">4 أقسام</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedQuizSubject('french');
            setSelectedQuizSection('');
            setSelectedQuizLevel('');
          }}
          className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">اللغة الفرنسية</h3>
                <p className="text-sm opacity-90">قسم واحد</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedQuizSubject('history');
            setSelectedQuizSection('');
            setSelectedQuizLevel('');
          }}
          className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">التاريخ</h3>
                <p className="text-sm opacity-90">وحدتان</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedQuizSubject('natural-sciences');
            setSelectedQuizSection('');
            setSelectedQuizLevel('');
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">العلوم الطبيعية والحياة</h3>
                <p className="text-sm opacity-90">7 أقسام</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedQuizSubject('mathematics');
            setSelectedQuizSection('');
            setSelectedQuizLevel('');
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">الرياضيات</h3>
                <p className="text-sm opacity-90">6 أقسام</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedQuizSubject('physics');
            setSelectedQuizSection('');
            setSelectedQuizLevel('');
          }}
          className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">العلوم الفيزيائية</h3>
                <p className="text-sm opacity-90">6 أقسام</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedQuizSubject('arabic');
            setSelectedQuizSection('');
            setSelectedQuizLevel('');
          }}
          className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">اللغة العربية</h3>
                <p className="text-sm opacity-90">5 أقسام</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedQuizSubject('islamic-studies');
            setSelectedQuizSection('comprehensive');
            setSelectedQuizLevel('');
          }}
          className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">العلوم الإسلامية</h3>
                <p className="text-sm opacity-90">كويزات شاملة</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedQuizSubject('geography');
            setSelectedQuizSection('');
            setSelectedQuizLevel('');
          }}
          className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">الجغرافيا</h3>
                <p className="text-sm opacity-90">وحدتان</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedQuizSubject('philosophy');
            setSelectedQuizSection('philosophical-quotes');
            setSelectedQuizLevel('');
          }}
          className="bg-gradient-to-r from-slate-500 to-gray-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">الفلسفة</h3>
                <p className="text-sm opacity-90">أقوال فلسفية</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default QuizPage;
