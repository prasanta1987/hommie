import { withAuth } from '@/middleWare/withAuth';
import admin from '@/firebaseConfig/adminConfig';

// Wrap the entire GET function
export const GET = withAuth(async (request) => {
    const { searchParams } = new URL(request.url);
    const deviceCode = searchParams.get('deviceCode');
    const feedName = searchParams.get('feedName');

    // Get the UID passed from our middleware
    const userUID = request.userUID;

    if (!deviceCode) {
        return Response.json({ error: 'Missing deviceCode or feedName' }, { status: 400 });
    }

    const db = admin.database();

    // Perform your update
    await db.ref(`${userUID}/${deviceCode}`).update({ deviceCode });

    const readableStream = new ReadableStream({
        start(controller) {
            let dbRef;
            const keysToRemove = ['isSelected', "time"];
            const typesToRemove = ['Gauge'];

            if (feedName === "display") {
                dbRef = db.ref(`${userUID}/${deviceCode}/display/`);
            } else if (!feedName || feedName == 'all') {
                dbRef = db.ref(`${userUID}/${deviceCode}/devFeeds/`);
            } else {
                dbRef = db.ref(`${userUID}/${deviceCode}/devFeeds/${feedName}`);
            }

            const listener = dbRef.on('value', (snapshot) => {
                let data = snapshot.val();
                if (!data) return controller.enqueue(`data: null\n\n`);

                let processedData;

                // 2. Structural handling based on the scope of data loaded
                if (!feedName || feedName === "all") {
                    processedData = {};
                    Object.entries(data).forEach(([key, feed]) => {
                        // Filter by type and clean keys for the bulk object
                        if (feed && feed.type && !typesToRemove.includes(feed.type)) {
                            const cleanedFeed = { ...feed };
                            keysToRemove.forEach(k => delete cleanedFeed[k]);
                            processedData[key] = cleanedFeed;
                        }
                    });
                } else {
                    // Single object handling (for "display" or a specific feedName)
                    processedData = typeof data === 'object' ? { ...data } : data;
                    if (typeof processedData === 'object' && processedData !== null) {
                        keysToRemove.forEach(k => delete processedData[k]);
                    }
                }

                controller.enqueue(`data: ${JSON.stringify(processedData)}\n\n`);
            }, (error) => {
                console.error("Firebase listener error:", error);
                controller.error(error);
            });

            const intervalId = setInterval(() => {
                controller.enqueue(': heartbeat\n\n');
            }, 10000);

            request.signal.addEventListener('abort', () => {
                dbRef.off('value', listener);
                clearInterval(intervalId);
                controller.close();
            });
        }
    });


    return new Response(readableStream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // Critical for Vercel/Nginx
        },
    });
});
