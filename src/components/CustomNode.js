import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

function CustomNode({ data, id }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleLabelChange = (e) => {
    setLabel(e.target.value);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    data.label = label;
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            className="w-full p-1 border rounded"
            autoFocus
          />
        ) : (
          <div
            className="flex-1 cursor-pointer"
            onDoubleClick={() => setIsEditing(true)}
          >
            {label}
          </div>
        )}
        <button
          className="ml-2 text-red-500 hover:text-red-700"
          onClick={() => data.onDelete(id)}
        >
          ×
        </button>
      </div>

      {data.inputs && (
        <div className="mt-2">
          {Object.entries(data.inputs).map(([key, value]) => (
            <div key={key} className="text-sm">
              <label className="block text-gray-600">{key}:</label>
              <input
                type="text"
                value={value}
                onChange={(e) => data.onInputChange(id, key, e.target.value)}
                className="w-full p-1 border rounded"
              />
            </div>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export default CustomNode; 