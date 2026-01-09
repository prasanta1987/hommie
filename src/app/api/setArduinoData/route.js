import { NextResponse } from 'next/server';
import admin from '../../firebase/adminConfig.js';

export async function POST(request) {
    try {
        const bodyData = await request.json();
        const { uid, path = null, data, purpose } = bodyData;

        if (!uid || !data || !purpose) {
            return NextResponse.json({ "error": "Missing Desired Inputs Perameters" }, { status: 400 });
        }

        await admin.auth().getUser(uid);
        const db = admin.database();

        if (purpose == "FEED") {

            if (!path) {
                return NextResponse.json({ "error": "Missing Desired Inputs Perameters" }, { status: 400 });
            } else {
                data.time = new Date().getTime();

                const dbRef = db.ref(`${uid}/${path}`);
                await dbRef.update(data);
                
                return NextResponse.json({ "msg": "Data Updated" }, { status: 200 });
            }

        } else if (purpose == "deviceAuth") {

            const dbRef = db.ref("nextDevice");
            const { name, deviceCode } = data

            let newDevice = {
                [deviceCode]: {
                    uid: uid,
                    deviceName: name
                }
            }

            await dbRef.update(newDevice);
            return NextResponse.json({ "msg": "Data Added/Updated" }, { status: 200 });

        } else if (purpose == "setDeviceProfile") {
            const { deviceCode } = data
            const dbRef = db.ref(`${uid}/${deviceCode}`);
            await dbRef.update(data);
            return NextResponse.json({ "msg": "Data Updated" }, { status: 200 });

        } else {
            return NextResponse.json({ "error": "Wrong Purpose Detected" }, { status: 200 });
        }


        // return NextResponse.json({ "error": "Wrong Parameters" }, { status: 200 });

    } catch (error) {
        console.error('Error:', error);
        if (error.code === 'auth/user-not-found') {
            return NextResponse.json({ "msg": "User Not Found" }, { status: 404 });
        }
        return NextResponse.json({ "msg": "An error occurred", "error": error.message }, { status: 500 });
    }
}
