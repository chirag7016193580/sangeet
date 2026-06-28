import React, { useState, useEffect } from 'react';
import { Play, Sparkles, ArrowRight, Music, Wand2, Compass, Heart, Disc, Headphones, RefreshCw, Radio, Mic } from 'lucide-react';
import { CURATED_PLAYLISTS, CURATED_ARTISTS, RECENTLY_PLAYED_ALBUMS } from '../../data';
import { useAudio } from '../../context/AudioContext';
import { Track } from '../../types';
import { PlaylistSection } from '../PlaylistSection';

const HOME_CATEGORIES = [
  "Good Morning", "Chill", "Romance", "Workout", "Party", 
  "Focus", "Sleep", "Trending Now", "New Releases", "Top Hits", 
  "Bollywood", "Punjabi", "English Pop", "Hip Hop", "Lo-Fi", 
  "Electronic", "Devotional", "Instrumental", "Podcasts", "Recommended For You"
];

interface HomeViewProps {
  setViewDetails: (details: any) => void;
  setActiveTab: (tab: 'home' | 'search' | 'library' | 'settings') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setViewDetails, setActiveTab }) => {
  const { playTrack, history } = useAudio();
  const [aiMix, setAiMix] = useState<Track[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [activePlayId, setActivePlayId] = useState<string | null>(null);

  // Dynamic feed state loaded from backend catalog
  const [feed, setFeed] = useState<any>(null);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Load complete feed from backend
  const loadHomeFeed = async () => {
    setLoadingFeed(true);
    try {
      const res = await fetch('/api/catalog/home');
      if (res.ok) {
        const data = await res.json();
        setFeed(data);
      }
    } catch (err) {
      console.error("Failed to fetch catalog home feed:", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  const [showAllArtists, setShowAllArtists] = useState(false);

  useEffect(() => {
    loadHomeFeed();
  }, []);

  // Determine localized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper to load and auto-play a song directly by query
  const playDirectQuery = async (query: string, title: string, artist: string, image: string, id: string) => {
    setActivePlayId(id);
    try {
      const response = await fetch(`/api/search?song=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        playTrack(data[0], data);
      } else {
        // Fallback dummy track if network is offline
        const fallbackTrack: Track = {
          title,
          artist,
          image,
          audioUrl: 'spotify',
          duration: '180',
          album: 'Single'
        };
        playTrack(fallbackTrack, [fallbackTrack]);
      }
    } catch (err) {
      console.error("Error direct playing query:", err);
    } finally {
      setActivePlayId(null);
    }
  };

  // Triggers the Smart AI DJ playlist compiler
  const handleTriggerAIDJ = async () => {
    setAiLoading(true);
    setAiMix([]);
    try {
      const response = await fetch(`/api/search?song=${encodeURIComponent('Lofi Study Beats')}`);
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const compiled = data.slice(0, 10).map((t, idx) => ({
          ...t,
          quality: '24-Bit / 192kHz',
          album: t.album || 'AI Neural Recommendation'
        }));
        setAiMix(compiled);
      } else {
        setAiMix([
          {
            title: 'Chaleya (Smart AI Pick)',
            artist: 'Anirudh Ravichander, Arijit Singh',
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
            audioUrl: 'spotify',
            duration: '200',
            album: 'Jawan'
          }
        ]);
      }
    } catch (err) {
      console.error("AI DJ failed to boot:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // Play the entire compiled AI mix
  const handlePlayAIMix = () => {
    if (aiMix.length > 0) {
      playTrack(aiMix[0], aiMix);
    }
  };

  // Get active items to render (with catalog or static fallbacks)
  const quickPickList = feed?.quickPicks || CURATED_PLAYLISTS.slice(0, 6);
  const recentAlbumsList = feed?.featuredAlbums?.slice(0, 6) || RECENTLY_PLAYED_ALBUMS.slice(0, 6);
  const featuredPlaylistsList = feed?.moods || CURATED_PLAYLISTS.slice(2);
  const featuredArtistsList = feed?.topArtists && feed.topArtists.length > 0 
    ? [...feed.topArtists, ...CURATED_ARTISTS] 
    : CURATED_ARTISTS;
  const mixesList = feed?.mixes || CURATED_PLAYLISTS.slice(0, 6);
  const chartsList = feed?.charts || CURATED_PLAYLISTS.slice(0, 4);

  return (
    <div className="space-y-10 pb-32 animate-fade-in select-none">
      
      {/* Session Metadata Label Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="font-mono text-[9px] text-[#bc8aff] uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Catalog Mode: Active (10,000+ Lossless)</span>
        </span>
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">Lossless Atmos Active</span>
      </div>
      
      {/* 1. Spotify "Good Evening" Quick Grid (Top Bento) */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            {getGreeting()}
          </h1>
          <button 
            onClick={loadHomeFeed}
            disabled={loadingFeed}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-4 h-4 ${loadingFeed ? 'animate-spin text-[#bc8aff]' : ''}`} />
          </button>
        </div>

        {loadingFeed ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 md:h-20 bg-white/5 rounded-xl md:rounded-2xl border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
            {(history && history.length > 0 ? history : quickPickList).slice(0, 6).map((item: any) => {
              // It could be a playlist or a track
              const isPlaylist = item.id?.startsWith('ply-') || item.id?.startsWith('curated-');
              return (
                <div 
                  key={item.id || item.title}
                  onClick={() => {
                    if (isPlaylist) {
                      setViewDetails({ type: 'playlist', id: item.id });
                    } else {
                      playTrack(item, quickPickList);
                    }
                  }}
                  className="flex items-center gap-2 md:gap-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 relative pr-2 md:pr-4"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 relative bg-neutral-950">
                    <img 
                      src={item.image || null} 
                      alt={item.name || item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-1 md:py-0">
                    <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-[#bc8aff] transition-colors truncate leading-tight">
                      {item.name || item.title}
                    </h3>
                    <p className="text-[9px] md:text-[10px] text-neutral-400 truncate mt-0.5">
                      {isPlaylist ? (item.description || 'Curated compilation') : (item.artist || 'Artist')}
                    </p>
                  </div>

                  {/* Quick Play overlay */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform translate-x-2 group-hover:translate-x-0 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>



      {/* Dynamic Group 1 */}
      {HOME_CATEGORIES.slice(0, 3).map(category => (
        <PlaylistSection key={category} title={category} category={category} setViewDetails={setViewDetails} />
      ))}

      {/* 3. New Releases Carousel (High-fidelity new songs) */}
      {feed?.newReleases && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tight">
                New Releases
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">The latest, fresh lossless releases generated this week</p>
            </div>
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">Latest Additions</span>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {feed.newReleases.map((track: any, idx: number) => (
              <div 
                key={track.id} 
                onClick={() => playTrack(track, feed.newReleases)}
                className="flex-none w-36 md:w-44 group cursor-pointer"
              >
                <div className="relative w-full aspect-square rounded-[24px] overflow-hidden mb-3 bg-white/5 border border-white/5 shadow-md">
                  <img 
                    src={track.image || null} 
                    alt={track.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                      <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#bc8aff] transition-colors">
                  {track.title}
                </h3>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Group 2 */}
      {HOME_CATEGORIES.slice(3, 7).map(category => (
        <PlaylistSection key={category} title={category} category={category} setViewDetails={setViewDetails} />
      ))}

      {/* 4. Featured Albums (Bridges to dynamic Album details) */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tight">
              Featured Albums
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">Epic sonic chapters available in lossless high-definition</p>
          </div>
          <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">Masterpieces</span>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {recentAlbumsList.map((album: any, idx: number) => (
            <div 
              key={album.id || idx} 
              onClick={() => {
                if (album.id) {
                  setViewDetails({ type: 'album', id: album.id });
                } else {
                  playDirectQuery(album.query, album.name, album.artist, album.image, `recent-${idx}`);
                }
              }}
              className="flex-none w-36 md:w-44 group cursor-pointer"
            >
              <div className="relative w-full aspect-square rounded-[24px] overflow-hidden mb-3 bg-white/5 border border-white/5 shadow-md">
                <img 
                  src={album.image || null} 
                  alt={album.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    {activePlayId === `recent-${idx}` ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#bc8aff] transition-colors">
                {album.name}
              </h3>
              <p className="text-xs text-neutral-400 truncate mt-0.5">{album.artist || album.artistName}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Group 3 */}
      {HOME_CATEGORIES.slice(7, 11).map(category => (
        <PlaylistSection key={category} title={category} category={category} setViewDetails={setViewDetails} />
      ))}

      {/* 5. Trending Charts section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tight">
              Trending Charts
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">Top hitlists trending by country. Refreshed daily.</p>
          </div>
          <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">Real-time Trends</span>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {chartsList.slice(0, 8).map((chart: any) => (
            <div 
              key={chart.id}
              onClick={() => setViewDetails({ type: 'playlist', id: chart.id })}
              className="flex-none w-44 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-3xl transition-all cursor-pointer group"
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 bg-neutral-900 border border-white/5">
                <img src={chart.image} alt={chart.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                    <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <h3 className="text-xs font-bold text-white truncate group-hover:text-[#bc8aff]">{chart.name}</h3>
              <p className="text-[10px] text-neutral-500 truncate mt-1">{chart.description.split('.')[0]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Group 4 */}
      {HOME_CATEGORIES.slice(11, 15).map(category => (
        <PlaylistSection key={category} title={category} category={category} setViewDetails={setViewDetails} />
      ))}

      {/* 7. Mood Playlists Bento Grid */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tight">
            Mood & Atmosphere Mixes
          </h2>
          <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">Moods</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredPlaylistsList.slice(0, 8).map((mix: any) => (
            <div 
              key={mix.id}
              onClick={() => setViewDetails({ type: 'playlist', id: mix.id })}
              className="glass-card p-4 rounded-3xl flex flex-col justify-between group cursor-pointer transition-all hover:-translate-y-1"
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-neutral-900 border border-white/5">
                <img 
                  src={mix.image || null} 
                  alt={mix.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#bc8aff] transition-colors truncate">
                  {mix.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {mix.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Group 5 */}
      {HOME_CATEGORIES.slice(15, 18).map(category => (
        <PlaylistSection key={category} title={category} category={category} setViewDetails={setViewDetails} />
      ))}

      {/* 9. Curated Artists Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tight">
              Featured Artists
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">Explore the verified discographies of 1,000+ catalog voices</p>
          </div>
          <button 
            onClick={() => setShowAllArtists(!showAllArtists)}
            className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 hover:text-white transition-colors"
          >
            {showAllArtists ? 'Show Less' : 'See All'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featuredArtistsList.slice(0, showAllArtists ? 40 : 8).map((artist: any, index: number) => (
            <div 
              key={artist.id}
              onClick={() => setViewDetails({ type: 'curated-artist', id: artist.id })}
              className="glass-card p-4 rounded-3xl flex flex-col items-center text-center group cursor-pointer transition-all hover:bg-white/10 border border-white/5"
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border border-white/10 bg-neutral-900 shrink-0">
                <img 
                  src={artist.image || null} 
                  alt={artist.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#bc8aff] transition-colors truncate w-full">
                {artist.name}
              </h3>
              <p className="font-mono text-[8px] text-[#bc8aff] tracking-wider uppercase mt-1">
                Verified Artist
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5 truncate w-full font-mono">
                {artist.listeners ? artist.listeners.split(' ')[0] : '1.2M'} monthly
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Group 6 */}
      {HOME_CATEGORIES.slice(18).map(category => (
        <PlaylistSection key={category} title={category} category={category} setViewDetails={setViewDetails} />
      ))}

    </div>
  );
};
