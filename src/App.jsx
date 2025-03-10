import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './Components/Sidebar.jsx';
import Songs from './Components/Songs.jsx';
import Favorites from './Components/Favorites.jsx';
import Playlist from './Components/Playlist.jsx';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        console.log('Loading YouTube API...');
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          console.log('YouTube API ready, initializing player...');
          initPlayer();
        };
      } else if (!playerRef.current) {
        console.log('YouTube API already loaded, initializing player...');
        initPlayer();
      }
    };
    loadYouTubeAPI();

    return () => {
      // Cleanup to avoid memory leaks
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const initPlayer = () => {
    try {
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        height: '0',
        width: '0',
        playerVars: {
          autoplay: 0,
          controls: 0,
          showinfo: 0,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            console.log('Player ready');
            onPlayerReady(event);
          },
          onStateChange: onPlayerStateChange,
          onError: (event) => {
            console.error('YouTube Player Error:', event.data);
            setError(`Player error: ${event.data}. Trying next song...`);
            playNextSong();
          },
        },
      });
    } catch (err) {
      console.error('Error initializing player:', err);
      setError('Failed to initialize YouTube player.');
    }
  };

  const onPlayerReady = (event) => {
    const savedSong = JSON.parse(localStorage.getItem('currentSong'));
    const savedIsPlaying = localStorage.getItem('isPlaying') === 'true';
    if (savedSong && savedIsPlaying) {
      console.log('Resuming saved song:', savedSong.title);
      playSong(savedSong);
    }
  };

  const onPlayerStateChange = (event) => {
    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        console.log('Song is playing');
        setIsPlaying(true);
        localStorage.setItem('isPlaying', 'true');
        setDuration(event.target.getDuration());
        const updateTime = () => {
          const time = event.target.getCurrentTime();
          setCurrentTime(time);
          if (playerRef.current?.getPlayerState() === window.YT.PlayerState.PLAYING) {
            requestAnimationFrame(updateTime);
          }
        };
        requestAnimationFrame(updateTime);
        break;
      case window.YT.PlayerState.PAUSED:
        console.log('Song paused');
        setIsPlaying(false);
        localStorage.setItem('isPlaying', 'false');
        setCurrentTime(event.target.getCurrentTime());
        break;
      case window.YT.PlayerState.ENDED:
        console.log('Song ended');
        playNextSong();
        break;
      default:
        break;
    }
  };

  const playSong = async (song) => {
    console.log('Attempting to play song:', song.title);
    if (!song || !song.title || !song.singer) {
      setError('Invalid song data.');
      console.error('Invalid song:', song);
      return;
    }

    if (!playerRef.current) {
      setError('Player not ready yet. Please wait.');
      console.warn('Player not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching YouTube video ID...');
      const response = await fetch(
        `http://localhost:5000/api/youtube/${encodeURIComponent(song.title)}/${encodeURIComponent(song.singer)}`
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      const videoId = data.videoId;
      if (!videoId) {
        throw new Error('No video ID returned from API');
      }

      console.log('Loading video with ID:', videoId);
      playerRef.current.loadVideoById({ videoId, startSeconds: currentTime });
      setCurrentSong(song);
      localStorage.setItem('currentSong', JSON.stringify(song));
      setIsPlaying(true);
    } catch (error) {
      console.error('Error in playSong:', error.message);
      setError(`Failed to play "${song.title}". ${error.message}`);
      playNextSong();
    } finally {
      setIsLoading(false);
    }
  };

  const pauseSong = () => {
    if (playerRef.current && isPlaying) {
      console.log('Pausing song');
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      localStorage.setItem('isPlaying', 'false');
    }
  };

  const playNextSong = () => {
    console.log('Playing next song (resetting)');
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const seekTo = (time) => {
    if (playerRef.current) {
      console.log('Seeking to:', time);
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
      if (!isPlaying) {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="app">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-content">
          {error && <div style={{ color: 'red', padding: '10px' }}>{error}</div>}
          <Routes>
            <Route
              path="/"
              element={
                <Songs
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  isLoading={isLoading}
                  playSong={playSong}
                  pauseSong={pauseSong}
                  seekTo={seekTo}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <Favorites
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  isLoading={isLoading}
                  playSong={playSong}
                  pauseSong={pauseSong}
                  seekTo={seekTo}
                />
              }
            />
            <Route
              path="/playlist"
              element={
                <Playlist
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  isLoading={isLoading}
                  playSong={playSong}
                  pauseSong={pauseSong}
                  seekTo={seekTo}
                />
              }
            />
          </Routes>
          {currentSong && (
            <div className="current-song-bar">
              <div className="song-info">
                <span className="song-title">{currentSong.title}</span>
                <span className="song-singer">{currentSong.singer}</span>
              </div>
              <div className="player-controls">
                <button
                  className="btn btn-primary"
                  onClick={isPlaying ? pauseSong : () => playSong(currentSong)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
                </button>
                <div className="track-container">
                  <input
                    type="range"
                    className="track-bar"
                    min="0"
                    max={duration || 100}
                    value={currentTime || 0}
                    onChange={(e) => seekTo(parseFloat(e.target.value))}
                  />
                  <span className="track-time">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /
                    {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={playerContainerRef} style={{ display: 'none' }} />
        </div>
      </div>
    </Router>
  );
}

export default App;