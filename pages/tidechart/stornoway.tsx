// File: pages/tidechart/stornoway.tsx
// WHATSUPP!!!

import { useEffect, useState } from 'react';
import { getMarineData, MarineDataPoint, SunTimes } from '../../lib/getMarineData';
import TideChart from '../../components/TideChart'; // The same TideChart from your example

const STORNOWAY_LAT = 58.215;
const STORNOWAY_LON = -6.387;

export default function StornowayTideChartPage() {
  const [tideData, setTideData] = useState<{ hour: number; height: number }[]>([]);
  const [waveData, setWaveData] = useState<MarineDataPoint[]>([]); // For debugging or wave chart
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch combined tide + wave data
        const { marineData, sunTimes } = await getMarineData(STORNOWAY_LAT, STORNOWAY_LON);

        // Debug: log wave data to see if everything arrives
        console.log('Marine data (raw):', marineData);

        // Filter for "today" only, and convert to chart-friendly data
        const now = new Date();
        const todayStr = now.toDateString();
        const todaysData = marineData.filter(d => d.time.toDateString() === todayStr);

        // Create the { hour, height } structure for the tide chart
        const condensedTide = todaysData.map(d => ({
          hour: d.time.getHours() + d.time.getMinutes() / 60,
          height: d.tideHeight || 0,
        }));

        setTideData(condensedTide);
        setWaveData(todaysData); // could be used in a separate WaveChart
        if (sunTimes) {
          setSunTimes(sunTimes);
        }
      } catch (error) {
        console.error('Failed to fetch marine data:', error);
      }
    }

    fetchData();
  }, []);

  // If you specifically need to wait for both tideData and sunTimes
  if (!tideData.length || !sunTimes) {
    return <p>Loading tide data...</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Stornoway Tide & Wave Data
      </h1>

      {/* Renders the existing TideChart from your example. 
          If you'd like wave data in the same chart, 
          you can modify the <TideChart> component to accept wave data props. */}
      <TideChart
        tideData={tideData}
        sunrise={sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60}
        sunset={sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60}
        twilightStart={sunTimes.sunrise.getHours() - 1}
        twilightEnd={sunTimes.sunset.getHours() + 1}
      />

      {/* If you want to debug wave data, you could render or console.log it here */}
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
        {JSON.stringify(waveData, null, 2)}
      </pre>
    </div>
  );
}
