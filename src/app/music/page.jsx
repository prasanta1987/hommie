'use client';

import { memo, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useMusicPlayer } from '../context/MusicPlayerContext.jsx';
import styles from './Music.module.css';
import { FiSearch, FiMusic, FiPlayCircle, FiPauseCircle, FiSkipBack, FiSkipForward, FiHeart, FiShuffle, FiTrash2, FiPlus } from 'react-icons/fi';
import { setValueToDatabase, updateValuesToDatabase } from '../miscFunctions/actions.js';
import { Spinner } from 'react-bootstrap';
import { useAuth, useRTDB } from '@/hooks/firebaseHooks';

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
    liveMetadata,
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

  const { user, loading: authLoading } = useAuth();
  const { data: playlist, loading } = useRTDB(
    user ? `playlist/${user.uid}` : null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualAlbum, setManualAlbum] = useState('');
  const [testAudioState, setTestAudioState] = useState('stopped'); // 'stopped', 'buffering', 'playing'
  const testAudioRef = useRef(null);

  const handleTestPlay = () => {
    if (!manualUrl) return;

    if (testAudioState === 'playing' || testAudioState === 'buffering') {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
        testAudioRef.current.currentTime = 0;
      }
      setTestAudioState('stopped');
    } else {
      const audio = new Audio(manualUrl);
      testAudioRef.current = audio;
      setTestAudioState('buffering');

      audio.onwaiting = () => setTestAudioState('buffering');
      audio.onplaying = () => setTestAudioState('playing');
      audio.onpause = () => setTestAudioState('stopped');
      audio.onended = () => setTestAudioState('stopped');
      audio.onerror = () => {
        setTestAudioState('stopped');
        console.error("Failed to play test audio");
        alert("Could not play the URL. Please check if it's a valid audio link.");
      };

      audio.play().catch(err => {
        console.error("Failed to play test audio", err);
        setTestAudioState('stopped');
        alert("Could not play the URL. Please check if it's a valid audio link.");
      });
    }
  };

  const handleCloseModal = () => {
    if (testAudioRef.current) {
      testAudioRef.current.pause();
      testAudioRef.current.currentTime = 0;
    }
    setTestAudioState('stopped');
    setManualTitle('');
    setManualUrl('');
    setManualAlbum('');
    setIsModalOpen(false);
  };

  const handleManualSave = () => {
    if (!user) {
      alert("You must be logged in to add a song.");
      return;
    }
    if (!manualTitle.trim() || !manualUrl.trim()) {
      alert("Please provide both a title and a valid audio URL.");
      return;
    }

    const newSongId = Date.now().toString(); // Generate a simple unique ID
    const path = 'playlist/' + user.uid;
    const values = {
      [newSongId]: {
        name: manualTitle.trim(),
        image: `https://placehold.co/150x150.png`, // Random duty-free image (using .png for Next.js compatibility)
        artist: 'Manually Added',
        album: manualAlbum.trim() || 'Unknown Album',
        url: manualUrl.trim(),
      }
    };
    updateValuesToDatabase(path, values);
    handleCloseModal();
  };

  useEffect(() => {
    if (playlist && !query) {
      const playlistSongs = Object.keys(playlist).map(key => ({ id: key, ...playlist[key] }));
      setSongs(playlistSongs);
    } else if (!playlist && !query) {
      setSongs([]);
    }
  }, [playlist, setSongs, query]);

  // This useEffect hook will update the metadata
  useEffect(() => {
    if (currentSong) {
      document.title = liveMetadata || currentSong.name;
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = currentSong.artist;
    } else {
      document.title = "Music Player";
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.content = "Search for and listen to your favorite music.";
      }
    }
  }, [currentSong, liveMetadata]);


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
            <Image src={song.image} alt={song.name} className={styles.songListImage} width={500} height={500} />
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
            <Image src={currentSong.image} alt={currentSong.name} className={styles.playerImage} width={64} height={64} />
            <div className={styles.playerSongInfo}>
              <p className={styles.playerSongName}>{liveMetadata || currentSong.name}</p>
              <p className={styles.playerArtistName}>{liveMetadata || currentSong.artist}</p>
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

      {/* Floating Add Button */}
      {user && (
        <button className={styles.floatingAddButton} onClick={() => setIsModalOpen(true)}>
          <FiPlus size={32} />
        </button>
      )}

      {/* Add Song Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add Song Manually</h2>

            <input
              type="text"
              placeholder="Song Title"
              className={styles.modalInput}
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
            />

            <input
              type="text"
              placeholder="Album Name (Optional)"
              className={styles.modalInput}
              value={manualAlbum}
              onChange={(e) => setManualAlbum(e.target.value)}
            />

            <input
              type="url"
              placeholder="Song Audio URL (e.g. .mp3 link)"
              className={styles.modalInput}
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
            />

            <div className={styles.testPlayContainer}>
              <button className={styles.testPlayBtn} onClick={handleTestPlay}>
                {(testAudioState === 'playing' || testAudioState === 'buffering') ? <FiPauseCircle size={28} /> : <FiPlayCircle size={28} />}
              </button>
              <span className={styles.testPlayText}>
                {testAudioState === 'buffering' ? "Buffering..." :
                  testAudioState === 'playing' ? "Playing test audio..." :
                    "Test URL before saving"}
              </span>
            </div>

            <div className={styles.modalActions}>
              <button className={`${styles.modalBtn} ${styles.modalBtnSecondary}`} onClick={handleCloseModal}>
                Cancel
              </button>
              <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={handleManualSave}>
                Save Song
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
