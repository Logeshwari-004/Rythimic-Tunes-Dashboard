import { FaHeart, FaPlay, FaPause, FaDownload } from 'react-icons/fa';

function SongCard({ song, isFavorite, isInPlaylist, onToggleFavorite, onTogglePlaylist, onPlay, isPlaying, isLoading, currentTime, duration, onSeek }) {
  const handleDownload = () => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${song.song_img.split('/vi/')[1]?.split('/')[0]}`;
    window.open(youtubeUrl, '_blank');
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`song-card ${isPlaying ? 'playing' : ''}`}>
      <div className="card-body">
        <h5 className="card-title">{song.title}</h5>
        <p className="card-text">
          <strong>Singer:</strong> {song.singer}<br />
          <strong>Movie:</strong> {song.movie}<br />
          <strong>Category:</strong> {song.category}
        </p>
        <div className="song-actions">
          <button onClick={onPlay} className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Loading...' : (isPlaying ? <FaPause /> : <FaPlay />)}
          </button>
          <button
            onClick={() => onToggleFavorite(song)}
            className={`btn ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
          >
            <FaHeart />
          </button>
          <button
            onClick={() => onTogglePlaylist(song)}
            className={`btn ${isInPlaylist ? 'btn-success' : 'btn-outline-success'}`}
          >
            {isInPlaylist ? 'Remove' : 'Add'}
          </button>
          <button onClick={handleDownload} className="btn btn-secondary">
            <FaDownload />
          </button>
        </div>
        {isPlaying && (
          <div className="track-container">
            <span className="track-time">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="track-bar"
            />
            <span className="track-time">{formatTime(duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SongCard;