import { NextResponse } from 'next/server';
import admin from '@/firebaseConfig/adminConfig';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        const db = admin.database();
        const ref = db.ref(`quizzes`);
        const snapshot = await ref.once('value');

        if (snapshot.exists()) {
            let items = Object.values(snapshot.val());

            if (category && category !== 'all') {
                items = items.filter(item => item.type === category);
            }

            if (items.length === 0) return NextResponse.json({ error: "No matching questions" }, { status: 404 });

            const randomItem = items[Math.floor(Math.random() * items.length)];
            return NextResponse.json(randomItem);
        }
        return NextResponse.json({ error: "Empty database" }, { status: 404 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
