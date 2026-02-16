import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Initialize the SDK
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function GET() {
  try {
    // 1. Fetch the list of files
    const files = await imagekit.listFiles({
      limit: 20,
      fileType: 'image'
    });

    // 2. Generate optimized URLs using the SDK's url helper
    const transformedData = files.map(file => {
      // Create a 300px thumbnail with smart focus
      const thumbnailUrl = imagekit.url({
        src: file.url,
        transformation: [{
          height: 300,
          width: 300,
          focus: "auto" // Focuses on the most important part of the image
        }]
      });

      return {
        id: file.fileId,
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
