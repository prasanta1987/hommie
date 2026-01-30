'use client'
import { FiZap, FiCpu, FiClock, FiPlus } from 'react-icons/fi';

export default function NoFeeds({ onTrigger }) {
  return (
    <div className="h-100 text-light container align-content-center text-center">
      <h1 style={{
        color: '#94c7e5',
        textShadow: '4px 4px 7px #000'
      }}>No Feeds Added</h1>

      <button
        className="plus-button"
        onClick={onTrigger}
        title="Add new feed"
      >
        <FiPlus size={24} />
      </button>
    </div>

  );
}
