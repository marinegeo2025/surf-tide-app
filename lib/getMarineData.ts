// File: lib/getMarineData.ts

export interface MarineDataPoint {
  time: Date;
  tideHeight: number | null;  // sea_level_height_msl
  waveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
}

// If you also want sunrise/sunset or other daily data, define a type here:
export interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

export async function getMarineData(latitude: number, longitude: number) {
  // Example: fetch for "today" and "tomorrow"
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // In "hourly", we include tide + wave variables
  // Add or remove variables as needed:
  const url = `https://marine-api.open-meteo.com/v1/marine?` +
  `latitude=${latitude}&longitude=${longitude}` +
  `&hourly=sea_level_height_msl,wave_height,wave_direction,wave_period` +
  `&daily=sunrise,sunset` +
  `&start_date=${today}&end_date=${tomorrow}` +  // ✅ KEEP THESE
  `&timezone=auto`;                               // ✅ REMOVE forecast_days


  console.log('[getMarineData] Fetching from:', url);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch marine data. Status: ${res.status}`);
  }

  const data = await res.json();
  console.log('Fetched marine data:', data);

  // "hourly" contains arrays for time and each variable
  // If the array for a variable is missing, fill with null
  const times: string[] = data.hourly?.time || [];
  const tideHeights: number[] = data.hourly?.sea_level_height_msl || [];
  const waveHeights: number[] = data.hourly?.wave_height || [];
  const waveDirections: number[] = data.hourly?.wave_direction || [];
  const wavePeriods: number[] = data.hourly?.wave_period || [];

  // Convert arrays into an array of objects
  const marineData: MarineDataPoint[] = times.map((timeStr, i) => ({
    time: new Date(timeStr),
    tideHeight: tideHeights[i] ?? null,
    waveHeight: waveHeights[i] ?? null,
    waveDirection: waveDirections[i] ?? null,
    wavePeriod: wavePeriods[i] ?? null,
  }));

  // Sunrise/sunset if available (daily)
  let sunTimes: SunTimes | null = null;
  if (data.daily && data.daily.sunrise && data.daily.sunrise[0]) {
    sunTimes = {
      sunrise: new Date(data.daily.sunrise[0]),
      sunset: new Date(data.daily.sunset[0]),
    };
  }

  return { marineData, sunTimes };
}
