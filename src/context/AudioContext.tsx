import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track } from '../types';
import { useSettings } from './SettingsContext';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  history: Track[];
  currentIndex: number;
  isShuffle: boolean;
  isRepeat: 'none' | 'one' | 'all';
  likedTracks: Track[];
  is3DMode: boolean;
  isHDMode: boolean;
  playbackSpeed: number;
  sleepTimer: number | null; // in minutes
  bassBoost: number; // in dB
  midBoost: number; // in dB
  trebleBoost: number; // in dB
  isResolving: boolean;
  playTrack: (track: Track, tracksQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  changeVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (track: Track) => void;
  isLiked: (track: Track) => boolean;
  addToQueue: (track: Track) => void;
  toggle3D: () => void;
  toggleHD: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  setEQ: (bass: number, mid: number, treble: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem('melody-playback-state');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };
  const initialState = getInitialState();

  const [currentTrack, setCurrentTrack] = useState<Track | null>(initialState?.currentTrack || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(initialState?.progress || 0);
  const [duration, setDuration] = useState(initialState?.duration || 0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('melody-volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<Track[]>(initialState?.queue || []);
  const { settings } = useSettings();

  const [history, setHistory] = useState<Track[]>(() => {
    const saved = localStorage.getItem('melody-listen-history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('melody-listen-history', JSON.stringify(history));
  }, [history]);
  const [currentIndex, setCurrentIndex] = useState(initialState?.currentIndex ?? -1);
  const [isShuffle, setIsShuffle] = useState(initialState?.isShuffle ?? settings.shuffleDef);
  const [isRepeat, setIsRepeat] = useState<'none' | 'one' | 'all'>(initialState?.isRepeat || 'none');
  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('melody-liked');
    return saved ? JSON.parse(saved) : [];
  });

  // Premium feature states
  const [is3DMode, setIs3DMode] = useState(false);
  const [isHDMode, setIsHDMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1.0);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [bassBoost, setBassBoost] = useState(0);
  const [midBoost, setMidBoost] = useState(0);
  const [trebleBoost, setTrebleBoost] = useState(0);
  const [isResolving, setIsResolving] = useState(false);

  // Web Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const bassNodeRef = useRef<BiquadFilterNode | null>(null);
  const midNodeRef = useRef<BiquadFilterNode | null>(null);
  const trebleNodeRef = useRef<BiquadFilterNode | null>(null);
  const panIntervalRef = useRef<any>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<any>(null);

  // Cleanup Web Audio Graph safely
  const cleanupWebAudio = () => {
    if (panIntervalRef.current) {
      clearInterval(panIntervalRef.current);
      panIntervalRef.current = null;
    }
    try {
      sourceNodeRef.current?.disconnect();
      bassNodeRef.current?.disconnect();
      midNodeRef.current?.disconnect();
      trebleNodeRef.current?.disconnect();
      pannerNodeRef.current?.disconnect();
    } catch (e) {
      console.warn("Error disconnecting Web Audio nodes:", e);
    }
    sourceNodeRef.current = null;
    bassNodeRef.current = null;
    midNodeRef.current = null;
    trebleNodeRef.current = null;
    pannerNodeRef.current = null;
    audioContextRef.current = null;
  };

  // Build the Web Audio filters chain
  const setupWebAudio = () => {
    if (!audioRef.current) return;
    if (audioContextRef.current) return; // Already setup

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      // Bass Low-Shelf Filter
      const bass = ctx.createBiquadFilter();
      bass.type = "lowshelf";
      bass.frequency.value = 100;
      bass.gain.value = bassBoost;
      bassNodeRef.current = bass;

      // Mid Peaking Filter
      const mid = ctx.createBiquadFilter();
      mid.type = "peaking";
      mid.frequency.value = 1000;
      mid.Q.value = 1.0;
      mid.gain.value = midBoost;
      midNodeRef.current = mid;

      // Treble High-Shelf Filter
      const treble = ctx.createBiquadFilter();
      treble.type = "highshelf";
      treble.frequency.value = 4000;
      treble.gain.value = trebleBoost;
      trebleNodeRef.current = treble;

      // Stereo Panner
      const panner = ctx.createStereoPanner();
      pannerNodeRef.current = panner;

      // Connect: Source -> Bass -> Mid -> Treble -> Panner -> Speaker Destination
      source.connect(bass);
      bass.connect(mid);
      mid.connect(treble);
      treble.connect(panner);
      panner.connect(ctx.destination);

      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (err) {
      console.warn("Web Audio API connection failed. Standard fallback mode engaged.", err);
      cleanupWebAudio();
    }
  };

  // Initialize HTML5 Audio
  const handleSongEndedRef = useRef<() => void>(() => {});

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.crossOrigin = "anonymous"; // Try anonymous for Web Audio support
    audioRef.current = audio;

    const handleEnded = () => {
      handleSongEndedRef.current();
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration || 0);
      }
    };

    // Fallback: If anonymous crossOrigin triggers CORS errors, remove it dynamically
    const handleError = (e: any) => {
      if (audioRef.current && audioRef.current.crossOrigin === "anonymous") {
        console.warn("Anonymous stream blocked by CORS. Switching to standard bypass fallback.");
        const savedSrc = audioRef.current.src;
        const savedTime = audioRef.current.currentTime;
        
        audioRef.current.removeAttribute("crossorigin");
        audioRef.current.src = savedSrc;
        audioRef.current.load();
        audioRef.current.currentTime = savedTime;

        if (isPlaying) {
          audioRef.current.play().catch(err => console.error("Playback fallback failed:", err));
        }

        cleanupWebAudio(); // Standard output bypassed
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.pause();
      cleanupWebAudio();
      clearInterval(progressInterval.current);
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem('melody-volume', volume.toString());
  }, [volume, isMuted]);

  // Sync liked tracks
  useEffect(() => {
    localStorage.setItem('melody-liked', JSON.stringify(likedTracks));
  }, [likedTracks]);

  // Save persistent playback state
  useEffect(() => {
    const state = {
      currentTrack,
      progress,
      duration,
      queue,
      currentIndex,
      isShuffle,
      isRepeat
    };
    localStorage.setItem('melody-playback-state', JSON.stringify(state));
  }, [currentTrack, progress, duration, queue, currentIndex, isShuffle, isRepeat]);

  // Track timer interval
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
        }
      }, 250);
    } else {
      clearInterval(progressInterval.current);
    }
    return () => clearInterval(progressInterval.current);
  }, [isPlaying]);

  // Handle HD Mode dynamics
  useEffect(() => {
    if (isHDMode) {
      // Elevate Bass & Treble for signature clear-hi-fi signature sound
      setBassBoost(5.5);
      setTrebleBoost(6.0);
      setMidBoost(1.0);
    } else {
      setBassBoost(0);
      setTrebleBoost(0);
      setMidBoost(0);
    }
  }, [isHDMode]);

  // Sync boost changes to nodes
  useEffect(() => {
    if (bassNodeRef.current) bassNodeRef.current.gain.value = bassBoost;
  }, [bassBoost]);

  useEffect(() => {
    if (midNodeRef.current) midNodeRef.current.gain.value = midBoost;
  }, [midBoost]);

  useEffect(() => {
    if (trebleNodeRef.current) trebleNodeRef.current.gain.value = trebleBoost;
  }, [trebleBoost]);

  // Handle 3D spatial panning (left/right ear sound wave rotation)
  useEffect(() => {
    if (panIntervalRef.current) {
      clearInterval(panIntervalRef.current);
      panIntervalRef.current = null;
    }

    if (is3DMode && pannerNodeRef.current && audioContextRef.current) {
      const speed = 0.6; // Oscillation speed
      const startTime = audioContextRef.current.currentTime;
      panIntervalRef.current = setInterval(() => {
        if (pannerNodeRef.current && audioContextRef.current) {
          const elapsed = audioContextRef.current.currentTime - startTime;
          pannerNodeRef.current.pan.value = Math.sin(elapsed * speed);
        }
      }, 40);
    } else {
      if (pannerNodeRef.current) {
        pannerNodeRef.current.pan.value = 0.0; // Center panning
      }
    }

    return () => {
      if (panIntervalRef.current) clearInterval(panIntervalRef.current);
    };
  }, [is3DMode]);

  // Playback speed effects
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [currentTrack, playbackSpeed]);

  // MediaSession API Integration for Lock Screen Controls
  useEffect(() => {
    if ('mediaSession' in navigator && settings.lockScreen && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'Single',
        artwork: [
          { src: currentTrack.image, sizes: '500x500', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    }
  }, [currentTrack, settings.lockScreen]);

  // Global Settings Sleep Timer Support
  useEffect(() => {
    let timerId: any = null;
    let ms = 0;
    if (settings.sleepTimer === '1m') ms = 60000;
    if (settings.sleepTimer === '15m') ms = 900000;
    if (settings.sleepTimer === '30m') ms = 1800000;
    if (settings.sleepTimer === '45m') ms = 2700000;
    if (settings.sleepTimer === '1h') ms = 3600000;
    
    if (ms > 0) {
      timerId = setTimeout(() => {
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      }, ms);
    }
    return () => clearTimeout(timerId);
  }, [settings.sleepTimer]);

  // Load new track & resolve if it's Spotify track
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    let active = true;

    const loadAndPlayTrack = async () => {
      let trackToPlay = currentTrack;
      const isRestoring = trackToPlay.title === initialState?.currentTrack?.title;

      // Immediately stop old audio and reset progress to 0 before resolving new track
      if (!isRestoring) {
        audioRef.current?.pause();
        try { if (audioRef.current) audioRef.current.currentTime = 0; } catch (e) {}
        setProgress(0);
        setDuration(0);
      }

      if (currentTrack.audioUrl === 'spotify' || currentTrack.isSpotify) {
        setIsResolving(true);
        try {
          const query = `${currentTrack.title} ${currentTrack.artist}`;
          const res = await fetch(`/api/search?song=${encodeURIComponent(query)}`);
          if (!res.ok) throw new Error("Search failed");
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && active) {
            const resolvedTrack = {
              ...currentTrack,
              audioUrl: data[0].audioUrl,
              duration: data[0].duration || currentTrack.duration,
              quality: data[0].quality || 'Lossless Hi-Fi',
              isSpotify: false
            };

            // Update queue, history, and liked list to cache resolved URL
            setQueue(prev => prev.map(t => t.title === currentTrack.title && t.artist === currentTrack.artist ? resolvedTrack : t));
            setHistory(prev => prev.map(t => t.title === currentTrack.title && t.artist === currentTrack.artist ? resolvedTrack : t));
            setLikedTracks(prev => prev.map(t => t.title === currentTrack.title && t.artist === currentTrack.artist ? resolvedTrack : t));
            
            setCurrentTrack(resolvedTrack);
            return; // Exit here. The state change will re-trigger this useEffect.
          }
        } catch (err) {
          console.error("Failed to resolve Spotify track:", err);
        } finally {
          if (active) setIsResolving(false);
        }
      }

      if (!active) return;

      if (trackToPlay.audioUrl === 'spotify' || trackToPlay.isSpotify) {
        console.warn("Skipping load of unresolved Spotify URL.");
        return;
      }

      // Check if we are restoring from localStorage for the first time
      // (isRestoring already declared above)

      audioRef.current.src = trackToPlay.audioUrl;
      audioRef.current.load();
      
      if (isRestoring && initialState?.progress > 0) {
        audioRef.current.currentTime = initialState.progress;
        setProgress(initialState.progress);
        setDuration(initialState.duration);
        // Clear initial state so we don't jump again on replay
        initialState.currentTrack = null; 
      } else {
        audioRef.current.currentTime = 0;
        setProgress(0);
        setDuration(0);
      }

      // Apply speed
      audioRef.current.playbackRate = playbackSpeed;

      if (isPlaying) {
        audioRef.current.play()
          .then(() => {
            setupWebAudio();
          })
          .catch(err => {
            console.error("Playback failed:", err);
            setIsPlaying(false);
          });
      }
    };

    loadAndPlayTrack();

    return () => {
      active = false;
    };
  }, [currentTrack]);

  const playTrack = (track: Track, tracksQueue?: Track[]) => {
    // If clicking same track, reset to beginning & play
    if (currentTrack && currentTrack.title === track.title && currentTrack.artist === track.artist) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        if (!isPlaying) {
          audioRef.current.play().then(() => setIsPlaying(true));
        }
      }
      return;
    }

    if (tracksQueue && tracksQueue.length > 0) {
      setQueue(tracksQueue);
      const index = tracksQueue.findIndex(t => t.title === track.title && t.artist === track.artist);
      setCurrentIndex(index !== -1 ? index : 0);
    } else {
      const isAlreadyInQueue = queue.some(t => t.title === track.title && t.artist === track.artist);
      if (!isAlreadyInQueue) {
        setQueue(prev => [...prev, track]);
        setCurrentIndex(queue.length);
      } else {
        const index = queue.findIndex(t => t.title === track.title && t.artist === track.artist);
        setCurrentIndex(index);
      }
    }

    setCurrentTrack(track);
    setIsPlaying(true);

    // Save to history
    setHistory(prev => {
      const filtered = prev.filter(t => t.title !== track.title || t.artist !== track.artist);
      return [track, ...filtered].slice(0, 50);
    });
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play()
        .then(() => {
          setIsPlaying(true);
          setupWebAudio();
        })
        .catch(err => {
          console.error("Failed to resume:", err);
        });
    }
  };

  const handleSongEnded = () => {
    if (isRepeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setProgress(0);
      }
    } else {
      nextTrack();
    }
  };

  // Sync the latest handleSongEnded to the ref so the event listener doesn't use stale state
  useEffect(() => {
    handleSongEndedRef.current = handleSongEnded;
  });

  const nextTrack = async () => {
    if (queue.length === 0) return;

    let nextIdx = currentIndex + 1;

    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (isRepeat === 'all') {
        nextIdx = 0;
      } else {
        // Infinite Autoplay: Fetch similar tracks if setting is enabled
        if (!settings.autoplay) {
          seek(0);
          setIsPlaying(false);
          return;
        }

        try {
          setIsResolving(true);
          const lastTrack = queue[queue.length - 1];
          const query = lastTrack.artist ? `${lastTrack.artist} top hits` : 'Bollywood Top Hits';
          const res = await fetch(`/api/recommend?query=${encodeURIComponent(query)}&pid=${lastTrack.id || ''}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Filter out songs already in queue to prevent loops
            let newTracks = data.filter(d => !queue.some(q => q.title === d.title)).slice(0, 10);
            
            // Fallback: if all recommendations are already in queue, just shuffle the recommendations and play them anyway!
            if (newTracks.length === 0) {
              newTracks = [...data].sort(() => 0.5 - Math.random()).slice(0, 5);
            }

            if (newTracks.length > 0) {
              setQueue(prev => [...prev, ...newTracks]);
              setCurrentIndex(nextIdx);
              setCurrentTrack(newTracks[0]);
              setIsPlaying(true);
              setIsResolving(false);
              return;
            }
          }
        } catch (e) {
          console.error('Infinite autoplay failed', e);
        }
        setIsResolving(false);
        setIsPlaying(false);
        return;
      }
    }

    setCurrentIndex(nextIdx);
    setCurrentTrack(queue[nextIdx]);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (queue.length === 0) return;

    if (progress > 3) {
      seek(0);
      return;
    }

    let prevIdx = currentIndex - 1;

    if (isShuffle) {
      prevIdx = Math.floor(Math.random() * queue.length);
    } else if (prevIdx < 0) {
      if (isRepeat === 'all') {
        prevIdx = queue.length - 1;
      } else {
        seek(0);
        return;
      }
    }

    setCurrentIndex(prevIdx);
    setCurrentTrack(queue[prevIdx]);
    setIsPlaying(true);
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setProgress(seconds);
    }
  };

  const changeVolume = (vol: number) => {
    const value = Math.max(0, Math.min(1, vol));
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : value;
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setIsRepeat(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  const toggleLike = (track: Track) => {
    setLikedTracks(prev => {
      const exists = prev.some(t => t.audioUrl === track.audioUrl);
      if (exists) {
        return prev.filter(t => t.audioUrl !== track.audioUrl);
      } else {
        return [...prev, track];
      }
    });
  };

  const isLiked = (track: Track) => {
    return likedTracks.some(t => t.audioUrl === track.audioUrl);
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => {
      const exists = prev.some(t => t.audioUrl === track.audioUrl);
      if (exists) return prev;
      return [...prev, track];
    });
  };

  const toggle3D = () => {
    setIs3DMode(prev => {
      const next = !prev;
      if (next) setupWebAudio();
      return next;
    });
  };

  const toggleHD = () => {
    setIsHDMode(prev => {
      const next = !prev;
      if (next) setupWebAudio();
      return next;
    });
  };

  const setPlaybackSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const setEQ = (bass: number, mid: number, treble: number) => {
    setupWebAudio();
    setBassBoost(bass);
    setMidBoost(mid);
    setTrebleBoost(treble);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isResolving,
        progress,
        duration,
        volume,
        isMuted,
        queue,
        history,
        currentIndex,
        isShuffle,
        isRepeat,
        likedTracks,
        is3DMode,
        isHDMode,
        playbackSpeed,
        sleepTimer,
        bassBoost,
        midBoost,
        trebleBoost,
        playTrack,
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
        addToQueue,
        toggle3D,
        toggleHD,
        setPlaybackSpeed,
        setSleepTimer,
        setEQ,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
