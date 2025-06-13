import React, { useState, useCallback, useRef } from "react";

// React Flow Components - using direct imports
const ReactFlow = ({
  children,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  nodeTypes,
  fitView,
  className,
  zoom,
  onZoomChange,
  isLocked,
  onNodeDrag,
}) => {
  const containerRef = useRef(null);
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedNode: null,
    offset: { x: 0, y: 0 },
  });

  const handleMouseDown = (e, nodeId) => {
    if (isLocked) return;

    const rect = containerRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === nodeId);

    setDragState({
      isDragging: true,
      draggedNode: nodeId,
      offset: {
        x: (e.clientX - rect.left) / zoom - node.position.x,
        y: (e.clientY - rect.top) / zoom - node.position.y,
      },
    });
  };

  const handleMouseMove = (e) => {
    if (!dragState.isDragging || isLocked) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = {
      x: (e.clientX - rect.left) / zoom - dragState.offset.x,
      y: (e.clientY - rect.top) / zoom - dragState.offset.y,
    };

    onNodeDrag(dragState.draggedNode, newPosition);
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      draggedNode: null,
      offset: { x: 0, y: 0 },
    });
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative ${className} ${
        isLocked ? "cursor-not-allowed" : "cursor-default"
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
    >
      <svg className="absolute inset-0 w-full h-full">
        {/* Render edges with improved curves */}
        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const sourceX = sourceNode.position.x + 200;
          const sourceY = sourceNode.position.y + 50;
          const targetX = targetNode.position.x;
          const targetY = targetNode.position.y + 50;

          // Create a curved path
          const midX = (sourceX + targetX) / 2;
          const controlX1 = sourceX + 50;
          const controlX2 = targetX - 50;

          const pathData = `M ${sourceX} ${sourceY} C ${controlX1} ${sourceY}, ${controlX2} ${targetY}, ${targetX} ${targetY}`;

          return (
            <g key={edge.id}>
              <path
                d={pathData}
                fill="none"
                stroke={edge.style?.stroke || "#3b82f6"}
                strokeWidth={edge.style?.strokeWidth || 2}
                markerEnd="url(#arrowhead)"
                className="drop-shadow-sm"
              />
              {edge.label && (
                <text
                  x={midX}
                  y={(sourceY + targetY) / 2 - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 font-medium"
                  style={{ fontSize: "10px" }}
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Enhanced Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="10"
            refX="12"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 0, 12 5, 0 10"
              fill="#3b82f6"
              className="drop-shadow-sm"
            />
          </marker>
        </defs>
      </svg>

      {/* Render nodes */}
      {nodes.map((node) => {
        const NodeComponent = nodeTypes[node.type];
        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.position.x,
              top: node.position.y,
              zIndex: 10,
              cursor: isLocked ? "not-allowed" : "move",
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          >
            <NodeComponent data={node.data} />
          </div>
        );
      })}

      {children}
    </div>
  );
};

const Controls = ({
  className,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  onFullscreen,
  isLocked,
  onToggleLock,
}) => (
  <div className={`absolute bottom-6 left-6 ${className}`}>
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex flex-col gap-1">
      <button
        onClick={onZoomIn}
        className="p-3 hover:bg-gray-100 rounded-md transition-colors group relative"
        title="Zoom In"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="21 21l-4.35-4.35" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <button
        onClick={onZoomOut}
        className="p-3 hover:bg-gray-100 rounded-md transition-colors group"
        title="Zoom Out"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="21 21l-4.35-4.35" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <button
        onClick={onFitView}
        className="p-3 hover:bg-gray-100 rounded-md transition-colors"
        title="Fit View"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>

      <button
        onClick={onFullscreen}
        className="p-3 hover:bg-gray-100 rounded-md transition-colors"
        title="Fullscreen"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 3h6l-6 6V3zM21 3h-6l6 6V3zM21 21h-6l6-6v6zM3 21h6l-6-6v6z" />
        </svg>
      </button>

      <div className="border-t border-gray-200 my-1"></div>

      <button
        onClick={onToggleLock}
        className={`p-3 rounded-md transition-colors ${
          isLocked
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "hover:bg-gray-100"
        }`}
        title={isLocked ? "Unlock Layout" : "Lock Layout"}
      >
        {isLocked ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M7 11V7a5 5 0 0 1 8.5 3.5" />
          </svg>
        )}
      </button>

      <div className="text-xs text-gray-500 text-center mt-2 px-1">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  </div>
);

const MiniMap = ({ className, nodeColor, nodes }) => (
  <div
    className={`absolute top-6 right-6 w-56 h-36 ${className} rounded-lg p-3 shadow-lg border border-gray-200`}
  >
    <div className="text-xs text-gray-600 mb-2 font-medium">
      Workflow Overview
    </div>
    <div className="relative w-full h-full bg-gray-50 rounded border">
      {nodes.map((node, index) => (
        <div
          key={node.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: nodeColor(node),
            left: `${((index * 20) % 80) + 10}%`,
            top: `${Math.floor(index / 4) * 25 + 20}%`,
          }}
        />
      ))}
    </div>
  </div>
);

const Background = ({ variant, gap, size, className }) => (
  <div className={`absolute inset-0 ${className}`}>
    <div
      className="w-full h-full opacity-10"
      style={{
        backgroundImage: `radial-gradient(circle, #9ca3af ${size}px, transparent ${size}px)`,
        backgroundSize: `${gap}px ${gap}px`,
      }}
    />
  </div>
);

// Custom Node Components (Enhanced with better connection points)
const UserRegistrationNode = ({ data }) => (
  <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg min-w-[200px] border-2 border-blue-600 relative hover:shadow-xl transition-shadow">
    {/* Output handle */}
    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-300 rounded-full border-3 border-white shadow-md"></div>

    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
        <span className="text-blue-500 font-bold text-xl">👤</span>
      </div>
      <h3 className="font-bold text-lg">User Registration</h3>
    </div>
    <p className="text-sm opacity-90 mb-2">Generate user data</p>
    {data.output && (
      <div className="mt-3 p-3 bg-blue-600 rounded-md text-xs space-y-1">
        <div>
          <strong>Name:</strong> {data.output.name}
        </div>
        <div>
          <strong>Email:</strong> {data.output.email}
        </div>
        <div>
          <strong>Age:</strong> {data.output.age}
        </div>
        <div>
          <strong>Region:</strong> {data.output.region}
        </div>
      </div>
    )}
  </div>
);

const ValidatorNode = ({ data }) => (
  <div className="bg-orange-500 text-white p-4 rounded-lg shadow-lg min-w-[200px] border-2 border-orange-600 relative hover:shadow-xl transition-shadow">
    {/* Input handle */}
    <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-orange-300 rounded-full border-3 border-white shadow-md"></div>
    {/* Output handles */}
    <div className="absolute -right-3 top-1/3 transform -translate-y-1/2 w-6 h-6 bg-green-300 rounded-full border-3 border-white shadow-md"></div>
    <div className="absolute -right-3 top-2/3 transform -translate-y-1/2 w-6 h-6 bg-red-300 rounded-full border-3 border-white shadow-md"></div>

    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
        <span className="text-orange-500 font-bold text-xl">✓</span>
      </div>
      <h3 className="font-bold text-lg">Validator</h3>
    </div>
    <p className="text-sm opacity-90 mb-2">Age & Email validation</p>
    {data.output && (
      <div className="mt-3 p-3 bg-orange-600 rounded-md text-xs space-y-1">
        <div>
          <strong>Valid:</strong> {data.output.isValid ? "✅" : "❌"}
        </div>
        <div>
          <strong>Reason:</strong> {data.output.reason}
        </div>
      </div>
    )}
  </div>
);

const ErrorHandlerNode = ({ data }) => (
  <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg min-w-[200px] border-2 border-red-600 relative hover:shadow-xl transition-shadow">
    {/* Input handle */}
    <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-red-300 rounded-full border-3 border-white shadow-md"></div>

    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
        <span className="text-red-500 font-bold text-xl">⚠️</span>
      </div>
      <h3 className="font-bold text-lg">Error Handler</h3>
    </div>
    <p className="text-sm opacity-90 mb-2">Handle validation errors</p>
    {data.output && (
      <div className="mt-3 p-3 bg-red-600 rounded-md text-xs space-y-1">
        <div>
          <strong>Error:</strong> {data.output.error}
        </div>
        <div>
          <strong>Action:</strong> {data.output.action}
        </div>
      </div>
    )}
  </div>
);

const RegionProcessNode = ({ data }) => (
  <div className="bg-purple-500 text-white p-4 rounded-lg shadow-lg min-w-[200px] border-2 border-purple-600 relative hover:shadow-xl transition-shadow">
    {/* Input handle */}
    <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-purple-300 rounded-full border-3 border-white shadow-md"></div>
    {/* Output handle */}
    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-purple-300 rounded-full border-3 border-white shadow-md"></div>

    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
        <span className="text-purple-500 font-bold text-xl">🌍</span>
      </div>
      <h3 className="font-bold text-lg">Region Process</h3>
    </div>
    <p className="text-sm opacity-90 mb-2">Process by region</p>
    {data.output && (
      <div className="mt-3 p-3 bg-purple-600 rounded-md text-xs space-y-1">
        <div>
          <strong>Region:</strong> {data.output.region}
        </div>
        <div>
          <strong>Currency:</strong> {data.output.currency}
        </div>
        <div>
          <strong>Language:</strong> {data.output.language}
        </div>
      </div>
    )}
  </div>
);

const WelcomeEmailNode = ({ data }) => (
  <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg min-w-[200px] border-2 border-green-600 relative hover:shadow-xl transition-shadow">
    {/* Input handle */}
    <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-green-300 rounded-full border-3 border-white shadow-md"></div>

    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
        <span className="text-green-500 font-bold text-xl">📧</span>
      </div>
      <h3 className="font-bold text-lg">Welcome Email</h3>
    </div>
    <p className="text-sm opacity-90 mb-2">Send welcome email</p>
    {data.output && (
      <div className="mt-3 p-3 bg-green-600 rounded-md text-xs space-y-1">
        <div>
          <strong>To:</strong> {data.output.recipient}
        </div>
        <div>
          <strong>Subject:</strong> {data.output.subject}
        </div>
        <div>
          <strong>Status:</strong> {data.output.status}
        </div>
      </div>
    )}
  </div>
);

const nodeTypes = {
  userRegistration: UserRegistrationNode,
  validator: ValidatorNode,
  errorHandler: ErrorHandlerNode,
  regionProcess: RegionProcessNode,
  welcomeEmail: WelcomeEmailNode,
};

const initialNodes = [
  {
    id: "1",
    type: "userRegistration",
    position: { x: 50, y: 200 },
    data: { label: "User Registration" },
  },
  {
    id: "2",
    type: "validator",
    position: { x: 350, y: 200 },
    data: { label: "Validator" },
  },
  {
    id: "3",
    type: "errorHandler",
    position: { x: 650, y: 100 },
    data: { label: "Error Handler" },
  },
  {
    id: "4",
    type: "regionProcess",
    position: { x: 650, y: 300 },
    data: { label: "Region Process" },
  },
  {
    id: "5",
    type: "welcomeEmail",
    position: { x: 950, y: 300 },
    data: { label: "Welcome Email" },
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    style: { stroke: "#3b82f6", strokeWidth: 3 },
    label: "User Data",
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    style: { stroke: "#ef4444", strokeWidth: 3 },
    label: "Invalid",
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    style: { stroke: "#22c55e", strokeWidth: 3 },
    label: "Valid",
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    style: { stroke: "#8b5cf6", strokeWidth: 3 },
    label: "Processed",
  },
];

const ReactFlowWorkflow = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges] = useState(initialEdges);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isLocked, setIsLocked] = useState(false);

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.3));
  const handleFitView = () => setZoom(1);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleToggleLock = () => setIsLocked((prev) => !prev);

  const handleNodeDrag = useCallback((nodeId, newPosition) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, position: newPosition } : node
      )
    );
  }, []);

  // Generate random user data
  const generateUserData = () => {
    const names = [
      "John Doe",
      "Jane Smith",
      "Alice Johnson",
      "Bob Wilson",
      "Charlie Brown",
    ];
    const domains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "example.com",
      "invalid-email",
    ];
    const regions = ["US", "EU", "ASIA", "LATAM"];

    const name = names[Math.floor(Math.random() * names.length)];
    const email =
      Math.random() > 0.3
        ? `${name.toLowerCase().replace(" ", ".")}@${
            domains[Math.floor(Math.random() * 4)]
          }`
        : `invalid-email@${domains[4]}`;

    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      age: Math.floor(Math.random() * 50) + 15, // 15-65
      region: regions[Math.floor(Math.random() * regions.length)],
      timestamp: new Date().toISOString(),
    };
  };

  // Validate user data
  const validateUser = (userData) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail =
      emailRegex.test(userData.email) &&
      !userData.email.includes("invalid-email");
    const isValidAge = userData.age >= 18;

    let reason = "";
    if (!isValidAge && !isValidEmail) {
      reason = "Underage and invalid email";
    } else if (!isValidAge) {
      reason = "User is underage";
    } else if (!isValidEmail) {
      reason = "Invalid email format";
    } else {
      reason = "All validations passed";
    }

    return {
      isValid: isValidAge && isValidEmail,
      reason,
      validatedAt: new Date().toISOString(),
      ...userData,
    };
  };

  // Process by region
  const processRegion = (validatedData) => {
    const regionConfig = {
      US: { currency: "USD", language: "en-US", timezone: "America/New_York" },
      EU: { currency: "EUR", language: "en-GB", timezone: "Europe/London" },
      ASIA: { currency: "JPY", language: "ja-JP", timezone: "Asia/Tokyo" },
      LATAM: {
        currency: "BRL",
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
      },
    };

    const config = regionConfig[validatedData.region] || regionConfig.US;

    return {
      ...validatedData,
      ...config,
      processedAt: new Date().toISOString(),
      welcomeBonus: validatedData.region === "US" ? 50 : 25,
    };
  };

  // Generate welcome email
  const generateWelcomeEmail = (processedData) => {
    const subject = `Welcome ${processedData.name}! Your ${processedData.currency} bonus awaits`;

    return {
      ...processedData,
      recipient: processedData.email,
      subject,
      body: `Dear ${processedData.name}, welcome to our platform! You've received a ${processedData.welcomeBonus} ${processedData.currency} bonus.`,
      status: "Email prepared for sending",
      emailId: Math.random().toString(36).substr(2, 9),
      sentAt: new Date().toISOString(),
    };
  };

  // Handle error cases
  const handleError = (invalidData) => {
    return {
      ...invalidData,
      error: invalidData.reason,
      action: "User registration rejected",
      errorCode: invalidData.age < 18 ? "AGE_RESTRICTION" : "INVALID_EMAIL",
      handledAt: new Date().toISOString(),
    };
  };

  const executeWorkflow = async () => {
    setIsProcessing(true);

    try {
      // Step 1: User Registration
      console.log("🔄 Starting workflow execution...");
      const userData = generateUserData();
      console.log(
        "👤 User Registration Node Output:",
        JSON.stringify(userData, null, 2)
      );

      setNodes((nds) =>
        nds.map((node) =>
          node.id === "1"
            ? { ...node, data: { ...node.data, output: userData } }
            : node
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Validation
      const validationResult = validateUser(userData);
      console.log(
        "✅ Validator Node Output:",
        JSON.stringify(validationResult, null, 2)
      );

      setNodes((nds) =>
        nds.map((node) =>
          node.id === "2"
            ? { ...node, data: { ...node.data, output: validationResult } }
            : node
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!validationResult.isValid) {
        // Step 3a: Error Handler
        const errorResult = handleError(validationResult);
        console.log(
          "❌ Error Handler Node Output:",
          JSON.stringify(errorResult, null, 2)
        );
        console.log("🛑 Workflow terminated due to validation failure");

        setNodes((nds) =>
          nds.map((node) =>
            node.id === "3"
              ? { ...node, data: { ...node.data, output: errorResult } }
              : node
          )
        );
      } else {
        // Step 3b: Region Processing
        const regionResult = processRegion(validationResult);
        console.log(
          "🌍 Region Process Node Output:",
          JSON.stringify(regionResult, null, 2)
        );

        setNodes((nds) =>
          nds.map((node) =>
            node.id === "4"
              ? { ...node, data: { ...node.data, output: regionResult } }
              : node
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 4: Welcome Email
        const emailResult = generateWelcomeEmail(regionResult);
        console.log(
          "📧 Welcome Email Node Output:",
          JSON.stringify(emailResult, null, 2)
        );
        console.log("✅ Workflow completed successfully!");

        setNodes((nds) =>
          nds.map((node) =>
            node.id === "5"
              ? { ...node, data: { ...node.data, output: emailResult } }
              : node
          )
        );
      }
    } catch (error) {
      console.error("❌ Workflow execution failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetWorkflow = () => {
    setNodes((nds) =>
      nds.map((node) => ({ ...node, data: { label: node.data.label } }))
    );
    console.clear();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-3 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">
            Enhanced React Flow Workflow
          </h1>
          {isLocked && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full flex items-center gap-1">
              🔒 Layout Locked
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span>Ready</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute top-20 left-4 z-20 bg-white p-4 rounded-lg shadow-lg max-w-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <h2 className="font-semibold text-gray-800">Workflow Controls</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          User registration with validation, error handling, and email
          processing.
        </p>
        <div className="flex gap-2 mb-3">
          <button
            onClick={executeWorkflow}
            disabled={isProcessing}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            {isProcessing ? "⏳ Processing..." : "🚀 Execute Workflow"}
          </button>
          <button
            onClick={resetWorkflow}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            🔄 Reset
          </button>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 Open browser console to see detailed JSON logs
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="absolute inset-0 top-16">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
          zoom={zoom}
          onZoomChange={setZoom}
          isLocked={isLocked}
          onNodeDrag={handleNodeDrag}
        >
          <Controls
            className="bg-white border-gray-300"
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            onFullscreen={handleFullscreen}
            isLocked={isLocked}
            onToggleLock={handleToggleLock}
          />
          <MiniMap
            className="bg-white border border-gray-300"
            nodes={nodes}
            nodeColor={(node) => {
              switch (node.type) {
                case "userRegistration":
                  return "#3b82f6";
                case "validator":
                  return "#f97316";
                case "errorHandler":
                  return "#ef4444";
                case "regionProcess":
                  return "#8b5cf6";
                case "welcomeEmail":
                  return "#22c55e";
                default:
                  return "#6b7280";
              }
            }}
          />
          <Background variant="dots" gap={25} size={1} className="bg-gray-50" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ReactFlowWorkflow;
