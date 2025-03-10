import { useState, useEffect } from 'react';
import axios from 'axios';
import SongCard from './SongCard.jsx';

function Songs({ currentSong, isPlaying, currentTime, duration, isLoading, playSong, pauseSong, seekTo }) {
  const [allSongs, setAllSongs] = useState([]);
  const [displayedSongs, setDisplayedSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching songs, favorites, and playlist...');
        const [songsRes, favRes, playlistRes] = await Promise.all([
          axios.get('http://localhost:5000/api/songs'),
          axios.get('http://localhost:5000/api/favorites'),
          axios.get('http://localhost:5000/api/playlist'),
        ]);
        const songs = songsRes.data || [];
        setAllSongs(songs);
        setFavorites(favRes.data || []);
        setPlaylist(playlistRes.data || []);
        const shuffled = [...songs].sort(() => 0.5 - Math.random());
        setDisplayedSongs(shuffled.slice(0, 12));
        console.log('Songs loaded:', songs.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load songs. Please check your server.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (term) => {
    console.log('Searching for:', term);
    setSearchTerm(term);
    if (term.trim() === '') {
      const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
      setDisplayedSongs(shuffled.slice(0, 12));
    } else {
      const filtered = allSongs.filter(
        (song) =>
          song.title?.toLowerCase().includes(term.toLowerCase()) ||
          song.singer?.toLowerCase().includes(term.toLowerCase()) ||
          song.category?.toLowerCase().includes(term.toLowerCase())
      );
      setDisplayedSongs(filtered);
    }
  };

  const toggleFavorite = async (song) => {
    console.log('Toggling favorite for:', song.title);
    const isFavorite = favorites.some((fav) => fav.id === song.id);
    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:5000/api/favorites/${song.id}`);
        setFavorites(favorites.filter((fav) => fav.id !== song.id));
      } else {
        await axios.post('http://localhost:5000/api/favorites', song);
        setFavorites([...favorites, song]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const togglePlaylist = async (song) => {
    console.log('Toggling playlist for:', song.title);
    const isInPlaylist = playlist.some((item) => item.id === song.id);
    try {
      if (isInPlaylist) {
        await axios.delete(`http://localhost:5000/api/playlist/${song.id}`);
        setPlaylist(playlist.filter((item) => item.id !== song.id));
      } else {
        await axios.post('http://localhost:5000/api/playlist', song);
        setPlaylist([...playlist, song]);
      }
    } catch (error) {
      console.error('Error toggling playlist:', error);
    }
  };

  if (loading) {
    return <div className="songs container">Loading songs...</div>;
  }

  if (error) {
    return <div className="songs container" style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="songs container">
      <input
        type="text"
        placeholder="Search by title, singer, or category"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-bar full-width"
      />
      <div className="row">
        {displayedSongs.length > 0 ? (
          displayedSongs.map((song) => (
            <div className="col" key={song.id}>
              <SongCard
                song={song}
                isFavorite={favorites.some((fav) => fav.id === song.id)}
                isInPlaylist={playlist.some((item) => item.id === song.id)}
                onToggleFavorite={toggleFavorite}
                onTogglePlaylist={togglePlaylist}
                onPlay={() => {
                  console.log('Play clicked for:', song.title);
                  currentSong?.id === song.id && isPlaying ? pauseSong() : playSong(song);
                }}
                isPlaying={currentSong?.id === song.id && isPlaying}
                isLoading={currentSong?.id === song.id && isLoading}
                currentTime={currentSong?.id === song.id ? currentTime : 0}
                duration={currentSong?.id === song.id ? duration : 0}
                onSeek={seekTo}
              />
            </div>
          ))
        ) : (
          <p>No songs available.</p>
        )}
      </div>
    </div>
  );
}

export default Songs;