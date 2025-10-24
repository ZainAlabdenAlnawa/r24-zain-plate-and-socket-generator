
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plate, SocketGroup, Direction } from './types';
import { PLATE_MIN_WIDTH, PLATE_MIN_HEIGHT, PLATE_MAX_WIDTH, PLATE_MAX_HEIGHT, PLATE_MIN_SIZE_FOR_SOCKETS } from './constants';
import Canvas from './components/Canvas';
import ConfigPanel from './components/ConfigPanel';
import { getSocketGroupBoundingBox, isPositionValid } from './services/validationService';

const App: React.FC = () => {
  const [plates, setPlates] = useState<Plate[]>([
    { id: crypto.randomUUID(), width: 151.5, height: 36.8 },
  ]);
  const [socketGroups, setSocketGroups] = useState<SocketGroup[]>([]);
  const [socketsEnabled, setSocketsEnabled] = useState(false);
  const [editingSocketGroupId, setEditingSocketGroupId] = useState<string | null>(null);
  const [draggingSocketInfo, setDraggingSocketInfo] = useState<{ id: string, initialX: number, initialY: number } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const handleToggleSockets = (enabled: boolean) => {
    setSocketsEnabled(enabled);
    if (!enabled) {
      setSocketGroups([]);
      setEditingSocketGroupId(null);
    } else {
      const firstEligiblePlate = plates.find(p => p.width >= PLATE_MIN_SIZE_FOR_SOCKETS && p.height >= PLATE_MIN_SIZE_FOR_SOCKETS);
      if (firstEligiblePlate) {
        const newSocketGroup: SocketGroup = {
          id: crypto.randomUUID(),
          plateId: firstEligiblePlate.id,
          count: 1,
          direction: Direction.Horizontal,
          x: 10,
          y: 10,
        };
        if (isPositionValid(newSocketGroup, firstEligiblePlate, [])) {
          setSocketGroups([newSocketGroup]);
          setEditingSocketGroupId(newSocketGroup.id);
        } else {
           showError("Default socket position is invalid on the existing plate. Please adjust plate size or socket position.");
           setSocketGroups([]);
        }
      } else {
        showError("No plate is large enough (min 40x40cm) to add sockets.");
      }
    }
  };

  const updatePlate = (id: string, newWidth: number, newHeight: number) => {
    const clampedWidth = Math.max(PLATE_MIN_WIDTH, Math.min(PLATE_MAX_WIDTH, newWidth));
    const clampedHeight = Math.max(PLATE_MIN_HEIGHT, Math.min(PLATE_MAX_HEIGHT, newHeight));

    setPlates(prevPlates => prevPlates.map(p =>
      p.id === id ? { ...p, width: clampedWidth, height: clampedHeight } : p
    ));
    // Sockets on the resized plate are removed as per requirements
    setSocketGroups(sg => sg.filter(s => s.plateId !== id));
    if(editingSocketGroupId && socketGroups.find(sg => sg.id === editingSocketGroupId)?.plateId === id) {
        setEditingSocketGroupId(null);
    }
  };

  const addPlate = () => {
    setPlates(prevPlates => [
      ...prevPlates,
      { id: crypto.randomUUID(), width: 100, height: 50 },
    ]);
  };

  const deletePlate = (id: string) => {
    if (plates.length > 1) {
      setPlates(prevPlates => prevPlates.filter(p => p.id !== id));
      // Also remove associated sockets
      setSocketGroups(sg => sg.filter(s => s.plateId !== id));
      if(editingSocketGroupId && socketGroups.find(sg => sg.id === editingSocketGroupId)?.plateId === id) {
        setEditingSocketGroupId(null);
      }
    }
  };
  
  const addSocketGroup = () => {
    const eligiblePlates = plates.filter(p => p.width >= PLATE_MIN_SIZE_FOR_SOCKETS && p.height >= PLATE_MIN_SIZE_FOR_SOCKETS);
    if (eligiblePlates.length === 0) {
      showError("No plate is large enough (min 40x40cm) to add sockets.");
      return;
    }
    const targetPlate = eligiblePlates[0];
    const newSocketGroup: SocketGroup = {
      id: crypto.randomUUID(),
      plateId: targetPlate.id,
      count: 1,
      direction: Direction.Horizontal,
      x: 10,
      y: 10,
    };

    const existingGroupsOnPlate = socketGroups.filter(sg => sg.plateId === targetPlate.id);
    if (!isPositionValid(newSocketGroup, targetPlate, existingGroupsOnPlate)) {
        showError("Cannot add new socket group at default position. It might be out of bounds or overlapping.");
        return;
    }

    setSocketGroups(prev => [...prev, newSocketGroup]);
    setEditingSocketGroupId(newSocketGroup.id);
  };
  
  const updateSocketGroup = (id: string, updates: Partial<SocketGroup>) => {
    setSocketGroups(prev => prev.map(sg => {
        if (sg.id !== id) return sg;

        const updatedSg = { ...sg, ...updates };
        const plate = plates.find(p => p.id === updatedSg.plateId);
        if (!plate) return sg; // Should not happen

        const otherSocketGroups = prev.filter(s => s.plateId === updatedSg.plateId && s.id !== id);
        
        if (!isPositionValid(updatedSg, plate, otherSocketGroups)) {
            showError("Invalid position: overlaps or too close to edge/another group.");
            return sg; // Revert change
        }
        
        return updatedSg;
    }));
  };

  const deleteSocketGroup = (id: string) => {
    setSocketGroups(prev => prev.filter(sg => sg.id !== id));
    if (editingSocketGroupId === id) {
      setEditingSocketGroupId(null);
    }
  };
  
  const handleSocketDrag = (id: string, newX: number, newY: number) => {
     setSocketGroups(prevSocketGroups => {
        const sg = prevSocketGroups.find(s => s.id === id);
        const plate = plates.find(p => p.id === sg?.plateId);
        if (!sg || !plate) return prevSocketGroups;

        const otherSocketGroups = prevSocketGroups.filter(s => s.plateId === sg.plateId && s.id !== id);
        const proposedSg = { ...sg, x: newX, y: newY };

        if (isPositionValid(proposedSg, plate, otherSocketGroups)) {
            return prevSocketGroups.map(s => s.id === id ? proposedSg : s);
        }
        return prevSocketGroups; // Position invalid, do not update state
    });
  };

  const handleSocketDragStart = (id: string) => {
    const sg = socketGroups.find(s => s.id === id);
    if (sg) {
        setDraggingSocketInfo({ id, initialX: sg.x, initialY: sg.y });
    }
  };

  const handleSocketDragEnd = (id: string) => {
    const sg = socketGroups.find(s => s.id === id);
    const plate = plates.find(p => p.id === sg?.plateId);
    if (sg && plate && draggingSocketInfo) {
        const otherSocketGroups = socketGroups.filter(s => s.plateId === sg.plateId && s.id !== id);
        if (!isPositionValid(sg, plate, otherSocketGroups)) {
            // Snap back
            setSocketGroups(prev => prev.map(s => s.id === id ? { ...s, x: draggingSocketInfo.initialX, y: draggingSocketInfo.initialY } : s));
            showError("Invalid final position. Reverting.");
        }
    }
    setDraggingSocketInfo(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen font-sans text-gray-800 bg-gray-50">
      {error && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-md shadow-lg z-50">
          {error}
        </div>
      )}
      <div className="flex-grow md:w-2/3 p-4 md:p-8 flex items-center justify-center bg-gray-200 overflow-hidden">
        <Canvas
          plates={plates}
          socketGroups={socketGroups}
          onSocketDrag={handleSocketDrag}
          onSocketDragStart={handleSocketDragStart}
          onSocketDragEnd={handleSocketDragEnd}
          draggingSocketId={draggingSocketInfo?.id ?? null}
        />
      </div>
      <div className="w-full md:w-1/3 md:max-w-md bg-white shadow-lg p-6 overflow-y-auto">
        <ConfigPanel
          plates={plates}
          socketGroups={socketGroups}
          socketsEnabled={socketsEnabled}
          editingSocketGroupId={editingSocketGroupId}
          onToggleSockets={handleToggleSockets}
          onUpdatePlate={updatePlate}
          onAddPlate={addPlate}
          onDeletePlate={deletePlate}
          onAddSocketGroup={addSocketGroup}
          onUpdateSocketGroup={updateSocketGroup}
          onDeleteSocketGroup={deleteSocketGroup}
          onSetEditingSocketGroupId={setEditingSocketGroupId}
        />
      </div>
    </div>
  );
};

export default App;
