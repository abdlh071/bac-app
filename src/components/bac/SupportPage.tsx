import React from 'react';
import { ArrowRight, Heart, Share2, Users, MessageCircle, Star } from 'lucide-react';

interface SupportPageProps {
  onBack: () => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ onBack }) => {
  
  const handleShare = () => {
    // This URL is a direct link to share the bot on Telegram
    window.open('https://t.me/share/url?url=t.me/MyBACPlus_bot&text=تطبيق رائع لمراجعة البكالوريا، أنصحكم به!', '_blank');
  };

  return (
    <div className="p-6 pb-20 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="ml-4 p-2 rounded-lg bg-white shadow-sm hover:bg-gray-100 transition-colors"
        >
          <ArrowRight size={20} className="text-gray-700" />
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-800">ادعم رحلتنا</h1>
          <p className="text-gray-600">دعمكم هو وقودنا للاستمرار والتطور</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Card: Introduction */}
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center border border-gray-100">
            <Heart className="mx-auto text-red-500 mb-4 h-12 w-12 animate-pulse" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">شكرًا لوجودك معنا!</h2>
            <p className="text-gray-700 leading-relaxed">
                أفضل دعم يمكنك تقديمه لنا هو مساعدتنا على الوصول إلى المزيد من الطلاب. دعمك المعنوي يعني لنا الكثير ويساعدنا على مواصلة تقديم الأفضل.
            </p>
        </div>

        {/* Card: Share the App */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex flex-col items-center text-center">
                <Share2 size={32} className="mb-3" />
                <h3 className="text-lg font-bold mb-2">شارك التطبيق مع أصدقائك</h3>
                <p className="text-sm opacity-90 mb-4">ساهم في نشر الفائدة وساعد زملائك في رحلتهم نحو النجاح.</p>
                <button 
                    onClick={handleShare}
                    className="bg-white text-blue-600 font-semibold px-6 py-2 rounded-full shadow-md hover:bg-blue-50 transition-transform transform hover:scale-105"
                >
                    شارك الآن
                </button>
            </div>
        </div>

        {/* Card: Support with Stars */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex flex-col items-center text-center">
                <Star size={32} className="mb-3" />
                <h3 className="text-lg font-bold mb-2">ادعمنا بالنجوم (اختياري)</h3>
                <p className="text-sm opacity-90 mb-4">إذا أردت المساهمة في تكاليف تطوير التطبيق، يمكنك دعمنا عبر نجوم تيليجرام.</p>
                {/* -- بداية التعديل -- */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
                    <button 
                        onClick={() => window.open('https://t.me/$6yoSCxm0YFOmAgAAlb7zPodPoYY', '_blank')}
                        className="bg-white text-orange-600 font-bold py-2 rounded-full shadow-md hover:bg-orange-50 transition-transform transform hover:scale-105 flex items-center justify-center"
                    >
                        <Star size={16} className="mr-1.5" /> 10
                    </button>
                    <button 
                        onClick={() => window.open('https://t.me/$ytqLVhm0YFOnAgAAVv5iLjoK9Nk', '_blank')}
                        className="bg-white text-orange-600 font-bold py-2 rounded-full shadow-md hover:bg-orange-50 transition-transform transform hover:scale-105 flex items-center justify-center"
                    >
                        <Star size={16} className="mr-1.5" /> 100
                    </button>
                    <button 
                        onClick={() => window.open('https://t.me/$OTU73Rm0YFOoAgAAv99zHRwhd0Q', '_blank')}
                        className="bg-white text-orange-600 font-bold py-2 rounded-full shadow-md hover:bg-orange-50 transition-transform transform hover:scale-105 flex items-center justify-center"
                    >
                        <Star size={16} className="mr-1.5" /> 500
                    </button>
                </div>
                {/* -- نهاية التعديل -- */}
            </div>
        </div>

        {/* Card: Join the Community */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex flex-col items-center text-center">
                <Users size={32} className="mb-3" />
                <h3 className="text-lg font-bold mb-2">انضم إلى مجتمعنا</h3>
                <p className="text-sm opacity-90 mb-4">كن جزءًا من عائلتنا على تيليجرام وشارك في النقاشات المفيدة.</p>
                {/* -- بداية التعديل -- */}
                <div className="flex justify-center items-center gap-4">
                    <button 
                        onClick={() => window.open('https://t.me/revisaa', '_blank')}
                        className="bg-white text-emerald-600 font-semibold px-5 py-2 rounded-full shadow-md hover:bg-emerald-50 transition-transform transform hover:scale-105"
                    >
                        القناة الرسمية
                    </button>
                    <button 
                        onClick={() => window.open('https://t.me/revisa_chat', '_blank')}
                        className="bg-white text-emerald-600 font-semibold px-5 py-2 rounded-full shadow-md hover:bg-emerald-50 transition-transform transform hover:scale-105"
                    >
                        مجموعة النقاش
                    </button>
                </div>
                {/* -- نهاية التعديل -- */}
            </div>
        </div>
        
        {/* Card: Feedback and Support */}
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center border border-gray-100">
            <MessageCircle className="mx-auto text-gray-500 mb-4 h-10 w-10" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">هل تواجه مشكلة؟</h2>
            <p className="text-gray-700 leading-relaxed">
                إذا واجهتك أي مشكلة تقنية أو كان لديك اقتراح لتطوير التطبيق، لا تتردد في التواصل معنا عبر قسم <span className="font-bold text-blue-600">"التواصل مع الدعم"</span>. رأيك يهمنا!
            </p>
        </div>

      </div>
    </div>
  );
};

export default SupportPage;
