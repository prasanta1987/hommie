'use client';

import { useState, useRef, memo } from 'react';
import styles from './Music.module.css';
import { FiSearch, FiMusic, FiPlayCircle, FiPauseCircle, FiSkipBack, FiSkipForward } from 'react-icons/fi';

// Memoized Search Component to prevent re-renders
const Search = memo(function Search({ query, setQuery, searchSong, isLoading }) {
  return (
    <div className={styles.searchContainer}>
      <h1 className={styles.title}>Music Player</h1>
      <form onSubmit={searchSong} className={styles.searchForm}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song..."
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton} disabled={isLoading}>
          {isLoading ? 'Searching...' : <FiSearch />}
        </button>
      </form>
    </div>
  );
});

export default function MusicPlayer() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const progressBarMobileRef = useRef(null);
  const progressBarDesktopRef = useRef(null);

  const searchSong = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setSongs([]); // Clear previous search results
    setError(null);

    try {
      const response = await fetch(`https://saavn.sumit.co/api/search/songs?query=${query}`);
      const data = await response.json();

      if (data.data.results.length > 0) {
        const fetchedSongs = data.data.results.map(song => ({
          id: song.id,
          name: song.name,
          artist: song.artists.primary[0].name,
          image: song.image?.[song.image.length - 1]?.url || 'https://via.placeholder.com/150?text=No+Image',
          url: song.downloadUrl?.[song.downloadUrl.length - 1]?.url,
        }));
        setSongs(fetchedSongs);
      } else {
        setSongs([]);
        setError('No songs found. Please try another search.');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Failed to fetch songs. Please try again later.');
    }

    setIsLoading(false);
  };

  const handlePlayPause = (song) => {
    setError(null);
    if (!song || !song.url) {
      setError(`Sorry, the song is not available for streaming.`);
      setPlayingSongId(null);
      return;
    }

    if (playingSongId === song.id) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else { 
      setCurrentSong(song);
      setPlayingSongId(song.id);
      if (audioRef.current) {
        audioRef.current.src = song.url;
        audioRef.current.play().then(() => {
            setIsPlaying(true);
        }).catch(e => {
            console.error("Playback failed:", e);
            setError(`Could not play "${song.name}". The audio might be unavailable.`);
            setIsPlaying(false);
            setPlayingSongId(null);
            setCurrentSong(null);
        });
      }
    }
  };

  const handleSongNavigation = (direction) => {
    if (!currentSong || songs.length < 1) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    for (let i = 0; i < songs.length; i++) {
        newIndex = (newIndex + direction + songs.length) % songs.length;
        const nextSong = songs[newIndex];
        if (nextSong.url) {
            handlePlayPause(nextSong);
            return;
        }
    }
    setError("No other available songs to play.");
  };

  const handleNextSong = () => handleSongNavigation(1);
  const handlePreviousSong = () => handleSongNavigation(-1);

  const handleTimeUpdate = () => {
    const { currentTime, duration } = audioRef.current;
    if (duration) {
      const progressPercent = (currentTime / duration) * 100;
      setProgress(progressPercent);
    }
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const newProgress = (clickX / progressBar.offsetWidth) * 100;
    
    if (audioRef.current && audioRef.current.duration) {
        const { duration } = audioRef.current;
        audioRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  return (
    <div className={styles.musicContainer}>
        <Search 
            query={query} 
            setQuery={setQuery} 
            searchSong={searchSong} 
            isLoading={isLoading} 
        />

      {error && <p className={styles.error}>{error}</p>}
      
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleNextSong}
       />

      <div className={styles.songList}>
        {songs.map(song => (
          <div key={song.id} className={styles.songListItem}>
            <img src={song.image} alt={song.name} className={styles.songListImage} />
            <div className={styles.songListInfo}>
              <p className={styles.songListName}>{song.name}</p>
              <p className={styles.songListArtist}>{song.artist}</p>
            </div>
            {song.url && (
              <button onClick={() => handlePlayPause(song)} className={styles.playPauseButton}>
                {isPlaying && playingSongId === song.id ? <FiPauseCircle size={28} /> : <FiPlayCircle size={28} />}
              </button>
            )}
          </div>
        ))}
      </div>

      {songs.length === 0 && !isLoading && !error && (
        <div className={styles.noSong}>
          <FiMusic size={80} />
          <p>Search for a song to begin</p>
        </div>
      )}

      {currentSong && (
        <div className={styles.bottomPlayer}>
            <div ref={progressBarMobileRef} className={styles.progressBarContainerMobile} onClick={handleSeek}>
                <div className={styles.progressBarFill} style={{ width: `${progress}%` }}>
                    <div className={styles.progressBarThumb}></div>
                </div>
            </div>
            <div className={styles.playerContent}>
                <img src={currentSong.image} alt={currentSong.name} className={styles.playerImage} />
                <div className={styles.playerSongInfo}>
                    <p className={styles.playerSongName}>{currentSong.name}</p>
                    <p className={styles.playerArtistName}>{currentSong.artist}</p>
                </div>
                <div className={styles.playerControls}>
                    <button onClick={handlePreviousSong} className={styles.controlButton}>
                        <FiSkipBack size={28} />
                    </button>
                    <button onClick={() => handlePlayPause(currentSong)} className={styles.controlButton}>
                        {isPlaying ? <FiPauseCircle size={32} /> : <FiPlayCircle size={32} />}
                    </button>
                    <button onClick={handleNextSong} className={styles.controlButton}>
                        <FiSkipForward size={28} />
                    </button>
                </div>
                <div ref={progressBarDesktopRef} className={styles.progressBarContainerDesktop} onClick={handleSeek}>
                    <div className={styles.progressBarFill} style={{ width: `${progress}%` }}>
                       <div className={styles.progressBarThumb}></div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
