/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNavBar } from './components/BottomNavBar';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { HomeView } from './components/pages/HomeView';
import { SearchView } from './components/pages/SearchView';
import { LibraryView } from './components/pages/LibraryView';
import { SettingsView } from './components/pages/SettingsView';
import { DetailView } from './components/pages/DetailView';
import { AudioProvider } from './context/AudioContext';
import { SettingsProvider } from './context/SettingsContext';
import { Bell, Sparkles, Music, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'settings'>('home');
  const [viewDetails, setViewDetails] = useState<{ type: 'liked-songs' | 'curated-playlist' | 'custom-playlist' | 'curated-artist' | 'album' | 'playlist'; id?: string } | null>(null);

  const renderActiveView = () => {
    if (viewDetails) {
      return (
        <DetailView 
          viewDetails={viewDetails} 
          setViewDetails={setViewDetails}
          onBack={() => setViewDetails(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            setViewDetails={setViewDetails} 
            setActiveTab={setActiveTab} 
          />
        );
      case 'search':
        return <SearchView />;
      case 'library':
        return <LibraryView setViewDetails={setViewDetails} />;
      case 'settings':
        return <SettingsView />;
    }
  };

  return (
    <div className="flex bg-transparent text-[#ffffff] min-h-screen font-sans">
      
      {/* LEFT SIDEBAR (Desktop) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setViewDetails={setViewDetails} 
      />

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP COMPACT APP BAR (Mobile & Desktop Header) */}
        <header className="sticky top-0 z-30 bg-[#08080a]/80 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-white/5">
          {/* LEFT: Mobile Logo & Desktop Navigation */}
          <div className="flex items-center gap-3">
            {/* Mobile Logo */}
            <div className="flex items-center gap-3 md:hidden">
              <img src="/sangeet_logo.png" alt="Sangeet Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_15px_rgba(188,138,255,0.4)]" />
              <span className="font-display font-extrabold text-lg text-white tracking-wider uppercase">Sangeet</span>
            </div>
            
            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => setViewDetails(null)}
                className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-neutral-400 hover:text-white transition-colors border border-white/5"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                disabled
                className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-neutral-600 cursor-not-allowed border border-white/5"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CENTER: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div 
              onClick={() => { setActiveTab('search'); setViewDetails(null); }}
              className="w-full flex items-center gap-3 bg-[#121216] hover:bg-[#1a1a20] border border-white/5 rounded-full px-4 py-2 cursor-pointer transition-colors group"
            >
              <Search className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-neutral-500 group-hover:text-neutral-300 transition-colors">
                What do you want to play?
              </span>
              <div className="ml-auto w-[1px] h-4 bg-white/10"></div>
              <Sparkles className="w-3.5 h-3.5 text-[#bc8aff] animate-pulse ml-1" />
            </div>
          </div>

          {/* RIGHT: Actions & Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="hidden lg:flex items-center gap-2 text-xs font-bold text-black bg-white hover:bg-neutral-200 px-4 py-1.5 rounded-full transition-colors">
              Explore Premium
            </button>
            
            <button className="hidden md:flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors">
              <Download className="w-3.5 h-3.5" />
              Install App
            </button>

            <button className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#bc8aff] border-2 border-[#08080a]" />
            </button>
            
            <div 
              onClick={() => { setActiveTab('settings'); setViewDetails(null); }}
              className="w-8 h-8 rounded-full border border-white/10 hover:border-[#bc8aff] cursor-pointer overflow-hidden transition-colors flex shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
            >
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCizXNVb2-qzpaYHWK74p6-0BkziKV0hWVONV3GPHn4jJjZm-f-fNB08Bunbnwy9Je2J5cs-EdfWsNbeM4K2DMT_OtGo7BD3jQJNatWTW1Y2UYv5SQwqb7P3EMdr_YYwvUAcQbRY70I3V-C6XFqKgQy5cmVEpq49V3SKCjd8uUS2yfjBWzcpJ-l08LYsyVlcb3LjzDtwioz9UL2N3tfFPmNCmNp7StHJHHZbmH00qt5w7I-AMQONR4xiSUlBbiYAfovm2syVYvcEtw" 
                alt="Evelyn Reed" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* ACTIVE SCREEN CONTENTS */}
        <main className="flex-1 px-4 md:px-8 py-6 overflow-y-auto max-w-7xl mx-auto w-full hide-scrollbar">
          {renderActiveView()}
        </main>

      </div>

      {/* NOW PLAYING BOTTOM HUD (Global floating player bar) */}
      <AudioPlayerBar />

      {/* MOBILE BOTTOM NAVIGATION */}
      <BottomNavBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setViewDetails={setViewDetails} 
      />

    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AudioProvider>
        <Dashboard />
      </AudioProvider>
    </SettingsProvider>
  );
}
