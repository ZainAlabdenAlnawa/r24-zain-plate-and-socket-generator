
import React, { useState, useEffect, useRef } from 'react';
import { Plate, SocketGroup } from '../types';
import PlateComponent from './PlateComponent';

interface CanvasProps {
  plates: Plate[];
  socketGroups: SocketGroup[];
  onSocketDrag: (id: string, x: number, y: number) => void;
  onSocketDragStart: (id: string) => void;
  onSocketDragEnd: (id: string) => void;
  draggingSocketId: string | null;
}

const Canvas: React.FC<CanvasProps> = ({ plates, socketGroups, onSocketDrag, onSocketDragStart, onSocketDragEnd, draggingSocketId }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const calculateScale = () => {
      if (!canvasRef.current || plates.length === 0) return;

      const { clientWidth, clientHeight } = canvasRef.current;
      setCanvasSize({ width: clientWidth, height: clientHeight });

      const totalPlatesWidth = plates.reduce((sum, p) => sum + p.width, 0) + (plates.length - 1) * 10; // Add gap for visualization
      const maxPlateHeight = Math.max(...plates.map(p => p.height));

      if (totalPlatesWidth > 0 && maxPlateHeight > 0) {
        const scaleX = clientWidth / totalPlatesWidth;
        const scaleY = clientHeight / maxPlateHeight;
        setScale(Math.min(scaleX, scaleY) * 0.9); // 90% padding
      }
    };

    calculateScale();
    const resizeObserver = new ResizeObserver(calculateScale);
    if (canvasRef.current) {
        resizeObserver.observe(canvasRef.current);
    }
    
    window.addEventListener('resize', calculateScale);
    return () => {
        window.removeEventListener('resize', calculateScale);
        if (canvasRef.current) {
            resizeObserver.unobserve(canvasRef.current);
        }
    };
  }, [plates]);

  const totalScaledWidth = plates.reduce((sum, p) => sum + p.width * scale, 0) + (plates.length > 1 ? (plates.length - 1) * 10 * scale : 0);

  return (
    <div ref={canvasRef} className="w-full h-full flex items-center justify-center">
      <div className="flex items-center justify-center space-x-4" style={{ transform: `scale(${scale > 0 ? 1 : 0})` }}>
        {plates.map(plate => (
          <PlateComponent
            key={plate.id}
            plate={plate}
            socketGroups={socketGroups.filter(sg => sg.plateId === plate.id)}
            scale={scale}
            onSocketDrag={onSocketDrag}
            onSocketDragStart={onSocketDragStart}
            onSocketDragEnd={onSocketDragEnd}
            isDragging={!!draggingSocketId}
            draggingSocketId={draggingSocketId}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
