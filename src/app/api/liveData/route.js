import { NextResponse } from 'next/server';
import admin from '../../../firebaseConfig/adminConfig';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const deviceCode = searchParams.get('deviceCode');
    const feedName = searchParams.get('feedName');

    if (!apiKey || !deviceCode || !feedName) {
        return NextResponse.json({ error: 'Missing apiKey or deviceCode or feedName' }, { status: 400 });
    }

    const db = admin.database();

    // Verify API key and get user UID
    const apiKeyRef = db.ref(`userCred/APItoUID/${apiKey}`);
    const apiKeySnapshot = await apiKeyRef.once('value');
    const userUID = apiKeySnapshot.val();

    if (!userUID) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }


    const deviceRef = db.ref(`${userUID}/${deviceCode}`);
    deviceRef.update(
        {
            deviceCode: deviceCode,
            lastSeen: new Date().getTime()
        }
    );

    let dbRef;

    const readableStream = new ReadableStream({
        start(controller) {
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


                if (feedName === "all") {

                    data = Object.fromEntries(
                        Object.entries(data).map(([key, value]) => {
                            const filteredValue = Object.fromEntries(
                                Object.entries(value).filter(([innerKey]) => !keysToRemove.includes(innerKey))
                            );
                            return [key, filteredValue];
                        })
                    );
                } else {
                    data && typeof data === 'object' && keysToRemove.forEach(key => delete data[key]);
                }

                controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);



            }, (error) => {
                console.error("Firebase listener error:", error);
                controller.error(error);
                controller.close();
            });

            const intervalId = setInterval(() => {
                controller.enqueue(': heartbeat\n\n');
            }, 10000);

            request.signal.addEventListener('abort', () => {
                dbRef.off('value', listener);
                clearInterval(intervalId);
                controller.close();
                console.log("Client disconnected, stream closed.");
            });
        },
        cancel(reason) {
            console.log("Stream canceled:", reason);
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
}
