export interface CuratedItem {
  id: string;
  name: string;
  description: string;
  image: string;
  searchQueries: string[];
  spotifyPlaylistId?: string;
  tracks?: any[];
}

export interface CuratedArtist {
  id: string;
  name: string;
  image: string;
  listeners: string;
  verified: boolean;
  biography: string;
  searchQuery: string;
}

export const CURATED_ARTISTS: CuratedArtist[] = [];
export const CURATED_PLAYLISTS: CuratedItem[] = [];
export const RECENTLY_PLAYED_ALBUMS: any[] = [];
