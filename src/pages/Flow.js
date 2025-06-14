import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from '../components/Sidebar';
import CustomNode from '../components/CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

// Default edge options
const defaultEdgeOptions = {
    type: 'smoothstep',
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

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onNodeChange = useCallback((nodeId, newData) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId ? { ...node, data: newData } : node
            )
        );
    }, [setNodes]);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode = {
                id: `${type}-${nodes.length + 1}`,
                type: 'custom',
                position,
                data: {
                    type,
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                    config: {},
                    onChange: onNodeChange,
                    onDelete: (nodeId) => {
                        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
                    },
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, nodes, setNodes, onNodeChange]
    );

    const onSave = useCallback(() => {
        if (reactFlowInstance) {
            const flow = reactFlowInstance.toObject();
            localStorage.setItem('flow', JSON.stringify(flow));
        }
    }, [reactFlowInstance]);

    const onRestore = useCallback(() => {
        const flow = localStorage.getItem('flow');
        if (flow) {
            const { nodes: restoredNodes, edges: restoredEdges } = JSON.parse(flow);
            
            // Add the required functions to each node's data
            const nodesWithFunctions = restoredNodes.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    onChange: onNodeChange,
                    onDelete: (nodeId) => {
                        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
                    },
                },
            }));

            // Add default edge options to restored edges
            const edgesWithOptions = restoredEdges.map(edge => ({
                ...edge,
                ...defaultEdgeOptions,
            }));

            setNodes(nodesWithFunctions);
            setEdges(edgesWithOptions);
        }
    }, [setNodes, setEdges, onNodeChange]);

    const onClear = useCallback(() => {
        setNodes([]);
        setEdges([]);
    }, [setNodes, setEdges]);

    const generateWorkflowJSON = useCallback(() => {
        const workflow = {
            nodes: nodes.map(node => ({
                id: node.id,
                type: node.data.type,
                config: node.data.config
            })),
            edges: edges.map(edge => ({
                source: edge.source,
                target: edge.target
            }))
        };
        console.log('Workflow JSON:', JSON.stringify(workflow, null, 2));
    }, [nodes, edges]);

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
                        onClick={onSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Save
                    </button>
                    <button
                        onClick={onClear}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Clear
                    </button>
                    <button
                        onClick={onRestore}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Restore
                    </button>
                    <button
                        onClick={generateWorkflowJSON}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                        Generate JSON
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Flow;
