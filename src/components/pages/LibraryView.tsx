import React, { useState } from 'react';
import { Heart, Plus, ListMusic, Play, Clock, Library, Trash2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { Track } from '../../types';

interface LibraryViewProps {
  setViewDetails: (details: any) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ setViewDetails }) => {
  const { likedTracks, playTrack, history } = useAudio();
  
  // Custom user created playlists (saved in local storage)
  const [customPlaylists, setCustomPlaylists] = useState<{ id: string; name: string; description: string; tracks: Track[] }[]>(() => {
    const saved = localStorage.getItem('melody-custom-playlists');
    return saved ? JSON.parse(saved) : [];
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPlaylist = {
      id: `custom-${Date.now()}`,
      name: newPlaylistName.trim(),
      description: newPlaylistDesc.trim() || 'A custom playlist curated on Sangeet.',
      tracks: []
    };

    const updated = [newPlaylist, ...customPlaylists];
    setCustomPlaylists(updated);
    localStorage.setItem('melody-custom-playlists', JSON.stringify(updated));

    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateModal(false);
  };

  const handleDeletePlaylist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = customPlaylists.filter(p => p.id !== id);
    setCustomPlaylists(updated);
    localStorage.setItem('melody-custom-playlists', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 pb-32 animate-fade-in select-none">
      
      {/* Title Header with Action */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Library className="w-6 h-6 text-emerald-400" />
          Your Library
        </h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 hover:border-emerald-400 text-white hover:text-emerald-400 font-semibold px-4 py-2 rounded-2xl text-xs transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LIKED SONGS HERO CARD */}
        <div 
          onClick={() => setViewDetails({ type: 'liked-songs' })}
          className="bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-900 rounded-2xl p-6 md:col-span-1 flex flex-col justify-between aspect-[4/3] relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-indigo-950/25 transition-transform hover:-translate-y-1"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-[circle_at_right_center] from-white/10 to-transparent pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">Liked Songs</h3>
            <p className="text-xs text-white/70 mt-1.5 font-medium">{likedTracks.length} personal favorites</p>
          </div>
          {likedTracks.length > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); playTrack(likedTracks[0], likedTracks); }}
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 transition-all duration-300"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          )}
        </div>

        {/* RECENTLY STREAMED HISTORY */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 md:col-span-2 flex flex-col">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            Recently Streamed History
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[160px] hide-scrollbar space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm">
                No songs played yet this session. Start searching!
              </div>
            ) : (
              history.slice(0, 4).map((track, idx) => (
                <div 
                  key={idx}
                  onClick={() => playTrack(track, history)}
                  className="group flex items-center justify-between p-2 hover:bg-neutral-900/50 rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={track.image || null} 
                      alt={track.title} 
                      className="w-10 h-10 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                        {track.title}
                      </h4>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold px-2 py-0.5 rounded-full uppercase">
                    {track.quality || 'Lossless'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* USER PLAYLISTS LIST */}
      <div>
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Your Custom Playlists</h3>
        {customPlaylists.length === 0 ? (
          <div className="text-center py-16 bg-neutral-950/20 border border-dashed border-neutral-800 rounded-3xl">
            <ListMusic className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-400">No custom playlists created yet</p>
            <p className="text-xs text-neutral-600 mt-1 max-w-xs mx-auto">
              Create a playlist and quickly queue up your customized hi-res collections.
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-400 text-white hover:text-emerald-400 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customPlaylists.map((playlist) => (
              <div 
                key={playlist.id}
                onClick={() => setViewDetails({ type: 'custom-playlist', id: playlist.id })}
                className="group bg-neutral-950 border border-neutral-900 hover:border-neutral-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-neutral-900/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-950/20 group-hover:border-emerald-500/20 transition-all">
                    <ListMusic className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {playlist.name}
                    </h4>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{playlist.tracks.length} tracks</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                  className="p-2 text-neutral-600 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE PLAYLIST DIALOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-md p-6 relative">
            <h3 className="text-lg font-display font-black text-white mb-2 uppercase tracking-wide">Create Custom Playlist</h3>
            <p className="text-xs text-neutral-400 mb-4">Add a customized library module to easily pool decrypted hi-res tracks.</p>
            
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">Playlist Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Late Night Drives"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 focus:border-[#bc8aff]/50 text-white rounded-xl py-2.5 px-3 text-sm outline-none transition-all placeholder:text-neutral-500"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">Description (Optional)</label>
                <textarea 
                  placeholder="e.g. Heavy atmospheric synthesizers..."
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 focus:border-[#bc8aff]/50 text-white rounded-xl py-2.5 px-3 text-sm outline-none h-20 resize-none transition-all placeholder:text-neutral-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-white hover:bg-neutral-100 text-black font-mono font-bold text-xs tracking-wider px-6 py-2.5 rounded-full transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
