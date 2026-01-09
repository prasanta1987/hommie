import { NextResponse } from 'next/server';
import admin from '../../firebase/adminConfig.js';

export async function POST(request) {
    try {
        const bodyData = await request.json();
        const { uid, path = null, purpose, deviceCode = null } = bodyData;

        if (!uid || !purpose) {
            return NextResponse.json({ "error": "Missing Desired Inputs Perameters" }, { status: 400 });
        }

        try {
            await admin.auth().getUser(uid);
            const db = admin.database();

            if (purpose == "getAuth") {
                if (deviceCode) {
                    const ref = db.ref(`nextDevice/${deviceCode}`);
                    const snapshot = await ref.once('value');
                    const data = snapshot.val();
                    if(data == null){
                        return NextResponse.json(false, { status: 200 });
                        // return NextResponse.json({"error":"Wrong Device Code Supplied"}, { status: 200 });
                    } else {
                        return NextResponse.json(data, { status: 200 });
                    }
                } else {
                    return NextResponse.json({"error":"Device Code Missing"}, { status: 200 });
                }


            } else if (purpose == "getDevices") {
                const ref = db.ref(uid);
                const snapshot = await ref.once('value');
                const data = snapshot.val();
                return NextResponse.json(data, { status: 200 });
            } else {
                return NextResponse.json({ "error": "Wrong Purpose Detected" }, { status: 400 });
            }

        }
        catch {
            return NextResponse.json({ "error": "User Not Found" }, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
