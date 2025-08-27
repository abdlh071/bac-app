import React from 'react';
import { ArrowRight, ArrowLeft, XCircle, CheckCircle, FileText } from 'lucide-react';

interface TimeManagementPageProps {
  onBack: () => void;
}

const TimeManagementPage: React.FC<TimeManagementPageProps> = ({ onBack }) => {
  return (
    <div className="p-6 pb-20">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">كيف تنظم وقتك</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-right">مقدمة مهمة</h2>
          <div className="text-gray-700 leading-relaxed text-right space-y-4">
            <p>
              قبـل كـل شـيء ، لن أعطيــك برنــامج مجـهزًا فـي الـبداية فهـذا خطأ ، بـل سأقـوم بتوجيـهك إلـى الـبرنـامج الـذي سيساعـدك !
            </p>
            <p>
              يمر التلميذ في مسيرة تحضير البكالوريا بعدة عواقب منها الاحباط والفشل والفراغ والتشتت ، فالمنظم لوقته ليس كالذي غير ذلك ، لهذا يجب عليه أولا أن يبدأ بتنظيم وقته حتى يشعر بأنه في الطريق الصحيح الذي سطره عند بداية الموسم، كما ان تنظيم الوقت يُعلم التلميذ الانضباط والالتزام بالخطط التي سيتبعها في تحضيراته ، وسيجعل نفسيته ممتازة ويشعر حينها بأنه ملم بكل نقاط قوته وضعفه في كل مادة.
            </p>
            <p className="font-semibold">
              إليكم هذه النصائح والأخطاء التي يجب تجنبها، و التي ستساعدكم في تنظيم وقتكم وإعداد برنامجكم الخاص بتحضير بكالوريا 2026 :
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-red-100">
          <h2 className="text-xl font-bold text-red-700 mb-4 text-right flex items-center justify-end">
            <span>أخطاء يجب تجنبها في رزنامتك</span>
            <XCircle size={24} className="mr-2" />
          </h2>
          <div className="space-y-4 text-gray-700 text-right">
            <div className="flex items-start text-right">
              <div className="flex-1">
                <p>لا يجب الاعتماد على برامج تحضير لأشخاص آخرين حتى ولو كانوا متفوقين ، فلكلٍ طريقته، يمكن الاستفادة من برامجهم وأخذ ما يناسبك منها ثم القيام بتسطير برنامج شخصي خاص بك.</p>
              </div>
              <div className="w-3 h-3 bg-red-400 rounded-full ml-3 mt-2 flex-shrink-0"></div>
            </div>
            <div className="flex items-start text-right">
              <div className="flex-1">
                <p>لا يجب تسطير برنامج مكثف وقاسي حتى لا تصيب نفسك بالاجهاد والذي ممكن ان يجعلك تتكاسل في تطبيقه.</p>
              </div>
              <div className="w-3 h-3 bg-red-400 rounded-full ml-3 mt-2 flex-shrink-0"></div>
            </div>
            <div className="flex items-start text-right">
              <div className="flex-1">
                <p>رزنامة التحضير لا يجب أن تعتمد على مبدأ الكمية بل الكيفية.</p>
              </div>
              <div className="w-3 h-3 bg-red-400 rounded-full ml-3 mt-2 flex-shrink-0"></div>
            </div>
            <div className="flex items-start text-right">
              <div className="flex-1">
                <p>من الخطأ الاعتماد على برنامج واحد طيلة الموسم ، بحيث اذا رأيت أنه يجب تعديل البرنامج بالزيادة مثلا في توقيت كل مادة او بالنقصان فقم بذلك.</p>
              </div>
              <div className="w-3 h-3 bg-red-400 rounded-full ml-3 mt-2 flex-shrink-0"></div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 text-right">
              تنظيم الوقت هو المفتاح الحقيقي للنجاح في الدراسة، فهو يساعدك على استغلال يومك بذكاء دون تراكم أو توتر. كل دقيقة تمر دون هدف هي فرصة ضائعة لا تُعوّض. فاجعل من وقتك أداة تبني بها مستقبلك لا عبئًا يثقل كاهلك.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl shadow-lg border border-green-100">
          <h2 className="text-xl font-bold text-green-700 mb-4 text-right flex items-center justify-end">
            <span>كيفية تسطير برنامج التحضير</span>
            <CheckCircle size={24} className="mr-2" />
          </h2>
          <div className="space-y-4 text-gray-700 text-right">
            <div className="flex items-start text-right">
              <div className="flex-1">
                <p className="font-semibold">1- قم بتسطير برنامج على هذا الشكل ⬇️</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full ml-3 mt-2 flex-shrink-0"></div>
            </div>
            <div className="flex items-start text-right">
              <div className="flex-1">
                <p>2- قم بملء الجدول حسب شعبتك بحيث تركز أكثر على المواد الأساسية عند توزيعها على البرنامج ، وأيضا تخصيص عطلة نهاية الأسبوع لحل الواجبات المدرسية ودراسة دروس الدعم أو الراحة ..</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full ml-3 mt-2 flex-shrink-0"></div>
            </div>
            <p className="font-semibold text-center mt-6 mb-4">يمكنكم تحميل جدول من الجداول الموجودة في الأسفل و تغيير عليها كما تريد</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 text-center mb-4">جداول حسب الشعب</h3>
          <button
            onClick={() => window.open('https://eddirasa.com/wp-content/uploads/2020/12/programme-revision-bac-science.docx', '_blank')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText size={24} />
                <span className="text-right">لشعبة علوم تجريبية</span>
              </div>
              <ArrowLeft size={16} />
            </div>
          </button>
          <button
            onClick={() => window.open('https://eddirasa.com/wp-content/uploads/2020/12/programme-revision-bac-math.docx', '_blank')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText size={24} />
                <span className="text-right">لشعبة رياضيات</span>
              </div>
              <ArrowLeft size={16} />
            </div>
          </button>
          <button
            onClick={() => window.open('https://eddirasa.com/wp-content/uploads/2020/12/programme-revision-bac-math-technique.docx', '_blank')}
            className="w-full bg-gradient-to-r from-slate-500 to-gray-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText size={24} />
                <span className="text-right">لشعبة تقني رياضي</span>
              </div>
              <ArrowLeft size={16} />
            </div>
          </button>
          <button
            onClick={() => window.open('https://eddirasa.com/wp-content/uploads/2020/12/programme-revision-bac-gestion.docx', '_blank')}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText size={24} />
                <span className="text-right">لشعبة تسيير و اقتصاد</span>
              </div>
              <ArrowLeft size={16} />
            </div>
          </button>
          <button
            onClick={() => window.open('https://eddirasa.com/wp-content/uploads/2020/12/programme-revision-bac-lettre.docx', '_blank')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText size={24} />
                <span className="text-right">لشعبة آداب و فلسفة</span>
              </div>
              <ArrowLeft size={16} />
            </div>
          </button>
          <button
            onClick={() => window.open('https://eddirasa.com/wp-content/uploads/2020/12/programme-revision-bac-langue.docx', '_blank')}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText size={24} />
                <span className="text-right">لشعبة لغات أجنبية</span>
              </div>
              <ArrowLeft size={16} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeManagementPage;
