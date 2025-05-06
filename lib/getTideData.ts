// File: lib/getTideData.ts

export async function getTideData(lat: number, lon: number) {
  const today = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&hourly=sea_level_height_msl&daily=sunrise,sunset` +
    `&start_date=${today}&end_date=${endDate}&timezone=auto&timeformat=unixtime`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tide data');

  const data = await res.json();
  console.log('Fetched tide data:', data); // Debug logging (trigger redeploy)

  const hourly = data.hourly;
  const daily = data.daily;

  const tideData = hourly.time.map((timestamp: number, i: number) => ({
    time: new Date(timestamp * 1000),
    height: hourly.sea_level_height_msl[i]
  }));

  const sunTimes = {
    sunrise: new Date(daily.sunrise[0] * 1000),
    sunset: new Date(daily.sunset[0] * 1000),
    // Optional: Derive first/last light from twilight models if available later
  };

  return { tideData, sunTimes };
}
