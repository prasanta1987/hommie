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

        // 2. Flatten the data based on the structure
        if (category && category !== 'all') {
            // Data is already filtered by category: { q_123: {...}, q_456: {...} }
            items = Object.values(data);
        } else {
            // Data contains all categories: { gk: { q_123: {...} }, math: { q_456: {...} } }
            // We use flatMap to merge all nested quiz objects into one array
            items = Object.keys(data).flatMap(cat => Object.values(data[cat]));
        }

        if (items.length === 0) {
            return NextResponse.json({ error: "No matching questions" }, { status: 404 });
        }

        // 3. Return a random item
        const randomItem = items[Math.floor(Math.random() * items.length)];
        return NextResponse.json(randomItem);

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
