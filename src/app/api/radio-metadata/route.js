import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const streamUrl = searchParams.get('url');

  if (!streamUrl) {
    return NextResponse.json({ error: 'Stream URL is required' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(streamUrl, {
      headers: { 'Icy-MetaData': '1' },
      signal: controller.signal
    });

    clearTimeout(timeout);

    const metaintStr = response.headers.get('icy-metaint');
    if (!metaintStr) {
      // No metadata interval found in headers
      await response.body?.cancel();
      return NextResponse.json({ title: null });
    }

    const metaint = parseInt(metaintStr, 10);
    const reader = response.body.getReader();

    let byteCount = 0;
    let metadataLength = 0;
    let metadataBuffer = new Uint8Array(0);
    let readingMetadata = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      let offset = 0;
      while (offset < value.length) {
        if (!readingMetadata) {
          const remainingAudio = metaint - byteCount;
          const chunkRemaining = value.length - offset;
          if (chunkRemaining > remainingAudio) {
            byteCount += remainingAudio;
            offset += remainingAudio;
            readingMetadata = true;
          } else {
            byteCount += chunkRemaining;
            offset += chunkRemaining;
          }
        } else {
          if (metadataLength === 0) {
            const lengthByte = value[offset];
            metadataLength = lengthByte * 16;
            offset += 1;
            if (metadataLength === 0) {
              readingMetadata = false;
              byteCount = 0;
            } else {
              metadataBuffer = new Uint8Array(0);
            }
          } else {
            const chunkRemaining = value.length - offset;
            const remainingMetadata = metadataLength - metadataBuffer.length;
            const readLength = Math.min(chunkRemaining, remainingMetadata);
            
            const newBuffer = new Uint8Array(metadataBuffer.length + readLength);
            newBuffer.set(metadataBuffer);
            newBuffer.set(value.subarray(offset, offset + readLength), metadataBuffer.length);
            metadataBuffer = newBuffer;
            
            offset += readLength;
            
            if (metadataBuffer.length === metadataLength) {
              const metadataString = new TextDecoder('utf-8').decode(metadataBuffer);
              const match = metadataString.match(/StreamTitle='([^']*)'/);
              const title = match ? match[1] : null;
              
              await reader.cancel();
              return NextResponse.json({ title });
            }
          }
        }
      }
    }
    
    return NextResponse.json({ title: null });
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return NextResponse.json({ error: 'Failed to extract metadata' }, { status: 500 });
  }
}
