import { NextResponse } from 'next/server';
import { db } from '../../firebase/config.js';
import { ref, get } from 'firebase/database';

// import admin from '../../firebase/adminConfig.js';

export async function POST(request) {
    try {
        const bodyData = await request.json();
        const { path } = bodyData;
        
        const databaseRef = ref(db, path);
        const snapshot = await get(databaseRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return NextResponse.json(data, { status: 200 });
        } else {
            return NextResponse.json({ error: "No data available" }, { status: 404 });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}


// await admin.auth().getUser(path);

// const db = admin.database();
// const ref = db.ref(path);
// const snapshot = await ref.once('value');
// const data = snapshot.val();