var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_axios = __toESM(require("axios"), 1);
var import_crypto_js = __toESM(require("crypto-js"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();
var app = (0, import_express.default)();
app.use((0, import_cors.default)());
app.use(import_express.default.json());
var JIOSAAVN_DES_KEY = "38346591";
var APICache = /* @__PURE__ */ new Map();
var CACHE_TTL = 1e3 * 60 * 30;
function getCached(key) {
  const cached = APICache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
function setCache(key, data) {
  if (APICache.size > 1e3) {
    const oldest = Array.from(APICache.keys())[0];
    APICache.delete(oldest);
  }
  APICache.set(key, { data, timestamp: Date.now() });
}
function decryptMediaUrl(encryptedBase64) {
  try {
    const key = import_crypto_js.default.enc.Utf8.parse(JIOSAAVN_DES_KEY);
    const decrypted = import_crypto_js.default.DES.decrypt(
      { ciphertext: import_crypto_js.default.enc.Base64.parse(encryptedBase64) },
      key,
      {
        mode: import_crypto_js.default.mode.ECB,
        padding: import_crypto_js.default.pad.Pkcs7
      }
    );
    return decrypted.toString(import_crypto_js.default.enc.Utf8);
  } catch (err) {
    console.error("Decryption failed:", err.message);
    return "";
  }
}
function getFullQualityUrl(decryptedUrl, has320kbps) {
  if (!decryptedUrl) return "";
  if (has320kbps) {
    return decryptedUrl.replace("_96.mp4", "_320.mp4");
  }
  return decryptedUrl.replace("_96.mp4", "_160.mp4");
}
function decodeHTMLEntities(str) {
  if (!str) return "";
  return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, " ");
}
var JIOSAAVN_API = "https://www.jiosaavn.com/api.php";
var JIOSAAVN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "hi-IN,hi;q=0.9,en-US;q=0.8,en;q=0.7",
  Cookie: "L=hindi",
  Referer: "https://www.jiosaavn.com/"
};
async function searchViaSongDetails(query) {
  try {
    const autoRes = await import_axios.default.get(JIOSAAVN_API, {
      params: {
        __call: "autocomplete.get",
        _format: "json",
        _marker: "0",
        ctx: "web6dot0",
        query
      },
      headers: JIOSAAVN_HEADERS,
      timeout: 1e4
    });
    const autoData = autoRes.data;
    if (!autoData || !autoData.songs || !autoData.songs.data || autoData.songs.data.length === 0) {
      return [];
    }
    const songIds = autoData.songs.data.map((s) => s.id).slice(0, 15);
    const pids = songIds.join(",");
    const detailRes = await import_axios.default.get(JIOSAAVN_API, {
      params: {
        __call: "song.getDetails",
        _format: "json",
        _marker: "0",
        ctx: "web6dot0",
        pids
      },
      headers: JIOSAAVN_HEADERS,
      timeout: 1e4
    });
    const detailData = detailRes.data;
    if (!detailData || !detailData.songs || detailData.songs.length === 0)
      return [];
    const songs = [];
    for (const song of detailData.songs) {
      if (!song.encrypted_media_url) continue;
      const decryptedUrl = decryptMediaUrl(song.encrypted_media_url);
      if (!decryptedUrl) continue;
      const has320 = song["320kbps"] === "true";
      const audioUrl = getFullQualityUrl(decryptedUrl, has320);
      if (!audioUrl) continue;
      songs.push({
        id: song.id,
        title: decodeHTMLEntities(song.song || song.title || ""),
        artist: decodeHTMLEntities(song.primary_artists || song.singers || "Unknown"),
        image: (song.image || "").replace("150x150", "500x500").replace("50x50", "500x500"),
        audioUrl,
        duration: song.duration || "0",
        album: decodeHTMLEntities(song.album || ""),
        year: song.year || "",
        quality: has320 ? "320kbps" : "160kbps",
        language: song.language || ""
      });
    }
    return songs;
  } catch (err) {
    console.error("\u274C Song Details search failed:", err.message);
    return [];
  }
}
async function searchViaGetResults(query) {
  try {
    const response = await import_axios.default.get(JIOSAAVN_API, {
      params: {
        __call: "search.getResults",
        _format: "json",
        _marker: "0",
        api_version: "4",
        ctx: "web6dot0",
        n: "50",
        q: query
      },
      headers: JIOSAAVN_HEADERS,
      timeout: 1e4
    });
    const data = response.data;
    if (!data || !data.results || data.results.length === 0) return [];
    const songs = [];
    for (const song of data.results) {
      const encUrl = song.more_info?.encrypted_media_url;
      if (!encUrl) continue;
      const decryptedUrl = decryptMediaUrl(encUrl);
      if (!decryptedUrl) continue;
      const has320 = song.more_info?.["320kbps"] === "true";
      const audioUrl = getFullQualityUrl(decryptedUrl, has320);
      if (!audioUrl) continue;
      songs.push({
        id: song.id,
        title: decodeHTMLEntities(song.title || song.song || ""),
        artist: decodeHTMLEntities(
          song.more_info?.artistMap?.primary_artists?.[0]?.name || song.more_info?.primary_artists || "Unknown"
        ),
        image: (song.image || "").replace("150x150", "500x500").replace("50x50", "500x500"),
        audioUrl,
        duration: song.more_info?.duration || "0",
        album: decodeHTMLEntities(song.more_info?.album || ""),
        year: song.year || "",
        quality: has320 ? "320kbps" : "160kbps",
        language: song.language || ""
      });
    }
    return songs;
  } catch (err) {
    console.error("\u274C GetResults search failed:", err.message);
    return [];
  }
}
async function searchITunes(query) {
  try {
    const response = await import_axios.default.get("https://itunes.apple.com/search", {
      params: { term: query, media: "music", limit: 50 },
      timeout: 8e3
    });
    if (!response.data || !response.data.results) return [];
    return response.data.results.filter((track) => track.previewUrl).map((track) => ({
      title: track.trackName,
      artist: track.artistName,
      image: track.artworkUrl100.replace("100x100bb", "500x500bb"),
      audioUrl: track.previewUrl,
      duration: Math.floor(track.trackTimeMillis / 1e3).toString(),
      album: track.collectionName || "",
      quality: "preview"
    }));
  } catch (err) {
    console.error("\u274C iTunes API Error:", err.message);
    return [];
  }
}
async function fetchSpotifyEmbed(type, id) {
  try {
    const url = `https://open.spotify.com/embed/${type}/${id}`;
    const response = await import_axios.default.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 1e4
    });
    const html = response.data;
    const resourceMatch = html.match(/<script id="resource" type="application\/json">([\s\S]*?)<\/script>/);
    if (resourceMatch) {
      return JSON.parse(resourceMatch[1].trim());
    }
    const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (nextMatch) {
      const nextData = JSON.parse(nextMatch[1].trim());
      return nextData.props?.pageProps?.state || nextData.props?.pageProps?.fallbackDetails;
    }
    console.warn(`Could not parse Spotify embed JSON for ${type}/${id}`);
    return null;
  } catch (err) {
    console.error(`\u274C Spotify embed fetch failed for ${type}/${id}:`, err.message);
    return null;
  }
}
function parseSpotifyTracks(data) {
  if (!data) return [];
  const songs = [];
  const items = data.tracks?.items || data.tracks || [];
  for (const item of items) {
    const track = item.track || item;
    if (!track || !track.name) continue;
    const artists = track.artists?.map((a) => a.name).join(", ") || "Unknown Artist";
    const image = track.album?.images?.[0]?.url || data.images?.[0]?.url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4";
    songs.push({
      title: decodeHTMLEntities(track.name),
      artist: decodeHTMLEntities(artists),
      image,
      audioUrl: "spotify",
      duration: Math.floor((track.duration_ms || 18e4) / 1e3).toString(),
      album: decodeHTMLEntities(track.album?.name || data.name || "Single"),
      isSpotify: true,
      quality: "Spotify Lossless"
    });
  }
  return songs;
}
function getStaticFallbackTracks(type, id) {
  return [
    {
      title: "Sajni",
      artist: "Arijit Singh, Ram Sampath",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop",
      audioUrl: "spotify",
      duration: "290",
      album: "Laapataa Ladies",
      isSpotify: true,
      quality: "Spotify Lossless"
    },
    {
      title: "Pehle Bhi Main",
      artist: "Vishal Mishra, Raj Shekhar",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
      audioUrl: "spotify",
      duration: "310",
      album: "Animal",
      isSpotify: true,
      quality: "Spotify Lossless"
    },
    {
      title: "Born To Shine",
      artist: "Diljit Dosanjh",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
      audioUrl: "spotify",
      duration: "212",
      album: "G.O.A.T.",
      isSpotify: true,
      quality: "Spotify Lossless"
    },
    {
      title: "Tum Hi Ho",
      artist: "Arijit Singh, Mithoon",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
      audioUrl: "spotify",
      duration: "262",
      album: "Aashiqui 2",
      isSpotify: true,
      quality: "Spotify Lossless"
    },
    {
      title: "Chaleya",
      artist: "Anirudh Ravichander, Arijit Singh",
      image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop",
      audioUrl: "spotify",
      duration: "200",
      album: "Jawan",
      isSpotify: true,
      quality: "Spotify Lossless"
    },
    {
      title: "Heeriye",
      artist: "Jasleen Royal, Arijit Singh",
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
      audioUrl: "spotify",
      duration: "194",
      album: "Single",
      isSpotify: true,
      quality: "Spotify Lossless"
    }
  ];
}
app.get("/api/spotify/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  if (type !== "playlist" && type !== "album") {
    return res.status(400).json({ error: "Invalid type" });
  }
  console.log(`
\u{1F3A7} Fetching Spotify ${type}: ${id}`);
  try {
    const data = await fetchSpotifyEmbed(type, id);
    if (!data) {
      console.warn(`Using static fallback tracks for ${type}/${id}`);
      const fallbackTracks = getStaticFallbackTracks(type, id);
      return res.json({
        id,
        name: type === "playlist" ? "Spotify Curated Playlist" : "Spotify Curated Album",
        description: "Loaded with uncompressed high-fidelity streams",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
        tracks: fallbackTracks
      });
    }
    const playlistInfo = {
      id,
      name: data.name || (type === "playlist" ? "Spotify Playlist" : "Spotify Album"),
      description: data.description || "Curated on Spotify \u2022 Lossless Playback",
      image: data.images?.[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
      tracks: parseSpotifyTracks(data)
    };
    res.json(playlistInfo);
  } catch (err) {
    console.error(`Error in Spotify API route:`, err.message);
    res.json({
      id,
      name: "Spotify Curated Playlist",
      description: "Lossless audio playback enabled",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
      tracks: getStaticFallbackTracks(type, id)
    });
  }
});
app.get("/api/recommend", async (req, res) => {
  try {
    const pid = req.query.pid;
    const query = req.query.query;
    const cacheKey = `reco_${pid || query}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);
    if (pid && pid !== "undefined") {
      const liveRes = await import_axios.default.get(JIOSAAVN_API, {
        params: {
          __call: "reco.getreco",
          api_version: "4",
          _format: "json",
          _marker: "0",
          ctx: "web6dot0",
          pid
        },
        headers: JIOSAAVN_HEADERS
      });
      if (liveRes.data && Array.isArray(liveRes.data)) {
        const songs = [];
        for (const song of liveRes.data) {
          const encUrl = song.more_info?.encrypted_media_url;
          if (!encUrl) continue;
          const decryptedUrl = decryptMediaUrl(encUrl);
          if (!decryptedUrl) continue;
          const has320 = song.more_info?.["320kbps"] === "true";
          const audioUrl = getFullQualityUrl(decryptedUrl, has320);
          if (!audioUrl) continue;
          songs.push({
            id: song.id,
            title: decodeHTMLEntities(song.title || song.song || ""),
            artist: decodeHTMLEntities(song.more_info?.artistMap?.primary_artists?.[0]?.name || song.more_info?.primary_artists || "Unknown"),
            image: (song.image || "").replace("150x150", "500x500").replace("50x50", "500x500"),
            audioUrl,
            duration: song.more_info?.duration || "0",
            album: decodeHTMLEntities(song.more_info?.album || ""),
            quality: has320 ? "320kbps" : "160kbps"
          });
        }
        if (songs.length > 0) {
          setCache(cacheKey, songs);
          return res.json(songs);
        }
      }
    }
    const searchRes = await searchViaGetResults(query || "Top Hits");
    const result = searchRes.slice(0, 15);
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.json([]);
  }
});
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.song || req.query.q || req.query.query;
    if (!query) {
      return res.json([]);
    }
    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`\u26A1 Cache Hit: Search [${query}]`);
      return res.json(cached);
    }
    console.log("\n\u{1F50E} Searching:", query);
    let catalogResults = await prisma.song.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { artistName: { contains: query } },
          { albumName: { contains: query } }
        ]
      },
      orderBy: { popularity: "desc" },
      take: 60
    });
    catalogResults = catalogResults.map((s) => ({ ...s, artist: s.artistName, album: s.albumName }));
    if (catalogResults.length >= 6) {
      console.log(`\u2705 DB Search: ${catalogResults.length} hits returned`);
      setCache(cacheKey, catalogResults);
      return res.json(catalogResults);
    }
    console.log(`\u23F3 DB returned ${catalogResults.length} results. Trying Live APIs...`);
    let liveSongs = await searchViaSongDetails(query);
    if (liveSongs.length > 0) {
      const result = [...catalogResults, ...liveSongs].slice(0, 60);
      setCache(cacheKey, result);
      return res.json(result);
    }
    liveSongs = await searchViaGetResults(query);
    if (liveSongs.length > 0) {
      const result = [...catalogResults, ...liveSongs].slice(0, 60);
      setCache(cacheKey, result);
      return res.json(result);
    }
    liveSongs = await searchITunes(query);
    if (liveSongs.length > 0) {
      const result = [...catalogResults, ...liveSongs].slice(0, 60);
      setCache(cacheKey, result);
      return res.json(result);
    }
    setCache(cacheKey, catalogResults);
    return res.json(catalogResults);
  } catch (err) {
    console.error("\u274C Server Error:", err.message);
    res.status(500).json({ error: "Music API failed", message: err.message });
  }
});
app.get("/api/playlists", async (req, res) => {
  try {
    const category = req.query.category || req.query.q;
    if (!category) {
      return res.json([]);
    }
    const cacheKey = `playlists_${category.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    console.log("\n\u{1F4DA} Fetching Playlists for:", category);
    const response = await import_axios.default.get(JIOSAAVN_API, {
      params: {
        __call: "search.getPlaylistResults",
        _format: "json",
        _marker: "0",
        api_version: "4",
        ctx: "web6dot0",
        n: "20",
        q: category
      },
      headers: JIOSAAVN_HEADERS,
      timeout: 1e4
    });
    const data = response.data;
    if (!data || !data.results || data.results.length === 0) return res.json([]);
    const playlists = data.results.map((p) => ({
      id: p.id,
      name: decodeHTMLEntities(p.title),
      description: decodeHTMLEntities(p.subtitle || `${category} Curated Playlist`),
      image: (p.image || "").replace("150x150", "500x500").replace("50x50", "500x500"),
      type: "playlist"
    }));
    setCache(cacheKey, playlists);
    res.json(playlists);
  } catch (err) {
    console.error("\u274C Playlists API failed:", err.message);
    res.json([]);
  }
});
app.get("/api/catalog/home", async (req, res) => {
  try {
    const cacheKey = `home_data`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);
    const localTopSongs = (await prisma.song.findMany({ orderBy: { popularity: "desc" }, take: 24 })).map((s) => ({ ...s, artist: s.artistName, album: s.albumName }));
    const localAlbums = await prisma.album.findMany({ take: 10 });
    const localArtists = await prisma.artist.findMany({ take: 10 });
    const localPodcasts = (await prisma.song.findMany({ where: { isPodcast: true }, take: 10 })).map((s) => ({ ...s, artist: s.artistName, album: s.albumName }));
    let liveData = null;
    try {
      const liveRes = await import_axios.default.get(JIOSAAVN_API, {
        params: {
          __call: "webapi.getLaunchData",
          api_version: "4",
          _format: "json",
          _marker: "0",
          ctx: "web6dot0"
        },
        headers: JIOSAAVN_HEADERS,
        timeout: 5e3
        // Fast fail
      });
      liveData = liveRes.data;
    } catch (e) {
      console.warn("JioSaavn Launch Data failed. Using pure local fallback.", e.message);
    }
    const formatImage = (url) => (url || "").replace("150x150", "500x500").replace("50x50", "500x500");
    let trending = [];
    let featuredAlbums = [];
    let charts = [];
    let moods = [];
    let topArtists = [];
    if (liveData) {
      if (liveData.new_trending && liveData.new_trending.length > 0) {
        trending = liveData.new_trending.map((s) => ({
          id: s.id,
          title: decodeHTMLEntities(s.title),
          artist: decodeHTMLEntities(s.more_info?.artistMap?.primary_artists?.[0]?.name || s.subtitle || "Unknown"),
          image: formatImage(s.image),
          audioUrl: "spotify",
          album: decodeHTMLEntities(s.more_info?.album || "Single"),
          isSpotify: true
        }));
      }
      if (liveData.new_albums && liveData.new_albums.length > 0) {
        featuredAlbums = liveData.new_albums.map((a) => ({
          id: a.id,
          name: decodeHTMLEntities(a.title),
          artistName: decodeHTMLEntities(a.subtitle || ""),
          image: formatImage(a.image),
          isSpotify: true,
          query: a.title + " " + a.subtitle
        }));
      }
      if (liveData.charts && liveData.charts.length > 0) {
        charts = liveData.charts.map((c) => ({
          id: c.id,
          name: decodeHTMLEntities(c.title),
          description: decodeHTMLEntities(c.subtitle || "Top Charts"),
          image: formatImage(c.image),
          type: "chart"
        }));
      }
      if (liveData.top_playlists && liveData.top_playlists.length > 0) {
        moods = liveData.top_playlists.map((p) => ({
          id: p.id,
          name: decodeHTMLEntities(p.title),
          description: decodeHTMLEntities(p.subtitle || "Curated Playlist"),
          image: formatImage(p.image),
          type: "mood"
        }));
      }
      if (liveData.artist_recos && liveData.artist_recos.length > 0) {
        topArtists = liveData.artist_recos.map((a) => ({
          id: a.id,
          name: decodeHTMLEntities(a.title),
          image: formatImage(a.image),
          listeners: a.subtitle || "2.5M"
        }));
      }
    }
    if (trending.length < 10) {
      const existingTitles = new Set(trending.map((t) => t.title));
      const localFiltered = localTopSongs.filter((s) => !existingTitles.has(s.title));
      trending = [...trending, ...localFiltered];
    }
    const mixes = localArtists.slice(0, 4).map((a) => ({
      id: "mix-" + a.id,
      name: `${a.name} Mix`,
      description: `Catch up with the top hits of ${a.name}.`,
      image: a.image,
      type: "mix"
    }));
    const finalArtists = topArtists.length > 0 ? topArtists : localArtists;
    const finalAlbums = featuredAlbums.length > 0 ? featuredAlbums : localAlbums;
    const responseData = {
      quickPicks: trending.slice(0, 6),
      trending,
      newReleases: trending.slice(6, 18),
      featuredAlbums: finalAlbums,
      topArtists: finalArtists,
      podcasts: localPodcasts,
      mixes,
      moods,
      charts
    };
    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    console.error("Critical Live Home Page Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/catalog/artist/:id", async (req, res) => {
  try {
    const cacheKey = `artist_${req.params.id}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);
    let artist = await prisma.artist.findUnique({ where: { id: req.params.id } });
    let popularTracks = [];
    let albums = [];
    if (!artist) {
      const liveRes = await import_axios.default.get(JIOSAAVN_API, {
        params: {
          __call: "artist.getArtistPageDetails",
          artistId: req.params.id,
          api_version: "4",
          _format: "json",
          _marker: "0",
          ctx: "web6dot0"
        },
        headers: JIOSAAVN_HEADERS
      });
      if (!liveRes.data || !liveRes.data.name) return res.status(404).json({ error: "Artist not found" });
      const d = liveRes.data;
      artist = {
        id: req.params.id,
        name: decodeHTMLEntities(d.name),
        image: (d.image || "").replace("150x150", "500x500"),
        popularity: 100,
        biography: d.bio ? JSON.parse(d.bio)[0]?.text : "Verified Artist on Aura",
        genres: "Bollywood"
      };
      if (d.topSongs && d.topSongs.length > 0) {
        popularTracks = d.topSongs.map((t) => ({
          id: t.id,
          title: decodeHTMLEntities(t.title),
          artist: decodeHTMLEntities(t.more_info?.artistMap?.primary_artists?.[0]?.name || artist.name),
          image: (t.image || "").replace("150x150", "500x500"),
          audioUrl: "spotify",
          album: decodeHTMLEntities(t.more_info?.album || "Single"),
          isSpotify: true
        }));
      }
      try {
        const extraTracks = await searchViaGetResults(artist.name);
        if (extraTracks.length > 0) {
          const existingTitles = new Set(popularTracks.map((t) => t.title));
          const newExtras = extraTracks.filter((t) => !existingTitles.has(t.title));
          popularTracks = [...popularTracks, ...newExtras];
        }
      } catch (e) {
        console.warn("Failed to enrich live artist tracks", e);
      }
      if (d.topAlbums && d.topAlbums.length > 0) {
        albums = d.topAlbums.map((a) => ({
          id: a.id,
          name: decodeHTMLEntities(a.title),
          image: (a.image || "").replace("150x150", "500x500"),
          year: a.year || "2024",
          artistId: artist.id,
          artistName: artist.name
        }));
      }
      const responseData2 = { artist, popularTracks, albums, relatedArtists: [] };
      setCache(cacheKey, responseData2);
      return res.json(responseData2);
    }
    popularTracks = (await prisma.song.findMany({ where: { artistId: artist.id }, orderBy: { plays: "desc" }, take: 10 })).map((s) => ({ ...s, artist: s.artistName, album: s.albumName }));
    let liveTracks = [];
    if (artist.image && artist.image.includes("saavncdn") || artist.name === "Arijit Singh") {
      liveTracks = await searchViaGetResults(artist.name);
      if (liveTracks.length > 0) {
        popularTracks = liveTracks;
      }
    }
    albums = await prisma.album.findMany({ where: { artistId: artist.id } });
    if (artist.image && artist.image.includes("saavncdn") || artist.name === "Arijit Singh") {
      if (liveTracks.length > 0) {
        const uniqueAlbums = /* @__PURE__ */ new Map();
        liveTracks.forEach((t) => {
          if (t.album && t.album !== "Single" && !uniqueAlbums.has(t.album)) {
            uniqueAlbums.set(t.album, { id: "live-album-" + t.title, name: t.album, image: t.image, year: t.year || "2024", artistId: artist.id, artistName: artist.name });
          }
        });
        const liveAlbums = Array.from(uniqueAlbums.values());
        if (liveAlbums.length > 0) albums = liveAlbums;
      }
    }
    const primaryGenre = artist.genres.split(",")[0] || "";
    const relatedArtists = await prisma.artist.findMany({
      where: { genres: { contains: primaryGenre }, id: { not: artist.id } },
      take: 6
    });
    const responseData = { artist, popularTracks, albums, relatedArtists };
    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/catalog/album/:id", async (req, res) => {
  try {
    const cacheKey = `album_${req.params.id}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);
    const album = await prisma.album.findUnique({ where: { id: req.params.id } });
    if (!album) {
      const liveRes = await import_axios.default.get(JIOSAAVN_API, {
        params: {
          __call: "content.getAlbumDetails",
          api_version: "4",
          _format: "json",
          _marker: "0",
          ctx: "web6dot0",
          albumid: req.params.id
        },
        headers: JIOSAAVN_HEADERS
      });
      if (!liveRes.data || !liveRes.data.title && !liveRes.data.name) return res.status(404).json({ error: "Album not found" });
      const liveAlbum = liveRes.data;
      const tracks2 = (liveAlbum.list || []).map((t) => ({
        id: t.id,
        title: decodeHTMLEntities(t.title),
        artist: decodeHTMLEntities(t.more_info?.artistMap?.primary_artists?.[0]?.name || t.subtitle || "Unknown"),
        image: (t.image || "").replace("150x150", "500x500").replace("50x50", "500x500"),
        audioUrl: "spotify",
        album: decodeHTMLEntities(liveAlbum.title),
        isSpotify: true
      }));
      const responseData2 = {
        album: {
          id: liveAlbum.albumid || liveAlbum.id,
          name: decodeHTMLEntities(liveAlbum.title),
          image: (liveAlbum.image || "").replace("150x150", "500x500").replace("50x50", "500x500"),
          artistName: decodeHTMLEntities(liveAlbum.primary_artists || liveAlbum.subtitle || "Unknown Artist"),
          year: liveAlbum.year || "2024"
        },
        tracks: tracks2,
        similarAlbums: []
      };
      setCache(cacheKey, responseData2);
      return res.json(responseData2);
    }
    let tracks = (await prisma.song.findMany({ where: { albumId: album.id } })).map((s) => ({ ...s, artist: s.artistName, album: s.albumName }));
    if (tracks.length > 0 && tracks[0].isSpotify) {
      const artistInfo = tracks[0].artist || "";
      const liveTracks = await searchViaGetResults(album.name + " " + artistInfo);
      if (liveTracks.length > 0) {
        tracks = liveTracks.map((t) => ({ ...t, image: album.image, album: album.name }));
      }
    }
    const similarAlbums = await prisma.album.findMany({ where: { genre: album.genre, id: { not: album.id } }, take: 6 });
    const responseData = { album, tracks, similarAlbums };
    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/catalog/playlist/:id", async (req, res) => {
  try {
    const cacheKey = `playlist_${req.params.id}_${req.query.page || 1}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);
    const playlist = await prisma.playlist.findUnique({ where: { id: req.params.id } });
    if (!playlist) {
      const liveRes = await import_axios.default.get(JIOSAAVN_API, {
        params: {
          __call: "playlist.getDetails",
          api_version: "4",
          _format: "json",
          _marker: "0",
          ctx: "web6dot0",
          listid: req.params.id
        },
        headers: JIOSAAVN_HEADERS
      });
      if (!liveRes.data || !liveRes.data.title && !liveRes.data.listname) return res.status(404).json({ error: "Playlist not found" });
      const liveList = liveRes.data;
      const tracks2 = (liveList.list || []).map((t) => ({
        id: t.id,
        title: decodeHTMLEntities(t.title),
        artist: decodeHTMLEntities(t.more_info?.artistMap?.primary_artists?.[0]?.name || t.subtitle || "Unknown"),
        image: (t.image || "").replace("150x150", "500x500").replace("50x50", "500x500"),
        audioUrl: "spotify",
        album: decodeHTMLEntities(t.more_info?.album || "Single"),
        isSpotify: true
      }));
      const responseData2 = {
        playlist: {
          id: liveList.id || liveList.listid,
          name: decodeHTMLEntities(liveList.title || liveList.listname),
          image: (liveList.image || "").replace("150x150", "500x500").replace("50x50", "500x500"),
          description: decodeHTMLEntities(liveList.subtitle || "Live Curated Playlist"),
          totalTracks: tracks2.length
        },
        tracks: tracks2,
        similarPlaylists: [],
        hasMore: false
      };
      setCache(cacheKey, responseData2);
      return res.json(responseData2);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const playlistSongs = await prisma.playlistSong.findMany({
      where: { playlistId: playlist.id },
      include: { song: true },
      skip,
      take: limit
    });
    const totalTracks = await prisma.playlistSong.count({ where: { playlistId: playlist.id } });
    const tracks = playlistSongs.map((ps) => ({ ...ps.song, artist: ps.song.artistName, album: ps.song.albumName }));
    const similarPlaylists = await prisma.playlist.findMany({
      where: { id: { not: playlist.id }, OR: [{ type: playlist.type }, { genre: playlist.genre || void 0 }] },
      take: 6
    });
    const responseData = {
      playlist: { ...playlist, totalTracks },
      tracks,
      similarPlaylists,
      hasMore: skip + limit < totalTracks
    };
    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/catalog/discover", async (req, res) => {
  try {
    const genre = req.query.genre;
    const type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    let items = [];
    let total = 0;
    if (type === "album") {
      const whereClause = genre ? { genre } : {};
      items = await prisma.album.findMany({ where: whereClause, orderBy: { popularity: "desc" }, skip, take: limit });
      total = await prisma.album.count({ where: whereClause });
    } else if (type === "playlist") {
      const whereClause = genre ? { genre } : {};
      items = await prisma.playlist.findMany({ where: whereClause, skip, take: limit });
      total = await prisma.playlist.count({ where: whereClause });
    } else if (type === "podcast") {
      items = (await prisma.song.findMany({ where: { isPodcast: true }, orderBy: { popularity: "desc" }, skip, take: limit })).map((s) => ({ ...s, artist: s.artistName, album: s.albumName }));
      total = await prisma.song.count({ where: { isPodcast: true } });
    } else {
      const whereClause = genre ? { genre, isPodcast: false } : { isPodcast: false };
      items = (await prisma.song.findMany({ where: whereClause, orderBy: { popularity: "desc" }, skip, take: limit })).map((s) => ({ ...s, artist: s.artistName, album: s.albumName }));
      total = await prisma.song.count({ where: whereClause });
    }
    res.json({ items, hasMore: skip + limit < total, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/catalog/trending", async (req, res) => {
  try {
    const country = req.query.country || "Global";
    const genre = req.query.genre;
    const limit = parseInt(req.query.limit) || 50;
    if (country && country !== "Global") {
      const countryPlaylist = await prisma.playlist.findFirst({
        where: { type: "chart", country }
      });
      if (countryPlaylist) {
        const ps = await prisma.playlistSong.findMany({ where: { playlistId: countryPlaylist.id }, include: { song: true }, take: limit });
        return res.json({ title: `${country} Top Chart`, tracks: ps.map((p) => ({ ...p.song, artist: p.song.artistName, album: p.song.albumName })) });
      }
    }
    const whereClause = { isPodcast: false };
    if (genre) whereClause.genre = genre;
    const tracks = (await prisma.song.findMany({
      where: whereClause,
      orderBy: { plays: "desc" },
      take: limit
    })).map((s) => ({ ...s, artist: s.artistName, album: s.albumName }));
    res.json({ title: genre ? `${genre} Trending Hits` : "Global Trending Top 50", tracks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/recommendations", async (req, res) => {
  try {
    const userId = req.query.userId;
    let recommendedSongs = [];
    if (userId) {
      const history = await prisma.listeningHistory.findMany({
        where: { userId },
        include: { song: true },
        orderBy: { playedAt: "desc" },
        take: 50
      });
      if (history.length > 0) {
        const genres = Array.from(new Set(history.map((h) => h.song.genre).filter(Boolean)));
        const artists = Array.from(new Set(history.map((h) => h.song.artistName).filter(Boolean)));
        const historySongIds = history.map((h) => h.songId);
        recommendedSongs = await prisma.song.findMany({
          where: {
            id: { notIn: historySongIds },
            OR: [
              { genre: { in: genres } },
              { artistName: { in: artists } }
            ]
          },
          orderBy: { plays: "desc" },
          take: 20
        });
      }
    }
    if (recommendedSongs.length === 0) {
      recommendedSongs = await prisma.song.findMany({
        where: { isPodcast: false },
        orderBy: { popularity: "desc" },
        take: 20
      });
    }
    res.json({
      title: "Recommended for You",
      tracks: recommendedSongs.map((s) => ({ ...s, artist: s.artistName, album: s.albumName }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Music server is running \u2705" });
});
async function startServer() {
  const PORT = 3e3;
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
