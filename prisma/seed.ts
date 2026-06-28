import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number { const x = Math.sin(this.seed++) * 10000; return x - Math.floor(x); }
  nextInt(min: number, max: number): number { return Math.floor(this.next() * (max - min + 1)) + min; }
  choice<T>(arr: T[]): T { return arr[this.nextInt(0, arr.length - 1)]; }
  shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

const FIRST_NAMES = ['Arijit', 'Diljit', 'Shreya', 'Pritam', 'Neha', 'Siddharth', 'Badshah', 'Prateek', 'Anuv', 'Aarav', 'Karan', 'Dev', 'Kabir', 'Rohan', 'Reyansh', 'Vivaan', 'Ishaan', 'Arjun', 'Sai', 'Vijay', 'Taylor', 'Alan', 'Abel', 'Dave', 'Chris', 'Billie', 'Lana', 'Dua', 'Ariana', 'Kendrick', 'Travis', 'Kanye', 'Gaurav', 'Neha', 'Divya', 'Pooja', 'Ananya', 'Riya', 'Aanya', 'Kiara'];
const LAST_NAMES = ['Singh', 'Dosanjh', 'Ghoshal', 'Chakraborty', 'Kakkar', 'Verma', 'Malhotra', 'Sharma', 'Kumar', 'Kuhad', 'Jain', 'Patel', 'Kapur', 'Malik', 'Rahman', 'Swift', 'Walker', 'Sheeran', 'Perry', 'Mars', 'Brown', 'Gomez', 'Lipa', 'Grande', 'Malone', 'Lamar', 'Scott', 'West', 'Eilish', 'Del Rey', 'Sen', 'Gupta', 'Mehta', 'Bose', 'Rao', 'Nair', 'Siddiqui', 'Roy', 'Joshi', 'Bhasin'];
const BAND_PREFIXES = ['The', 'DJ', 'MC', 'Project', 'Echo', 'Astral', 'Neon', 'Cosmic', 'Velvet', 'Lunar', 'Retro', 'Sonic', 'Digital', 'Audio', 'Synth', 'Beats', 'Harmony', 'Sound', 'Melody', 'Sangeet'];
const BAND_SUFFIXES = ['Collective', 'Syndicate', 'Orchestra', 'Society', 'Trio', 'Quartet', 'Band', 'Connection', 'Wave', 'System', 'Frequency', 'Experience', 'Junction', 'Vibes', 'Chronicles', 'Ensemble', 'Session', 'Lab', 'Fm', 'Studio'];
const NOUNS = ['Silence', 'Waves', 'Sangeet', 'Aura', 'Dreams', 'Duniya', 'Glow', 'Tape', 'Heartbreak', 'Sunsets', 'Rain', 'Summer', 'Shadows', 'Mirage', 'Gravity', 'Horizons', 'Whispers', 'Chords', 'Legends', 'Infinity', 'Echo', 'Starlight', 'Solitude', 'Rhythm', 'Storm', 'Fire', 'Ice', 'Sky', 'Midnight', 'Dawn', 'Desert', 'Mountain', 'River', 'Forest', 'Memory', 'Echoes', 'Vortex', 'Symphony', 'Nirvana', 'Breeze'];
const ADJECTIVES = ['Electric', 'Golden', 'Neon', 'Velvet', 'Midnight', 'Blue', 'Lost', 'Eternal', 'Silent', 'Vibrant', 'Deep', 'Cosmic', 'Acoustic', 'Atmospheric', 'Savage', 'Smooth', 'Retro', 'Haunting', 'Wanderlust', 'Sublime', 'Divine', 'Celestial', 'Primal', 'Bitter', 'Sweet', 'Broken', 'Hidden', 'Fallen', 'Rising', 'Untold', 'Ethereal', 'Moody', 'Chilled', 'Heavy', 'Melodic', 'Aesthetic', 'Vintage', 'Modern', 'Symphonic', 'Urban'];
const GENRES = ['Bollywood', 'Punjabi', 'Chill Lofi', 'Pop', 'Rock', 'Hip-Hop', 'Indie Melodies', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Acoustic', 'Devotional', 'Ghazal', 'Sufi', 'Synthwave', 'Ambient'];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Japan', 'Brazil'];

const IMAGE_POOLS = {
  artists: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop','https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop'],
  albums: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop','https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop','https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=400&auto=format&fit=crop'],
  playlists: ['https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop','https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop','https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=400&auto=format&fit=crop']
};

async function main() {
  console.log('Clearing database...');
  await prisma.listeningHistory.deleteMany();
  await prisma.playlistSong.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.user.deleteMany();

  const rng = new SeededRandom(2026);

  console.log('Generating Artists...');
  const artistsData = [];
  for (let i = 1; i <= 1000; i++) {
    let name = rng.next() < 0.45 ? rng.choice(FIRST_NAMES) + ' ' + rng.choice(LAST_NAMES) : rng.choice(BAND_PREFIXES) + ' ' + rng.choice(NOUNS) + (rng.next() < 0.5 ? ' ' + rng.choice(BAND_SUFFIXES) : '');
    const genres = [rng.choice(GENRES)];
    if (rng.next() < 0.3) genres.push(rng.choice(GENRES.filter(g => g !== genres[0])));
    
    artistsData.push({
      id: `art-${i}`,
      name,
      image: IMAGE_POOLS.artists[(i - 1) % IMAGE_POOLS.artists.length],
      listenerCount: rng.nextInt(50000, 48000000),
      listeners: '',
      verified: rng.next() < 0.85,
      biography: `${name} is a renowned voice in ${genres.join(' & ')}.`,
      popularity: rng.nextInt(15, 100),
      country: rng.choice(COUNTRIES),
      genres: genres.join(',')
    });
  }
  
  for (const a of artistsData) {
    a.listeners = a.listenerCount.toLocaleString() + ' monthly listeners';
  }
  
  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@melody.app',
      passwordHash: 'hashedpassword'
    }
  });

  console.log('Inserting Artists...');
  for (let i = 0; i < artistsData.length; i += 500) {
    await prisma.artist.createMany({ data: artistsData.slice(i, i + 500) });
  }

  console.log('Generating Albums & Songs...');
  const albumsData = [];
  const songsData = [];
  let albumIndex = 1;
  let trackIndex = 1;

  for (const artist of artistsData) {
    const albumsCount = rng.nextInt(1, 3);
    for (let a = 0; a < albumsCount; a++) {
      if (albumIndex > 2000) break;
      const genre = artist.genres.split(',')[0];
      const albumName = rng.next() < 0.5 ? rng.choice(ADJECTIVES) + ' ' + rng.choice(NOUNS) : rng.choice(NOUNS) + ' of ' + rng.choice(NOUNS);
      const album = {
        id: `alb-${albumIndex}`,
        name: albumName,
        artistId: artist.id,
        image: IMAGE_POOLS.albums[(albumIndex - 1) % IMAGE_POOLS.albums.length],
        year: rng.nextInt(1998, 2026).toString(),
        genre,
        popularity: rng.nextInt(10, 100),
        tracksCount: rng.nextInt(5, 7)
      };
      albumsData.push(album);
      
      for (let t = 1; t <= album.tracksCount; t++) {
        songsData.push({
          id: `trk-${trackIndex}`,
          title: rng.next() < 0.3 ? rng.choice(NOUNS) : (rng.next() < 0.6 ? rng.choice(ADJECTIVES) + ' ' + rng.choice(NOUNS) : rng.choice(NOUNS) + ' in ' + rng.choice(NOUNS)),
          artistName: artist.name,
          artistId: artist.id,
          albumName: album.name,
          albumId: album.id,
          image: album.image,
          audioUrl: 'spotify',
          duration: rng.nextInt(150, 320).toString(),
          year: album.year,
          genre: album.genre,
          quality: 'Lossless Hi-Fi',
          language: rng.choice(['Hindi', 'English', 'Punjabi']),
          plays: rng.nextInt(5000, 15000000),
          popularity: rng.nextInt(5, 100),
          isSpotify: true,
          isPodcast: false,
          podcastShow: null
        });
        trackIndex++;
      }
      albumIndex++;
    }
  }

  console.log('Inserting Albums...');
  for (let i = 0; i < albumsData.length; i += 500) {
    await prisma.album.createMany({ data: albumsData.slice(i, i + 500) });
  }
  
  console.log('Inserting Songs...');
  for (let i = 0; i < songsData.length; i += 500) {
    await prisma.song.createMany({ data: songsData.slice(i, i + 500) });
  }

  console.log('Generating Playlists...');
  const playlistsData = [];
  const playlistSongsData = [];
  let playlistIndex = 1;

  for (let m = 0; m < 500; m++) {
    const p = {
      id: `ply-${playlistIndex}`,
      name: `Mood Playlist Vol. ${m + 1}`,
      description: 'Mastered in spatial 3D audio.',
      image: IMAGE_POOLS.playlists[m % IMAGE_POOLS.playlists.length],
      curator: 'Melody Editor',
      type: 'mood',
      genre: rng.choice(GENRES),
      country: null
    };
    playlistsData.push(p);

    const matchTracks = songsData.filter(s => s.genre === p.genre).slice(0, 30);
    for (const st of matchTracks) {
      playlistSongsData.push({
        id: `ps-${playlistIndex}-${st.id}`,
        playlistId: p.id,
        songId: st.id
      });
    }
    playlistIndex++;
  }

  console.log('Inserting Playlists...');
  for (let i = 0; i < playlistsData.length; i += 500) {
    await prisma.playlist.createMany({ data: playlistsData.slice(i, i + 500) });
  }

  console.log('Inserting Playlist Songs...');
  for (let i = 0; i < playlistSongsData.length; i += 500) {
    await prisma.playlistSong.createMany({ data: playlistSongsData.slice(i, i + 500) });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
