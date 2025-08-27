import React, { useState, useMemo } from 'react';
import { BookOpen, ArrowRight, ArrowLeft, ClipboardCheck } from 'lucide-react';
// تم تصحيح مسار الاستيراد هنا
import CardsComponent from './cards/CardsComponent'; 

interface MemorizePageProps {
  onBack: () => void;
}

const MemorizePage: React.FC<MemorizePageProps> = ({ onBack }) => {
  const [selectedMemorizeSubject, setSelectedMemorizeSubject] = useState<string>('');
  const [selectedMemorizeSection, setSelectedMemorizeSection] = useState<string>('');
  const [selectedMemorizeUnit, setSelectedMemorizeUnit] = useState<string>('');

  const memoizedMemorizeConfig = useMemo(() => ({
    subject: selectedMemorizeSubject,
    section: selectedMemorizeSection,
    unit: selectedMemorizeUnit
  }), [selectedMemorizeSubject, selectedMemorizeSection, selectedMemorizeUnit]);

  const handleBackToMainSubjects = () => {
    setSelectedMemorizeSubject('');
    setSelectedMemorizeSection('');
    setSelectedMemorizeUnit('');
  };

  if (selectedMemorizeSubject && selectedMemorizeSection && selectedMemorizeUnit) {
    return (
      <CardsComponent
        cardConfig={memoizedMemorizeConfig}
        onBack={() => {
          if (selectedMemorizeSubject === 'history' && (selectedMemorizeSection === 'terms' || selectedMemorizeSection === 'personalities')) {
            setSelectedMemorizeUnit('');
          } else {
            setSelectedMemorizeUnit('');
            setSelectedMemorizeSection('');
          }
        }}
      />
    );
  }

  if (selectedMemorizeSubject === 'history' && selectedMemorizeSection && !selectedMemorizeUnit) {
    const units = selectedMemorizeSection === 'terms'
      ? ['مصطلحات الوحدة الاولى', 'مصطلحات الوحدة الثانية']
      : ['شخصيات الوحدة الاولى', 'شخصيات الوحدة الثانية', 'شخصيات إضافية'];

    return (
      <div className="p-6 pb-20">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setSelectedMemorizeSection('')}
            className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedMemorizeSection === 'terms' ? 'مصطلحات التاريخ' : 'شخصيات التاريخ'}
            </h1>
            <p className="text-gray-600">اختر الوحدة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {units.map((unit, index) => (
            <button
              key={index}
              onClick={() => setSelectedMemorizeUnit(unit)}
              className="bg-gradient-to-r from-teal-500 to-green-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ClipboardCheck size={32} />
                  <div className="text-right">
                    <h3 className="text-lg font-bold">{unit}</h3>
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

  if (selectedMemorizeSubject && !selectedMemorizeSection) {
    let sections: { id: string; name: string; unitName?: string }[] = [];
    let pageTitle = '';
    let pageDescription = '';

    if (selectedMemorizeSubject === 'history') {
      pageTitle = 'مادة التاريخ';
      pageDescription = 'اختر القسم';
      sections = [
        { id: 'terms', name: 'المصطلحات' },
        { id: 'personalities', name: 'الشخصيات' },
      ];
    } else if (selectedMemorizeSubject === 'geography') {
      pageTitle = 'مادة الجغرافيا';
      pageDescription = 'اختر الوحدة';
      sections = [
        { id: 'unit1-terms', name: 'مصطلحات الوحدة الاولى', unitName: 'مصطلحات الوحدة الاولى' },
        { id: 'unit2-terms', name: 'مصطلحات الوحدة الثانية', unitName: 'مصطلحات الوحدة الثانية' },
      ];
    } else if (selectedMemorizeSubject === 'islamic-sciences') {
      pageTitle = 'العلوم الإسلامية';
      pageDescription = 'اختر القسم';
      sections = [
        { id: 'definitions', name: 'تعريفات', unitName: 'تعريفات' },
      ];
    }

    return (
      <div className="p-6 pb-20">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToMainSubjects}
            className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
            <p className="text-gray-600">{pageDescription}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setSelectedMemorizeSection(section.id);
                if (selectedMemorizeSubject === 'geography' || selectedMemorizeSubject === 'islamic-sciences') {
                  setSelectedMemorizeUnit(section.unitName || '');
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <BookOpen size={32} />
                  <div className="text-right">
                    <h3 className="text-lg font-bold">{section.name}</h3>
                  </div>
                </div>
                <ArrowLeft size={20} />
              </div>
            </button>
          ))}
        </div>
        {selectedMemorizeSubject === 'history' && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-right">
            <p className="text-sm text-yellow-800">
              التواريخ مدرجة في قسم الكويز.
            </p>
          </div>
        )}
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-800">احفظ معي</h1>
          <p className="text-gray-600">اختر المادة للحفظ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => setSelectedMemorizeSubject('history')}
          className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">مادة التاريخ</h3>
                <p className="text-sm opacity-90">مصطلحات وشخصيات</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => setSelectedMemorizeSubject('geography')}
          className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">مادة الجغرافيا</h3>
                <p className="text-sm opacity-90">مصطلحات</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>

        <button
          onClick={() => setSelectedMemorizeSubject('islamic-sciences')}
          className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen size={32} />
              <div className="text-right">
                <h3 className="text-lg font-bold">العلوم الإسلامية</h3>
                <p className="text-sm opacity-90">تعريفات</p>
              </div>
            </div>
            <ArrowLeft size={20} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default MemorizePage;
