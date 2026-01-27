import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock, FiSettings } from 'react-icons/fi';
import './FeedCard.css';
import FeedSettingsModal from './FeedSettingsModal';
import { calculateAgeing } from '../../miscFunctions/timeCalculation'
import Gauge from "@nationsinfo/react-simple-gauge";

import './Guage.css';

export default function Guage({ feed, boardName, feedName, deviceCode, uid }) {

  const [showModal, setShowModal] = useState(false);
  const [longAging, setLongAging] = useState(false);
  const [millis, setMillis] = useState(0);

  const dbTimestamp = feed.time ? feed.time : null;

  useEffect(() => {
    if (longAging) return;

    const interval = setInterval(() => {
      setMillis(new Date().getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [longAging]);

  useEffect(() => {
    if (dbTimestamp) {
      const diffMs = new Date().getTime() - dbTimestamp;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs >= 24) {
        setLongAging(true);
      }
    }
  }, [dbTimestamp]);


  if (!feed) return null;

  return (
    <>
      <div className="feed-card">
        <div className="feed-card-header">
          <FiZap className="feed-icon" />
          <span className="feed-name">{feedName}</span>
          <FiSettings
            className="settings-icon"
            onClick={() => setShowModal(true)}
          />
        </div>
        <div className="gauge-card-body">
          <Gauge
            className="gauge"
            value={feed.value}
            min={0}
            max={100}
          />
        </div>
        <div className="feed-card-footer">
          <div className="feed-board-info">
            <FiCpu className="board-icon" />
            <span>{boardName}</span>
          </div>
          <div className="feed-timestamp d-flex align-items-center">
            <FiClock className="board-icon" />
            <span>
              {dbTimestamp ? calculateAgeing(dbTimestamp) : 'No timestamp'}
            </span>
          </div>
        </div>
      </div>
      <FeedSettingsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feed={feed}
        boardName={boardName}
        feedName={feedName}
        deviceCode={deviceCode}
        uid={uid}
      />
    </>
  );
};
