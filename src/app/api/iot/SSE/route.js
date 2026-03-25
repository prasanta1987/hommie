import { NextResponse } from 'next/server';

export const runtime = 'edge';

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

    const userUID = await getAuthenticatedUID(apiKey);
    if (!userUID || !deviceCode) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let fbPath = `${userUID}/${deviceCode}/devFeeds`;
    if (feedName === "display") fbPath = `${userUID}/${deviceCode}/display`;
    
    const secret = process.env.FIREBASE_DATABASE_SECRET;
    const fbStreamUrl = `https://hommily-default-rtdb.firebaseio.com/${fbPath}.json?auth=${secret}`;

    const fbResponse = await fetch(fbStreamUrl, {
        headers: { 'Accept': 'text/event-stream' }
    });

    const readableStream = new ReadableStream({
        async start(controller) {
            const reader = fbResponse.body.getReader();
            const decoder = new TextDecoder();
            
            const keysToRemove = ['isSelected', 'time', 'rangeMax', 'rangeMin', 'timerEndTime'];
            const typesToRemove = ['Gauge'];
            let buffer = ""; 

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    let parts = buffer.split('\n\n');
                    buffer = parts.pop(); 

                    for (const part of parts) {
                        if (!part.trim()) continue;

                        const lines = part.split('\n');
                        let eventType = "put";
                        let rawData = "";

                        for (const line of lines) {
                            if (line.startsWith('event:')) {
                                eventType = line.replace('event:', '').trim();
                            } else if (line.startsWith('data:')) {
                                rawData = line.slice(5).trim();
                            }
                        }

                        if (!rawData || rawData === "null" || rawData === "keep-alive") {
                            controller.enqueue(`event: ${eventType}\ndata: ${rawData}\n\n`);
                            continue;
                        }

                        try {
                            const parsed = JSON.parse(rawData);
                            let processed = null;

                            // 1. EXTRACT THE ACTUAL FEEDS
                            // Firebase REST 'put' puts everything inside .data
                            let rawFeeds = (parsed.path === "/" && parsed.data) ? parsed.data : parsed;

                            // 2. FILTER SCENARIO: PATCH (Single Update)
                            if (parsed.path && parsed.path !== "/" && parsed.data !== undefined) {
                                processed = { ...parsed };
                                if (typeof processed.data === 'object') {
                                    keysToRemove.forEach(k => delete processed.data[k]);
                                }
                            } 
                            // 3. FILTER SCENARIO: PUT (The Big Sync)
                            else if (typeof rawFeeds === 'object' && rawFeeds !== null) {
                                processed = {};
                                for (const [key, feed] of Object.entries(rawFeeds)) {
                                    if (feed && typeof feed === 'object' && !typesToRemove.includes(feed.type)) {
                                        const cleaned = { ...feed };
                                        keysToRemove.forEach(k => delete cleaned[k]);
                                        processed[key] = cleaned;
                                    }
                                }
                                // If it was a root put, re-wrap it so the ESP8266 path logic still works
                                if (parsed.path === "/") {
                                    processed = { path: "/", data: processed };
                                }
                            }

                            controller.enqueue(`event: ${eventType}\ndata: ${JSON.stringify(processed || parsed)}\n\n`);
                        } catch (e) {
                            controller.enqueue(`event: ${eventType}\ndata: ${rawData}\n\n`);
                        }
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                reader.releaseLock();
                controller.close();
            }
        }
    });

    return new Response(readableStream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
};



// import { NextResponse } from 'next/server';

// export const runtime = 'edge'; // Moves this to the free/low-cost Edge tier

// // --- 1. Edge-Compatible Auth Helper ---
// async function getAuthenticatedUID(apiKey) {
//     if (!apiKey) return null;
//     try {
//         const fbBase = "https://hommily-default-rtdb.firebaseio.com";
//         // Append the secret to the URL to bypass rules as an admin
//         const authUrl = `${fbBase}/userCred/APItoUID/${apiKey}/fbUID.json?auth=${process.env.FIREBASE_DATABASE_SECRET}`;
        
//         const res = await fetch(authUrl);
        
//         // IMPORTANT: You can only call res.json() ONCE. 
//         // If you log it, store it in a variable first.
//         const data = await res.json();
//         return data;
//     } catch (e) {
//         console.error("Auth Error:", e);
//         return null;
//     }
// }

// // --- 2. The Main SSE Handler ---
// export const GET = async (request) => {
//     const { searchParams } = new URL(request.url);
//     const apiKey = searchParams.get('apiKey');
//     const deviceCode = searchParams.get('deviceCode');
//     const feedName = searchParams.get('feedName');

//     const userUID = await getAuthenticatedUID(apiKey);
    
//     if (!userUID || !deviceCode) {
//         return NextResponse.json({ error: 'Unauthorized or Missing Params' }, { status: 401 });
//     }

//     // Define the path to watch
//     let fbPath = `${userUID}/${deviceCode}/devFeeds`;
//     if (feedName === "display") fbPath = `${userUID}/${deviceCode}/display`;
    
//     const fbStreamUrl = `https://hommily-default-rtdb.firebaseio.com/${fbPath}.json`;

//     // Connect to Firebase REST Stream
//     const fbResponse = await fetch(fbStreamUrl, {
//         headers: { 'Accept': 'text/event-stream' }
//     });

//     const readableStream = new ReadableStream({
//         async start(controller) {
//             const reader = fbResponse.body.getReader();
//             const decoder = new TextDecoder();
            
//             // Config for the Surgical Filter
//             const keysToRemove = ['isSelected', 'time', 'rangeMax', 'rangeMin'];
//             const typesToRemove = ['Gauge'];

//             try {
//                 while (true) {
//                     const { done, value } = await reader.read();
//                     if (done) break;

//                     const chunk = decoder.decode(value);
//                     const lines = chunk.split('\n');

//                     for (let i = 0; i < lines.length; i++) {
//                         const line = lines[i];

//                         if (line.startsWith('event:')) {
//                             controller.enqueue(`${line}\n`);
//                         } 
//                         else if (line.startsWith('data:')) {
//                             const rawData = line.slice(5).trim();
                            
//                             // Handle noise/keep-alives
//                             if (!rawData || rawData === "null" || rawData === "keep-alive") {
//                                 controller.enqueue(`${line}\n\n`);
//                                 continue;
//                             }

//                             try {
//                                 const parsed = JSON.parse(rawData);
//                                 let processed = null;

//                                 // SCENARIO A: It's a PATCH (e.g., Night Lamp toggle)
//                                 if (parsed.path && parsed.data) {
//                                     processed = { ...parsed };
//                                     // Remove heavy keys from the nested 'data' object
//                                     keysToRemove.forEach(k => delete processed.data[k]);
//                                 } 
//                                 // SCENARIO B: It's a PUT (Initial full sync)
//                                 else if (typeof parsed === 'object') {
//                                     processed = {};
//                                     for (const [key, feed] of Object.entries(parsed)) {
//                                         if (feed && !typesToRemove.includes(feed.type)) {
//                                             const cleaned = { ...feed };
//                                             keysToRemove.forEach(k => delete cleaned[k]);
//                                             processed[key] = cleaned;
//                                         }
//                                     }
//                                 }

//                                 controller.enqueue(`data: ${JSON.stringify(processed || parsed)}\n\n`);
//                             } catch (e) {
//                                 // If partial JSON, just pass it through or ignore
//                                 controller.enqueue(`${line}\n\n`);
//                             }
//                         }
//                     }
//                 }
//             } catch (err) {
//                 console.error("Stream Error:", err);
//                 controller.error(err);
//             } finally {
//                 reader.releaseLock();
//                 controller.close();
//             }
//         }
//     });

//     return new Response(readableStream, {
//         headers: {
//             'Content-Type': 'text/event-stream',
//             'Cache-Control': 'no-cache',
//             'Connection': 'keep-alive',
//             'X-Accel-Buffering': 'no',
//         },
//     });
// };