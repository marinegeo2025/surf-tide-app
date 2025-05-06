// File: pages/tidechart/stornoway.tsx
import { useEffect, useState } from 'react';
import TideChart from '../../components/TideChart';
import { getTideData } from '../../lib/getTideData';

const STORNOWAY_LAT = 58.215;
const STORNOWAY_LON = -6.387;

export default function StornowayTideChartPage() {
  const [tideData, setTideData] = useState<{ hour: number; height: number }[]>([]);
  const [sunTimes, setSunTimes] = useState<{ sunrise: Date; sunset: Date } | null>(null);
  const [highLowPoints, setHighLowPoints] = useState<{ hour: number; height: number; type: 'high' | 'low' }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTideData(STORNOWAY_LAT, STORNOWAY_LON);
        const now = new Date();
        const today = now.toDateString();

        const condensed = data.tideData
          .filter(d => d.time.toDateString() === today)
          .map(d => ({
            hour: d.time.getHours() + d.time.getMinutes() / 60,
            height: d.height
          }));

        setTideData(condensed);
        setSunTimes(data.sunTimes);

        // Find highs and lows
        const highLow: { hour: number; height: number; type: 'high' | 'low' }[] = [];
        for (let i = 1; i < condensed.length - 1; i++) {
          const prev = condensed[i - 1];
          const curr = condensed[i];
          const next = condensed[i + 1];
          if (curr.height > prev.height && curr.height > next.height) {
            highLow.push({ ...curr, type: 'high' });
          } else if (curr.height < prev.height && curr.height < next.height) {
            highLow.push({ ...curr, type: 'low' });
          }
        }

        setHighLowPoints(highLow);
      } catch (error) {
        console.error('Failed to fetch tide data:', error);
      }
    }

    fetchData();
  }, []);

  if (!tideData.length || !sunTimes) return <p>Loading tide data...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Stornoway Tide Chart</h1>
      <TideChart
        tideData={tideData}
        sunrise={sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60}
        sunset={sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60}
        twilightStart={sunTimes.sunrise.getHours() - 1}
        twilightEnd={sunTimes.sunset.getHours() + 1}
        highLowPoints={highLowPoints}
      />
    </div>
  );
}
