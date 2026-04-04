'use client';

import { createContext, useContext, useState, useRef, useCallback } from 'react';

const MusicPlayerContext = createContext();

export function useMusicPlayer() {
  return useContext(MusicPlayerContext);
}

export function MusicPlayerProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState('');
  const [playingSongId, setPlayingSongId] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(true);
  const audioRef = useRef(null);

  const searchSong = useCallback(async (e) => {
    if(e) e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://saavn.sumit.co/api/search/songs?query=${query}`);
      const data = await response.json();

      if (data.data.results.length > 0) {
        const fetchedSongs = data.data.results.map(song => ({
          id: song.id,
          name: song.name,
          artist: song.artists.primary[0].name,
          album: song.album.name,
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
  }, [query]);


  const handlePlayPause = useCallback((song) => {
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
  }, [playingSongId, isPlaying]);

  const handleSongNavigation = useCallback((direction) => {
    if (!currentSong || songs.length < 1) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    
    if (currentIndex === -1) return;

    if (shuffle) {
      let newIndex = Math.floor(Math.random() * songs.length);
      while(newIndex === currentIndex) {
        newIndex = Math.floor(Math.random() * songs.length);
      }
      const nextSong = songs[newIndex];
      if (nextSong.url) {
        handlePlayPause(nextSong);
      } else {
        handleSongNavigation(direction); // try again
      }
      return;
    }

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
  }, [currentSong, songs, handlePlayPause, shuffle]);

  const handleNextSong = useCallback(() => handleSongNavigation(1), [handleSongNavigation]);
  const handlePreviousSong = useCallback(() => handleSongNavigation(-1), [handleSongNavigation]);

  const toggleShuffle = () => setShuffle(!shuffle);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
        const { currentTime, duration } = audioRef.current;
        if (duration) {
          const progressPercent = (currentTime / duration) * 100;
          setProgress(progressPercent);
        }
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
  
  const value = {
    songs,
    setSongs,
    query,
    setQuery,
    playingSongId,
    currentSong,
    isLoading,
    error,
    isPlaying,
    progress,
    shuffle,
    audioRef,
    searchSong,
    handlePlayPause,
    handleNextSong,
    handlePreviousSong,
    handleSeek,
    toggleShuffle,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleNextSong}
       />
    </MusicPlayerContext.Provider>
  );
}
