import { NextResponse } from 'next/server';
import { db } from '../../firebase/config'
import { ref, get } from "firebase/database"

export async function POST(request) {
    try {
        const bodyData = await request.json();
        const { path } = bodyData;

        const dbRef = ref(db, path);
        const snapshot = await get(dbRef);
        const data = snapshot.val();

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
