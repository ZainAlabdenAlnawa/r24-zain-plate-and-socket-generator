
import React from 'react';
import { Plate, SocketGroup } from '../types';
import PlateManager from './PlateManager';
import SocketManager from './SocketManager';
import { PLATE_MIN_SIZE_FOR_SOCKETS } from '../constants';

interface ConfigPanelProps {
  plates: Plate[];
  socketGroups: SocketGroup[];
  socketsEnabled: boolean;
  editingSocketGroupId: string | null;
  onToggleSockets: (enabled: boolean) => void;
  onUpdatePlate: (id: string, width: number, height: number) => void;
  onAddPlate: () => void;
  onDeletePlate: (id: string) => void;
  onAddSocketGroup: () => void;
  onUpdateSocketGroup: (id: string, updates: Partial<SocketGroup>) => void;
  onDeleteSocketGroup: (id: string) => void;
  onSetEditingSocketGroupId: (id: string | null) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = (props) => {
    const { plates, onUpdatePlate, onAddPlate, onDeletePlate, socketsEnabled, onToggleSockets, socketGroups, editingSocketGroupId, onAddSocketGroup, onUpdateSocketGroup, onDeleteSocketGroup, onSetEditingSocketGroupId } = props;
    
    const eligiblePlates = plates.filter(p => p.width >= PLATE_MIN_SIZE_FOR_SOCKETS && p.height >= PLATE_MIN_SIZE_FOR_SOCKETS);

    return (
        <div className="space-y-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800">R<span className="text-green-500">24</span> Technical Task</h1>
            
            <PlateManager 
                plates={plates}
                onUpdatePlate={onUpdatePlate}
                onAddPlate={onAddPlate}
                onDeletePlate={onDeletePlate}
            />

            <div className="border-t border-gray-200 pt-6">
                <SocketManager
                    socketsEnabled={socketsEnabled}
                    onToggleSockets={onToggleSockets}
                    socketGroups={socketGroups}
                    editingSocketGroupId={editingSocketGroupId}
                    onAddSocketGroup={onAddSocketGroup}
                    onUpdateSocketGroup={onUpdateSocketGroup}
                    onDeleteSocketGroup={onDeleteSocketGroup}
                    onSetEditingSocketGroupId={onSetEditingSocketGroupId}
                    plates={plates}
                    eligiblePlatesExist={eligiblePlates.length > 0}
                />
            </div>
        </div>
    );
};

export default ConfigPanel;
