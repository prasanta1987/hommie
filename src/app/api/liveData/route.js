import { NextResponse } from 'next/server';
import admin from '../../firebase/adminConfig'; // Correctly importing admin

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const deviceCode = searchParams.get('deviceCode');

    if (!uid || !deviceCode) {
        return NextResponse.json({ error: 'Missing uid or deviceCode' }, { status: 400 });
    }

    const readableStream = new ReadableStream({
        start(controller) {
            const db = admin.database(); // Getting the database instance correctly
            const dbRef = db.ref(`${uid}/${deviceCode}`);

            const listener = dbRef.on('value', (snapshot) => {
                const data = snapshot.val();
                controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            }, (error) => {
                console.error("Firebase listener error:", error);
                controller.error(error);
                controller.close();
            });

            request.signal.addEventListener('abort', () => {
                dbRef.off('value', listener);
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
        },
    });
}
