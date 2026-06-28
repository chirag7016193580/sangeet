import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

interface PlaylistSectionProps {
  title: string;
  category: string;
  setViewDetails: (details: any) => void;
}

export const PlaylistSection: React.FC<PlaylistSectionProps> = ({ title, category, setViewDetails }) => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`/api/playlists?category=${encodeURIComponent(category)}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setPlaylists(data);
          }
        }
      } catch (err) {
        console.error(`Failed to fetch playlists for ${category}:`, err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPlaylists();
    return () => { active = false; };
  }, [category]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tight">
            {title}
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-none w-36 md:w-44 aspect-square bg-white/5 rounded-[24px] border border-white/5" />
          ))}
        </div>
      </section>
    );
  }

  if (playlists.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tight">
          {title}
        </h2>
        <button className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 hover:text-white transition-colors">
          See All
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {playlists.map((playlist: any) => (
          <div 
            key={playlist.id} 
            onClick={() => setViewDetails({ type: 'playlist', id: playlist.id })}
            className="flex-none w-36 md:w-44 group cursor-pointer"
          >
            <div className="relative w-full aspect-square rounded-[24px] overflow-hidden mb-3 bg-white/5 border border-white/5 shadow-md">
              <img 
                src={playlist.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop'} 
                alt={playlist.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#bc8aff] transition-colors">
              {playlist.name}
            </h3>
            <p className="text-xs text-neutral-400 truncate mt-0.5">{playlist.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
