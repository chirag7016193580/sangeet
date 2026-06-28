export interface Track {
  id?: string;
  title: string;
  artist: string;
  image: string;
  audioUrl: string;
  duration: string; // duration in seconds
  album?: string;
  year?: string;
  quality?: string;
  language?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string;
  tracks: Track[];
  curator?: string;
}

export interface ArtistProfile {
  name: string;
  image: string;
  listeners: string;
  verified: boolean;
  popularTracks: Track[];
  albums: {
    name: string;
    year: string;
    image: string;
  }[];
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // in seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  queue: Track[];
  history: Track[];
  currentIndex: number;
  isShuffle: boolean;
  isRepeat: 'none' | 'one' | 'all';
}
