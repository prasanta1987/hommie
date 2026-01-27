
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

    const diffMs = new Date().getTime() - epochMs;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec} seconds ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;

    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;

    return formatTimestamp(epochMs);
}

export { formatTimestamp, calculateAgeing }