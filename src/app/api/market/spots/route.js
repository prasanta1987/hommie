import { NextResponse } from 'next/server';
import { searchMCIds, spotDataUrl } from '@/app/api/market/helperFunctions'

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const spotName = searchParams.get("spotName");
    const filter = searchParams.get("filter");

    if (!spotName) return NextResponse.json({ error: "Spot Name Required" }, { status: 200 });

    const filterSet = filter ? new Set([...filter.split(",").map(s => s.trim()), "name"]) : null;
    const spotNames = spotName.toUpperCase().split(",").map(s => s.trim());


    try {
        const results = await Promise.allSettled(
            spotNames.map(async (name) => {
                const id = await searchMCIds(name);
                if (!id) return null;

                const rawData = await spotDataUrl(id);

                if (filterSet) {
                    const filtered = {};
                    for (const key in rawData) {
                        if (filterSet.has(key)) filtered[key] = rawData[key];
                    }
                    return filtered;
                }
                return rawData;
            })
        );

        const finalData = results
            .filter(r => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value);

        return NextResponse.json(finalData, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }


}
