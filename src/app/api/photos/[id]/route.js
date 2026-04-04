import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import admin from '@/firebaseConfig/adminConfig';

export async function PATCH(request, { params }) {

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
    const { id } = params;
    const { tags } = await request.json(); // This is the array from frontend

    // ImageKit replaces old tags with this new array automatically
    const result = await imagekit.updateFileDetails(id, {
      tags: tags
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {

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
    await imagekit.deleteFile(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
