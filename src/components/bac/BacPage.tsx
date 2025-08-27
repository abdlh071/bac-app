import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Brain, Calculator, Clock, Users, ArrowRight, ArrowLeft, MessageSquare, Heart, Share2, Star, Headphones, Play, Lightbulb, GraduationCap } from 'lucide-react';

// استيراد جميع المكونات الفرعية لقسم البكالوريا
import QuizPage from './QuizPage';
import MemorizePage from './MemorizePage';
import BotCommandsPage from './BotCommandsPage';
import TimeManagementPage from './TimeManagementPage';
import BacCalculatorPage from './BacCalculatorPage';
import CountdownPage from './CountdownPage';
import SubjectsGridPage from './SubjectsGridPage';
import TrialExamsPage from './TrialExamsPage';
import SupportPage from './SupportPage';

interface BacPageProps {
  userData?: { id: number; points?: number } | null;
}

const BacPage: React.FC<BacPageProps> = ({ userData }) => {
  const [currentView, setCurrentView] = useState<string>('main');

  // -- بداية التعديل --
  // هذا الكود سيجبر الصفحة على الصعود للأعلى كلما تغيرت الواجهة الداخلية
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);
  // -- نهاية التعديل --

  // شاشة تحميل بسيطة في حالة عدم توفر بيانات المستخدم
  if (!userData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen-1/2">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-semibold text-lg">جاري تحميل البيانات...</p>
      </div>
    );
  }

  const handleShare = () => {
    window.open('https://t.me/share/url?url=t.me/MyBACPlus_bot', '_blank');
  };

  // هذه الوظيفة هي المسؤولة عن عرض المحتوى المناسب
  const renderContent = () => {
    switch (currentView) {
      case 'previous-exams':
        return <SubjectsGridPage 
          title="البكالوريات السابقة بالحل" 
          description="اضغط على المادة التي تريدها وسيتم توجيهك للبوت والحصول على كل البكالوريات مرفقة بالحل في شكل PDF" 
          type="previous-exams" 
          onBack={() => setCurrentView('main')} 
        />;
      case 'trial-exams':
        return <TrialExamsPage onBack={() => setCurrentView('main')} />;
      case 'lessons':
        return <SubjectsGridPage 
          title="دروس وملخصات" 
          description="اضغط على المادة التي تريدها وسيتم توجيهك للبوت والحصول على كل الدروس والملخصات في شكل PDF" 
          type="lessons" 
          onBack={() => setCurrentView('main')} 
        />;
      case 'quiz':
        return <QuizPage userData={userData} onBack={() => setCurrentView('main')} />;
      case 'memorize':
        return <MemorizePage onBack={() => setCurrentView('main')} />;
      case 'bot-commands':
        return <BotCommandsPage onBack={() => setCurrentView('main')} />;
      case 'time-management':
        return <TimeManagementPage onBack={() => setCurrentView('main')} />;
      case 'calculator':
        return <BacCalculatorPage onBack={() => setCurrentView('main')} />;
      case 'countdown':
        return <CountdownPage onBack={() => setCurrentView('main')} />;
      case 'support':
        return <SupportPage onBack={() => setCurrentView('main')} />;
      
      // الحالة الافتراضية تعرض القائمة الرئيسية
      default:
        return (
          <div className="p-6 pb-20">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">البكالوريا</h1>
              <p className="text-gray-600">جميع الموارد التعليمية للبكالوريا</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {/* البكالوريات السابقة */}
              <button onClick={() => setCurrentView('previous-exams')} className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">البكالوريات السابقة بالحل</h3>
                      <p className="text-sm opacity-90">جميع امتحانات البكالوريا مع الحلول النموذجية لجميع المواد</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* البكالوريات التجريبية */}
              <button onClick={() => setCurrentView('trial-exams')} className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">البكالوريات التجريبية</h3>
                      <p className="text-sm opacity-90">امتحانات البكالوريا التجريبية للسنوات المختلفة</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* البكالوريات الأجنبية (رابط مباشر) */}
              <button onClick={() => window.open('https://t.me/MyBACPlus_bot?start=9eaf4ed49616faaa50a8947e11a28167', '_blank')} className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">البكالوريات الأجنبية</h3>
                      <p className="text-sm opacity-90">مجموعة من البكالوريات الأجنبية لمختلف السنوات</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* دروس وملخصات */}
              <button onClick={() => setCurrentView('lessons')} className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <BookOpen size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">دروس وملخصات</h3>
                      <p className="text-sm opacity-90">ملخصات ودروس شاملة لجميع المواد مع التمارين المحلولة</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* كويز في المواد */}
              <button onClick={() => setCurrentView('quiz')} className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Brain size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">كويز في المواد</h3>
                      <p className="text-sm opacity-90">اختبر معلوماتك في الإنجليزية، الفرنسية والتاريخ</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* احفظ معي */}
              <button onClick={() => setCurrentView('memorize')} className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Lightbulb size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">احفظ معي</h3>
                      <p className="text-sm opacity-90">احفظ ما يجب حفظه في أهم مواد الحفظ</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* جميع مزايا الآلة الحاسبة (رابط مباشر) */}
              <button onClick={() => window.open('https://t.me/MyBACPlus_bot?start=c484b62e10c06697eff39d966a38e05a', '_blank')} className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Calculator size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">جميع مزايا الآلة الحاسبة</h3>
                      <p className="text-sm opacity-90">دليلك الكامل لاستخدام جميع مزايا الآلة الحاسبة</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* أوامر إلى البوت */}
              <button onClick={() => setCurrentView('bot-commands')} className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <MessageSquare size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">أوامر إلى البوت</h3>
                      <p className="text-sm opacity-90">أوامر مفيدة يمكنك إرسالها للبوت للحصول على مساعدة إضافية</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* كيف تنظم وقتك */}
              <button onClick={() => setCurrentView('time-management')} className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Clock size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">كيف تنظم وقتك</h3>
                      <p className="text-sm opacity-90">دليل شامل لتنظيم الوقت وإعداد برنامج مراجعة فعال</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* رسالة تحفيزية لك (رابط مباشر) */}
              <button onClick={() => window.open('https://t.me/MyBACPlus_bot?start=3fb99c321d3c36887a19cc69f3a3981c', '_blank')} className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Heart size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">رسالة تحفيزية لك</h3>
                      <p className="text-sm opacity-90">احصل على رسالة تحفيزية من البوت لدعمك في رحلة البكالوريا</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* دليلك الشامل لأسبوع البكالوريا (رابط مباشر) */}
              <button onClick={() => window.open('https://t.me/MyBACPlus_bot?start=c8d26f4295bc94808a0d49624e5294ac', '_blank')} className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Star size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">دليلك الشامل لأسبوع البكالوريا</h3>
                      <p className="text-sm opacity-90">دليل متكامل يساعدك في التحضير لأسبوع امتحان البكالوريا</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* حساب معدل البكالوريا */}
              <button onClick={() => setCurrentView('calculator')} className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Calculator size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">حساب معدل البكالوريا</h3>
                      <p className="text-sm opacity-90">احسب معدلك لجميع الشعب مع إمكانية استثناء بعض المواد</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* العد التنازلي للبكالوريا */}
              <button onClick={() => setCurrentView('countdown')} className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Clock size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">العد التنازلي للبكالوريا</h3>
                      <p className="text-sm opacity-90">الوقت المتبقي لامتحان البكالوريا 2026</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* قناتنا في البكالوريا (رابط مباشر) */}
              <button onClick={() => window.open('https://t.me/revisaa', '_blank')} className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Users size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">قناتنا في البكالوريا</h3>
                      <p className="text-sm opacity-90">تابع قناتنا الرسمية للحصول على آخر الأخبار والموارد</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* مجموعة المناقشة (رابط مباشر) */}
              <button onClick={() => window.open('https://t.me/revisa_chat', '_blank')} className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Users size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">مجموعة المناقشة</h3>
                      <p className="text-sm opacity-90">انضم لمجموعة النقاش والتفاعل مع الطلاب</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* دليلك الشامل لرحلتك الجامعية (رابط مباشر) */}
              <button onClick={() => window.open('https://t.me/after_revisa', '_blank')} className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <GraduationCap size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">دليلك الشامل لرحلتك الجامعية</h3>
                      <p className="text-sm opacity-90">دليل متكامل يساعدك في اتخاذ قراراتك بعد البكالوريا</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* ادعم تطبيقنا */}
              <button onClick={() => setCurrentView('support')} className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Heart size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">ادعم تطبيقنا</h3>
                      <p className="text-sm opacity-90">ساهم في دعم تطوير التطبيق واستمراريته</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* التواصل مع الدعم (رابط مباشر) */}
              <button onClick={() => window.open('https://t.me/Revisa_Support', '_blank')} className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Headphones size={32} className="transform transition-transform duration-300 hover:scale-110" />
                    <div className="text-right">
                      <h3 className="text-lg font-bold">التواصل مع الدعم</h3>
                      <p className="text-sm opacity-90">تواصل مع فريق الدعم لحل أي مشكلة</p>
                    </div>
                  </div>
                  <ArrowLeft size={20} />
                </div>
              </button>
              {/* شارك البوت مع أصدقائك */}
              <button onClick={handleShare} className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-center">
                  <Share2 size={24} className="ml-3" />
                  <h3 className="text-lg font-bold">شارك البوت مع أصدقائك</h3>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  // المكون يعرض فقط نتيجة الدالة أعلاه
  return <>{renderContent()}</>;
};

export default BacPage;
