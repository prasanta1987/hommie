import { NextResponse } from 'next/server';
import admin from '../../../firebaseConfig/adminConfig';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const deviceCode = searchParams.get('deviceCode');

    if (!apiKey || !deviceCode) {
        return NextResponse.json({ error: 'Missing apiKey or deviceCode' }, { status: 400 });
    }

    const db = admin.database();
    const userCredRef = db.ref(`userCred/${apiKey}`);
    const userCredSnapshot = await userCredRef.once('value');
    const userCredData = userCredSnapshot.val();

    if (!userCredData || !userCredData.uid) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const uid = userCredData.uid;

    const readableStream = new ReadableStream({
        start(controller) {
            const dbRef = db.ref(`${uid}/${deviceCode}`);

            const listener = dbRef.on('value', (snapshot) => {
                const data = snapshot.val();
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
