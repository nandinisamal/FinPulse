import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
  PointElement,
  LineElement,
  LineController,
  Filler,
  ChartConfiguration,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
  PointElement,
  LineElement,
  LineController,
  Filler
);

interface ChartWrapperProps {
  config: ChartConfiguration;
  height?: number;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({ config, height = 260 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new ChartJS(ctx, config);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [config]);

  return (
    <div style={{ position: 'relative', height: `${height}px`, width: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
