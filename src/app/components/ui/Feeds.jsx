import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock } from 'react-icons/fi';


import './Feeds.css';

// Helper function to format timestamp
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
    }
    )
};

const FeedCard = ({ feed, boardName, feedName }) => {
    const [millis, setMillis] = useState(new Date().getTime());

    useEffect(() => {
        const interval = setInterval(() => {
            setMillis(new Date().getTime());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!feed) return null;

    function calculateAgeing(epochMs) {
        const diffMs = millis - epochMs;


        const diffSec = Math.floor(diffMs / 1000);
        if (diffSec < 60) {
            return `${diffSec} seconds ago`;
        }

        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) {
            return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        }

        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) {
            return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
        } else {
            return formatTimestamp(epochMs)
        }

        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < (24 * 30)) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }

        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) {
            return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        }

        const diffYear = Math.floor(diffMonths / 12);
        return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;

    }


    // Use the timestamp from the feed data, assuming it has a 'time' property
    const dbTimestamp = feed.time ? feed.time : null;

    return (
        <div className="feed-card">
            <div className="feed-card-header">
                <FiZap className="feed-icon" />
                <span className="feed-name">{feedName}</span>
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
    );
};

const Feeds = React.memo((props) => {
    const [selectedFeeds, setSelectedFeeds] = useState([]);

    useEffect(() => {
        if (props.feedData) {
            const allBoards = Object.values(props.feedData);
            const feeds = allBoards.flatMap(board => {
                if (board.devFeeds) {
                    return Object.keys(board.devFeeds)
                        .filter(feedName => board.devFeeds[feedName].isSelected)
                        .map(feedName => ({
                            ...board.devFeeds[feedName],
                            boardName: board.deviceName,
                            feedName: feedName,
                            id: `${board.deviceCode}-${feedName}`
                        }));
                }
                return [];
            });
            setSelectedFeeds(feeds);
        } else {
            setSelectedFeeds([]);
        }
    }, [props.feedData]);

    if (selectedFeeds.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>
                <h2>No Feeds Selected</h2>
                <p>Please select a feed from a board to see its data.</p>
            </div>
        );
    }

    return (
        <div className="feeds-grid">
            {selectedFeeds.map(feed => (
                <FeedCard key={feed.id} feed={feed} boardName={feed.boardName} feedName={feed.feedName} />
            ))}
        </div>
    );
});
Feeds.displayName = "Feeds";

export default Feeds;
