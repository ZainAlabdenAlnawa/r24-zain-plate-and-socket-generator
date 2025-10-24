
import React from 'react';
import { Plate, SocketGroup } from '../types';
import SocketGroupForm from './SocketGroupForm';

interface SocketManagerProps {
    socketsEnabled: boolean;
    onToggleSockets: (enabled: boolean) => void;
    socketGroups: SocketGroup[];
    editingSocketGroupId: string | null;
    onAddSocketGroup: () => void;
    onUpdateSocketGroup: (id: string, updates: Partial<SocketGroup>) => void;
    onDeleteSocketGroup: (id: string) => void;
    onSetEditingSocketGroupId: (id: string | null) => void;
    plates: Plate[];
    eligiblePlatesExist: boolean;
}

const SocketManager: React.FC<SocketManagerProps> = (props) => {
    const { socketsEnabled, onToggleSockets, socketGroups, editingSocketGroupId, onAddSocketGroup, onUpdateSocketGroup, onDeleteSocketGroup, onSetEditingSocketGroupId, plates, eligiblePlatesExist } = props;

    const editingSocketGroup = socketGroups.find(sg => sg.id === editingSocketGroupId);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-700">Steckdosen. Auswählen.</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={socketsEnabled} onChange={(e) => onToggleSockets(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
            </div>

            {socketsEnabled && (
                <div className="space-y-4">
                    {!editingSocketGroup && (
                        <div className="space-y-2">
                            {socketGroups.map((sg, index) => (
                                <div key={sg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Steckdose Gruppe {index + 1}</span>
                                    <div className="space-x-2">
                                        <button onClick={() => onSetEditingSocketGroupId(sg.id)} className="text-blue-500 hover:text-blue-700">Bearbeiten</button>
                                        <button onClick={() => onDeleteSocketGroup(sg.id)} className="text-red-500 hover:text-red-700">Löschen</button>
                                    </div>
                                </div>
                            ))}
                             <button
                                onClick={onAddSocketGroup}
                                disabled={!eligiblePlatesExist}
                                className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Steckdose hinzufügen
                            </button>
                            {!eligiblePlatesExist && <p className="text-xs text-red-500 text-center mt-1">Keine Platte ist groß genug (min 40x40cm).</p>}
                        </div>
                    )}
                    
                    {editingSocketGroup && (
                         <SocketGroupForm
                            socketGroup={editingSocketGroup}
                            onUpdate={onUpdateSocketGroup}
                            onConfirm={() => onSetEditingSocketGroupId(null)}
                            plates={plates}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default SocketManager;
