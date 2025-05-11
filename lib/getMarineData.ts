// File: lib/getMarineData.ts

import { fetchWeatherApi } from "openmeteo";

export interface MarineDataPoint {
  time: Date;
  tideHeight: number | null;
  waveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

export async function getMarineData(latitude: number, longitude: number) {
  const params = {
    latitude,
    longitude,
    hourly: [
      "sea_level_height_msl",
      "wave_height",
      "wave_direction",
      "wave_period"
    ],
    daily: ["sunrise", "sunset"],
    timezone: "auto",
    forecast_days: 2
  };

  const url = "https://marine-api.open-meteo.com/v1/marine";
  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const hourly = response.hourly();
  const daily = response.daily();

  const hours = (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval();
  const times = [...Array(hours)].map((_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000));

  const tideHeights = hourly.variables(0)?.valuesArray() || [];
  const waveHeights = hourly.variables(1)?.valuesArray() || [];
  const waveDirections = hourly.variables(2)?.valuesArray() || [];
  const wavePeriods = hourly.variables(3)?.valuesArray() || [];

  const marineData: MarineDataPoint[] = times.map((time, i) => ({
    time,
    tideHeight: tideHeights[i] ?? null,
    waveHeight: waveHeights[i] ?? null,
    waveDirection: waveDirections[i] ?? null,
    wavePeriod: wavePeriods[i] ?? null,
  }));

  let sunTimes: SunTimes | null = null;
  if (daily && daily.variables(0) && daily.variables(1)) {
    const sunrise = daily.variables(0);
    const sunset = daily.variables(1);
    sunTimes = {
      sunrise: new Date((Number(sunrise.valuesInt64(0)) + utcOffsetSeconds) * 1000),
      sunset: new Date((Number(sunset.valuesInt64(0)) + utcOffsetSeconds) * 1000),
    };
  }

  return { marineData, sunTimes };
}
