import { NextResponse } from 'next/server';
import admin from '../../../firebaseConfig/adminConfig';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const deviceCode = searchParams.get('deviceCode');
    const feedName = searchParams.get('feedName');

    if (!apiKey || !deviceCode) {
        return NextResponse.json({ error: 'Missing apiKey or deviceCode' }, { status: 400 });
    }

    const db = admin.database();

    // Verify API key and get user UID
    const userCredRef = db.ref(`userCred`);
    const userCredSnapshot = await userCredRef.once('value');
    const userCredData = userCredSnapshot.val();

    const userCredEntries = Object.entries(userCredData || {});
    const userCredDataEntry = userCredEntries.find(([key, value]) => value.apiKey === apiKey);
    const userUID = userCredDataEntry ? userCredDataEntry[0] : null;

    if (!userUID)
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });


    // Check if device exists under the user
    const deviceRef = db.ref(`${userUID}/${deviceCode}`);
    const deviceSnapshot = await deviceRef.once('value');

    if (!deviceSnapshot.exists()) {
        deviceRef.update(
            {
                deviceCode: deviceCode,
                deviceName: "Unnamed Device"
            });
    }

    let dbRef;

    const readableStream = new ReadableStream({
        start(controller) {
            if (!feedName) {
                dbRef = db.ref(`${userUID}/${deviceCode}`);
            } else if (feedName === "display") {
                dbRef = db.ref(`${userUID}/${deviceCode}/display/`);
            } else if (feedName !== "all" && feedName !== "display") {
                dbRef = db.ref(`${userUID}/${deviceCode}/devFeeds/${feedName}`);
            }
            else {
                dbRef = db.ref(`${userUID}/${deviceCode}/devFeeds/`);
            }

            const listener = dbRef.on('value', (snapshot) => {
                let data = snapshot.val();

                if (feedName !== "all" && feedName !== "display" && data !== null) {
                    let feedData = {};
                    feedData.value = data.value;
                    feedData.GPIO = data?.GPIO;
                    data = feedData;
                }

                if (feedName === "all") {
                    const filtered = Object.fromEntries(
                        Object.entries(data).map(([key, details]) => {

                            const cleaned = {
                                value: details.value,
                                GPIO: details?.GPIO
                            };

                            return [key, cleaned];
                        })
                    );

                    data = filtered;
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
