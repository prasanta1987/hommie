import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Crucial for 8-hour sessions and cost savings

async function getAuthenticatedUID(apiKey) {
    if (!apiKey) return null;
    try {
        const fbBase = "https://hommily-default-rtdb.firebaseio.com";
        const secret = process.env.FIREBASE_DATABASE_SECRET;
        const authUrl = `${fbBase}/userCred/APItoUID/${apiKey}/fbUID.json?auth=${secret}`;
        const res = await fetch(authUrl);
        return await res.json();
    } catch (e) {
        return null;
    }
}

export const GET = async (request) => {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const deviceCode = searchParams.get('deviceCode');
    const feedName = searchParams.get('feedName');

    // 1. Authenticate using your new function
    const userUID = await getAuthenticatedUID(apiKey);
    if (!userUID || !deviceCode) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Setup Firebase Stream Path
    let fbPath = `${userUID}/${deviceCode}/devFeeds`;
    if (feedName === "display") fbPath = `${userUID}/${deviceCode}/display`;

    const secret = process.env.FIREBASE_DATABASE_SECRET;
    const fbStreamUrl = `https://hommily-default-rtdb.firebaseio.com/${fbPath}.json?auth=${secret}`;

    const fbResponse = await fetch(fbStreamUrl, {
        headers: { 'Accept': 'text/event-stream' }
    });

    // ... (getAuthenticatedUID and initial setup remain the same)

    const readableStream = new ReadableStream({
        async start(controller) {
            const reader = fbResponse.body.getReader();
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();

            let masterState = {};
            const keysToRemove = ['isSelected', 'time', 'rangeMax', 'rangeMin']; // Keeping timerEndTime as it was in your example
            const typesToRemove = ['Gauge',"Card"];

            function clean(obj) {
                if (!obj || typeof obj !== 'object') return obj;
                const newObj = { ...obj };
                keysToRemove.forEach(k => delete newObj[k]);
                return newObj;
            }

            const heartbeatInterval = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": heartbeat\n\n"));
                } catch (e) {
                    clearInterval(heartbeatInterval);
                }
            }, 15000);

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    let eventType = "put";
                    let rawData = "";

                    for (const line of lines) {
                        if (line.startsWith('event:')) eventType = line.replace('event:', '').trim();
                        else if (line.startsWith('data:')) rawData = line.slice(5).trim();
                    }

                    // Handle Heartbeats/Keep-alive silently
                    if (!rawData || rawData === "keep-alive" || rawData === "null") {
                        continue;
                    }

                    try {
                        const parsed = JSON.parse(rawData);
                    
                        // --- MERGE INTO MASTER STATE ---
                        if (eventType === 'put') {
                            if (parsed.path === "/") {
                                // Full reset or initial load
                                masterState = {};
                                const incoming = parsed.data || {};
                                for (const [id, dev] of Object.entries(incoming)) {
                                    if (dev && !typesToRemove.includes(dev.type)) {
                                        masterState[id] = clean(dev);
                                    }
                                }
                            } else {
                                const pathKey = parsed.path.replace('/', '');
                                if (parsed.data === null) {
                                    // Handle specific item deletion via PUT
                                    delete masterState[pathKey];
                                } else if (!typesToRemove.includes(parsed.data.type)) {
                                    masterState[pathKey] = clean(parsed.data);
                                }
                            }
                        } else if (eventType === 'patch') {
                            const pathKey = parsed.path.replace('/', '');
                            
                            if (parsed.data === null) {
                                // Explicit deletion via PATCH
                                if (pathKey !== "") delete masterState[pathKey];
                            } else if (pathKey === "") {
                                // Multi-path update
                                Object.entries(parsed.data).forEach(([id, dev]) => {
                                    if (dev === null) {
                                        delete masterState[id];
                                    } else {
                                        masterState[id] = { ...masterState[id], ...clean(dev) };
                                    }
                                });
                            } else {
                                // Single item update
                                masterState[pathKey] = { ...masterState[pathKey], ...clean(parsed.data) };
                            }
                        }
                    
                        // --- THE FILTERED OUTPUT ---
                        // Only send the state if it's a valid object and NOT an empty "path" noise packet
                        if (Object.keys(masterState).length > 0 || eventType === 'put' || eventType === 'patch') {
                            const cleanOutput = `data: ${JSON.stringify(masterState)}\n\n`;
                            controller.enqueue(encoder.encode(cleanOutput));
                        }
                    
                    } catch (e) {
                        // Ignore parsing errors
                    }

                }
            } catch (err) {
                controller.error(err);
            } finally {
                clearInterval(heartbeatInterval);
                reader.releaseLock();
                controller.close();
            }
        }
    });

    // ... (Return Response remains the same)

    return new Response(readableStream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
};