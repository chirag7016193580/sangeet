import React from 'react';
import { Home, Search, Library, Settings } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'home' | 'search' | 'library' | 'settings';
  setActiveTab: (tab: 'home' | 'search' | 'library' | 'settings') => void;
  setViewDetails: (details: any) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab, setViewDetails }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-neutral-900 pb-5 pt-2 px-6 md:hidden">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setViewDetails(null);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative"
            >
              <Icon
                className={`w-6 h-6 transition-all duration-300 ${
                  isActive ? 'text-emerald-400 scale-110' : 'text-neutral-500'
                }`}
              />
              <span
                className={`text-[10px] mt-1 font-medium tracking-wide transition-all ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-neutral-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
