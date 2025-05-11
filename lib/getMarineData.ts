// File: lib/getMarineData.ts

export interface MarineDataPoint {
  time: Date;
  tideHeight: number | null;   // from tide_height
  waveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

export async function getMarineData(latitude: number, longitude: number) {
  const url =
  "https://marine-api.open-meteo.com/v1/marine?" +
  `latitude=${latitude}&longitude=${longitude}` +
  `&hourly=wave_height,wave_direction,wave_period,sea_level_height_msl` +  // ✅ use this
  `&daily=sunrise,sunset` +
  `&forecast_days=2` +
  `&timezone=auto`;


  console.log("[getMarineData] Fetching from:", url);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch marine data. Status: ${res.status}`);
  }

  const data = await res.json();
  console.log("Fetched marine data:", data);

  const times: string[] = data.hourly?.time || [];
  const tideHeights: number[] = data.hourly?.sea_level_height_msl || [];
  const waveHeights: number[] = data.hourly?.wave_height || [];
  const waveDirections: number[] = data.hourly?.wave_direction || [];
  const wavePeriods: number[] = data.hourly?.wave_period || [];

  const marineData: MarineDataPoint[] = times.map((timeStr, i) => ({
    time: new Date(timeStr),
    tideHeight: tideHeights[i] ?? null,
    waveHeight: waveHeights[i] ?? null,
    waveDirection: waveDirections[i] ?? null,
    wavePeriod: wavePeriods[i] ?? null,
  }));

  let sunTimes: SunTimes | null = null;
  if (data.daily && data.daily.sunrise && data.daily.sunrise[0]) {
    sunTimes = {
      sunrise: new Date(data.daily.sunrise[0]),
      sunset: new Date(data.daily.sunset[0]),
    };
  }

  return { marineData, sunTimes };
}