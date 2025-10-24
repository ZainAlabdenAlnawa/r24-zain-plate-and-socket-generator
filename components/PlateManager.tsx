
import React from 'react';
import { Plate } from '../types';
import { PLATE_MIN_WIDTH, PLATE_MAX_WIDTH, PLATE_MIN_HEIGHT, PLATE_MAX_HEIGHT } from '../constants';

interface PlateManagerProps {
    plates: Plate[];
    onUpdatePlate: (id: string, width: number, height: number) => void;
    onAddPlate: () => void;
    onDeletePlate: (id: string) => void;
}

const PlateManager: React.FC<PlateManagerProps> = ({ plates, onUpdatePlate, onAddPlate, onDeletePlate }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Maße. Eingeben.</h2>
            <div className="space-y-3">
                {plates.map((plate, index) => (
                    <div key={plate.id} className="bg-gray-100 p-3 rounded-lg flex items-center space-x-2">
                        <span className="font-bold text-gray-600 mr-2">{index + 1}</span>
                        <div className="flex-grow">
                            <label className="text-xs text-gray-500">Breite ({PLATE_MIN_WIDTH}-{PLATE_MAX_WIDTH} cm)</label>
                            <input
                                type="number"
                                value={plate.width}
                                onChange={(e) => onUpdatePlate(plate.id, parseFloat(e.target.value) || 0, plate.height)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                min={PLATE_MIN_WIDTH}
                                max={PLATE_MAX_WIDTH}
                            />
                        </div>
                        <span className="pt-5">x</span>
                        <div className="flex-grow">
                             <label className="text-xs text-gray-500">Höhe ({PLATE_MIN_HEIGHT}-{PLATE_MAX_HEIGHT} cm)</label>
                            <input
                                type="number"
                                value={plate.height}
                                onChange={(e) => onUpdatePlate(plate.id, plate.width, parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                min={PLATE_MIN_HEIGHT}
                                max={PLATE_MAX_HEIGHT}
                            />
                        </div>
                        <button
                            onClick={() => onDeletePlate(plate.id)}
                            disabled={plates.length <= 1}
                            className="p-2 text-red-500 disabled:text-gray-300 hover:text-red-700 disabled:cursor-not-allowed transition-colors pt-6"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={onAddPlate}
                className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
                Rückwand hinzufügen +
            </button>
        </div>
    );
};

export default PlateManager;
