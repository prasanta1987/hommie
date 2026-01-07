import { NextResponse } from 'next/server';
import admin from '../../firebase/adminConfig.js';

export async function POST(request) {
    try {
        const bodyData = await request.json();
        const { uid, path, data } = bodyData;

        if (!uid || !path || !data) {
            return NextResponse.json({ "msg": "Missing uid, path, or data in request body" }, { status: 400 });
        }

        await admin.auth().getUser(uid);

        const db = admin.database();
        const dbRef = db.ref(`${uid}/${path}`);

        await dbRef.update(data);

        return NextResponse.json({ "msg": "Data Added/Updated" }, { status: 200 });

    } catch (error) {
        console.error('Error:', error);
        if (error.code === 'auth/user-not-found') {
            return NextResponse.json({ "msg": "User Not Found" }, { status: 404 });
        }
        return NextResponse.json({ "msg": "An error occurred", "error": error.message }, { status: 500 });
    }
}
