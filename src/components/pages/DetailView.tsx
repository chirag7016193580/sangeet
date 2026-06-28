import React, { useState, useEffect } from 'react';
import { Play, Heart, ChevronLeft, Clock, Sparkles, AlertCircle, ListPlus, Music, RefreshCw, Disc, User } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { CURATED_PLAYLISTS, CURATED_ARTISTS } from '../../data';
import { Track } from '../../types';

interface DetailViewProps {
  viewDetails: {
    type: 'liked-songs' | 'curated-playlist' | 'custom-playlist' | 'curated-artist' | 'album' | 'playlist';
    id?: string;
  };
  setViewDetails?: (details: any) => void;
  onBack: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ viewDetails, setViewDetails, onBack }) => {
  const { playTrack, likedTracks, toggleLike, isLiked, addToQueue } = useAudio();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Recommendation engine state
  const [relatedAlbums, setRelatedAlbums] = useState<any[]>([]);
  const [relatedArtists, setRelatedArtists] = useState<any[]>([]);
  const [relatedPlaylists, setRelatedPlaylists] = useState<any[]>([]);

  // Pagination & infinite scrolling state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Info details for header
  const [headerInfo, setHeaderInfo] = useState({
    title: '',
    description: '',
    image: '',
    meta: '',
    isArtist: false,
    verified: false,
    listeners: '',
    biography: ''
  });

  // Load playlist/artist/album details in background
  const loadDetails = async () => {
    setLoading(true);
    setError('');
    setTracks([]);
    setRelatedAlbums([]);
    setRelatedArtists([]);
    setRelatedPlaylists([]);
    setHasMore(false);
    setPage(1);

    try {
      if (viewDetails.type === 'liked-songs') {
        setTracks(likedTracks);
        setHeaderInfo({
          title: 'Liked Songs',
          description: 'Your personal collection of uncompressed, hi-res decrypted tracks.',
          image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop',
          meta: `${likedTracks.length} favorite tracks`,
          isArtist: false,
          verified: false,
          listeners: '',
          biography: ''
        });
        setLoading(false);
      } 
      else if (viewDetails.type === 'curated-playlist' || viewDetails.type === 'playlist') {
        const playlistId = viewDetails.id;

        // Try fetching from server-side procedural catalog
        try {
          const res = await fetch(`/api/catalog/playlist/${playlistId}?page=1&limit=30`);
          if (res.ok) {
            const data = await res.json();
            setHeaderInfo({
              title: data.playlist.name,
              description: data.playlist.description,
              image: data.playlist.image,
              meta: `${data.playlist.curator || 'Sangeet AI Compiler'} • ${data.playlist.totalTracks} tracks`,
              isArtist: false,
              verified: false,
              listeners: '',
              biography: ''
            });
            setTracks(data.tracks);
            setRelatedPlaylists(data.similarPlaylists);
            setHasMore(data.hasMore);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to load catalog playlist via API, using fallback:", err);
        }

        // Fallback to static list
        const curated = CURATED_PLAYLISTS.find(p => p.id === playlistId);
        if (!curated) throw new Error('Playlist not found');

        setHeaderInfo({
          title: curated.name,
          description: curated.description,
          image: curated.image,
          meta: 'Curated Mix • Lossless Audio Enabled',
          isArtist: false,
          verified: false,
          listeners: '',
          biography: ''
        });

        if (curated.tracks && curated.tracks.length > 0) {
          setTracks(curated.tracks);
          setLoading(false);
          return;
        }

        // Parallel query resolution
        const fetchedTracks: Track[] = [];
        const fetchPromises = curated.searchQueries.map(async (query) => {
          try {
            const res = await fetch(`/api/search?song=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data && data.length > 0) {
              fetchedTracks.push(data[0]);
            }
          } catch (e) {
            console.error("Error fetching fallback tracks:", query, e);
          }
        });
        await Promise.all(fetchPromises);
        setTracks(fetchedTracks);
        setLoading(false);
      } 
      else if (viewDetails.type === 'custom-playlist') {
        const savedPlaylists = JSON.parse(localStorage.getItem('melody-custom-playlists') || '[]');
        const custom = savedPlaylists.find((p: any) => p.id === viewDetails.id);
        if (!custom) throw new Error('Playlist not found');

        setTracks(custom.tracks || []);
        setHeaderInfo({
          title: custom.name,
          description: custom.description,
          image: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=400&auto=format&fit=crop',
          meta: `Custom • ${custom.tracks?.length || 0} tracks`,
          isArtist: false,
          verified: false,
          listeners: '',
          biography: ''
        });
        setLoading(false);
      } 
      else if (viewDetails.type === 'curated-artist') {
        const artistId = viewDetails.id;

        // Try loading from database API
        try {
          const res = await fetch(`/api/catalog/artist/${artistId}`);
          if (res.ok) {
            const data = await res.json();
            setHeaderInfo({
              title: data.artist.name,
              description: data.artist.biography,
              image: data.artist.image,
              meta: data.artist.listeners,
              isArtist: true,
              verified: data.artist.verified,
              listeners: data.artist.listeners,
              biography: data.artist.biography
            });
            setTracks(data.popularTracks || []);
            setRelatedAlbums(data.albums || []);
            setRelatedArtists(data.relatedArtists || []);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to load catalog artist, falling back:", err);
        }

        // Fallback
        const artist = CURATED_ARTISTS.find(a => a.id === artistId);
        if (!artist) throw new Error('Artist not found');

        setHeaderInfo({
          title: artist.name,
          description: '',
          image: artist.image,
          meta: artist.listeners,
          isArtist: true,
          verified: artist.verified,
          listeners: artist.listeners,
          biography: artist.biography
        });

        const res = await fetch(`/api/search?song=${encodeURIComponent(artist.searchQuery)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setTracks(data);
        }
        setLoading(false);
      }
      else if (viewDetails.type === 'album') {
        const albumId = viewDetails.id;

        try {
          const res = await fetch(`/api/catalog/album/${albumId}`);
          if (res.ok) {
            const data = await res.json();
            setHeaderInfo({
              title: data.album.name,
              description: `Album by ${data.album.artistName} • Released ${data.album.year} • Genre: ${data.album.genre}`,
              image: data.album.image,
              meta: `Album • ${data.album.tracksCount} tracks`,
              isArtist: false,
              verified: false,
              listeners: '',
              biography: ''
            });
            setTracks(data.tracks || []);
            setRelatedAlbums(data.similarAlbums || []);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to load album details:", err);
        }
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to decrypt hi-res streams. Check server connection.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [viewDetails, likedTracks]);

  // Load more paginated tracks for playlists
  const loadMoreTracks = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/catalog/playlist/${viewDetails.id}?page=${nextPage}&limit=30`);
      if (res.ok) {
        const data = await res.json();
        setTracks(prev => [...prev, ...data.tracks]);
        setPage(nextPage);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Error loading more tracks:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const formatDuration = (secs: string) => {
    const s = parseInt(secs);
    if (isNaN(s)) return '3:42';
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-6 pb-32 animate-fade-in select-none">
      
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 text-neutral-400 hover:text-white font-semibold transition-colors py-2 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Hero Header block */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-white/5">
        <img 
          src={headerInfo.image || null} 
          alt={headerInfo.title}
          className={`w-44 h-44 object-cover shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/10 ${
            headerInfo.isArtist ? 'rounded-full' : 'rounded-3xl'
          }`}
          referrerPolicy="no-referrer"
        />
        
        <div className="flex-1 text-center md:text-left space-y-2">
          {headerInfo.isArtist && headerInfo.verified && (
            <div className="flex items-center justify-center md:justify-start gap-1 text-[#bc8aff] text-xs font-mono tracking-wider uppercase">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Verified Artist</span>
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight leading-none bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            {headerInfo.title}
          </h1>

          <p className="text-sm text-neutral-400 max-w-xl leading-relaxed">
            {headerInfo.description || headerInfo.biography}
          </p>

          <p className="font-mono text-xs text-white/40">
            {headerInfo.meta}
          </p>

          {tracks.length > 0 && (
            <div className="pt-2 flex items-center justify-center md:justify-start">
              <button 
                onClick={handlePlayAll}
                className="flex items-center gap-2 bg-white hover:bg-neutral-100 text-black font-mono font-bold text-xs tracking-wider px-8 py-3.5 rounded-full transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] uppercase cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Stream</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TRACKS LIST TABLE */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-neutral-950/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-950/15 border border-red-500/10 rounded-2xl p-6 text-red-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-16 bg-neutral-950/20 border border-dashed border-neutral-800 rounded-3xl p-6">
          <Music className="w-10 h-10 text-neutral-600 mx-auto mb-3 animate-bounce" />
          <h4 className="text-sm font-bold text-white">No tracks available</h4>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            {viewDetails.type === 'liked-songs' 
              ? 'Start searching for your favorite Punjabi, Hindi, or English hits and click the Heart icon!' 
              : 'Add songs from your search results to personalize this list.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="hidden md:flex items-center gap-4 px-4 py-3 text-xs font-mono text-white/40 uppercase tracking-widest border-b border-white/5">
            <span className="w-8 text-center">#</span>
            <span className="flex-1">Title</span>
            <span className="w-40">Album</span>
            <span className="w-16 text-right">Time</span>
          </div>

          {tracks.map((track, index) => (
            <div 
              key={index}
              onClick={() => playTrack(track, tracks)}
              className="group flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all duration-300"
            >
              <span className="w-8 text-center text-xs font-mono text-white/30 group-hover:text-[#bc8aff]">
                {index + 1}
              </span>

              <img 
                src={track.image || null} 
                alt={track.title} 
                className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                referrerPolicy="no-referrer"
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#bc8aff] transition-colors">
                  {track.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>
              </div>

              <span className="hidden md:block w-40 text-xs text-neutral-500 truncate">
                {track.album || 'Single'}
              </span>

              {/* Quick interactive actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); addToQueue(track); }}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
                  title="Add to Queue"
                >
                  <ListPlus className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                  className="p-1.5 text-neutral-400 hover:text-[#bc8aff] rounded-full hover:bg-[#bc8aff]/10"
                  title="Like Track"
                >
                  <Heart className={`w-4 h-4 ${isLiked(track) ? 'text-[#bc8aff] fill-[#bc8aff]' : ''}`} />
                </button>
              </div>

              <span className="w-16 text-right text-xs font-mono text-neutral-400">
                {formatDuration(track.duration)}
              </span>

            </div>
          ))}

          {/* Load More Pagination */}
          {hasMore && (
            <div className="pt-6 flex justify-center">
              <button
                onClick={loadMoreTracks}
                disabled={loadingMore}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-xs tracking-wider px-6 py-3 rounded-full transition-all border border-white/5 hover:border-white/10 uppercase cursor-pointer"
              >
                {loadingMore ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Load More Tracks</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- INTEGRATED RECOMMENDATION CAROUSELS --- */}

      {/* 1. Artist's Albums section (rendered on Artist Profile) */}
      {viewDetails.type === 'curated-artist' && relatedAlbums.length > 0 && setViewDetails && (
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
            <Disc className="w-5 h-5 text-[#bc8aff]" />
            <span>Popular Albums</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {relatedAlbums.slice(0, 5).map((alb) => (
              <div 
                key={alb.id}
                onClick={() => setViewDetails({ type: 'album', id: alb.id })}
                className="group p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all duration-300"
              >
                <img 
                  src={alb.image} 
                  alt={alb.name} 
                  className="w-full aspect-square object-cover rounded-xl border border-white/5 group-hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <h4 className="mt-3 text-sm font-semibold text-white truncate group-hover:text-[#bc8aff]">
                  {alb.name}
                </h4>
                <p className="text-xs text-neutral-400 truncate mt-1">Released {alb.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Similar Albums section (rendered on Album Profile) */}
      {viewDetails.type === 'album' && relatedAlbums.length > 0 && setViewDetails && (
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
            <Disc className="w-5 h-5 text-[#bc8aff]" />
            <span>Similar Albums</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {relatedAlbums.slice(0, 5).map((alb) => (
              <div 
                key={alb.id}
                onClick={() => setViewDetails({ type: 'album', id: alb.id })}
                className="group p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all duration-300"
              >
                <img 
                  src={alb.image} 
                  alt={alb.name} 
                  className="w-full aspect-square object-cover rounded-xl border border-white/5 group-hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <h4 className="mt-3 text-sm font-semibold text-white truncate group-hover:text-[#bc8aff]">
                  {alb.name}
                </h4>
                <p className="text-xs text-neutral-400 truncate mt-1">{alb.artistName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Fans Also Like section (rendered on Artist Profile) */}
      {viewDetails.type === 'curated-artist' && relatedArtists.length > 0 && setViewDetails && (
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
            <User className="w-5 h-5 text-[#bc8aff]" />
            <span>Fans Also Like</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {relatedArtists.slice(0, 5).map((art) => (
              <div 
                key={art.id}
                onClick={() => setViewDetails({ type: 'curated-artist', id: art.id })}
                className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl text-center cursor-pointer transition-all duration-300"
              >
                <img 
                  src={art.image} 
                  alt={art.name} 
                  className="w-24 h-24 mx-auto object-cover rounded-full border border-white/10 group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <h4 className="mt-3 text-sm font-semibold text-white truncate group-hover:text-[#bc8aff]">
                  {art.name}
                </h4>
                <p className="text-[10px] font-mono text-[#bc8aff] uppercase tracking-wider mt-1">{art.genres[0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Similar Playlists section (rendered on Playlist Profile) */}
      {(viewDetails.type === 'curated-playlist' || viewDetails.type === 'playlist') && relatedPlaylists.length > 0 && setViewDetails && (
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
            <Music className="w-5 h-5 text-[#bc8aff]" />
            <span>Similar Playlists</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {relatedPlaylists.slice(0, 5).map((ply) => (
              <div 
                key={ply.id}
                onClick={() => setViewDetails({ type: 'playlist', id: ply.id })}
                className="group p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all duration-300"
              >
                <img 
                  src={ply.image} 
                  alt={ply.name} 
                  className="w-full aspect-square object-cover rounded-xl border border-white/5 group-hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <h4 className="mt-3 text-sm font-semibold text-white truncate group-hover:text-[#bc8aff]">
                  {ply.name}
                </h4>
                <p className="text-xs text-neutral-400 truncate mt-1">{ply.curator || 'Sangeet Compiler'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
