// File: lib/getMarineData.ts

export interface MarineDataPoint {
  time: Date;
  tideHeight: number | null;   // from tide_height
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
  // We'll fetch marine data from open-meteo's marine endpoint:
  const url =
    "https://marine-api.open-meteo.com/v1/marine?" +
    `latitude=${latitude}&longitude=${longitude}` +
    `&hourly=wave_height,wave_direction,wave_period,tide_height` +  // <--- use tide_height
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

  // Hourly arrays (each index corresponds to the same hour)
  const times: string[] = data.hourly?.time || [];
  const tideHeights: number[] = data.hourly?.tide_height || [];      // <--- updated
  const waveHeights: number[] = data.hourly?.wave_height || [];
  const waveDirections: number[] = data.hourly?.wave_direction || [];
  const wavePeriods: number[] = data.hourly?.wave_period || [];

  // Convert those arrays into an array of MarineDataPoint
  const marineData: MarineDataPoint[] = times.map((timeStr, i) => ({
    time: new Date(timeStr),
    tideHeight: tideHeights[i] ?? null,
    waveHeight: waveHeights[i] ?? null,
    waveDirection: waveDirections[i] ?? null,
    wavePeriod: wavePeriods[i] ?? null,
  }));

  // Pull out sunrise/sunset from the daily data if available
  let sunTimes: SunTimes | null = null;
  if (data.daily && data.daily.sunrise && data.daily.sunrise[0]) {
    sunTimes = {
      sunrise: new Date(data.daily.sunrise[0]),
      sunset: new Date(data.daily.sunset[0]),
    };
  }

  return { marineData, sunTimes };
}
