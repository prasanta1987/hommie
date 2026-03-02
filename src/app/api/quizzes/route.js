import { NextResponse } from 'next/server';
import admin from '@/firebaseConfig/adminConfig';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category')?.toLowerCase();

        const db = admin.database();

        // 1. Determine the reference path
        // If category is 'all' or null, we fetch the whole 'quizzes' node
        const path = (category && category !== 'all') ? `quizzes/${category}` : `quizzes`;
        const ref = db.ref(path);
        const snapshot = await ref.once('value');

        if (!snapshot.exists()) {
            return NextResponse.json({ error: "No data found" }, { status: 404 });
        }

        const data = snapshot.val();
        let items = [];

        if (category && category !== 'all') {
            items = Object.values(data);
        } else {
            items = Object.keys(data).flatMap(cat => Object.values(data[cat]));
        }

        if (items.length === 0) {
            return NextResponse.json({ error: "No matching questions" }, { status: 404 });
        }

        const randomItem = items[Math.floor(Math.random() * items.length)];
        return NextResponse.json(randomItem);

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
