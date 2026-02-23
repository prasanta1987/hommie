import { withAuth } from '@/middleWare/withAuth';
import admin from '@/firebaseConfig/adminConfig';

// Wrap the entire GET function
export const GET = withAuth(async (request) => {
    const { searchParams } = new URL(request.url);
    const deviceCode = searchParams.get('deviceCode');
    const feedName = searchParams.get('feedName');

    // Get the UID passed from our middleware
    const userUID = request.userUID;

    if (!deviceCode || !feedName) {
        return Response.json({ error: 'Missing deviceCode or feedName' }, { status: 400 });
    }

    const db = admin.database();

    // Perform your update
    await db.ref(`${userUID}/${deviceCode}`).update({ deviceCode });

    const readableStream = new ReadableStream({
        start(controller) {
            let dbRef;
            if (feedName === "display") {
                dbRef = db.ref(`${userUID}/${deviceCode}/display/`);
            } else if (feedName !== "all") {
                dbRef = db.ref(`${userUID}/${deviceCode}/devFeeds/${feedName}`);
            } else {
                dbRef = db.ref(`${userUID}/${deviceCode}/devFeeds/`);
            }

            const listener = dbRef.on('value', (snapshot) => {
                let data = snapshot.val();
                const keysToRemove = ['isSelected', "time"];

                if (data && typeof data === 'object') {
                    if (feedName === "all") {
                        data = Object.fromEntries(
                            Object.entries(data).map(([key, value]) => [
                                key,
                                Object.fromEntries(Object.entries(value).filter(([k]) => !keysToRemove.includes(k)))
                            ])
                        );
                    } else {
                        keysToRemove.forEach(key => delete data[key]);
                    }
                }

                controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            });

            const intervalId = setInterval(() => controller.enqueue(': heartbeat\n\n'), 15000);

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
