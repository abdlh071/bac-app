import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

interface SubjectsGridPageProps {
  title: string;
  description: string;
  type: 'previous-exams' | 'lessons';
  onBack: () => void;
}

const SubjectsGridPage: React.FC<SubjectsGridPageProps> = ({ title, description, type, onBack }) => {
  const subjectsWithLinks = {
    'previous-exams': {
      'الرياضيات': 'https://t.me/MyBACPlus_bot?start=ade0b2d4c52b45603d2aaa5c5df05241',
      'الفيزياء': 'https://t.me/MyBACPlus_bot?start=03583554a0509561721fd7f39e0a3276',
      'العلوم الطبيعية والحياة': 'https://t.me/MyBACPlus_bot?start=937c174a26b2903e46326f4272a10dea',
      'هندسة كهربائية': 'https://t.me/MyBACPlus_bot?start=ecdc8f7f7656edf708298106919229ac',
      'هندسة مدنية': 'https://t.me/MyBACPlus_bot?start=1ee6098715e7d6d32e0cd3e08cff8edd',
      'هندسة طرائق': 'https://t.me/MyBACPlus_bot?start=ae9d4395cc686298acb5bfbf0fe3d568',
      'هندسة ميكانيكية': 'https://t.me/MyBACPlus_bot?start=0f7658922b6bcd25f066ffb2a2379d32',
      'الاقتصاد': 'https://t.me/MyBACPlus_bot?start=1509b25cb2389643d88636694130b17f',
      'القانون': 'https://t.me/MyBACPlus_bot?start=5b28c6e5253fc1f6abd957d4218bcb82',
      'المحاسبة': 'https://t.me/MyBACPlus_bot?start=c8dad1d6bee5890f84e07586dd199850',
      'الشريعة': 'https://t.me/MyBACPlus_bot?start=bfb988d4360c01ed909d87ffad7f91a6',
      'اللغة العربية': 'https://t.me/MyBACPlus_bot?start=996ec67d39262f08c47b98e718f772db',
      'الإسبانية': 'https://t.me/MyBACPlus_bot?start=bb9ddea96347baa0836948029a81421f',
      'الألمانية': 'https://t.me/MyBACPlus_bot?start=ed06afec88bac8b194f9cd2c05b646f8',
      'الإيطالية': 'https://t.me/MyBACPlus_bot?start=e43349cf9bd623b3dc5b35b714c2be71',
      'الفرنسية': 'https://t.me/MyBACPlus_bot?start=3ce4eed1422cdab1b68e282ff03dfa92',
      'الإنجليزية': 'https://t.me/MyBACPlus_bot?start=d5820d44865d3d48566100567bc22e1d',
      'الاجتماعيات': 'https://t.me/MyBACPlus_bot?start=e81a234cdbe94c5dfab425618594bb07',
      'الفلسفة': 'https://t.me/MyBACPlus_bot?start=40bf252f6d90058e18af794e8bedbd12',
      'الأمازيغية': 'https://t.me/MyBACPlus_bot?start=f3bc954f751008ab12706045fe27ba48'
    },
    'lessons': {
      'الرياضيات': 'https://t.me/MyBACPlus_bot?start=0dc7a2b070dcd187dbdb5327225ac799',
      'الفيزياء': 'https://t.me/MyBACPlus_bot?start=b0aec9872e26d7561a347e7d01ffd440',
      'العلوم الطبيعية والحياة': 'https://t.me/MyBACPlus_bot?start=07d5c9e1fd595b21f02146e092fa7c2e',
      'هندسة مدنية': 'https://t.me/MyBACPlus_bot?start=7c4e4cafa272f2481dccdf12c4e105f9',
      'هندسة كهربائية': 'https://t.me/MyBACPlus_bot?start=c41177b3e717695b8098551f5a19953b',
      'هندسة طرائق': 'https://t.me/MyBACPlus_bot?start=63581fd93e14fab34e2824aee7239cc5',
      'هندسة ميكانيكية': 'https://t.me/MyBACPlus_bot?start=8373c369e74fd80c0ab2a10eb1025930',
      'الاقتصاد': 'https://t.me/MyBACPlus_bot?start=926e8b08f6ad08c2e586552be8a4b128',
      'القانون': 'https://t.me/MyBACPlus_bot?start=c6336d1897958916c5756f1f7b20a82a',
      'المحاسبة': 'https://t.me/MyBACPlus_bot?start=df794c3af24d2d5fc62311cb8d80dd1e',
      'الشريعة': 'https://t.me/MyBACPlus_bot?start=be8673bc2c86a8377612d17564098b81',
      'اللغة العربية': 'https://t.me/MyBACPlus_bot?start=f723abe91cb3677db0f0deec09781710',
      'الإسبانية': 'https://t.me/MyBACPlus_bot?start=c3f98ed68826027be21236d23ed874cb',
      'الألمانية': 'https://t.me/MyBACPlus_bot?start=db8784578a8010567b18e4e6da6b2248',
      'الإيطالية': 'https://t.me/MyBACPlus_bot?start=99e6bce0ea21dd67e1a6cddcd2e1186a',
      'الفرنسية': 'https://t.me/MyBACPlus_bot?start=3ce4eed1422cdab1b68e282ff03dfa92',
      'الإنجليزية': 'https://t.me/MyBACPlus_bot?start=d5820d44865d3d48566100567bc22e1d',
      'الاجتماعيات': 'https://t.me/MyBACPlus_bot?start=3adbfc1050a21b93d9dcef64913c574b',
      'الفلسفة': 'https://t.me/MyBACPlus_bot?start=596dafa4c031614fee075bdcf7b8cbc6',
      'الأمازيغية': 'https://t.me/MyBACPlus_bot?start=8c27f38eb850c96cd964cfdc096f4061'
    }
  };

  const subjects = Object.keys(subjectsWithLinks['previous-exams']);
  const links = subjectsWithLinks[type];

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
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 text-sm mt-2">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {subjects.map((subject, index) => (
          <button
            key={index}
            onClick={() => window.open(links[subject as keyof typeof links], '_blank')}
            className="group relative bg-white p-6 rounded-3xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <BookOpen className="text-white animate-pulse" size={28} />
              </div>
              <span className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                {subject}
              </span>
            </div>
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300"></div>
          </button>
        ))}
        {type === 'lessons' && (
          <div className="col-span-2 mt-6">
            <button
              onClick={() => window.open('https://t.me/Bacscientifique2026', '_blank')}
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
            >
              <BookOpen size={28} className="ml-3" />
              <h3 className="text-lg font-bold">مجموعة اضافية تحتوي على دروس و ملخصات</h3>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsGridPage;
