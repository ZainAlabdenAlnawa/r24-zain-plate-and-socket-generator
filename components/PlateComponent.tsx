
import React from 'react';
import { Plate, SocketGroup } from '../types';
import SocketGroupComponent from './SocketGroupComponent';

interface PlateComponentProps {
  plate: Plate;
  socketGroups: SocketGroup[];
  scale: number;
  onSocketDrag: (id: string, x: number, y: number) => void;
  onSocketDragStart: (id: string) => void;
  onSocketDragEnd: (id: string) => void;
  isDragging: boolean;
  draggingSocketId: string | null;
}

const PlateComponent: React.FC<PlateComponentProps> = ({ plate, socketGroups, scale, onSocketDrag, onSocketDragStart, onSocketDragEnd, isDragging, draggingSocketId }) => {
  const plateStyle = {
    width: `${plate.width * scale}px`,
    height: `${plate.height * scale}px`,
  };

  return (
    <div className="bg-white border-2 border-gray-400 shadow-md relative" style={plateStyle}>
      {socketGroups.map(sg => (
        <SocketGroupComponent
          key={sg.id}
          socketGroup={sg}
          plate={plate}
          scale={scale}
          onDrag={onSocketDrag}
          onDragStart={onSocketDragStart}
          onDragEnd={onSocketDragEnd}
          showGuidelines={draggingSocketId === sg.id}
        />
      ))}
    </div>
  );
};

export default PlateComponent;
