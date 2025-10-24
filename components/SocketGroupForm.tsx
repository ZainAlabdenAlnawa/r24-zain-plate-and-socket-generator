
import React from 'react';
import { SocketGroup, Plate, Direction } from '../types';
import { PLATE_MIN_SIZE_FOR_SOCKETS, SOCKET_COUNT_MIN, SOCKET_COUNT_MAX } from '../constants';

interface SocketGroupFormProps {
    socketGroup: SocketGroup;
    onUpdate: (id: string, updates: Partial<SocketGroup>) => void;
    onConfirm: () => void;
    plates: Plate[];
}

const SocketGroupForm: React.FC<SocketGroupFormProps> = ({ socketGroup, onUpdate, onConfirm, plates }) => {
    const eligiblePlates = plates.filter(p => p.width >= PLATE_MIN_SIZE_FOR_SOCKETS && p.height >= PLATE_MIN_SIZE_FOR_SOCKETS);
    
    return (
        <div className="p-4 bg-gray-100 rounded-lg space-y-6">
            <div>
                <label className="font-semibold text-gray-600 block mb-2">Wähle die Rückwand für die Steckdose</label>
                <select 
                    value={socketGroup.plateId} 
                    onChange={e => onUpdate(socketGroup.id, { plateId: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    {eligiblePlates.map((p, index) => (
                        <option key={p.id} value={p.id}>Rückwand {plates.findIndex(pl => pl.id === p.id) + 1} ({p.width}x{p.height}cm)</option>
                    ))}
                </select>
                {eligiblePlates.length === 0 && <p className="text-xs text-red-500 mt-1">Keine passende Rückwand verfügbar.</p>}
            </div>

            <div>
                <label className="font-semibold text-gray-600 block mb-2">Bestimme Anzahl und Ausrichtung der Steckdosen</label>
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Anzahl</p>
                        <div className="flex rounded-md border border-gray-300">
                            {[...Array(SOCKET_COUNT_MAX).keys()].map(i => i + 1).map(num => (
                                <button
                                    key={num}
                                    onClick={() => onUpdate(socketGroup.id, { count: num })}
                                    className={`flex-1 py-2 px-4 text-sm ${socketGroup.count === num ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-50'}`}
                                >{num}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Steckdosen-Ausrichtung</p>
                        <div className="flex rounded-md border border-gray-300">
                           <button onClick={() => onUpdate(socketGroup.id, { direction: Direction.Horizontal })} className={`flex-1 py-2 px-2.5 text-sm ${socketGroup.direction === Direction.Horizontal ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-50'}`}>Horizontal</button>
                           <button onClick={() => onUpdate(socketGroup.id, { direction: Direction.Vertical })} className={`flex-1 py-2 px-2.5 text-sm ${socketGroup.direction === Direction.Vertical ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-50'}`}>Vertikal</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                 <label className="font-semibold text-gray-600 block mb-2">Positioniere die Steckdose</label>
                 <div className="flex items-end space-x-2">
                     <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Abstand von Links (cm)</p>
                        <input
                            type="number"
                            step="0.1"
                            value={socketGroup.x}
                            onChange={e => onUpdate(socketGroup.id, { x: parseFloat(e.target.value) || 0 })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                     </div>
                     <span>x</span>
                     <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Abstand von unten (cm)</p>
                        <input
                            type="number"
                            step="0.1"
                            value={socketGroup.y}
                            onChange={e => onUpdate(socketGroup.id, { y: parseFloat(e.target.value) || 0 })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                     </div>
                 </div>
            </div>

            <button
                onClick={onConfirm}
                className="w-full py-2 px-4 border border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
            >
                Steckdose bestätigen
            </button>
        </div>
    );
};

export default SocketGroupForm;
