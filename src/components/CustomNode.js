import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

const nodeConfigs = {
  http: {
    fields: [
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
      { key: 'headers', label: 'Headers', type: 'json' }
    ]
  },
  if: {
    fields: [
      { key: 'condition', label: 'Condition', type: 'text' }
    ]
  },
  delay: {
    fields: [
      { key: 'delayTime', label: 'Delay (ms)', type: 'number' }
    ]
  },
  function: {
    fields: [
      { key: 'expression', label: 'Expression', type: 'text' }
    ]
  },
  set: {
    fields: [
      { key: 'fields', label: 'Fields', type: 'json' }
    ]
  }
};

function CustomNode({ data, id }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const nodeType = data.type || 'http';
  const config = data.config || {};

  const handleLabelChange = (e) => {
    setLabel(e.target.value);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    data.onChange(id, { ...data, label });
  };

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    data.onChange(id, { ...data, config: newConfig });
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={config[field.key] || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full p-1 border rounded bg-white text-gray-800"
          >
            <option value="">Select {field.label}</option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'json':
        return (
          <textarea
            value={JSON.stringify(config[field.key] || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleConfigChange(field.key, parsed);
              } catch (err) {
                // Invalid JSON, keep the raw value
                handleConfigChange(field.key, e.target.value);
              }
            }}
            className="w-full p-1 border rounded bg-white text-gray-800 font-mono text-sm"
            rows={3}
          />
        );
      default:
        return (
          <input
            type={field.type}
            value={config[field.key] || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full p-1 border rounded bg-white text-gray-800"
            placeholder={`Enter ${field.label}`}
          />
        );
    }
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

      <div className="mt-2 space-y-2">
        {nodeConfigs[nodeType]?.fields.map((field) => (
          <div key={field.key} className="text-sm">
            <label className="block text-gray-600">{field.label}:</label>
            {renderField(field)}
          </div>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export default CustomNode; 