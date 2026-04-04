import React, { useEffect, useState } from 'react';
import NoFeed from '../ui/NoFeed'
import FeedCard from '../ui/FeedCard'
import './LandingPage.css'

const Feeds = React.memo((props) => {
    const [selectedFeeds, setSelectedFeeds] = useState([]);
    const [selectedDeviceCode, setSelectedDeviceCode] = useState('');

    useEffect(() => {

        if (props.feedData) {
            const userDbData = Object.values(props.feedData);
            const feeds = userDbData.flatMap(board => {
                if (board.devFeeds) {
                    return Object.keys(board.devFeeds)
                        .filter(feedName => board.devFeeds[feedName].isSelected)
                        .map(feedName => ({
                            ...board.devFeeds[feedName],
                            boardName: board.deviceName,
                            feedName: feedName,
                            id: `${board.deviceCode}-${feedName}`,
                            deviceCode: board.deviceCode,
                            deviceType: board.deviceType
                        }));
                }
                return [];
            });
            setSelectedFeeds(feeds);
        } else {
            setSelectedFeeds([]);
            setDevices([]);
        }
    }, [props.feedData, selectedDeviceCode]);

    if (selectedFeeds.length === 0) {
        return <NoFeed />
    }


    return (
        <div className="feeds-grid">
            {selectedFeeds.map(feed => {
                return <FeedCard
                    key={feed.id}
                    type={feed.type}
                    feed={feed}
                    boardName={feed.boardName}
                    feedName={feed.feedName}
                    deviceCode={feed.deviceCode}
                    uid={props.userUid}
                />

            })}
        </div>
    );
});
Feeds.displayName = "Feeds";

export default Feeds;
