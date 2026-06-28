import React from 'react';
import { Home, Search, Library, Settings, Heart, Music, ListMusic } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface SidebarProps {
  activeTab: 'home' | 'search' | 'library' | 'settings';
  setActiveTab: (tab: 'home' | 'search' | 'library' | 'settings') => void;
  setViewDetails: (details: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, setViewDetails }) => {
  const { likedTracks } = useAudio();

  const navItems = [
    { id: 'home', label: 'Discover', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Collections', icon: Library },
    { id: 'settings', label: 'Oscillations', icon: Settings },
  ] as const;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-black/20 border-r border-white/5 p-8 h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-3 mb-10 cursor-pointer group" 
        onClick={() => { setActiveTab('home'); setViewDetails(null); }}
      >
        <img src="/sangeet_logo.png" alt="Sangeet Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_15px_rgba(188,138,255,0.4)] transition-transform duration-300 group-hover:scale-105" />
        <span className="font-display font-extrabold text-lg tracking-[0.2em] text-white">SANGEET</span>
      </div>

      {/* Library Label */}
      <div className="mb-6">
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mb-4 block">Library</span>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setViewDetails(null);
                }}
                className={`w-full flex items-center gap-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                  isActive
                    ? 'text-white font-semibold glow-accent'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#bc8aff]' : 'text-white/40'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Space Section label */}
      <div className="mt-6 pt-6 border-t border-white/5 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mb-4 block">Space</span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('library');
                  setViewDetails({ type: 'liked-songs' });
                }}
                className="w-full flex items-center gap-3 py-2 rounded-xl text-white/60 hover:text-white transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#bc8aff]/20 to-[#6bceff]/20 border border-white/10 flex items-center justify-center group-hover:border-[#bc8aff]/40 transition-colors">
                  <Heart className="w-3.5 h-3.5 text-[#bc8aff] fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">Liked Songs</p>
                  <p className="font-mono text-[9px] text-white/40">{likedTracks.length} tracks</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('library');
                  setViewDetails({ type: 'playlist', id: '1737128' });
                }}
                className="w-full flex items-center gap-3 py-2 rounded-xl text-white/60 hover:text-white transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#bc8aff]/40 transition-colors">
                  <ListMusic className="w-3.5 h-3.5 text-[#bc8aff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">Baarish Aur Pyaar</p>
                  <p className="font-mono text-[9px] text-white/40">Live Curated Playlist</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card aligned to liquid glass design */}
        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCizXNVb2-qzpaYHWK74p6-0BkziKV0hWVONV3GPHn4jJjZm-f-fNB08Bunbnwy9Je2J5cs-EdfWsNbeM4K2DMT_OtGo7BD3jQJNatWTW1Y2UYv5SQwqb7P3EMdr_YYwvUAcQbRY70I3V-C6XFqKgQy5cmVEpq49V3SKCjd8uUS2yfjBWzcpJ-l08LYsyVlcb3LjzDtwioz9UL2N3tfFPmNCmNp7StHJHHZbmH00qt5w7I-AMQONR4xiSUlBbiYAfovm2syVYvcEtw"
              alt="Evelyn Reed"
              className="w-10 h-10 rounded-xl object-cover border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">Evelyn Reed</h4>
              <p className="font-mono text-[9px] text-[#bc8aff] tracking-wider uppercase">QUANTUM TIER</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
