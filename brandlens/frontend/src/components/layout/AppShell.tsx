import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export const AppShell: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background relative selection:bg-brand-500 selection:text-white">
      {/* Decorative Watermelon UI ambient gradient orbs */}
      <div className="fixed top-0 left-64 w-[500px] h-[300px] bg-gradient-to-br from-brand-400/5 via-violet-400/4 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[450px] h-[350px] bg-gradient-to-tl from-indigo-300/6 via-pink-300/4 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
