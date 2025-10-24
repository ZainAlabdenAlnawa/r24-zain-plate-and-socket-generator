
import React, { useRef, useCallback, useEffect } from 'react';
import { SocketGroup, Plate, Direction } from '../types';
import { SOCKET_WIDTH, SOCKET_HEIGHT, SOCKET_GAP } from '../constants';

interface SocketGroupComponentProps {
  socketGroup: SocketGroup;
  plate: Plate;
  scale: number;
  onDrag: (id: string, x: number, y: number) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  showGuidelines: boolean;
}

const SocketGroupComponent: React.FC<SocketGroupComponentProps> = ({ socketGroup, plate, scale, onDrag, onDragStart, onDragEnd, showGuidelines }) => {
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialSocketX: 0,
    initialSocketY: 0,
  });

  const getGroupDimensions = useCallback(() => {
    const width = socketGroup.direction === Direction.Horizontal
      ? socketGroup.count * SOCKET_WIDTH + (socketGroup.count - 1) * SOCKET_GAP
      : SOCKET_WIDTH;
    const height = socketGroup.direction === Direction.Vertical
      ? socketGroup.count * SOCKET_HEIGHT + (socketGroup.count - 1) * SOCKET_GAP
      : SOCKET_HEIGHT;
    return { width, height };
  }, [socketGroup.count, socketGroup.direction]);

  const { width: groupWidthCm } = getGroupDimensions();
    
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStart(socketGroup.id);
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialSocketX: socketGroup.x,
      initialSocketY: socketGroup.y,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    onDragStart(socketGroup.id);
    const touch = e.touches[0];
    dragRef.current = {
      isDragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      initialSocketX: socketGroup.x,
      initialSocketY: socketGroup.y,
    };
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
  const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

  const handleMove = (clientX: number, clientY: number) => {
      if (!dragRef.current.isDragging) return;
      const dx = (clientX - dragRef.current.startX) / scale;
      const dy = (dragRef.current.startY - clientY) / scale; // Y is inverted in screen coords
      onDrag(socketGroup.id, dragRef.current.initialSocketX + dx, dragRef.current.initialSocketY + dy);
  };
  
  const handleMouseUp = () => endDrag();
  const handleTouchEnd = () => endDrag();

  const endDrag = () => {
    if (dragRef.current.isDragging) {
        onDragEnd(socketGroup.id);
        dragRef.current.isDragging = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    }
  };
  
  useEffect(() => {
      return () => { // Cleanup function
          if (dragRef.current.isDragging) {
              endDrag();
          }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sockets = Array.from({ length: socketGroup.count }, (_, i) => {
    const style: React.CSSProperties = {
      width: `${SOCKET_WIDTH * scale}px`,
      height: `${SOCKET_HEIGHT * scale}px`,
      position: 'absolute',
    };
    if (socketGroup.direction === Direction.Horizontal) {
      style.left = `${i * (SOCKET_WIDTH + SOCKET_GAP) * scale}px`;
    } else {
      style.top = `${i * (SOCKET_HEIGHT + SOCKET_GAP) * scale}px`;
    }
    return (
      <div key={i} className="bg-gray-200 border border-gray-400 rounded-sm flex items-center justify-center" style={style}>
        <div className="w-2/3 h-2/3 bg-gray-100 rounded-sm border border-gray-300 flex flex-col justify-around items-center p-0.5">
           <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
           <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    );
  });
  
  const { width, height } = getGroupDimensions();

  const groupStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${socketGroup.x * scale}px`,
    bottom: `${socketGroup.y * scale}px`,
    width: `${width * scale}px`,
    height: `${height * scale}px`,
    cursor: 'move',
    zIndex: showGuidelines ? 10 : 1,
  };
  
  const anchorX = socketGroup.x * scale;
  const anchorY = socketGroup.y * scale;

  return (
    <>
      <div onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={groupStyle}>
        {sockets}
      </div>
      {showGuidelines && (
        <>
          {/* Vertical Guideline */}
          <div className="absolute bottom-0 bg-red-500 opacity-70" style={{ left: anchorX, width: '1px', height: anchorY, zIndex: 20 }} />
          <div className="absolute bg-white px-1 text-red-500 text-xs rounded" style={{ left: anchorX + 4, bottom: anchorY / 2 - 8, zIndex: 20 }}>
            {socketGroup.y.toFixed(1)} cm
          </div>

          {/* Horizontal Guideline */}
          <div className="absolute left-0 bg-red-500 opacity-70" style={{ bottom: anchorY, height: '1px', width: anchorX, zIndex: 20 }} />
          <div className="absolute bg-white px-1 text-red-500 text-xs rounded" style={{ bottom: anchorY + 4, left: anchorX / 2 - 15, zIndex: 20 }}>
            {socketGroup.x.toFixed(1)} cm
          </div>
        </>
      )}
    </>
  );
};

export default SocketGroupComponent;
