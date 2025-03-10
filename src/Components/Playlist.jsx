import { useState, useEffect } from 'react';
import axios from 'axios';
import SongCard from './SongCard.jsx';

function Playlist({ currentSong, isPlaying, currentTime, duration, isLoading, playSong, pauseSong, seekTo }) {
  const [favorites, setFavorites] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [favRes, playlistRes] = await Promise.all([
        axios.get('http://localhost:5000/api/favorites'),
        axios.get('http://localhost:5000/api/playlist'),
      ]);
      setFavorites(favRes.data);
      setPlaylist(playlistRes.data);
    };
    fetchData();
  }, []);

  const toggleFavorite = async (song) => {
    const isFavorite = favorites.some((fav) => fav.id === song.id);
    if (isFavorite) {
      await axios.delete(`http://localhost:5000/api/favorites/${song.id}`);
      setFavorites(favorites.filter((fav) => fav.id !== song.id));
    } else {
      await axios.post('http://localhost:5000/api/favorites', song);
      setFavorites([...favorites, song]);
    }
  };

  const togglePlaylist = async (song) => {
    await axios.delete(`http://localhost:5000/api/playlist/${song.id}`);
    setPlaylist(playlist.filter((item) => item.id !== song.id));
  };

  return (
    <div className="playlist container">
      <h1>Playlist</h1>
      <div className="row">
        {playlist.map((song) => (
          <div className="col" key={song.id}>
            <SongCard
              song={song}
              isFavorite={favorites.some((fav) => fav.id === song.id)}
              isInPlaylist={true}
              onToggleFavorite={toggleFavorite}
              onTogglePlaylist={togglePlaylist}
              onPlay={() => currentSong?.id === song.id && isPlaying ? pauseSong() : playSong(song)}
              isPlaying={currentSong?.id === song.id && isPlaying}
              isLoading={currentSong?.id === song.id && isLoading}
              currentTime={currentSong?.id === song.id ? currentTime : 0}
              duration={currentSong?.id === song.id ? duration : 0}
              onSeek={seekTo}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Playlist;