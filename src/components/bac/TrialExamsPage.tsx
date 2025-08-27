import React from 'react';
import { ArrowRight } from 'lucide-react';

interface TrialExamsPageProps {
  onBack: () => void;
}

const TrialExamsPage: React.FC<TrialExamsPageProps> = ({ onBack }) => {
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
          <h1 className="text-2xl font-bold text-gray-800">البكالوريات التجريبية</h1>
          <p className="text-gray-600">امتحانات البكالوريا التجريبية للسنوات المختلفة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <button
          onClick={() => window.open('https://t.me/MyBACPlus_bot?start=a366a616081f8c83001124ea61bce7a9', '_blank')}
          className="bg-gradient-to-br from-red-500 to-pink-600 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
        >
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">2023</div>
            <p className="text-lg opacity-90">البكالوريات التجريبية</p>
          </div>
        </button>

        <button
          onClick={() => window.open('https://t.me/MyBACPlus_bot?start=ce0401d93c30c7b9a29cd30cd76241cf', '_blank')}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
        >
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">2024</div>
            <p className="text-lg opacity-90">البكالوريا التجريبية</p>
          </div>
        </button>

        <button
          onClick={() => window.open('https://t.me/MyBACPlus_bot?start=6d2e51b29c54002134b30b4823e09b0f', '_blank')}
          className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
        >
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">2025</div>
            <p className="text-lg opacity-90">البكالوريا التجريبية</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TrialExamsPage;
