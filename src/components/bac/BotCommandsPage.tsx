import React from 'react';
import { ArrowRight, MessageSquare, Play } from 'lucide-react';

interface BotCommandsPageProps {
  onBack: () => void;
}

const BotCommandsPage: React.FC<BotCommandsPageProps> = ({ onBack }) => {
  const botCommands = [
    { code: '901', description: 'سوف يرسل البوت لك نصًا يوضح كيفية التسجيل في البكالوريا، والوثائق المطلوبة، والروابط الرسمية المهمة', color: 'from-blue-500 to-cyan-600' },
    { code: '902', description: 'سوف يرسل البوت لك أفضل أدوات الذكاء الاصطناعي التي تساعدك في حل التمارين، تلخيص الدروس، والمراجعة الذكية', color: 'from-green-500 to-emerald-600' },
    { code: '903', description: 'سوف يرسل البوت لك آلة حاسبة تفاعلية شبيهة بكازيو، يمكنك استخدامها مباشرة في هاتفك دون الحاجة لحمل آلة حقيقية', color: 'from-purple-500 to-pink-600' },
    { code: '904', description: 'سوف يرسل البوت لك نسخة مطابقة لورقة الإجابة الرسمية في البكالوريا لتتدرب عليها كأنك في الامتحان الحقيقي', color: 'from-orange-500 to-red-600' },
    { code: '905', description: 'سوف يرسل البوت لك أداة تساعدك في تحويل صور التمارين أو الملاحظات إلى ملف PDF مرتب بسهولة', color: 'from-yellow-500 to-orange-600' },
    { code: '906', description: 'سوف يرسل البوت لك دليلاً لأهم الإعدادات التي يجب تفعيلها على تطبيق تلغرام لتحصل على الإشعارات وتتفادى التشتت', color: 'from-indigo-500 to-purple-600' },
    { code: '907', description: 'سوف يرسل البوت لك تطبيقًا ذكيًا يساعدك على غلق التطبيقات المشتتة ومنع استخدام الهاتف أثناء المراجعة', color: 'from-pink-500 to-rose-600' },
    { code: '908', description: 'سوف يرسل البوت لك تطبيقًا يساعدك على تنظيم المهام اليومية، وتحديد أهدافك الدراسية، ومتابعة إنجازك كل يوم', color: 'from-teal-500 to-cyan-600' }
  ];

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
          <h1 className="text-2xl font-bold text-gray-800">أوامر إلى البوت</h1>
          <p className="text-gray-600">أرسل هذه الأوامر للبوت للحصول على مساعدة إضافية</p>
        </div>
      </div>

      <button
        onClick={() => window.open('https://t.me/MyBACPlus_bot?start=2bf3a5ed571b3be149814687a9128368', '_blank')}
        className="w-full bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all mb-6"
      >
        <div className="flex items-center justify-center">
          <Play size={24} className="ml-3" />
          <h3 className="text-lg font-bold">كيف تستخدم الأوامر</h3>
        </div>
      </button>

      <div className="grid grid-cols-1 gap-4">
        {botCommands.map((command, index) => (
          <div
            key={index}
            className={`relative overflow-hidden bg-gradient-to-r ${command.color} p-6 rounded-2xl text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  <span className="text-2xl font-bold animate-pulse">
                    {command.code}
                  </span>
                </div>
                <MessageSquare size={24} className="animate-bounce" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-lg">أرسل الى البوت الامر: {command.code}</p>
                <p className="text-sm opacity-90 leading-relaxed">{command.description}</p>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotCommandsPage;
