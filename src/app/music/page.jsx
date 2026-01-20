'use client';

import { memo, useEffect } from 'react';
import { useMusicPlayer } from '../context/MusicPlayerContext.jsx';
import styles from './Music.module.css';
import { FiSearch, FiMusic, FiPlayCircle, FiPauseCircle, FiSkipBack, FiSkipForward, FiHeart, FiShuffle, FiTrash2 } from 'react-icons/fi';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref } from 'firebase/database';
import { useObjectVal } from 'react-firebase-hooks/database';
import { setValueToDatabase, updateValuesToDatabase } from '../miscFunctions/actions.js';
import { Spinner } from 'react-bootstrap';

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

export default function MusicPage() {
  const {
    songs,
    setSongs,
    query,
    setQuery,
    isLoading,
    error,
    currentSong,
    playingSongId,
    isPlaying,
    progress,
    shuffle,
    searchSong,
    handlePlayPause,
    handleNextSong,
    handlePreviousSong,
    handleSeek,
    toggleShuffle,
  } = useMusicPlayer();
  const auth = getAuth();
  const database = getDatabase();
  const [user] = useAuthState(auth);
  const [playlist, loading] = useObjectVal(user ? ref(database, 'playlist/' + user.uid) : null);

  useEffect(() => {
    if (playlist && !query) {
      const playlistSongs = Object.keys(playlist).map(key => ({ id: key, ...playlist[key] }));
      setSongs(playlistSongs);
    } else if (!playlist && !query) {
      setSongs([]);
    }
  }, [playlist, setSongs, query]);

  const isLiked = (songId) => {
    return playlist && playlist[songId];
  };

  const handleLike = (song) => {
    if (user && !isLiked(song.id)) {
      const path = 'playlist/' + user.uid;
      const values = {
        [song.id]: {
            name: song.name,
            image: song.image,
            artist: song.artist,
            album: song.album,
            url: song.url,
        }
      };
      updateValuesToDatabase(path, values);
    } else if (!user) {
      console.log("You must be logged in to like a song.");
    }
  };
  
  const handleDelete = (songId) => {
      if (user) {
          const path = 'playlist/' + user.uid + '/' + songId;
          setValueToDatabase(path, null);
      }
  };

  if (loading) {
    return (
      <div className='text-center bg-dark flex-grow-1 d-flex justify-content-center align-items-center'>
        <Spinner animation="grow" variant="info" size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.musicContainer}>
      <Search 
        query={query} 
        setQuery={setQuery} 
        searchSong={searchSong} 
        isLoading={isLoading} 
      />

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.songList}>
        {songs.map(song => (
          <div key={song.id} className={styles.songListItem}>
            <img src={song.image} alt={song.name} className={styles.songListImage} />
            <div className={styles.songListInfo}>
              <p className={styles.songListName}>{song.name}</p>
              <p className={styles.songListArtist}>{song.artist}</p>
              <p className={styles.songListAlbum}>{song.album}</p>
            </div>
            {song.url && (
              <div className={styles.songActions}>
                {isLiked(song.id) ? (
                    <button onClick={() => handleDelete(song.id)} className={styles.likeButton}>
                        <FiTrash2 size={28} color="#ff6347" />
                    </button>
                ) : (
                    <button onClick={() => handleLike(song)} className={styles.likeButton}>
                        <FiHeart size={28} />
                    </button>
                )}
                <button onClick={() => handlePlayPause(song)} className={styles.playPauseButton}>
                  {isPlaying && playingSongId === song.id ? <FiPauseCircle size={28} /> : <FiPlayCircle size={28} />}
                </button>
              </div>
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
            <div className={styles.progressBarContainerMobile} onClick={handleSeek}>
                <div className={styles.progressBarFill} style={{ width: `${progress}%` }}>
                    <div className={styles.progressBarThumb}></div>
                </div>
            </div>
            <div className={styles.playerContent}>
                <img src={currentSong.image} alt={currentSong.name} className={styles.playerImage} />
                <div className={styles.playerSongInfo}>
                    <p className={styles.playerSongName}>{currentSong.name}</p>
                    <p className={styles.playerArtistName}>{currentSong.artist}</p>
                    <p className={styles.playerAlbumName}>{currentSong.album}</p>
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
                    <button onClick={toggleShuffle} className={styles.controlButton}>
                        <FiShuffle size={28} color={shuffle ? '#1DB954' : 'currentColor'} />
                    </button>
                </div>
                <div className={styles.progressBarContainerDesktop} onClick={handleSeek}>
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
