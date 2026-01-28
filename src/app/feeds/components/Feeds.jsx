import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock } from 'react-icons/fi';
import NoFeed from '../ui/NoFeed'
import FeedCard from '../ui/FeedCard'

const Feeds = React.memo((props) => {
    const [selectedFeeds, setSelectedFeeds] = useState([]);

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
                            deviceCode: board.deviceCode
                        }));
                }
                return [];
            });
            setSelectedFeeds(feeds);
            console.log(feeds)
        } else {
            setSelectedFeeds([]);
        }
    }, [props.feedData]);

    if (selectedFeeds.length === 0) {
        return <NoFeed />;
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
