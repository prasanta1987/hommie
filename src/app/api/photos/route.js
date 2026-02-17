import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function GET(request) {
  try {
    // 1. Get pagination params from the URL (e.g., /api/images?limit=10&skip=0)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    // 2. Fetch the specific batch using the ImageKit Node.js SDK
    const files = await imagekit.listFiles({
      limit: limit,
      skip: skip,
      fileType: 'image',
      sort: 'ASC_CREATED' // Keeps order consistent for pagination
    });

    // 3. Generate optimized URLs
    const transformedData = files.map(file => {
      const thumbnailUrl = imagekit.url({
        src: file.url,
        transformation: [{
          height: "300",
          width: "300",
          focus: "auto"
        }]
      });

      return {
        id: file.fileId,
        tags: file.tags || [],
        name: file.name,
        fullUrl: file.url,
        thumbnailUrl: thumbnailUrl
      };
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
