import { useState, useEffect } from 'react';
import axios from 'axios';
import SongCard from './SongCard.jsx';

function Favorites({ currentSong, isPlaying, currentTime, duration, isLoading, playSong, pauseSong, seekTo }) {
  const [favorites, setFavorites] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [favRes, playlistRes] = await Promise.all([
          axios.get('http://localhost:5000/api/favorites'),
          axios.get('http://localhost:5000/api/playlist'),
        ]);
        setFavorites(favRes.data || []);
        setPlaylist(playlistRes.data || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError('Failed to load favorites. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = async (song) => {
    try {
      await axios.delete(`http://localhost:5000/api/favorites/${song.id}`);
      setFavorites(favorites.filter((fav) => fav.id !== song.id));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const togglePlaylist = async (song) => {
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
    return <div className="favorites container">Loading favorites...</div>;
  }

  if (error) {
    return <div className="favorites container" style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="favorites container">
      <h1>Favorites</h1>
      <div className="row">
        {favorites.length > 0 ? (
          favorites.map((song) => (
            <div className="col" key={song.id}>
              <SongCard
                song={song}
                isFavorite={true}
                isInPlaylist={playlist.some((item) => item.id === song.id)}
                onToggleFavorite={toggleFavorite}
                onTogglePlaylist={togglePlaylist}
                onPlay={() => (currentSong?.id === song.id && isPlaying ? pauseSong() : playSong(song))}
                isPlaying={currentSong?.id === song.id && isPlaying}
                isLoading={currentSong?.id === song.id && isLoading}
                currentTime={currentSong?.id === song.id ? currentTime : 0}
                duration={currentSong?.id === song.id ? duration : 0}
                onSeek={seekTo}
              />
            </div>
          ))
        ) : (
          <p>No favorites yet.</p>
        )}
      </div>
    </div>
  );
}

export default Favorites;