'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  ReactFlowProvider,
  useReactFlow,
  Connection,
} from 'reactflow';

import { BoardState, Message, ChatBubbleType, LLMProvider, ViewMode } from '../types';
import Sidebar from './Sidebar';
import BoardHeader from './BoardHeader';
import Composer from './Composer';
import Guide from './Guide';
import ChatBubbleNode from './ChatBubbleNode';
import DisconnectModal from './DisconnectModal';

const initialBoard: BoardState = {
  id: 'board-1',
  name: 'State Management Research',
  bubbles: [
    {
      id: 'bubble-1',
      title: 'Initial Query',
      position: { x: 50, y: 50 },
      messages: [
        { id: 'msg-1-1', text: 'What are the most popular state management libraries for React in 2025?', sender: 'human', timestamp: '4:01 PM' },
      ],
      isShrunk: false,
      type: 'message',
    },
    {
      id: 'bubble-2',
      title: 'Zustand Deep Dive',
      parentId: 'bubble-1',
      position: { x: 520, y: 80 },
      messages: [
        { id: 'msg-2-1', text: 'Tell me more about Zustand. Why is it gaining popularity?', sender: 'ai', timestamp: '4:03 PM' },
      ],
      isShrunk: false,
      type: 'message',
    },
  ],
  viewMode: 'zoomed-out'
};

const allBoards = [
  { id: 'board-1', name: 'State Management Research' },
  { id: 'board-2', name: 'Q3 Marketing Strategy' },
  { id: 'board-3', name: 'API Design Document' },
];

const nodeTypes = {
  chatBubble: ChatBubbleNode,
};

function FlowBoard() {
  const [boardState, setBoardState] = useState<BoardState>(initialBoard);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedLLM, setSelectedLLM] = useState<LLMProvider>('gpt-oss-120b');
  const [showGuide, setShowGuide] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  
  const [isDisconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [edgeToDisconnect, setEdgeToDisconnect] = useState<Edge | null>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  const isValidConnection = (connection: Connection) => {
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);
    
    if (!sourceNode || !targetNode) return false;
    
    // Files can only connect to human (prompt) nodes
    if (sourceNode.data.bubble.type === 'file') {
      return targetNode.data.bubble.type === 'message' && targetNode.data.bubble.messages[0]?.sender === 'human';
    }
    
    return true;
  };

  const onConnect: OnConnect = useCallback(
    (connection) => {
        if (isValidConnection(connection)) {
            setEdges((eds) => addEdge({ ...connection, type: 'smoothstep' }, eds));
        }
    },
    [setEdges, nodes]
  );
  
  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode?.data.bubble.type === 'file') {
      setEdgeToDisconnect(edge);
      setDisconnectModalOpen(true);
    }
  };
  
  const confirmDisconnect = () => {
    if (edgeToDisconnect) {
      setEdges((eds) => eds.filter((e) => e.id !== edgeToDisconnect.id));
      setEdgeToDisconnect(null);
    }
    setDisconnectModalOpen(false);
  };
  
  const removeNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);
  
  const toggleShrink = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const newBubble = { ...node.data.bubble, isShrunk: !node.data.bubble.isShrunk };
          return { ...node, data: { ...node.data, bubble: newBubble } };
        }
        return node;
      })
    );
  }, [setNodes]);

  useEffect(() => {
    const bubbles = boardState.bubbles;
    const initialNodes = bubbles.map((bubble) => ({
      id: bubble.id,
      type: 'chatBubble',
      position: bubble.position,
      data: { bubble, onRemove: removeNode, onToggleShrink: toggleShrink },
    }));
    const initialEdges = bubbles
      .filter((bubble) => bubble.parentId)
      .map((bubble) => ({
        id: `e-${bubble.parentId}-${bubble.id}`,
        source: bubble.parentId!,
        target: bubble.id,
        type: 'smoothstep',
      }));
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [boardState.bubbles, removeNode, toggleShrink]);

  const handleSendMessage = (text: string, bubbleId: string) => {
    const parentNode = nodes.find((n) => n.id === bubbleId) || nodes[nodes.length - 1];
    const newPosition = parentNode
      ? { x: parentNode.position.x + 400, y: parentNode.position.y }
      : { x: 50, y: 50 };

    const newBubble: ChatBubbleType = {
      id: `bubble-${Date.now()}`,
      title: 'New Message',
      messages: [{
        id: `msg-${Date.now()}`,
        text,
        sender: 'human',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
      }],
      position: newPosition,
      isShrunk: false,
      type: 'message',
      parentId: parentNode?.id,
    };
    
    const newNode: Node = {
      id: newBubble.id,
      type: 'chatBubble',
      position: newBubble.position,
      data: { bubble: newBubble, onRemove: removeNode, onToggleShrink: toggleShrink },
    };

    setNodes((nds) => nds.concat(newNode));
    if (parentNode) {
      const newEdge: Edge = {
        id: `e-${parentNode.id}-${newNode.id}`,
        source: parentNode.id,
        target: newNode.id,
        type: 'smoothstep',
      };
      setEdges((eds) => eds.concat(newEdge));
    }
  };
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0 || !reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: e.clientX - reactFlowBounds.left,
      y: e.clientY - reactFlowBounds.top,
    });

    const newNodes: Node[] = files.map((file, i) => {
      const bubble: ChatBubbleType = {
        id: `file-${Date.now()}-${i}`,
        title: file.name,
        messages: [],
        position: {
          x: position.x + i * 20,
          y: position.y + i * 20,
        },
        file,
        isShrunk: true,
        type: 'file',
        fileUrl: URL.createObjectURL(file),
      };
      return {
        id: bubble.id,
        type: 'chatBubble',
        position: bubble.position,
        data: { bubble, onRemove: removeNode, onToggleShrink: toggleShrink },
      };
    });
    setNodes((nds) => [...nds, ...newNodes]);
  };
  
  const setViewMode = (mode: ViewMode) => {
    setBoardState(prev => ({ ...prev, viewMode: mode }));
  };

  const sourceNode = nodes.find(node => node.id === edgeToDisconnect?.source);
  const targetNode = nodes.find(node => node.id === edgeToDisconnect?.target);

  return (
    <div className="flex h-screen w-full bg-slate-900">
      <Sidebar
        boards={allBoards}
        onSelectBoard={() => {}}
        selectedLLM={selectedLLM}
        onSelectLLM={setSelectedLLM}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <BoardHeader
          boardName={boardState.name}
          setViewMode={setViewMode}
          viewMode={boardState.viewMode}
          onToggleGuide={() => setShowGuide(!showGuide)}
        />
        <main
          ref={reactFlowWrapper}
          className="relative flex-1"
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {showGuide && <Guide onClose={() => setShowGuide(false)} />}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            isValidConnection={isValidConnection}
            fitView
          >
            <Controls style={{ top: 20, right: 20, left: 'auto', bottom: 'auto' }} />
            <Background />
          </ReactFlow>
        </main>
        <Composer bubbles={boardState.bubbles} onSendMessage={handleSendMessage} />
      </div>
      <DisconnectModal 
        isOpen={isDisconnectModalOpen}
        onClose={() => setDisconnectModalOpen(false)}
        onConfirm={confirmDisconnect}
        fileName={sourceNode?.data.bubble.title ?? ''}
        nodeTitle={targetNode?.data.bubble.title ?? ''}
      />
    </div>
  );
}

export default function AppContainer() {
  return (
    <ReactFlowProvider>
      <FlowBoard />
    </ReactFlowProvider>
  );
}