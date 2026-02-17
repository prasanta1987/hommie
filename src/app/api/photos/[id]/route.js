import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// DELETE Image
export async function DELETE(req, { params }) {
  try {
    await imagekit.deleteFile(params.id);
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

// UPDATE Tags
export async function PATCH(req, { params }) {
  try {
    const { tags } = await req.json();
    await imagekit.updateFileDetails(params.id, { tags });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
