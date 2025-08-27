
import React from 'react';
import { Home, CheckSquare, Trophy, GraduationCap, Clock, List } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'tasks', label: 'المهام', icon: CheckSquare },
    { id: 'ranking', label: 'التصنيف', icon: Trophy },
    { id: 'bac', label: 'بكالوريا', icon: GraduationCap },
    { id: 'tdl', label: 'TDL', icon: List },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-2 py-2 z-50 shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                console.log('Tab clicked:', tab.id);
                onTabChange(tab.id);
              }}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 min-w-[60px] ${
                isActive 
                  ? 'text-blue-600 bg-blue-50 scale-110 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} className={`mb-1 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-medium leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
