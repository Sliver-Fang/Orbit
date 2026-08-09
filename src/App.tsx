/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeWrapper } from './components/ThemeWrapper';
import { Navigation, MainTab } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { StudyTracker } from './components/StudyTracker';
import { TaskManager } from './components/TaskManager';
import { FitnessTracker } from './components/fitness/FitnessTracker';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { MoreMenu } from './components/MoreMenu';
import { OnboardingFlow } from './components/OnboardingFlow';
import { initStatusBar, hideSplashScreen } from './utils/nativeBridge';

function AppContent() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const { isOnboarded } = useApp();

  useEffect(() => {
    initStatusBar();
    hideSplashScreen();
  }, []);

  return (
    <div id="app-shell" className="flex flex-col md:flex-row min-h-screen relative">
      {/* Onboarding Widget */}
      <OnboardingFlow />

      {/* Main Navigation Sidebar / Mobile Bottom Dock */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main content viewport */}
      <main className={`flex-1 md:ml-64 min-h-screen flex flex-col relative pb-20 md:pb-8 min-w-0 overflow-x-hidden ${!isOnboarded ? 'pt-28 sm:pt-20' : ''}`}>
        {activeTab === 'home' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'study' && <StudyTracker />}
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'fitness' && <FitnessTracker />}
        {activeTab === 'analytics' && <AdvancedAnalytics />}
        {activeTab === 'more' && <MoreMenu />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ThemeWrapper>
        <AppContent />
      </ThemeWrapper>
    </AppProvider>
  );
}
