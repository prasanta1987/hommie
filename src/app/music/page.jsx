'use client';

import { memo } from 'react';
import { useMusicPlayer } from '../context/MusicPlayerContext.jsx';
import styles from './Music.module.css';
import { FiSearch, FiMusic, FiPlayCircle, FiPauseCircle, FiSkipBack, FiSkipForward } from 'react-icons/fi';

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
    query,
    setQuery,
    isLoading,
    error,
    currentSong,
    playingSongId,
    isPlaying,
    progress,
    searchSong,
    handlePlayPause,
    handleNextSong,
    handlePreviousSong,
    handleSeek,
  } = useMusicPlayer();

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
