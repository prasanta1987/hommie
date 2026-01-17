import { NextResponse } from 'next/server';

import { db } from '../../firebase/config.js';
import { ref, get, set, update } from 'firebase/database';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const dataRef = ref(db, path);
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      return NextResponse.json(snapshot.val(), { status: 200 });
    } else {
      return NextResponse.json({ error: 'No data available' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data. Check security rules.', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    let errors = {};

    const body = await request.json();
    const { purpose, path, data, feedName, deviceCode } = body;

    if (!path) errors.path = "Path is Required";
    if (!data) errors.data = "Data is required";
    if (!purpose) errors.data = "Piurpose is required";
    if (!feedName) errors.data = "Feed Name is required";
    if (!deviceCode) errors.data = "Device Code is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ "error": errors }, { status: 400 });
    }

    if (purpose == "SET") {

      const dbRef = ref(db, path);
      await set(dbRef, data);
      return NextResponse.json({ "msg": "Data Set" }, { status: 200 });

    } else if (purpose == "UPDATE") {

      const dbRef = ref(db, `${path}/${deviceCode}/${feedName}`);
      await update(dbRef, data);
      return NextResponse.json({ "msg": "Data Set" }, { status: 200 });

    } else {
      return NextResponse.json({ "purpose": "Wrong Purpose" }, { status: 401 });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Failed to authenticate', details: error.message }, { status: 401 });
  }
}