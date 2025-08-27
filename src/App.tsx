import React, { useState, useCallback, memo } from 'react';
import { useAuth } from './context/AuthContext';
import AIChatPage from './components/AIChatPage';
import { BrainCircuit } from 'lucide-react';
import BottomNavigation from './components/BottomNavigation';
import HomePage from './components/HomePage';
import TasksPage from './components/TasksPage';
import RankingPage from './components/RankingPage';
import BacPage from './components/bac/BacPage';
import TDLPage from './components/TDLPage';
import ChallengePage from './components/ChallengePage';
import FocusTimerPage from './components/FocusTimerPage';
import LoginPage from './components/LoginPage';
import { handleMinutelySessionUpdate, updateSessionGroups } from './utils/supabase';

/**
 * The main component of the application.
 * It handles routing between different pages based on the active tab
 * and manages the authentication state.
 */
const App: React.FC = memo(() => {
  // Get authentication state from the context
  const { user, userData, loading: authLoading } = useAuth();
  
  // State for managing the UI
  const [activeTab, setActiveTab] = useState('home');
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  /**
   * Handles changing the active tab and triggers session updates if necessary.
   */
  const handleTabChange = useCallback(
    async (tab: string) => {
      setActiveTab(tab);
      // If navigating to or from the challenge page, update session time
      if (userData?.id && (tab === 'challenge' || activeTab === 'challenge')) {
        try {
          await handleMinutelySessionUpdate(userData.id);
          await updateSessionGroups(userData.id);
        } catch (error) {
          console.error('Error updating session for challenge navigation:', error);
        }
      }
    },
    [activeTab, userData?.id]
  );

  // Show a loading spinner while authentication is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="text-gray-700 text-lg font-medium mt-4">جاري التحميل...</p>
      </div>
    );
  }

  // If the user is not authenticated, show the login page
  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100" dir="rtl">
        <LoginPage />
      </div>
    );
  }

  /**
   * Renders the component corresponding to the active tab.
   */
  const renderActiveTab = () => {
    if (showFocusTimer) return <FocusTimerPage onClose={() => setShowFocusTimer(false)} />;

    switch (activeTab) {
      case 'home':
        return <HomePage userData={userData} onTabChange={handleTabChange} />;
      case 'tasks':
        return <TasksPage userData={userData} />;
      case 'ranking':
        return <RankingPage currentUser={userData} onTabChange={handleTabChange} />;
      case 'bac':
        return <BacPage userData={userData} />;
      case 'tdl':
        return <TDLPage userData={userData} onShowFocusTimer={() => setShowFocusTimer(true)} />;
      case 'challenge':
        return <ChallengePage currentUser={userData} />;
      default:
        return <HomePage userData={userData} onTabChange={handleTabChange} />;
    }
  };

  const isAIChatButtonVisible =
    ['home', 'ranking', 'tasks', 'bac', 'tdl'].includes(activeTab) &&
    !showFocusTimer &&
    !showAIChat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100" dir="rtl">
      {isAIChatButtonVisible && (
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full shadow-lg"
          title="مساعد الذكاء الاصطناعي"
        >
          <BrainCircuit size={24} />
        </button>
      )}

      {showFocusTimer ? (
        renderActiveTab()
      ) : (
        <>
          <main className="min-h-screen pb-20">{renderActiveTab()}</main>
          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </>
      )}
    </div>
  );
});

App.displayName = 'App';
export default App;
