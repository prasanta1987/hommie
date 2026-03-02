import { NextResponse } from 'next/server';
import { searchMCIds, spotDataUrl } from '@/app/api/market/helperFunctions'

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const spotName = searchParams.get("spotName");
    const filter = searchParams.get("filter");

    if (!spotName) return NextResponse.json({ error: "Script Name Required" }, { status: 500 });

    try {
        const scriptId = await searchMCIds(spotName);
        const data = await spotDataUrl(scriptId);


        if (!filter) return NextResponse.json(data, { status: 200 });

        return NextResponse.json(data[filter], { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }

}
