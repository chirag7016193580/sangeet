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

export const CURATED_ARTISTS: CuratedArtist[] = [
  { id: 'ca-1', name: 'Arijit Singh', image: 'https://images.unsplash.com/photo-1520625902196-18ec25f932e6?q=80&w=400&auto=format&fit=crop', listeners: '35M', verified: true, biography: '', searchQuery: 'Arijit Singh' },
  { id: 'ca-2', name: 'Taylor Swift', image: 'https://images.unsplash.com/photo-1493225457224-ca2e6ef4ce14?q=80&w=400&auto=format&fit=crop', listeners: '100M', verified: true, biography: '', searchQuery: 'Taylor Swift' },
  { id: 'ca-3', name: 'A.R. Rahman', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400&auto=format&fit=crop', listeners: '20M', verified: true, biography: '', searchQuery: 'AR Rahman' },
  { id: 'ca-4', name: 'The Weeknd', image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=400&auto=format&fit=crop', listeners: '105M', verified: true, biography: '', searchQuery: 'The Weeknd' },
  { id: 'ca-5', name: 'Shreya Ghoshal', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&auto=format&fit=crop', listeners: '25M', verified: true, biography: '', searchQuery: 'Shreya Ghoshal' },
  { id: 'ca-6', name: 'Drake', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop', listeners: '80M', verified: true, biography: '', searchQuery: 'Drake' },
  { id: 'ca-7', name: 'Badshah', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&auto=format&fit=crop', listeners: '18M', verified: true, biography: '', searchQuery: 'Badshah' },
  { id: 'ca-8', name: 'Ed Sheeran', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop', listeners: '85M', verified: true, biography: '', searchQuery: 'Ed Sheeran' },
  { id: 'ca-9', name: 'Neha Kakkar', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=400&auto=format&fit=crop', listeners: '22M', verified: true, biography: '', searchQuery: 'Neha Kakkar' },
  { id: 'ca-10', name: 'Justin Bieber', image: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd15?q=80&w=400&auto=format&fit=crop', listeners: '75M', verified: true, biography: '', searchQuery: 'Justin Bieber' },
  { id: 'ca-11', name: 'Jubin Nautiyal', image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=400&auto=format&fit=crop', listeners: '28M', verified: true, biography: '', searchQuery: 'Jubin Nautiyal' },
  { id: 'ca-12', name: 'Billie Eilish', image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=400&auto=format&fit=crop', listeners: '65M', verified: true, biography: '', searchQuery: 'Billie Eilish' },
  { id: 'ca-13', name: 'Atif Aslam', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop', listeners: '30M', verified: true, biography: '', searchQuery: 'Atif Aslam' },
  { id: 'ca-14', name: 'Dua Lipa', image: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?q=80&w=400&auto=format&fit=crop', listeners: '70M', verified: true, biography: '', searchQuery: 'Dua Lipa' },
  { id: 'ca-15', name: 'Darshan Raval', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=400&auto=format&fit=crop', listeners: '15M', verified: true, biography: '', searchQuery: 'Darshan Raval' },
  { id: 'ca-16', name: 'Bruno Mars', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop', listeners: '60M', verified: true, biography: '', searchQuery: 'Bruno Mars' },
  { id: 'ca-17', name: 'Anirudh Ravichander', image: 'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=400&auto=format&fit=crop', listeners: '40M', verified: true, biography: '', searchQuery: 'Anirudh Ravichander' },
  { id: 'ca-18', name: 'Post Malone', image: 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?q=80&w=400&auto=format&fit=crop', listeners: '55M', verified: true, biography: '', searchQuery: 'Post Malone' },
  { id: 'ca-19', name: 'Sonu Nigam', image: 'https://images.unsplash.com/photo-1525926477800-7a3b10316ac6?q=80&w=400&auto=format&fit=crop', listeners: '12M', verified: true, biography: '', searchQuery: 'Sonu Nigam' },
  { id: 'ca-20', name: 'Kishore Kumar', image: 'https://images.unsplash.com/photo-1490214811801-64c81a282928?q=80&w=400&auto=format&fit=crop', listeners: '10M', verified: true, biography: '', searchQuery: 'Kishore Kumar' }
];
export const CURATED_PLAYLISTS: CuratedItem[] = [];
export const RECENTLY_PLAYED_ALBUMS: any[] = [];
