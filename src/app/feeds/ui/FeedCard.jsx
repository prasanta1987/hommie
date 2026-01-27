import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock, FiSettings } from 'react-icons/fi';
import FeedSettingsModal from './FeedSettingsModal';
import './FeedCard.css';

export default function FeedCard({ feed, boardName, feedName }) {
    const [millis, setMillis] = useState(new Date().getTime());
    const [showModal, setShowModal] = useState(false);


    useEffect(() => {
        const interval = setInterval(() => {
            setMillis(new Date().getTime());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!feed) return null;

    const formatTimestamp = (dateValue) => {
        let dateInput = parseInt(dateValue);
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) {
            return 'Invalid time';
        }
        return date.toLocaleString('en-IN', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            day: 'numeric',
            month: 'short',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    };

    function calculateAgeing(epochMs) {
        const diffMs = millis - epochMs;
        const diffSec = Math.floor(diffMs / 1000);
        if (diffSec < 60) return `${diffSec} seconds ago`;

        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;

        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;

        return formatTimestamp(epochMs);
    }

    const dbTimestamp = feed.time ? feed.time : null;

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
                <div className="feed-card-body">
                    <div className="feed-value">{feed.value}</div>
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
            />
        </>
    );
};