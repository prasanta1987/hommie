import { NextResponse } from 'next/server';
import admin from '../../firebase/adminConfig.js';

export async function POST(request) {
    try {

        const bodyData = await request.json();
        const { uid, purpose, data } = bodyData;

        if (!uid || !purpose || !data) {
            return NextResponse.json({ "error": "Missing Key Parameters" }, { status: 400 });
        }

        await admin.auth().getUser(uid);

        const db = admin.database();

        if (purpose == "FEED") {

            const { deviceCode, feedName, data } = bodyData;
            let errors = {};

            if (!deviceCode) errors.deviceCode = "Device Code is required";
            if (!feedName) errors.feedName = "Feed Name is required";
            if (!data) errors.data = "Data is required";


            if (Object.keys(errors).length > 0) {
                return NextResponse.json({ "error": errors }, { status: 400 });
            }

            data.time = new Date().getTime();

            const dbRef = db.ref(`${uid}/${deviceCode}/devFeeds/${feedName}`);
            await dbRef.update(data);

            const ref = db.ref(`${uid}/${deviceCode}`);
            const snapshot = await ref.once('value');
            const snapShotData = snapshot.val();

            return NextResponse.json(snapShotData, { status: 200 });

        } else if (purpose == "deviceAuth") {

            const { deviceName, deviceCode } = data

            let errors = {};

            if (!deviceCode) errors.deviceCode = "Device Code is required";

            if (Object.keys(errors).length > 0) {
                return NextResponse.json({ "error": errors }, { status: 400 });
            }

            const dbRef = db.ref("nextDevice");

            let newDevice = {
                [deviceCode]: {
                    uid: uid,
                    deviceName: deviceName || null,
                    deviceCode: deviceCode
                }
            }

            await dbRef.update(newDevice);
            return NextResponse.json({ "msg": "Addition Request Sent" }, { status: 200 });

        } else if (purpose == "setDeviceProfile") {

            const { deviceName, deviceCode } = data

            let errors = {};

            if (!deviceCode) errors.deviceCode = "Device Code is required";

            if (Object.keys(errors).length > 0) {
                return NextResponse.json({ "error": errors }, { status: 400 });
            }

            const dbRef = db.ref(`${uid}/${deviceCode}`);
            await dbRef.update({
                deviceName: deviceName || null,
                deviceCode: deviceCode
            });

            const oldRef = db.ref(`nextDevice/${deviceCode}`);
            await oldRef.remove();

            return NextResponse.json({ "msg": "Data Updated" }, { status: 200 });

        } else if (purpose == "delDeviceProfile") {

            const { deviceCode } = data;

            let errors = {};

            if (!deviceCode) errors.deviceCode = "Device Code is required";

            if (Object.keys(errors).length > 0) {
                return NextResponse.json({ "error": errors }, { status: 400 });
            }

            const dbRef = db.ref(uid);
            await dbRef.remove();

            return NextResponse.json({ "msg": "Device Deleted" }, { status: 200 });

        } else {
            return NextResponse.json({ "error": "Wrong Purpose Detected" }, { status: 400 });
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
