import React, { useState, useCallback } from 'react';

// React Flow Components - using direct imports
const ReactFlow = ({ children, nodes, edges, onNodesChange, onEdgesChange, onConnect, nodeTypes, fitView, className }) => {
  return (
    <div className={`w-full h-full relative ${className}`}>
      <svg className="absolute inset-0 w-full h-full">
        {/* Render edges */}
        {edges.map((edge) => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;
          
          const sourceX = sourceNode.position.x + 200;
          const sourceY = sourceNode.position.y + 50;
          const targetX = targetNode.position.x;
          const targetY = targetNode.position.y + 50;
          
          return (
            <line
              key={edge.id}
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke={edge.style?.stroke || '#3b82f6'}
              strokeWidth={edge.style?.strokeWidth || 2}
              markerEnd="url(#arrowhead)"
            />
          );
        })}
        
        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#3b82f6"
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
              position: 'absolute',
              left: node.position.x,
              top: node.position.y,
              zIndex: 10,
            }}
          >
            <NodeComponent data={node.data} />
          </div>
        );
      })}
      
      {children}
    </div>
  );
};

const Controls = ({ className }) => (
  <div className={`absolute bottom-4 left-4 ${className}`}>
    <div className="bg-white p-2 rounded-lg shadow-lg flex gap-2">
      <button className="p-2 hover:bg-gray-100 rounded">🔍</button>
      <button className="p-2 hover:bg-gray-100 rounded">⊕</button>
      <button className="p-2 hover:bg-gray-100 rounded">⊖</button>
      <button className="p-2 hover:bg-gray-100 rounded">⟲</button>
    </div>
  </div>
);

const MiniMap = ({ className, nodeColor }) => (
  <div className={`absolute top-4 right-4 w-48 h-32 ${className} rounded-lg p-2`}>
    <div className="text-xs text-gray-600 mb-2">Workflow Map</div>
    <div className="grid grid-cols-5 gap-1 h-full">
      <div className="bg-blue-400 rounded-sm"></div>
      <div className="bg-orange-400 rounded-sm"></div>
      <div className="bg-red-400 rounded-sm"></div>
      <div className="bg-purple-400 rounded-sm"></div>
      <div className="bg-green-400 rounded-sm"></div>
    </div>
  </div>
);

const Background = ({ variant, gap, size, className }) => (
  <div className={`absolute inset-0 ${className}`}>
    <div 
      className="w-full h-full opacity-20"
      style={{
        backgroundImage: `radial-gradient(circle, #666 ${size}px, transparent ${size}px)`,
        backgroundSize: `${gap}px ${gap}px`,
      }}
    />
  </div>
);

// Custom Node Components
const UserRegistrationNode = ({ data }) => (
  <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg min-w-[200px] border-2 border-blue-600 relative">
    {/* Output handle */}
    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-300 rounded-full border-2 border-white"></div>
    
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <span className="text-blue-500 font-bold text-lg">👤</span>
      </div>
      <h3 className="font-bold">User Registration</h3>
    </div>
    <p className="text-sm opacity-90">Generate user data</p>
    {data.output && (
      <div className="mt-2 p-2 bg-blue-600 rounded text-xs">
        <div>Name: {data.output.name}</div>
        <div>Email: {data.output.email}</div>
        <div>Age: {data.output.age}</div>
      </div>
    )}
  </div>
);

const ValidatorNode = ({ data }) => (
  <div className="bg-orange-500 text-white p-4 rounded-lg shadow-lg min-w-[200px] border-2 border-orange-600 relative">
    {/* Input handle */}
    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-orange-300 rounded-full border-2 border-white"></div>
    {/* Output handles */}
    <div className="absolute -right-2 top-1/3 transform -translate-y-1/2 w-4 h-4 bg-green-300 rounded-full border-2 border-white"></div>
    <div className="absolute -right-2 top-2/3 transform -translate-y-1/2 w-4 h-4 bg-red-300 rounded-full border-2 border-white"></div>
    
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <span className="text-orange-500 font-bold text-lg">✓</span>
      </div>
      <h3 className="font-bold">Validator</h3>
    </div>
    <p className="text-sm opacity-90">Age & Email validation</p>
    {data.output && (
      <div className="mt-2 p-2 bg-orange-600 rounded text-xs">
        <div>Valid: {data.output.isValid ? '✅' : '❌'}</div>
        <div>Reason: {data.output.reason}</div>
      </div>
    )}
  </div>
);

const ErrorHandlerNode = ({ data }) => (
  <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg min-w-[200px] border-2 border-red-600 relative">
    {/* Input handle */}
    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-300 rounded-full border-2 border-white"></div>
    
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <span className="text-red-500 font-bold text-lg">⚠️</span>
      </div>
      <h3 className="font-bold">Error Handler</h3>
    </div>
    <p className="text-sm opacity-90">Handle validation errors</p>
    {data.output && (
      <div className="mt-2 p-2 bg-red-600 rounded text-xs">
        <div>Error: {data.output.error}</div>
        <div>Action: {data.output.action}</div>
      </div>
    )}
  </div>
);

const RegionProcessNode = ({ data }) => (
  <div className="bg-purple-500 text-white p-4 rounded-lg shadow-lg min-w-[200px] border-2 border-purple-600 relative">
    {/* Input handle */}
    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-purple-300 rounded-full border-2 border-white"></div>
    {/* Output handle */}
    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-purple-300 rounded-full border-2 border-white"></div>
    
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <span className="text-purple-500 font-bold text-lg">🌍</span>
      </div>
      <h3 className="font-bold">Region Process</h3>
    </div>
    <p className="text-sm opacity-90">Process by region</p>
    {data.output && (
      <div className="mt-2 p-2 bg-purple-600 rounded text-xs">
        <div>Region: {data.output.region}</div>
        <div>Currency: {data.output.currency}</div>
        <div>Language: {data.output.language}</div>
      </div>
    )}
  </div>
);

const WelcomeEmailNode = ({ data }) => (
  <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg min-w-[200px] border-2 border-green-600 relative">
    {/* Input handle */}
    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-300 rounded-full border-2 border-white"></div>
    
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <span className="text-green-500 font-bold text-lg">📧</span>
      </div>
      <h3 className="font-bold">Welcome Email</h3>
    </div>
    <p className="text-sm opacity-90">Send welcome email</p>
    {data.output && (
      <div className="mt-2 p-2 bg-green-600 rounded text-xs">
        <div>To: {data.output.recipient}</div>
        <div>Subject: {data.output.subject}</div>
        <div>Status: {data.output.status}</div>
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
    id: '1',
    type: 'userRegistration',
    position: { x: 50, y: 200 },
    data: { label: 'User Registration' },
  },
  {
    id: '2',
    type: 'validator',
    position: { x: 350, y: 200 },
    data: { label: 'Validator' },
  },
  {
    id: '3',
    type: 'errorHandler',
    position: { x: 650, y: 100 },
    data: { label: 'Error Handler' },
  },
  {
    id: '4',
    type: 'regionProcess',
    position: { x: 650, y: 300 },
    data: { label: 'Region Process' },
  },
  {
    id: '5',
    type: 'welcomeEmail',
    position: { x: 950, y: 300 },
    data: { label: 'Welcome Email' },
  },
];

const initialEdges = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    style: { stroke: '#3b82f6', strokeWidth: 3 },
    label: 'User Data'
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    style: { stroke: '#ef4444', strokeWidth: 3 },
    label: 'Invalid'
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4', 
    style: { stroke: '#22c55e', strokeWidth: 3 },
    label: 'Valid'
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5', 
    style: { stroke: '#8b5cf6', strokeWidth: 3 }
  },
];

const ReactFlowWorkflow = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges] = useState(initialEdges);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate random user data
  const generateUserData = () => {
    const names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Wilson', 'Charlie Brown'];
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com', 'invalid-email'];
    const regions = ['US', 'EU', 'ASIA', 'LATAM'];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const email = Math.random() > 0.3 
      ? `${name.toLowerCase().replace(' ', '.')}@${domains[Math.floor(Math.random() * 4)]}`
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
    const isValidEmail = emailRegex.test(userData.email) && !userData.email.includes('invalid-email');
    const isValidAge = userData.age >= 18;

    let reason = '';
    if (!isValidAge && !isValidEmail) {
      reason = 'Underage and invalid email';
    } else if (!isValidAge) {
      reason = 'User is underage';
    } else if (!isValidEmail) {
      reason = 'Invalid email format';
    } else {
      reason = 'All validations passed';
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
      US: { currency: 'USD', language: 'en-US', timezone: 'America/New_York' },
      EU: { currency: 'EUR', language: 'en-GB', timezone: 'Europe/London' },
      ASIA: { currency: 'JPY', language: 'ja-JP', timezone: 'Asia/Tokyo' },
      LATAM: { currency: 'BRL', language: 'pt-BR', timezone: 'America/Sao_Paulo' },
    };

    const config = regionConfig[validatedData.region] || regionConfig.US;
    
    return {
      ...validatedData,
      ...config,
      processedAt: new Date().toISOString(),
      welcomeBonus: validatedData.region === 'US' ? 50 : 25,
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
      status: 'Email prepared for sending',
      emailId: Math.random().toString(36).substr(2, 9),
      sentAt: new Date().toISOString(),
    };
  };

  // Handle error cases
  const handleError = (invalidData) => {
    return {
      ...invalidData,
      error: invalidData.reason,
      action: 'User registration rejected',
      errorCode: invalidData.age < 18 ? 'AGE_RESTRICTION' : 'INVALID_EMAIL',
      handledAt: new Date().toISOString(),
    };
  };

  const executeWorkflow = async () => {
    setIsProcessing(true);
    
    try {
      // Step 1: User Registration
      console.log('🔄 Starting workflow execution...');
      const userData = generateUserData();
      console.log('👤 User Registration Node Output:', JSON.stringify(userData, null, 2));
      
      setNodes((nds) =>
        nds.map((node) =>
          node.id === '1' ? { ...node, data: { ...node.data, output: userData } } : node
        )
      );
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Validation
      const validationResult = validateUser(userData);
      console.log('✅ Validator Node Output:', JSON.stringify(validationResult, null, 2));
      
      setNodes((nds) =>
        nds.map((node) =>
          node.id === '2' ? { ...node, data: { ...node.data, output: validationResult } } : node
        )
      );
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!validationResult.isValid) {
        // Step 3a: Error Handler
        const errorResult = handleError(validationResult);
        console.log('❌ Error Handler Node Output:', JSON.stringify(errorResult, null, 2));
        console.log('🛑 Workflow terminated due to validation failure');
        
        setNodes((nds) =>
          nds.map((node) =>
            node.id === '3' ? { ...node, data: { ...node.data, output: errorResult } } : node
          )
        );
      } else {
        // Step 3b: Region Processing
        const regionResult = processRegion(validationResult);
        console.log('🌍 Region Process Node Output:', JSON.stringify(regionResult, null, 2));
        
        setNodes((nds) =>
          nds.map((node) =>
            node.id === '4' ? { ...node, data: { ...node.data, output: regionResult } } : node
          )
        );
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 4: Welcome Email
        const emailResult = generateWelcomeEmail(regionResult);
        console.log('📧 Welcome Email Node Output:', JSON.stringify(emailResult, null, 2));
        console.log('✅ Workflow completed successfully!');
        
        setNodes((nds) =>
          nds.map((node) =>
            node.id === '5' ? { ...node, data: { ...node.data, output: emailResult } } : node
          )
        );
      }
    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
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
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-20 bg-white p-4 rounded-lg shadow-lg max-w-sm">
        <h1 className="text-xl font-bold mb-2 text-gray-800">n8n-style React Flow Workflow</h1>
        <p className="text-sm text-gray-600 mb-4">
          User registration with validation, error handling, and email processing.
        </p>
        <div className="flex gap-2 mb-2">
          <button
            onClick={executeWorkflow}
            disabled={isProcessing}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isProcessing ? '⏳ Processing...' : '🚀 Submit Registration'}
          </button>
          <button
            onClick={resetWorkflow}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🔄 Reset
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Open browser console to see detailed JSON logs
        </div>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Controls className="bg-white border-gray-300" />
        <MiniMap 
          className="bg-white border border-gray-300" 
          nodeColor={(node) => {
            switch (node.type) {
              case 'userRegistration': return '#3b82f6';
              case 'validator': return '#f97316';
              case 'errorHandler': return '#ef4444';
              case 'regionProcess': return '#8b5cf6';
              case 'welcomeEmail': return '#22c55e';
              default: return '#6b7280';
            }
          }}
        />
        <Background variant="dots" gap={20} size={1} className="bg-gray-50" />
      </ReactFlow>
    </div>
  );
};

export default ReactFlowWorkflow;