import { NextResponse } from 'next/server';
import admin from '@/firebaseConfig/adminConfig';

export function withAuth(handler) {
    return async (request, context) => {
        const { searchParams } = new URL(request.url);
        const apiKey = searchParams.get('apiKey');

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key Required' }, { status: 401 });
        }

        try {
            const db = admin.database();
            const apiKeySnapshot = await db.ref(`userCred/APItoUID/${apiKey}/fbUID`).once('value');
            const userUID = apiKeySnapshot.val();

            if (!userUID) {
                return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
            }

            // Pass the userUID to the actual handler via the request object or a new argument
            request.userUID = userUID;
            return handler(request, context);
            
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    };
}
