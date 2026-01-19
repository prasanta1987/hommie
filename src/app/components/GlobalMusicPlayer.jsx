'use client';

import { useMusicPlayer } from '../context/MusicPlayerContext.jsx';
import { usePathname } from 'next/navigation';
import styles from '../music/Music.module.css';
import { FiPlayCircle, FiPauseCircle, FiSkipBack, FiSkipForward } from 'react-icons/fi';

export default function GlobalMusicPlayer() {
  const {
    currentSong,
    isPlaying,
    progress,
    handlePlayPause,
    handleNextSong,
    handlePreviousSong,
    handleSeek,
  } = useMusicPlayer();
  const pathname = usePathname();

  if (!currentSong) return null;

  const isMusicPage = pathname === '/music';

  if (isMusicPage) {
    return null; // The full player is rendered on the /music page itself
  }

  // The main div is now the click target for seeking
  return (
    <div className={styles.floatingPlayer} onClick={handleSeek}>
      {/* This div is the visual progress fill */}
      <div className={styles.playerProgressFill} style={{ width: `${progress}%` }}></div>

      {/* The controls sit on top of the fill */}
      <div className={`${styles.playerContent} ${styles.miniPlayerContent}`}>
        <div className={styles.playerControls}>
          <button onClick={(e) => { e.stopPropagation(); handlePreviousSong(); }} className={styles.controlButton}>
            <FiSkipBack size={24} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handlePlayPause(currentSong); }} className={styles.controlButton}>
            {isPlaying ? <FiPauseCircle size={28} /> : <FiPlayCircle size={28} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleNextSong(); }} className={styles.controlButton}>
            <FiSkipForward size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
