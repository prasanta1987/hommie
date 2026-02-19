import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import admin from '@/firebaseConfig/adminConfig';

export async function GET(request) {

  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('apiKey');

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 400 });
  }

  const db = admin.database();

  // Verify API key and get user UID
  const apiKeyRef = db.ref(`userCred/APItoUID/${apiKey}/`);
  const apiKeySnapshot = (await apiKeyRef.once('value')).val();

  if (!apiKeySnapshot) {
    return NextResponse.json({ error: "Invalid API Key" }, { status: 400 });
  }

  const imagekit = new ImageKit({
    publicKey: apiKeySnapshot.imgPubKey,
    privateKey: apiKeySnapshot.imgPrivKey,
    urlEndpoint: apiKeySnapshot.imgEndPoint
  });

  try {
    // Fetch a large batch of files (max 1000) to ensure you get all tags
    const files = await imagekit.listFiles({
      limit: 1000,
      fileType: 'image'
    });

    // Use a Set to extract only unique tags from the array of files
    const allTags = files.flatMap(file => file.tags || []);
    const uniqueTags = [...new Set(allTags)];

    return NextResponse.json(uniqueTags);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
