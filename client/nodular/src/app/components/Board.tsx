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
  NodeChange,
  OnConnectStartParams,
  Position,
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
      position: { x: 400, y: 50 },
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
      position: { x: 50, y: 400 },
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

const getClosestConnectionPoint = (sourceNode: Node, targetNode: Node) => {
    const sourceHandles = [Position.Top, Position.Right, Position.Bottom, Position.Left];
    const targetHandles = ['file-left', 'file-right'];

    let minDistance = Infinity;
    let bestConnection = { sourceHandle: 'bottom', targetHandle: 'file-left' };

    const getHandlePosition = (node: Node, handle: Position | string) => {
        const { x, y } = node.position;
        const { width, height } = node;

        switch (handle) {
            case Position.Top: return { x: x + width! / 2, y };
            case Position.Right:
            case 'file-right': 
                return { x: x + width!, y: y + height! / 2 };
            case Position.Bottom: return { x: x + width! / 2, y: y + height! };
            case Position.Left:
            case 'file-left': 
                return { x, y: y + height! / 2 };
            default: return { x, y };
        }
    };

    sourceHandles.forEach(sourceHandle => {
        targetHandles.forEach(targetHandle => {
            const sourcePos = getHandlePosition(sourceNode, sourceHandle);
            const targetPos = getHandlePosition(targetNode, targetHandle);
            const distance = Math.sqrt(Math.pow(sourcePos.x - targetPos.x, 2) + Math.pow(sourcePos.y - targetPos.y, 2));

            if (distance < minDistance) {
                minDistance = distance;
                bestConnection = { sourceHandle, targetHandle };
            }
        });
    });

    return bestConnection;
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
  const [connectingNode, setConnectingNode] = useState<any>(null);
  const [targetNode, setTargetNode] = useState<Node | null>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onNodeDragStop = (_: React.MouseEvent, node: Node) => {
    setBoardState((prev) => ({
      ...prev,
      bubbles: prev.bubbles.map((bubble) =>
        bubble.id === node.id ? { ...bubble, position: node.position } : bubble
      ),
    }));
  };

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnectStart = (_: any, { nodeId, handleType }: OnConnectStartParams) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setConnectingNode({
        id: nodeId,
        type: node.data.bubble.type,
      });
      if (node.data.bubble.type === 'file') {
        document.body.classList.add('connecting-file');
      }
    }
  };

  const onConnectEnd = (event: any) => {
    if (connectingNode?.type === 'file' && targetNode) {
        const sourceNode = nodes.find((n) => n.id === connectingNode.id);
        if (sourceNode && targetNode) {
            const { sourceHandle, targetHandle } = getClosestConnectionPoint(sourceNode, targetNode);
            const newConnection: Connection = {
                source: connectingNode.id,
                target: targetNode.id,
                sourceHandle,
                targetHandle,
            };
            onConnect(newConnection);
        }
    }
    setConnectingNode(null);
    document.body.classList.remove('connecting-file');
  };
  
  const isValidConnection = (connection: Connection) => {
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);
    
    if (!sourceNode || !targetNode) return false;

    const connectionExists = edges.some(
        (edge) =>
          (edge.source === connection.source && edge.target === connection.target) ||
          (edge.source === connection.target && edge.target === connection.source)
      );

    if (connectionExists) return false;
    
    // Files can only connect to human (prompt) nodes
    if (sourceNode.data.bubble.type === 'file') {
      return targetNode.data.bubble.type === 'message' && 
             targetNode.data.bubble.messages[0]?.sender === 'human';
    }
    
    // Human nodes can connect to AI nodes
    if (sourceNode.data.bubble.type === 'message' && 
        sourceNode.data.bubble.messages[0]?.sender === 'human') {
      return targetNode.data.bubble.type === 'message' && 
             targetNode.data.bubble.messages[0]?.sender === 'ai';
    }
    
    // AI nodes can connect to human nodes
    if (sourceNode.data.bubble.type === 'message' && 
        sourceNode.data.bubble.messages[0]?.sender === 'ai') {
      return targetNode.data.bubble.type === 'message' && 
             targetNode.data.bubble.messages[0]?.sender === 'human';
    }
    
    return false;
  };

  const onConnect: OnConnect = useCallback(
    (connection) => {
        if (isValidConnection(connection)) {
            const sourceNode = nodes.find(node => node.id === connection.source);
            
            let edgeStyle = {};
            let edgeType = 'smoothstep';

            if (sourceNode?.data.bubble.type === 'file') {
                edgeStyle = { stroke: '#3b82f6', strokeWidth: 2 };
            } else if (sourceNode?.data.bubble.messages[0]?.sender === 'human') {
                edgeStyle = { stroke: '#3b82f6', strokeWidth: 2 }; 
            } else if (sourceNode?.data.bubble.messages[0]?.sender === 'ai') {
                edgeStyle = { stroke: '#10b981', strokeWidth: 2 };
            }
            
            setEdges((eds) => addEdge({ 
                ...connection, 
                type: edgeType,
                style: edgeStyle,
                animated: sourceNode?.data.bubble.type === 'file',
            }, eds));
            
            setBoardState(prev => ({
                ...prev,
                bubbles: prev.bubbles.map(bubble => {
                    if (bubble.id === connection.target && sourceNode?.data.bubble.type === 'file') {
                        return {
                            ...bubble,
                            connectedFiles: [...(bubble.connectedFiles || []), connection.source!]
                        };
                    }
                    if (bubble.id === connection.source && sourceNode?.data.bubble.type === 'file') {
                        return {
                            ...bubble,
                            connectedTo: connection.target!
                        };
                    }
                    if (bubble.id === connection.target) {
                        return {
                            ...bubble,
                            parentId: connection.source!
                        };
                    }
                    return bubble;
                })
            }));
        }
    },
    [setEdges, nodes, setBoardState, edges]
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
      
      setBoardState(prev => ({
        ...prev,
        bubbles: prev.bubbles.map(bubble => {
          if (bubble.id === edgeToDisconnect.target) {
            return {
              ...bubble,
              connectedFiles: (bubble.connectedFiles || []).filter(id => id !== edgeToDisconnect.source)
            };
          }
          if (bubble.id === edgeToDisconnect.source) {
            return {
              ...bubble,
              connectedTo: undefined
            };
          }
          return bubble;
        })
      }));
      
      setEdgeToDisconnect(null);
    }
    setDisconnectModalOpen(false);
  };
  
  const removeNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    
    setBoardState(prev => ({
      ...prev,
      bubbles: prev.bubbles.filter(bubble => bubble.id !== nodeId)
    }));
  }, [setNodes, setEdges, setBoardState]);
  
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
    
    setBoardState(prev => ({
      ...prev,
      bubbles: prev.bubbles.map(bubble => {
        if (bubble.id === nodeId) {
          return { ...bubble, isShrunk: !bubble.isShrunk };
        }
        return bubble;
      })
    }));
  }, [setNodes, setBoardState]);

  useEffect(() => {
    const bubbles = boardState.bubbles;
    const initialNodes = bubbles.map((bubble) => ({
      id: bubble.id,
      type: 'chatBubble',
      position: bubble.position,
      data: { bubble, onRemove: removeNode, onToggleShrink: toggleShrink, isConnecting: !!connectingNode, connectingNode },
    }));
    
    const messageChainEdges = bubbles
      .filter((bubble) => bubble.parentId && bubble.type === 'message')
      .map((bubble) => {
        const parentBubble = bubbles.find(b => b.id === bubble.parentId);
        let edgeStyle = {};
        
        if (parentBubble?.messages[0]?.sender === 'human') {
          edgeStyle = { stroke: '#3b82f6', strokeWidth: 2 };
        } else if (parentBubble?.messages[0]?.sender === 'ai') {
          edgeStyle = { stroke: '#10b981', strokeWidth: 2 };
        }
        
        return {
          id: `e-${bubble.parentId}-${bubble.id}`,
          source: bubble.parentId!,
          target: bubble.id,
          type: 'smoothstep',
          style: edgeStyle,
        };
      });
    
    const fileEdges = bubbles
      .filter(bubble => bubble.connectedTo)
      .map(bubble => {
        const sourceNode = nodes.find(n => n.id === bubble.id);
        const targetNode = nodes.find(n => n.id === bubble.connectedTo);
        
        if (sourceNode && targetNode) {
            const { sourceHandle, targetHandle } = getClosestConnectionPoint(sourceNode, targetNode);
            return {
                id: `e-${bubble.id}-${bubble.connectedTo}`,
                source: bubble.id,
                target: bubble.connectedTo!,
                sourceHandle,
                targetHandle,
                type: 'smoothstep',
                style: { stroke: '#3b82f6', strokeWidth: 2 },
                animated: true,
            }
        }
        return null;
      }).filter(Boolean);
    
    setNodes(initialNodes);
    setEdges([...messageChainEdges, ...fileEdges as Edge[]]);
  }, [boardState.bubbles, removeNode, toggleShrink, connectingNode]);

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
    
    setBoardState(prev => ({
      ...prev,
      bubbles: [...prev.bubbles, newBubble]
    }));
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

    const newBubbles: ChatBubbleType[] = files.map((file, i) => ({
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
    }));
    
    setBoardState(prev => ({
      ...prev,
      bubbles: [...prev.bubbles, ...newBubbles]
    }));
  };
  
  const setViewMode = (mode: ViewMode) => {
    setBoardState(prev => ({ ...prev, viewMode: mode }));
  };

  const sourceNodeForModal = nodes.find(node => node.id === edgeToDisconnect?.source);
  const targetNodeForModal = nodes.find(node => node.id === edgeToDisconnect?.target);

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
            onNodeDragStop={onNodeDragStop}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onNodeMouseEnter={(_, node) => setTargetNode(node)}
            onNodeMouseLeave={() => setTargetNode(null)}
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
        fileName={sourceNodeForModal?.data.bubble.title ?? ''}
        nodeTitle={targetNodeForModal?.data.bubble.title ?? ''}
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