import { NextResponse } from 'next/server';
import admin from '../../firebase/adminConfig.js';

export async function POST(request) {
    try {
        const bodyData = await request.json();
        const { path } = bodyData;
        try {
            await admin.auth().getUser(path);

            const db = admin.database();
            const ref = db.ref(path);
            const snapshot = await ref.once('value');
            const data = snapshot.val();
            
            return NextResponse.json(data, { status: 200 });
        }
        catch {
            return NextResponse.json({ "error": "User Not Found" }, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
