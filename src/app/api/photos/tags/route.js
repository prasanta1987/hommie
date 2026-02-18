import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function GET() {
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
