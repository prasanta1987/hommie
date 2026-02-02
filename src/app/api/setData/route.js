import { NextResponse } from 'next/server';
import admin from '../../../firebaseConfig/adminConfig';

export async function POST(request) {
    try {

        const bodyData = await request.json();
        const { apiKey, deviceCode, purpose } = bodyData;

        if (!apiKey || !purpose || !deviceCode) {
            let errors = {};

            if (!deviceCode) errors.deviceCode = "Device Code is required";
            if (!apiKey) errors.apiKey = "API Key is required";
            if (!purpose) errors.purpose = "Purpose is required";

            return NextResponse.json({ "error": errors }, { status: 400 });
        }

        const db = admin.database();

        // Verify API key and get user UID
        const userUID = (await db.ref(`userCred/APItoUID/${apiKey}`).once('value')).val();

        if (!userUID) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }


        const deviceRef = db.ref(`${userUID}/${deviceCode}`);
        await deviceRef.update(
            { 
                deviceCode: deviceCode,
             }
        );



        if (purpose == "FEED") {

            const { feedName, data } = bodyData;
            let errors = {};

            if (!feedName) errors.feedName = "Feed Name is required";
            if (!data) errors.data = "Data is required";

            if (!feedName || !data) {
                return NextResponse.json({ "error": errors }, { status: 400 });
            }

            data.time = new Date().getTime();

            const dbRef = db.ref(`${userUID}/${deviceCode}/devFeeds/${feedName}`);
            await dbRef.update(data);

            const snapshot = await dbRef.once('value');
            const snapShotData = snapshot.val();

            return NextResponse.json(snapShotData, { status: 200 });

        } else if (purpose == "delDeviceProfile") {

            const dbRef = db.ref(`${userUID}/${deviceCode}`);
            await dbRef.remove();

            return NextResponse.json({ "msg": "Device Deleted" }, { status: 200 });

        } else {
            return NextResponse.json({ "error": "Wrong Purpose Detected" }, { status: 400 });
        }



    } catch (error) {
        console.error('Error:', error);
        if (error.code === 'auth/user-not-found') {
            return NextResponse.json({ "msg": "User Not Found" }, { status: 404 });
        }
        return NextResponse.json({ "msg": "An error occurred", "error": error.message }, { status: 500 });
    }
}
