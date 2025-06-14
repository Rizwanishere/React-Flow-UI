import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

// ===== Utils =====
const randomUser = () => {
  const regions = ["US", "EU", "Asia"];
  const names = ["Alex", "Jamie", "Taylor", "Sam", "Jordan", "Morgan"];
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const age =
    Math.random() < 0.3
      ? Math.floor(Math.random() * 10) + 10
      : Math.floor(Math.random() * 25) + 18;
  const email =
    Math.random() < 0.2
      ? "invalid-email"
      : getRandom(names).toLowerCase() + "@example.com";
  return {
    name: getRandom(names),
    email,
    region: getRandom(regions),
    age,
    registrationDate: new Date().toISOString(),
  };
};

function validateUser(user) {
  const errors = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push("Invalid email");
  }
  if (user.age < 18) {
    errors.push("User under 18");
  }
  return errors;
}

// ===== Custom Node Components =====
const baseNodeStyle = {
  padding: 16,
  borderRadius: 16,
  color: "#fff",
  minWidth: 180,
  minHeight: 80,
  border: "3px solid #fff",
  fontWeight: 700,
  fontFamily: "Inter,sans-serif",
  boxShadow: "0 4px 22px 0 rgba(22,76,167,0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  position: "relative",
  backgroundClip: "padding-box",
  cursor: "move",
};
const icons = {
  start: "👤",
  validator: "🧐",
  error: "❌",
  process: "🌎",
  email: "✉️",
};

// Blue: User Registration
function StartNode({ data }) {
  return (
    <div
      style={{
        ...baseNodeStyle,
        background: "linear-gradient(135deg, #397bee 70%, #45e6fd)",
        borderColor: "#2671e4",
        paddingRight: 32,
      }}
    >
      <div style={{ fontSize: 28 }}>{icons.start}</div>
      <div>User Registration</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        {data && data.user ? (
          <>
            <div>
              <b>{data.user.name}</b> — {data.user.region}, {data.user.age}
            </div>
            <div>{data.user.email}</div>
          </>
        ) : (
          <span style={{ fontStyle: "italic", color: "#e6e6e6" }}>
            Submit to start
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#397bee",
          border: "2px solid #fff",
          width: 14,
          height: 14,
          right: -7,
          top: "50%",
        }}
        id="out"
      />
    </div>
  );
}

// Orange: Validator
function ValidatorNode({ data }) {
  const errors = data?.validation?.errors;
  return (
    <div
      style={{
        ...baseNodeStyle,
        background: "linear-gradient(135deg, #fd9222 60%, #ffcc70)",
        borderColor: "#fd9222",
        paddingLeft: 30,
        paddingRight: 30,
      }}
    >
      <div style={{ fontSize: 28 }}>{icons.validator}</div>
      <div>Validator</div>
      {data?.user && (
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          Validating...
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>
              Email: <b>{data.user.email}</b>
            </li>
            <li>
              Age: <b>{data.user.age}</b>
            </li>
          </ul>
        </div>
      )}
      {errors && (
        <div style={{ color: "red", fontWeight: 600, marginTop: 4 }}>
          {errors.join(", ")}
        </div>
      )}
      {/* Target handle for input */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          background: "#397bee",
          border: "2px solid #fff",
          width: 14,
          height: 14,
          left: -7,
          top: "50%",
        }}
      />
      {/* Error branch */}
      <Handle
        type="source"
        position={Position.Top}
        id="error"
        style={{
          background: "#ee406e",
          border: "2px solid #fff",
          width: 14,
          height: 14,
          left: "70%",
          top: -7,
        }}
      />
      {/* Success branch */}
      <Handle
        type="source"
        position={Position.Right}
        id="success"
        style={{
          background: "#6c47ec",
          border: "2px solid #fff",
          width: 14,
          height: 14,
          right: -7,
          top: "50%",
        }}
      />
    </div>
  );
}

// Red: Error Handler
function ErrorHandlerNode({ data }) {
  return (
    <div
      style={{
        ...baseNodeStyle,
        background: "linear-gradient(133deg, #ee406e 60%, #fd5858 100%)",
        borderColor: "#ee406e",
        paddingLeft: 22,
      }}
    >
      <div style={{ fontSize: 28 }}>{icons.error}</div>
      <div>Error Handler</div>
      {data?.validation && (
        <div style={{ fontSize: 13, marginTop: 4 }}>
          <div>
            <b>Rejected:</b>
          </div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {(data.validation.errors || []).map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          background: "#ee406e",
          border: "2px solid #fff",
          width: 14,
          height: 14,
          left: -7,
          top: "50%",
        }}
      />
    </div>
  );
}

// Purple: Region Processor
function RegionProcessNode({ data }) {
  return (
    <div
      style={{
        ...baseNodeStyle,
        background: "linear-gradient(133deg, #6c47ec 60%, #7d53f2 100%)",
        borderColor: "#6c47ec",
        paddingLeft: 22,
        paddingRight: 22,
      }}
    >
      <div style={{ fontSize: 28 }}>{icons.process}</div>
      <div>Region Process</div>
      {data?.user && (
        <div style={{ fontSize: 13 }}>
          <div>
            Region: <b>{data.user.region}</b>
          </div>
          <div>
            Policy:{" "}
            <span
              style={{
                background: "#c4b5fd",
                color: "#5432b3",
                borderRadius: 4,
                padding: "1px 6px",
                fontWeight: 600,
              }}
            >
              {data.regionPolicy}
            </span>
          </div>
        </div>
      )}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          background: "#6c47ec",
          border: "2px solid #fff",
          width: 14,
          height: 14,
          left: -7,
          top: "50%",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{
          background: "#33c967",
          border: "2px solid #fff",
          width: 14,
          height: 14,
          right: -7,
          top: "50%",
        }}
      />
    </div>
  );
}

// Green: Welcome Email
function WelcomeEmailNode({ data }) {
  return (
    <div
      style={{
        ...baseNodeStyle,
        background: "linear-gradient(133deg, #33c967 60%, #84fba2 100%)",
        borderColor: "#33c967",
        minWidth: 220,
        paddingLeft: 22,
        paddingRight: 22,
      }}
    >
      <div style={{ fontSize: 28 }}>{icons.email}</div>
      <div>Welcome Email</div>
      {data?.user && (
        <div style={{ fontSize: 13 }}>
          <div>
            Dear <b>{data.user.name}</b>,
            <br />
            Welcome to our {data.user.region} community!
          </div>
        </div>
      )}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          background: "#33c967",
          border: "2px solid #fff",
          width: 14,
          height: 14,
          left: -7,
          top: "50%",
        }}
      />
    </div>
  );
}

// Node Types
const nodeTypes = {
  start: StartNode,
  validator: ValidatorNode,
  error: ErrorHandlerNode,
  region: RegionProcessNode,
  email: WelcomeEmailNode,
};

// ==== Initial Layout ====
const initialNodes = [
  {
    id: "start",
    type: "start",
    position: { x: 10, y: 210 },
    data: {},
    draggable: true,
  },
  {
    id: "validator",
    type: "validator",
    position: { x: 260, y: 200 },
    data: {},
    draggable: true,
  },
  {
    id: "error",
    type: "error",
    position: { x: 540, y: 90 },
    data: {},
    draggable: true,
  },
  {
    id: "region",
    type: "region",
    position: { x: 550, y: 320 },
    data: {},
    draggable: true,
  },
  {
    id: "email",
    type: "email",
    position: { x: 800, y: 320 },
    data: {},
    draggable: true,
  },
];

// Correct edge connection, multiple handles used for branching
const initialEdges = [
  {
    id: "e1",
    source: "start",
    sourceHandle: "out",
    target: "validator",
    targetHandle: "in",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#397bee", strokeWidth: 3 },
  },
  {
    id: "e2",
    source: "validator",
    sourceHandle: "error",
    target: "error",
    targetHandle: "in",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#ee406e", strokeWidth: 3 },
  },
  {
    id: "e3",
    source: "validator",
    sourceHandle: "success",
    target: "region",
    targetHandle: "in",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#6c47ec", strokeWidth: 3 },
  },
  {
    id: "e4",
    source: "region",
    sourceHandle: "out",
    target: "email",
    targetHandle: "in",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#33c967", strokeWidth: 3 },
  },
];

// ======= Main App =======
export default function FlowExample() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLocked, setIsLocked] = useState(false); // Track lock state
  const userRef = useRef(null);

  // Update all nodes' draggable property based on lock state
  const updateDraggable = useCallback(
    (locked) => {
      setNodes((nds) => nds.map((node) => ({ ...node, draggable: locked })));
    },
    [setNodes]
  );

  // Listen to lock/unlock from Controls
  const onLockChange = useCallback(
    (locked) => {
      setIsLocked(locked);
      updateDraggable(locked);
    },
    [updateDraggable]
  );

  const onSubmit = useCallback(() => {
    const user = randomUser();
    userRef.current = user;
    setNodes((nds) =>
      nds.map((node) =>
        node.id === "start" ? { ...node, data: { user } } : node
      )
    );
    setTimeout(() => validatorStep(user), 400);
  }, [setNodes]);

  const validatorStep = (user) => {
    const validation = { errors: validateUser(user) };
    const validatorOut = { ...user, validation };
    console.log("[ValidatorNode]", JSON.stringify(validatorOut, null, 2));
    setNodes((nds) =>
      nds.map((node) =>
        node.id === "validator" ? { ...node, data: { user, validation } } : node
      )
    );
    setTimeout(() => {
      if (validation.errors.length) {
        errorHandlerStep(user, validation);
      } else {
        regionStep(user);
      }
    }, 600);
  };

  const errorHandlerStep = (user, validation) => {
    const out = { ...user, validation, failedAt: "validation" };
    console.log("[ErrorHandlerNode]", JSON.stringify(out, null, 2));
    setNodes((nds) =>
      nds.map((node) =>
        node.id === "error" ? { ...node, data: { validation } } : node
      )
    );
    setNodes((nds) =>
      nds.map((node) =>
        ["region", "email"].includes(node.id) ? { ...node, data: {} } : node
      )
    );
  };

  const regionStep = (user) => {
    let regionPolicy = "";
    switch (user.region) {
      case "US":
        regionPolicy = "GDPR Not Required";
        break;
      case "EU":
        regionPolicy = "GDPR Required";
        break;
      case "Asia":
        regionPolicy = "APAC Policy";
        break;
      default:
        regionPolicy = "Generic";
    }
    const regionResult = { ...user, regionPolicy };
    console.log("[RegionProcessorNode]", JSON.stringify(regionResult, null, 2));
    setNodes((nds) =>
      nds.map((node) =>
        node.id === "region" ? { ...node, data: { user, regionPolicy } } : node
      )
    );
    setTimeout(() => emailStep(regionResult), 700);
  };

  const emailStep = (data) => {
    const emailData = {
      ...data,
      welcomeMessage: `Dear ${data.name},\nWelcome to our ${data.region} community!`,
    };
    console.log("[WelcomeEmailNode]", JSON.stringify(emailData, null, 2));
    setNodes((nds) =>
      nds.map((node) =>
        node.id === "email" ? { ...node, data: { user: emailData } } : node
      )
    );
  };

  // Style for App background panel
  const gradientBg = "linear-gradient(90deg, #e6eefd 0%, #fff 100%)";

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: gradientBg,
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* <div
        style={{
          padding: "24px 32px 0px 24px",
          fontWeight: 800,
          fontSize: 26,
          color: "#2663d1",
          letterSpacing: -1.5,
        }}
      >
        🚀 Registration Workflow{" "}
      </div> */}

      <div
        style={{
          padding: "8px 30px 6px 24px",
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <button
          style={{
            background: "linear-gradient(89deg, #397bee 60%, #33c967 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 17,
            border: "none",
            borderRadius: 10,
            padding: "12px 26px",
            boxShadow: "0 2px 16px #d1d9fb66",
            cursor: "pointer",
            marginRight: 12,
            outline: "none",
            marginTop: 8,
          }}
          onClick={onSubmit}
        >
          Submit
        </button>
        <button
          style={{
            background: "#e6eefd",
            color: "#397bee",
            fontWeight: 700,
            fontSize: 17,
            border: "1.5px solid #397bee",
            borderRadius: 10,
            padding: "12px 26px",
            boxShadow: "0 2px 16px #d1d9fb33",
            cursor: "pointer",
            outline: "none",
            marginTop: 8,
          }}
          onClick={() => {
            setNodes(initialNodes);
            setEdges(initialEdges);
            userRef.current = null;
          }}
        >
          Reset
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 480 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          panOnDrag
          panOnScroll
          zoomOnScroll
          zoomOnPinch
          minZoom={0.25}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          attributionPosition="bottom-left"
        >
          <Background gap={32} size={1} color="#c7d4ee" variant="dots" />
          <MiniMap
            nodeColor={(n) =>
              n.type === "start"
                ? "#397bee"
                : n.type === "validator"
                ? "#fd9222"
                : n.type === "error"
                ? "#ee406e"
                : n.type === "region"
                ? "#6c47ec"
                : n.type === "email"
                ? "#33c967"
                : "#999"
            }
            nodeStrokeWidth={2}
            maskColor="#eeeefde9"
            style={{ height: 75 }}
          />
          <Controls
            position="bottom-right"
            onInteractiveChange={onLockChange}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
