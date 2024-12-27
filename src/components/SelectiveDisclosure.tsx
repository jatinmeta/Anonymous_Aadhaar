import { useState } from 'react';

interface SelectiveDisclosureProps {
  proof: any;
  onUpdate: (selectedFields: string[]) => void;
}

export function SelectiveDisclosure({ proof, onUpdate }: SelectiveDisclosureProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  
  const availableFields = [
    { id: 'age', label: 'Age Verification' },
    { id: 'state', label: 'State/Region' },
    { id: 'gender', label: 'Gender' },
  ];

  const handleToggle = (fieldId: string) => {
    setSelectedFields(prev => {
      const newSelection = prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId];
      
      onUpdate(newSelection);
      return newSelection;
    });
  };

  return (
    <div className="w-full p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-4">Choose Information to Share</h3>
      <div className="space-y-2">
        {availableFields.map(field => (
          <label
            key={field.id}
            className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded"
          >
            <input
              type="checkbox"
              checked={selectedFields.includes(field.id)}
              onChange={() => handleToggle(field.id)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>{field.label}</span>
          </label>
        ))}
      </div>
      
      {selectedFields.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
          You are sharing: {selectedFields.map(f => 
            availableFields.find(af => af.id === f)?.label
          ).join(', ')}
        </div>
      )}
    </div>
  );
}
