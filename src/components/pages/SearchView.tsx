import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Play, Clock, Sparkles, ListPlus, Heart, Music } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { Track } from '../../types';

export const SearchView: React.FC = () => {
  const { playTrack, addToQueue, toggleLike, isLiked } = useAudio();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Recent search history (persisted locally)
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('melody-search-history');
    return saved ? JSON.parse(saved) : ['Arijit Singh', 'Diljit Dosanjh', 'Lofi Sleep Beats', 'Daft Punk'];
  });

  const searchTimeout = useRef<any>(null);

  // Sync search history
  useEffect(() => {
    localStorage.setItem('melody-search-history', JSON.stringify(history));
  }, [history]);

  // Execute Search API call
  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?song=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query) {
      setLoading(true);
      searchTimeout.current = setTimeout(() => {
        executeSearch(query);
      }, 600);
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => clearTimeout(searchTimeout.current);
  }, [query]);

  const handleSelectGenre = (genreQuery: string) => {
    setQuery(genreQuery);
    executeSearch(genreQuery);
    addHistoryItem(genreQuery);
  };

  const addHistoryItem = (item: string) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== item.toLowerCase());
      return [item, ...filtered].slice(0, 8);
    });
  };

  const removeHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h !== item));
  };

  const handleSongSelect = (track: Track) => {
    playTrack(track, results);
    addHistoryItem(query || track.title);
  };

  const formatDuration = (secs: string) => {
    const s = parseInt(secs);
    if (isNaN(s)) return '3:45';
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const genreCards = [
    { name: 'Pop', color: 'from-emerald-500 to-teal-700', query: 'Taylor Swift Pop Hits' },
    { name: 'Rock', color: 'from-purple-600 to-indigo-900', query: 'Queen AC/DC Rock Classics' },
    { name: 'Hip-Hop', color: 'from-red-500 to-amber-700', query: 'Eminem Drake Hip Hop' },
    { name: 'Indie', color: 'from-orange-400 to-red-600', query: 'Anuv Jain Prateek Kuhad Indie' },
    { name: 'Electronic', color: 'from-cyan-500 to-blue-800', query: 'Kavinsky Daft Punk Synthwave' },
    { name: 'Jazz', color: 'from-zinc-700 to-stone-900', query: 'Miles Davis Jazz Smooth' },
    { name: 'R&B', color: 'from-pink-500 to-rose-900', query: 'The Weeknd Bruno Mars R&B' },
    { name: 'Classical', color: 'from-amber-600 to-yellow-900', query: 'Ludovico Einaudi Classical Piano' }
  ];

  return (
    <div className="space-y-6 pb-32 animate-fade-in select-none">
      
      {/* Immersive Search Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to? (Songs, Artists, Playlists)"
          className="w-full bg-white/5 border border-white/5 focus:border-[#bc8aff]/50 focus:ring-1 focus:ring-[#bc8aff]/40 text-white rounded-2xl py-4 pl-12 pr-12 text-sm md:text-base outline-none transition-all placeholder:text-neutral-500"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute inset-y-0 right-4 flex items-center text-neutral-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* SEARCH RESULTS */}
      {loading ? (
        /* Shimmer skeleton */
        <div className="space-y-4">
          <div className="h-6 w-32 bg-neutral-900 rounded-full animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-neutral-950/40 rounded-2xl animate-pulse">
              <div className="w-12 h-12 bg-neutral-900 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-900 rounded w-1/3" />
                <div className="h-3 bg-neutral-900 rounded w-1/4" />
              </div>
              <div className="w-16 h-3 bg-neutral-900 rounded" />
            </div>
          ))}
        </div>
      ) : query && results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="text-lg font-display font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#bc8aff]" />
              Search Results
            </h2>
            <span className="font-mono text-[10px] text-white/40">{results.length} songs decrypted</span>
          </div>

          <div className="space-y-2">
            {results.map((track, idx) => (
              <div 
                key={idx}
                onClick={() => handleSongSelect(track)}
                className="group flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all cursor-pointer"
              >
                {/* Cover Art */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                  <img 
                    src={track.image || null} 
                    alt={track.title} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#bc8aff] transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>
                </div>

                {/* Album Name */}
                <span className="hidden md:block text-xs text-neutral-500 truncate max-w-[150px]">
                  {track.album || 'Single'}
                </span>

                {/* Audio Quality Tag */}
                <span className="font-mono text-[9px] bg-[#bc8aff]/15 text-[#bc8aff] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {track.quality === '320kbps' ? 'HQ' : 'Preview'}
                </span>

                {/* Quick actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToQueue(track); }}
                    className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
                    title="Add to Queue"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                    className="p-2 text-neutral-400 hover:text-[#bc8aff] rounded-full hover:bg-[#bc8aff]/10"
                    title="Like Track"
                  >
                    <Heart className={`w-4 h-4 ${isLiked(track) ? 'text-[#bc8aff] fill-[#bc8aff]' : ''}`} />
                  </button>
                </div>

                {/* Duration */}
                <span className="w-10 text-right text-xs text-neutral-500 font-mono flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3 text-neutral-600" />
                  {formatDuration(track.duration)}
                </span>

              </div>
            ))}
          </div>
        </div>
      ) : query ? (
        /* Empty results state */
        <div className="text-center py-20 bg-neutral-950/30 rounded-3xl border border-neutral-900">
          <Music className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No results found for "{query}"</h3>
          <p className="text-sm text-neutral-400 mt-1 max-w-sm mx-auto">
            Try looking for general terms like a singer name (e.g. "Arijit"), a song title (e.g. "Sajni"), or a movie (e.g. "Kabir Singh").
          </p>
        </div>
      ) : (
        /* DEFAULT BROWSE STATE */
        <div className="space-y-8">
          {/* Recent Searches */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Recent Searches</h3>
                <button 
                  onClick={() => setHistory([])}
                  className="text-xs text-neutral-500 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => { setQuery(item); executeSearch(item); }}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full pl-4 pr-2.5 py-1.5 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>{item}</span>
                    <button 
                      onClick={(e) => removeHistoryItem(e, item)}
                      className="p-0.5 bg-neutral-800 hover:bg-neutral-700 rounded-full text-neutral-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browse All categories */}
          <div>
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Browse All</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {genreCards.map((genre, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSelectGenre(genre.query)}
                  className={`bg-gradient-to-br ${genre.color} p-5 rounded-2xl aspect-[4/3] relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-emerald-950/20 hover:-translate-y-1 transition-all`}
                >
                  <span className="text-lg font-extrabold text-white tracking-tight">{genre.name}</span>
                  
                  {/* Decorative vinyl art inside card */}
                  <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-black/40 rounded-full border-4 border-white/5 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                    <div className="w-8 h-8 rounded-full border border-white/10 bg-black" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
