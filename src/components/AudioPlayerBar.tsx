import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, VolumeX, 
  Heart, Minimize2, ListMusic, Music, ChevronDown, Sparkles, Sliders, Moon, Gauge, Compass 
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';

export const AudioPlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isResolving,
    progress,
    duration,
    volume,
    isMuted,
    queue,
    isShuffle,
    isRepeat,
    currentIndex,
    is3DMode,
    isHDMode,
    playbackSpeed,
    sleepTimer,
    bassBoost,
    midBoost,
    trebleBoost,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    changeVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    isLiked,
    toggle3D,
    toggleHD,
    setPlaybackSpeed,
    setSleepTimer,
    setEQ
  } = useAudio();

  const { settings } = useSettings();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showEQPanel, setShowEQPanel] = useState(false);

  // Auto-seek dragging helper
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  // Synchronize drag value
  useEffect(() => {
    if (!isDragging) {
      setDragProgress(progress);
    }
  }, [progress, isDragging]);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDragProgress(parseFloat(e.target.value));
  };

  const handleSeekEnd = () => {
    setIsDragging(false);
    seek(dragProgress);
  };

  // Mock sync lyrics based on time
  const lyricsList = [
    { time: 0, text: "🎵 [Instrumental Intro - High Fidelity Quality] 🎵" },
    { time: 5, text: "Chalte chalte, is haseen raahon mein..." },
    { time: 12, text: "Teri baahon mein kho jaane do..." },
    { time: 20, text: "Dhadkanein chal rahi hain bekhabar..." },
    { time: 28, text: "Is haseen pal ko yahin tham jaane do..." },
    { time: 36, text: "Chasing stars in the sapphire Indian sky..." },
    { time: 44, text: "Lost in high fidelity, wondering why..." },
    { time: 52, text: "Live uncompressed stream decrypted just for you..." },
    { time: 60, text: "🎶 [Glow Solo Studio Synth Drop] 🎶" },
    { time: 75, text: "Suno is dunya ki sargoshiyaan..." },
    { time: 83, text: "Dil se dil ka milna hi to hai dunya..." },
    { time: 92, text: "Lossless audio flow keeping you free..." },
    { time: 100, text: "In this absolute state of premium ecstasy." },
    { time: 108, text: "We were chasing stars in a sapphire sky..." },
    { time: 116, text: "Lost in the static, wondering why..." },
    { time: 124, text: "Now the music is the only thing that remains..." },
    { time: 135, text: "🎵 [Studio Outro fading out nicely...] 🎵" }
  ];

  const getActiveLyricIndex = () => {
    let activeIndex = 0;
    for (let i = 0; i < lyricsList.length; i++) {
      if (progress >= lyricsList[i].time) {
        activeIndex = i;
      }
    }
    return activeIndex;
  };

  const activeLyricIdx = getActiveLyricIndex();

  return (
    <>
      {/* 1. DOCKED BOTTOM BAR (Desktop Horizontal, Mobile Mini Floating) */}
      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 z-40 px-4 md:px-0 select-none">
        <div className="max-w-7xl mx-auto bg-black/40 backdrop-blur-2xl border border-white/5 md:border-0 md:border-t md:border-white/5 md:bg-black/20 p-3 md:p-6 rounded-2xl md:rounded-none flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          
          {/* Left: Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-initial md:w-80 cursor-pointer" onClick={() => setIsFullscreen(true)}>
            <img 
              src={(currentTrack.image || '').replace('500x500', settings.dataSaver ? '150x150' : '500x500')}
              alt={currentTrack.title} 
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover shadow-lg border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate hover:text-[#bc8aff] transition-colors">
                  {currentTrack.title}
                </h4>
                {isResolving && (
                  <span className="flex h-2 w-2 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#bc8aff] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#bc8aff]"></span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 truncate hover:text-white transition-colors">
                {isResolving ? 'Resolving full lossless stream...' : currentTrack.artist}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack);
              }}
              className="p-2 text-neutral-400 hover:text-[#bc8aff] transition-all shrink-0"
            >
              <Heart 
                className={`w-5 h-5 transition-transform duration-300 ${
                  isLiked(currentTrack) ? 'text-[#bc8aff] fill-[#bc8aff] scale-110' : ''
                }`} 
              />
            </button>
          </div>

          {/* Center: Playback Controls & Progress (Desktop) */}
          <div className="hidden md:flex flex-col items-center flex-1 max-w-xl">
            {/* Quick Controls */}
            <div className="flex items-center gap-6 mb-2">
              <button 
                onClick={toggleShuffle} 
                className={`p-1.5 transition-colors ${isShuffle ? 'text-[#bc8aff] drop-shadow-[0_0_5px_rgba(188,138,255,0.5)]' : 'text-neutral-500 hover:text-white'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button 
                onClick={prevTrack} 
                className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              <button 
                onClick={togglePlay} 
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button 
                onClick={nextTrack} 
                className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
              <button 
                onClick={toggleRepeat} 
                className={`p-1.5 transition-colors relative ${isRepeat !== 'none' ? 'text-[#bc8aff]' : 'text-neutral-500 hover:text-white'}`}
              >
                <Repeat className="w-4 h-4" />
                {isRepeat === 'one' && (
                  <span className="absolute top-0.5 right-0.5 bg-[#bc8aff] text-black text-[8px] font-extrabold w-3 h-3 rounded-full flex items-center justify-center">1</span>
                )}
              </button>
            </div>

            {/* Progress Bar Slider */}
            <div className="w-full flex items-center gap-3 text-xs text-neutral-500 font-mono">
              <span>{formatTime(isDragging ? dragProgress : progress)}</span>
              <div className="flex-1 relative group py-2 cursor-pointer">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={isDragging ? dragProgress : progress}
                  onMouseDown={() => setIsDragging(true)}
                  onTouchStart={() => setIsDragging(true)}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full h-1 bg-white/10 rounded-full relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#bc8aff] to-[#6bceff] rounded-full transition-all shadow-[0_0_8px_rgba(188,138,255,0.5)]"
                    style={{ width: `${((isDragging ? dragProgress : progress) / (duration || 100)) * 100}%` }}
                  />
                </div>
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Sound Controls & Screen Expansion triggers */}
          <div className="hidden md:flex items-center gap-4 w-80 justify-end">
            {/* Quick HD/3D Badges in bottom docked bar */}
            {isHDMode && (
              <span className="font-mono text-[9px] bg-[#bc8aff]/15 text-[#bc8aff] border border-[#bc8aff]/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">HD ACTIVE</span>
            )}
            {is3DMode && (
              <span className="font-mono text-[9px] bg-[#6bceff]/15 text-[#6bceff] border border-[#6bceff]/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">3D SPATIAL</span>
            )}

            <button 
              onClick={() => setShowQueue(!showQueue)} 
              className={`p-2 transition-colors ${showQueue ? 'text-[#bc8aff]' : 'text-neutral-400 hover:text-white'}`}
              title="Up Next Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-neutral-400 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input 
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/10 accent-[#bc8aff] rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Mobile Right: Mini Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextTrack(); }}
              className="p-2 text-neutral-400 hover:text-white"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

        </div>
      </div>

      {/* 2. FULLSCREEN DETAILED PLAYER OVERLAY (Immersive, highly animated) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="fixed inset-0 z-50 bg-[#060606] text-white flex flex-col justify-between overflow-hidden select-none"
          >
            {/* Ambient Background Gradient Glow */}
            {settings.canvas && (
              <div className="absolute inset-0 bg-radial-[circle_at_center_top] from-[#bc8aff]/10 via-transparent to-transparent pointer-events-none" />
            )}

            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-white/5 relative z-10 bg-black/20">
              <button 
                onClick={() => { setIsFullscreen(false); setShowQueue(false); setShowLyrics(false); setShowEQPanel(false); }}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <div className="text-center">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Playing From Album</p>
                <p className="font-mono text-xs text-[#bc8aff] truncate max-w-[200px] mt-0.5 uppercase tracking-wider">
                  {currentTrack.album || 'Midnight Echoes'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowLyrics(!showLyrics);
                  setShowQueue(false);
                  setShowEQPanel(false);
                }}
                className={`p-2 rounded-full transition-colors ${
                  showLyrics ? 'bg-[#bc8aff]/20 text-[#bc8aff] border border-[#bc8aff]/20' : 'text-neutral-400 hover:text-white'
                }`}
                title="Smart Synced Lyrics"
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8 md:gap-12 max-w-6xl mx-auto w-full relative z-10 overflow-y-auto">
              
              {/* Left Side: Art or Karaoke Lyrics */}
              <div className="flex-1 w-full max-w-sm md:max-w-md flex flex-col justify-center items-center">
                <AnimatePresence mode="wait">
                  {showLyrics ? (
                    /* Sync Karaoke lyrics view */
                    <motion.div 
                      key="lyrics"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full h-[320px] md:h-[400px] rounded-[32px] bg-black/40 backdrop-blur-md border border-white/5 p-6 overflow-y-auto hide-scrollbar flex flex-col gap-6 scroll-smooth"
                    >
                      <div className="text-center border-b border-white/5 pb-3 flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#bc8aff]" />
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Dynamic Synced Lyrics</span>
                      </div>
                      <div className="space-y-4 py-8">
                        {lyricsList.map((lyric, idx) => {
                          const isActive = idx === activeLyricIdx;
                          const isPast = idx < activeLyricIdx;
                          return (
                            <div 
                              key={idx}
                              onClick={() => seek(lyric.time)}
                              className={`text-center py-1.5 px-3 rounded-xl cursor-pointer transition-all duration-300 ${
                                isActive 
                                  ? 'text-[#bc8aff] text-lg md:text-xl font-bold bg-[#bc8aff]/10 scale-105' 
                                  : isPast 
                                    ? 'text-neutral-500 text-sm md:text-base font-medium' 
                                    : 'text-neutral-400 text-sm md:text-base opacity-70 hover:opacity-100'
                              }`}
                            >
                              {lyric.text}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    /* Default Album Cover art */
                    <motion.div 
                      key="cover"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative aspect-square w-full rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
                    >
                      <img 
                        src={(currentTrack.image || '').replace('500x500', settings.dataSaver ? '150x150' : '500x500')}
                        alt={currentTrack.title} 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Audio Quality indicator */}
                      <span className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 text-[9px] text-[#bc8aff] font-mono tracking-widest uppercase py-1 px-2.5 rounded-full">
                        {currentTrack.quality || '320kbps Lossless'}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Side: Metadata, Slider & Full Controls */}
              <div className="flex-1 w-full max-w-md flex flex-col justify-between py-2">
                
                {/* Titles and Like button */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight truncate">
                      {currentTrack.title}
                    </h2>
                    <p className="text-[#bc8aff] text-sm md:text-base mt-1 font-medium truncate flex items-center gap-2">
                      {isResolving ? (
                        <>
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#bc8aff] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#bc8aff]"></span>
                          </span>
                          <span className="font-mono text-xs text-white/40">Resolving high-fidelity audio stream...</span>
                        </>
                      ) : (
                        currentTrack.artist
                      )}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleLike(currentTrack)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all text-neutral-400 hover:text-[#bc8aff] shrink-0"
                  >
                    <Heart 
                      className={`w-6 h-6 transition-transform duration-300 ${
                        isLiked(currentTrack) ? 'text-[#bc8aff] fill-[#bc8aff] scale-110' : ''
                      }`} 
                    />
                  </button>
                </div>

                {/* Secondary Premium Studio Enhancements Rack */}
                <div className="grid grid-cols-5 bg-white/5 border border-white/5 p-2 rounded-2xl mt-6">
                  {/* 3D Binaural */}
                  <button 
                    onClick={toggle3D}
                    className={`flex flex-col items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                      is3DMode ? 'text-[#bc8aff] bg-white/5' : 'text-neutral-500 hover:text-white'
                    }`}
                    title="Binaural left/right stereo panner wave"
                  >
                    <Compass className={`w-4.5 h-4.5 ${is3DMode ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                    <span className="font-mono text-[8px] font-bold tracking-wider uppercase">3D Sound</span>
                  </button>

                  {/* HD Sound Boost */}
                  <button 
                    onClick={toggleHD}
                    className={`flex flex-col items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                      isHDMode ? 'text-[#6bceff] bg-white/5' : 'text-neutral-500 hover:text-white'
                    }`}
                    title="Treble/Bass shelves boost"
                  >
                    <Sparkles className="w-4.5 h-4.5" />
                    <span className="font-mono text-[8px] font-bold tracking-wider uppercase">HD Audio</span>
                  </button>

                  {/* Playback Speed */}
                  <button 
                    onClick={() => {
                      const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                      const currentIdx = speeds.indexOf(playbackSpeed);
                      const nextIdx = (currentIdx + 1) % speeds.length;
                      setPlaybackSpeed(speeds[nextIdx]);
                    }}
                    className="flex flex-col items-center justify-center gap-1.5 py-2 rounded-xl text-neutral-500 hover:text-white transition-all"
                    title="Audio playback speed multiplier"
                  >
                    <Gauge className="w-4.5 h-4.5 text-[#bc8aff]" />
                    <span className="font-mono text-[8px] font-bold tracking-wider uppercase">{playbackSpeed}x Speed</span>
                  </button>

                  {/* Sleep Timer */}
                  <button 
                    onClick={() => {
                      if (sleepTimer === null) setSleepTimer(15);
                      else if (sleepTimer === 15) setSleepTimer(30);
                      else if (sleepTimer === 30) setSleepTimer(45);
                      else if (sleepTimer === 45) setSleepTimer(60);
                      else setSleepTimer(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 py-2 rounded-xl transition-all relative ${
                      sleepTimer !== null ? 'text-[#bc8aff] bg-white/5' : 'text-neutral-500 hover:text-white'
                    }`}
                    title="Auto-sleep schedule countdown"
                  >
                    <Moon className="w-4.5 h-4.5" />
                    <span className="font-mono text-[8px] font-bold tracking-wider uppercase">
                      {sleepTimer !== null ? `${sleepTimer}m Left` : 'Sleep'}
                    </span>
                  </button>

                  {/* Studio Equalizer Sliders Trigger */}
                  <button 
                    onClick={() => {
                      setShowEQPanel(!showEQPanel);
                      setShowQueue(false);
                      setShowLyrics(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                      showEQPanel ? 'text-[#bc8aff] bg-white/5' : 'text-neutral-500 hover:text-white'
                    }`}
                    title="Bass, Mid-Range, and Treble peaking band EQ"
                  >
                    <Sliders className="w-4.5 h-4.5" />
                    <span className="font-mono text-[8px] font-bold tracking-wider uppercase">Studio EQ</span>
                  </button>
                </div>

                {/* Seek Progress Indicator with custom range input */}
                <div className="mt-6 md:mt-8">
                  <div className="w-full relative py-3 group cursor-pointer">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={isDragging ? dragProgress : progress}
                      onMouseDown={() => setIsDragging(true)}
                      onTouchStart={() => setIsDragging(true)}
                      onChange={handleSeekChange}
                      onMouseUp={handleSeekEnd}
                      onTouchEnd={handleSeekEnd}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#bc8aff] to-[#6bceff] rounded-full shadow-[0_0_10px_rgba(188,138,255,0.6)]"
                        style={{ width: `${((isDragging ? dragProgress : progress) / (duration || 100)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-white/30 mt-1">
                    <span>{formatTime(isDragging ? dragProgress : progress)}</span>
                    <span>-{formatTime(Math.max(0, duration - progress))}</span>
                  </div>
                </div>

                {/* Advanced Control deck */}
                <div className="flex items-center justify-between mt-6 md:mt-8 px-2">
                  <button 
                    onClick={toggleShuffle} 
                    className={`p-3 rounded-full transition-all hover:bg-white/5 ${
                      isShuffle ? 'text-[#bc8aff] drop-shadow-[0_0_8px_rgba(188,138,255,0.5)]' : 'text-neutral-500 hover:text-white'
                    }`}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={prevTrack} 
                    className="p-3 text-white hover:text-[#bc8aff] transition-all rounded-full hover:bg-white/5"
                  >
                    <SkipBack className="w-7 h-7 fill-current" />
                  </button>
                  <button 
                    onClick={togglePlay} 
                    className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center transition-all hover:scale-110 shadow-xl hover:bg-neutral-100"
                  >
                    {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                  </button>
                  <button 
                    onClick={nextTrack} 
                    className="p-3 text-white hover:text-[#bc8aff] transition-all rounded-full hover:bg-white/5"
                  >
                    <SkipForward className="w-7 h-7 fill-current" />
                  </button>
                  <button 
                    onClick={toggleRepeat} 
                    className={`p-3 rounded-full transition-all hover:bg-white/5 relative ${
                      isRepeat !== 'none' ? 'text-[#bc8aff]' : 'text-neutral-500 hover:text-white'
                    }`}
                  >
                    <Repeat className="w-5 h-5" />
                    {isRepeat === 'one' && (
                      <span className="absolute top-1 right-1 bg-[#bc8aff] text-black text-[7px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black">1</span>
                    )}
                  </button>
                </div>

                {/* Footer Controls: Queue List / Volume slider */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-6">
                  {/* Volume Slider (Hidden on Mobile) */}
                  <div className="hidden md:flex items-center gap-3 flex-1">
                    <button onClick={toggleMute} className="text-neutral-500 hover:text-white transition-colors shrink-0">
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-[#bc8aff]" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input 
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 accent-[#bc8aff] rounded-full cursor-pointer appearance-none"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      setShowQueue(!showQueue);
                      setShowLyrics(false);
                      setShowEQPanel(false);
                    }}
                    className={`p-2 rounded-full border border-white/5 transition-colors flex items-center gap-1.5 px-3 ${
                      showQueue ? 'bg-[#bc8aff]/20 text-[#bc8aff] border-[#bc8aff]/20' : 'text-neutral-400 bg-white/5 hover:text-white'
                    }`}
                  >
                    <ListMusic className="w-4 h-4" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Queue</span>
                  </button>
                </div>

              </div>
            </main>

            {/* Slide-out Queue Panel in Fullscreen */}
            <AnimatePresence>
              {showQueue && (
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 h-[400px] bg-[#0c0c0c] border-t border-white/5 rounded-t-[30px] p-6 flex flex-col z-20"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                      <ListMusic className="w-5 h-5 text-[#bc8aff]" />
                      PLAY QUEUE ({queue.length} SONGS)
                    </h3>
                    <button 
                      onClick={() => setShowQueue(false)}
                      className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2">
                    {queue.map((track, idx) => {
                      const isCurrent = idx === currentIndex;
                      return (
                        <div 
                          key={idx}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                            isCurrent ? 'bg-white/5 border border-[#bc8aff]/20' : 'hover:bg-white/5'
                          }`}
                        >
                          <span className="w-5 text-xs text-neutral-500 font-mono text-center">
                            {isCurrent ? '▶' : idx + 1}
                          </span>
                          <img 
                            src={track.image || null} 
                            alt={track.title} 
                            className="w-10 h-10 rounded-xl object-cover" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#bc8aff]' : 'text-white'}`}>
                              {track.title}
                            </h4>
                            <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slide-out Studio Equalizer Panel in Fullscreen */}
            <AnimatePresence>
              {showEQPanel && (
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 h-[400px] bg-[#0c0c0c] border-t border-white/5 rounded-t-[30px] p-6 flex flex-col z-20"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-[#bc8aff]" />
                      STUDIO EQUALIZER & SOUND ENHANCERS
                    </h3>
                    <button 
                      onClick={() => setShowEQPanel(false)}
                      className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  {/* Sound Presets Grid */}
                  <div className="mb-6">
                    <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block mb-2">Acoustic Presets</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Flat', bass: 0, mid: 0, treble: 0 },
                        { name: 'Bass Booster 🔊', bass: 8, mid: 1, treble: -2 },
                        { name: 'Vocal Crisp 🎙️', bass: -2, mid: 6, treble: 4 },
                        { name: 'Electronic EDM ⚡', bass: 6, mid: 0, treble: 5 },
                        { name: 'Ambient Chill 🧘', bass: 3, mid: 3, treble: 3 },
                      ].map((preset) => {
                        const isActive = bassBoost === preset.bass && midBoost === preset.mid && trebleBoost === preset.treble;
                        return (
                          <button
                            key={preset.name}
                            onClick={() => setEQ(preset.bass, preset.mid, preset.treble)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              isActive 
                                ? 'bg-white text-black font-extrabold shadow-md' 
                                : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
                            }`}
                          >
                            {preset.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fine Tuning Sliders */}
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block">Fine Tuning (Bands)</span>
                    
                    {/* Bass Low-shelf */}
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-xs font-mono text-neutral-450">Bass (100Hz)</span>
                      <input 
                        type="range"
                        min={-10}
                        max={10}
                        step={1}
                        value={bassBoost}
                        onChange={(e) => setEQ(parseInt(e.target.value), midBoost, trebleBoost)}
                        className="flex-1 h-1 bg-white/10 accent-[#bc8aff] rounded-full cursor-pointer appearance-none"
                      />
                      <span className="w-12 text-right text-xs font-mono text-[#bc8aff] font-semibold">{bassBoost} dB</span>
                    </div>

                    {/* Mid peaking */}
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-xs font-mono text-neutral-455">Mid (1kHz)</span>
                      <input 
                        type="range"
                        min={-10}
                        max={10}
                        step={1}
                        value={midBoost}
                        onChange={(e) => setEQ(bassBoost, parseInt(e.target.value), trebleBoost)}
                        className="flex-1 h-1 bg-white/10 accent-[#bc8aff] rounded-full cursor-pointer appearance-none"
                      />
                      <span className="w-12 text-right text-xs font-mono text-[#bc8aff] font-semibold">{midBoost} dB</span>
                    </div>

                    {/* Treble high-shelf */}
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-xs font-mono text-neutral-460">Treble (4kHz)</span>
                      <input 
                        type="range"
                        min={-10}
                        max={10}
                        step={1}
                        value={trebleBoost}
                        onChange={(e) => setEQ(bassBoost, midBoost, parseInt(e.target.value))}
                        className="flex-1 h-1 bg-white/10 accent-[#bc8aff] rounded-full cursor-pointer appearance-none"
                      />
                      <span className="w-12 text-right text-xs font-mono text-[#bc8aff] font-semibold">{trebleBoost} dB</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
