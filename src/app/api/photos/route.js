import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = parseInt(searchParams.get('skip') || '0');
    const tag = searchParams.get('tags'); // Fetch tag from query params

    const options = {
      limit,
      skip,
      fileType: 'image',
      sort: 'ASC_CREATED'
    };

    // If tag is provided and not "ALL", add it to ImageKit search options
    if (tag && tag !== "ALL") {
      options.tags = tag;
    }

    const files = await imagekit.listFiles(options);

    const transformedData = files.map(file => ({
      id: file.fileId,
      name: file.name,
      tags: file.tags || [],
      fullUrl: file.url,
      // Optimized thumbnail for the grid
      thumbnailUrl: imagekit.url({
        src: file.url,
        transformation: [{ height: 240, width: 320, focus: "auto" }]
      })
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const tagsString = formData.get('tags') || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer for ImageKit upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to ImageKit Media Library
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      tags: tagsString.split(',').map(t => t.trim()).filter(t => t !== "")
    });

    // Return the new file details so the frontend can update immediately
    return NextResponse.json({
      id: uploadResponse.fileId,
      name: uploadResponse.name,
      tags: uploadResponse.tags || [],
      fullUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}