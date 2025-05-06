import TideChart from '../../components/TideChart';

const mockTideData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  height: 2 + Math.sin((i / 24) * 2 * Math.PI) * 1.5
}));

const sunrise = 5.5;
const sunset = 21.25;
const twilightStart = 4.5;
const twilightEnd = 22.25;

export default function StornowayTideChartPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Stornoway Tide Chart
      </h1>
      <TideChart
        tideData={mockTideData}
        sunrise={sunrise}
        sunset={sunset}
        twilightStart={twilightStart}
        twilightEnd={twilightEnd}
      />
    </div>
  );
}
