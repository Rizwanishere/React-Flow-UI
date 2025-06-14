import React from 'react';

const nodeTypes = [
  { type: 'http', label: 'HTTP Request', icon: '🌐' },
  { type: 'if', label: 'IF', icon: '⚖️' },
  { type: 'delay', label: 'Delay', icon: '⏱️' },
  { type: 'function', label: 'Function', icon: '⚡' },
  { type: 'set', label: 'Set', icon: '📝' },
];

function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Nodes</h2>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="flex items-center p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50"
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
          >
            <span className="mr-2">{node.icon}</span>
            <span>{node.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar; 