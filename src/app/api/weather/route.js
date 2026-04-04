import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 });
  }

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Weather API key is not configured' }, { status: 500 });
  }

  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    let filteredData = {};

    filteredData.name = data.location.name;
    filteredData.temp = data.current.temp_c;
    filteredData.feelsLike = data.current.feelslike_c;
    filteredData.condition = data.current.condition.text;
    filteredData.pressureMB = data.current.pressure_mb;
    filteredData.humidity = data.current.humidity;
    filteredData.uv = data.current.uv;


    return NextResponse.json(filteredData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
