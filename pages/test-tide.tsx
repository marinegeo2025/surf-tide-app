import { useEffect, useState } from 'react';
import { getTideData } from '../lib/getTideData';

export default function TestTide() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getTideData(58.215, -6.387); // Stornoway
        console.log('Tide Result:', result);
        setData(result);
      } catch (err: any) {
        console.error('Tide fetch error:', err);
        setError(err.message || 'Unknown error');
      }
    }

    fetchData();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading tide data...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Tide Data (debug)</h1>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
