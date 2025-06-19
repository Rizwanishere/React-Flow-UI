import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

// Node types configuration
const nodeConfigs = {
  gateway: {
    fields: [{ key: "actions", label: "Actions", type: "actions" }],
  },
  persistenceShard: {
    fields: [
      { key: "gpType", label: "GP Type", type: "text" },
      { key: "shardName", label: "Shard Name", type: "text" },
      { key: "shardRole", label: "Shard Role", type: "text" },
      { key: "numberOfShards", label: "Number of Shards", type: "number" },
      { key: "shardKey", label: "Shard Key", type: "text" },
      { key: "copyKeys", label: "Copy Keys", type: "text" },
      { key: "enrichKeys", label: "Enrich Keys", type: "text" },
      { key: "filterKeys", label: "Filter Keys", type: "text" },
      { key: "actions", label: "Actions", type: "actions" },
    ],
  },
  kafka: {
    fields: [
      { key: "kafkaTopics", label: "Kafka Topics", type: "text" },
      { key: "actions", label: "Actions", type: "actions" },
    ],
  },
  genericActor: {
    fields: [
      { key: "gpType", label: "GP Type", type: "text" },
      { key: "totalInstances", label: "Total Instances", type: "number" },
      { key: "routeesPaths", label: "Routees Paths", type: "text" },
      {
        key: "allowLocalRoutees",
        label: "Allow Local Routees",
        type: "select",
        options: ["true", "false"],
      },
      { key: "userRoles", label: "User Roles", type: "text" },
      { key: "actions", label: "Actions", type: "actions" },
    ],
  },
  rtShard: {
    fields: [
      { key: "gpType", label: "GP Type", type: "text" },
      { key: "shardName", label: "Shard Name", type: "text" },
      { key: "shardRole", label: "Shard Role", type: "text" },
      { key: "numberOfShards", label: "Number of Shards", type: "number" },
      { key: "actions", label: "Actions", type: "actions" },
    ],
  },
  actor: {
    fields: [
      {
        key: "reply",
        label: "Reply",
        type: "select",
        options: ["true", "false"],
      },
      { key: "actions", label: "Actions", type: "actions" },
    ],
  },
};

// Sidebar component
function Sidebar() {
  const nodeTypes = [
    { type: "gateway", label: "Gateway", icon: "🚪" },
    { type: "persistenceShard", label: "Persistence Shard", icon: "💾" },
    { type: "kafka", label: "Kafka", icon: "📨" },
    { type: "genericActor", label: "Generic Actor", icon: "⚡" },
    { type: "rtShard", label: "Realtime Shard", icon: "⚡" },
    { type: "actor", label: "Actor", icon: "🎭" },
  ];

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Node Types</h2>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="flex items-center p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50"
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
          >
            <span className="mr-2">{node.icon}</span>
            <span className="text-sm">{node.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

// Custom Node component
function CustomNode({ data, id }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const nodeType = data.nType || data.type || "gateway";
  const metadata = data.metadata || {};
  const actions = data.actions || [];

  const handleLabelChange = (e) => {
    setLabel(e.target.value);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    data.onChange(id, { ...data, label, name: label });
  };

  const handleMetadataChange = (key, value) => {
    const newMetadata = { ...metadata, [key]: value };
    data.onChange(id, { ...data, metadata: newMetadata });
  };

  const handleActionsChange = (newActions) => {
    data.onChange(id, { ...data, actions: newActions });
  };

  const addAction = () => {
    const newActions = [...actions, { label: "", formula: "" }];
    handleActionsChange(newActions);
  };

  const updateAction = (index, field, value) => {
    const newActions = [...actions];
    newActions[index][field] = value;
    handleActionsChange(newActions);
  };

  const removeAction = (index) => {
    const newActions = actions.filter((_, i) => i !== index);
    handleActionsChange(newActions);
  };

  const renderField = (field) => {
    if (field.key === "actions") {
      return (
        <div className="space-y-2">
          {actions.map((action, index) => (
            <div key={index} className="border p-2 rounded bg-gray-50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Action {index + 1}</span>
                <button
                  onClick={() => removeAction(index)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Label"
                value={action.label || ""}
                onChange={(e) => updateAction(index, "label", e.target.value)}
                className="w-full p-1 mb-1 border rounded text-xs"
              />
              <input
                type="text"
                placeholder="Formula"
                value={action.formula || ""}
                onChange={(e) => updateAction(index, "formula", e.target.value)}
                className="w-full p-1 border rounded text-xs"
              />
            </div>
          ))}
          <button
            onClick={addAction}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Add Action
          </button>
        </div>
      );
    }

    switch (field.type) {
      case "select":
        return (
          <select
            value={metadata[field.key] || ""}
            onChange={(e) => handleMetadataChange(field.key, e.target.value)}
            className="w-full p-1 border rounded bg-white text-gray-800 text-xs"
          >
            <option value="">Select {field.label}</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            value={metadata[field.key] || ""}
            onChange={(e) => handleMetadataChange(field.key, e.target.value)}
            className="w-full p-1 border rounded bg-white text-gray-800 text-xs"
            placeholder={`Enter ${field.label}`}
          />
        );
      default:
        return (
          <input
            type="text"
            value={metadata[field.key] || ""}
            onChange={(e) => handleMetadataChange(field.key, e.target.value)}
            className="w-full p-1 border rounded bg-white text-gray-800 text-xs"
            placeholder={`Enter ${field.label}`}
          />
        );
    }
  };

  const getNodeColor = (type) => {
    const colors = {
      gateway: "bg-blue-100 border-blue-300",
      persistenceShard: "bg-green-100 border-green-300",
      kafka: "bg-purple-100 border-purple-300",
      genericActor: "bg-yellow-100 border-yellow-300",
      rtShard: "bg-red-100 border-red-300",
      actor: "bg-gray-100 border-gray-300",
    };
    return colors[type] || "bg-white border-gray-200";
  };

  return (
    <div
      className={`px-3 py-2 shadow-md rounded-md border-2 min-w-[200px] ${getNodeColor(
        nodeType
      )}`}
    >
      {/* Add handles for edge connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        style={{ background: "#555" }}
      />
      <div className="flex items-center mb-2">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            className="flex-1 p-1 border rounded text-sm"
            autoFocus
          />
        ) : (
          <div
            className="flex-1 cursor-pointer font-medium text-sm"
            onDoubleClick={() => setIsEditing(true)}
          >
            {label}
          </div>
        )}
        <button
          className="ml-2 text-red-500 hover:text-red-700 text-lg"
          onClick={() => data.onDelete(id)}
        >
          ×
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {nodeConfigs[nodeType]?.fields.map((field) => (
          <div key={field.key} className="text-xs">
            <label className="block text-gray-600 font-medium">
              {field.label}:
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
  style: { strokeWidth: 2 },
};

function Flow() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonInput, setShowJsonInput] = useState(false);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeChange = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: newData } : node
        )
      );
    },
    [setNodes]
  );

  // Delete node and its connected edges
  const deleteNodeAndEdges = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `n${nodes.length + 1}`,
        type: "custom",
        position,
        data: {
          nType: type,
          type: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          name: type.charAt(0).toUpperCase() + type.slice(1),
          className: "actionNode",
          nodeType: 1,
          actions: [],
          metadata: {},
          onChange: onNodeChange,
          onDelete: deleteNodeAndEdges,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes, onNodeChange, deleteNodeAndEdges]
  );

  const loadJsonWorkflow = useCallback(() => {
    try {
      const workflowData = JSON.parse(jsonInput);
      const { flowChart } = workflowData;

      // Convert nodes
      const loadedNodes = flowChart.nodes.map((node) => ({
        id: node.nodeId,
        type: "custom",
        position: { x: node.positionX, y: node.positionY },
        data: {
          nType: node.nType,
          type: node.nType,
          label: node.name,
          name: node.name,
          className: node.className,
          nodeType: node.nodeType,
          actions: node.actions || [],
          metadata: node.metadata || {},
          onChange: onNodeChange,
          onDelete: deleteNodeAndEdges,
        },
      }));

      // Convert edges
      const loadedEdges = flowChart.connections.map((conn) => ({
        id: conn.connectionId,
        source: conn.pageSourceId,
        target: conn.pageTargetId,
        label: conn.label,
        sourceHandle: "source", // ensure edges connect to the correct handle
        targetHandle: "target",
        ...defaultEdgeOptions,
      }));

      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setShowJsonInput(false);
      setJsonInput("");
    } catch (error) {
      alert("Invalid JSON format: " + error.message);
    }
  }, [jsonInput, setNodes, setEdges, onNodeChange, deleteNodeAndEdges]);

  const generateWorkflowJSON = useCallback(() => {
    // Find start node (typically the first one or one with no incoming edges)
    const startNode =
      nodes.find((node) => !edges.some((edge) => edge.target === node.id)) ||
      nodes[0];

    const workflow = {
      startNodeId: startNode?.id || "n1",
      variables: {
        nodes: nodes.map((node) => ({
          className: node.data.className || "actionNode",
          label: node.data.label,
          type: "1",
          nType: node.data.nType,
        })),
      },
      flowChart: {
        nodes: nodes.map((node) => ({
          nodeId: node.id,
          name: node.data.name || node.data.label,
          nType: node.data.nType,
          className: node.data.className || "actionNode",
          nodeType: node.data.nodeType || 1,
          positionX: Math.round(node.position.x),
          positionY: Math.round(node.position.y),
          actions: node.data.actions || [],
          metadata: node.data.metadata || {},
        })),
        connections: edges.map((edge) => ({
          connectionId: edge.id,
          pageSourceId: edge.source,
          pageTargetId: edge.target,
          label: edge.label || "",
        })),
      },
    };

    const jsonString = JSON.stringify(workflow, null, 2);
    console.log("Generated Workflow JSON:", jsonString);

    // Copy to clipboard
    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        alert("Workflow JSON copied to clipboard!");
      })
      .catch(() => {
        // Fallback - show in alert
        alert("Workflow JSON:\n\n" + jsonString);
      });
  }, [nodes, edges]);

  const onClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        <div className="absolute bottom-4 right-4 space-x-2">
          <button
            onClick={() => setShowJsonInput(!showJsonInput)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Load JSON
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear
          </button>
          <button
            onClick={generateWorkflowJSON}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Generate JSON
          </button>
        </div>

        {showJsonInput && (
          <div className="absolute top-4 left-4 right-4 bg-white border rounded-lg shadow-lg p-4 z-10">
            <h3 className="text-lg font-semibold mb-2">Load Workflow JSON</h3>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-40 p-2 border rounded font-mono text-sm"
              placeholder="Paste your workflow JSON here..."
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowJsonInput(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={loadJsonWorkflow}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load Workflow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Flow;
