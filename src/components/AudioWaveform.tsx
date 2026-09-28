import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  color?: 'emerald' | 'amber' | 'cyan' | 'purple';
  height?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  analyser,
  isActive,
  color = 'emerald',
  height = 48,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 32);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      if (analyser && isActive) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Idle ambient gentle wave
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = isActive ? 12 : 2;
        }
      }

      const barCount = 28;
      const barWidth = 4;
      const spacing = 3;
      const totalWidth = barCount * (barWidth + spacing);
      const startX = (width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        // Sample frequencies smoothly
        const sampleIndex = Math.floor((i / barCount) * (dataArray.length / 2));
        const val = dataArray[sampleIndex] || 0;
        const normalized = val / 255;

        // Dynamic height
        const barHeight = Math.max(3, normalized * (h - 8));
        const x = startX + i * (barWidth + spacing);
        const y = (h - barHeight) / 2;

        let stroke = '#10b981'; // emerald
        if (color === 'cyan') stroke = '#06b6d4';
        if (color === 'amber') stroke = '#f59e0b';
        if (color === 'purple') stroke = '#a855f7';

        ctx.fillStyle = stroke;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isActive, color]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={height}
      className="w-full max-w-[240px] h-[48px] block"
    />
  );
};
