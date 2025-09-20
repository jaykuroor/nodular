'use client';

import React,
{
    useState,
    useRef,
    useEffect,
    useCallback
} from 'react';

import {
    ReactFlow,
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
} from '@xyflow/react';

import type { NodeHandle } from '@xyflow/system';

import { BoardState, Message, ChatBubbleType, LLMProvider, ViewMode } from '../types';
import Sidebar from './Sidebar';
import BoardHeader from './BoardHeader';
import Composer from './Composer';
import Guide from './Guide';
import ChatBubbleNode from './ChatBubbleNode';
import DisconnectModal from './DisconnectModal';
import ButtonEdge from './ButtonEdge';
import SystemNode from './SystemPromptNode';
import Watermark from './Watermark';

const initialBoard: BoardState = {
    id: 'board-1',
    name: 'State Management Research',
    bubbles: [
        {
            id: 'bubble-0',
            title: 'System Prompt',
            position: { x: 0, y: 0 },
            messages: [{ id: 'msg-0-1', text: 'You are a helpful assistant specializing in frontend development.', sender: 'human', timestamp: '4:00 PM' }],
            isShrunk: false,
            type: 'system',
            llm: 'gpt-oss-120b',
            temperature: 0.7,
            handles: [],
        },
        {
            id: 'bubble-1',
            title: 'Initial Query',
            position: { x: 600, y: 310 },
            messages: [
                { id: 'msg-1-1', text: 'What are the most popular state management libraries for React in 2025?', sender: 'human', timestamp: '4:01 PM' },
            ],
            isShrunk: false,
            type: 'message',
            parentId: 'bubble-0', // Connect to System Prompt
            handles: [],
        },
        {
            id: 'bubble-2',
            title: 'Zustand Deep Dive',
            parentId: 'bubble-1',
            position: { x: 0, y: 620 },
            messages: [
                { id: 'msg-2-1', text: 'Tell me more about Zustand. Why is it gaining popularity?', sender: 'ai', timestamp: '4:03 PM' },
            ],
            isShrunk: false,
            type: 'message',
            handles: [],
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
    system: SystemNode,
};

const getClosestConnectionPoint = (sourceNode: Node<{ bubble: ChatBubbleType }>, targetNode: Node<{ bubble: ChatBubbleType }>) => {
    const sourceBubble = sourceNode.data.bubble;
    const targetBubble = targetNode.data.bubble;

    let sourceHandles = sourceBubble.handles.filter(h => h.type === 'source');
    let targetHandles = targetBubble.handles.filter(h => h.type === 'target');

    let minDistance = Infinity;
    let bestConnection = { sourceHandle: null, targetHandle: null };

    const getHandleCoord = (node: Node<{ bubble: ChatBubbleType }>, handle: any) => {
        const { x, y } = node.position;
        const width = node.width || 0;
        const height = node.height || 0;

        switch (handle.position) {
            case Position.Top:
                return { x: x + width / 2, y };
            case Position.Right:
                return { x: x + width, y: y + height / 2 };
            case Position.Bottom:
                return { x: x + width / 2, y: y + height };
            case Position.Left:
                return { x, y: y + height / 2 };
            default: return { x, y };
        }
    };

    sourceHandles.forEach(sourceHandle => {
        targetHandles.forEach(targetHandle => {
            const sourcePos = getHandleCoord(sourceNode, sourceHandle);
            const targetPos = getHandleCoord(targetNode, targetHandle);
            const distance = Math.sqrt(Math.pow(sourcePos.x - targetPos.x, 2) + Math.pow(sourcePos.y - targetPos.y, 2));

            if (distance < minDistance) {
                minDistance = distance;
                bestConnection = {
                    sourceHandle: sourceHandle.id,
                    targetHandle: targetHandle.id,
                };
            }
        });
    });

    return bestConnection;
};


function FlowBoard() {
    const [boardState, setBoardState] = useState<BoardState>(initialBoard);
    const [nodes, setNodes] = useState<Node<{ bubble: ChatBubbleType }>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedLLM, setSelectedLLM] = useState<LLMProvider>('gpt-oss-120b');
    const [showGuide, setShowGuide] = useState(true);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const reactFlowInstance = useReactFlow();

    const [isDisconnectModalOpen, setDisconnectModalOpen] = useState(false);
    const [edgeToDisconnect, setEdgeToDisconnect] = useState<Edge | null>(null);
    const [connectingNode, setConnectingNode] = useState<any>(null);
    const [targetNode, setTargetNode] = useState<Node<{ bubble: ChatBubbleType }> | null>(null);

    const onNodesChange: OnNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds as Node[]) as Node<{ bubble: ChatBubbleType }>[]); // ensure correct type
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
            const nodeType = node.data.bubble.type;
            setConnectingNode({
                id: nodeId,
                type: nodeType,
            });
            if (nodeType === 'file') {
                document.body.classList.add('connecting-file');
            } else if (nodeType === 'system') {
                document.body.classList.add('connecting-system');
            }
        }
    };

    const onConnectEnd = (event: any) => {
        const sourceNode = nodes.find((n) => n.id === connectingNode?.id);

        if (sourceNode && targetNode) {
            if (isValidConnection({ source: sourceNode.id, target: targetNode.id, sourceHandle: null, targetHandle: null })) {
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

        if (connectingNode?.type === 'file') {
            document.body.classList.remove('connecting-file');
        } else if (connectingNode?.type === 'system') {
            document.body.classList.remove('connecting-system');
        }
        setConnectingNode(null);
        setTargetNode(null);
    };

    const isValidConnection = (params: Edge | Connection) => {
        if (!params.source || !params.target) return false;

        const sourceNode = nodes.find(node => node.id === params.source);
        const targetNode = nodes.find(node => node.id === params.target);

        if (!sourceNode || !targetNode) return false;

        const sourceBubble = sourceNode.data.bubble;
        const targetBubble = targetNode.data.bubble;

        const connectionExists = edges.some(
            (edge) =>
                (edge.source === params.source && edge.target === params.target) ||
                (edge.source === params.target && edge.target === params.source)
        );

        if (connectionExists) return false;

        // File node -> Prompt Node
        if (sourceBubble.type === 'file' && targetBubble.type === 'message' && targetBubble.messages[0]?.sender === 'human') {
            return true;
        }

        // System Prompt Node -> Prompt Node
        if (sourceBubble.type === 'system' && targetBubble.type === 'message' && targetBubble.messages[0]?.sender === 'human') {
            return true;
        }

        // Prompt Node -> Response Node
        if (sourceBubble.type === 'message' && sourceBubble.messages[0]?.sender === 'human' && targetBubble.type === 'message' && targetBubble.messages[0]?.sender === 'ai') {
            return true;
        }

        // Response Node -> Prompt Node
        if (sourceBubble.type === 'message' && sourceBubble.messages[0]?.sender === 'ai' && targetBubble.type === 'message' && targetBubble.messages[0]?.sender === 'human') {
            return true;
        }

        return false;
    };

    const onConnect: OnConnect = useCallback(
        (connection) => {
            if (isValidConnection(connection)) {
                const sourceNode = nodes.find(node => node.id === connection.source);

                let edgeStyle = { stroke: '#3b82f6', strokeWidth: 2 }; // Default blue
                let edgeType = 'smoothstep';
                let edgeData = {};

                if (sourceNode?.data.bubble.type === 'file') {
                    edgeType = 'buttonedge';
                    edgeStyle = { stroke: '#3b82f6', strokeWidth: 2 };
                    edgeData = {
                        onEdgeClick: (id: string) => {
                            const edge = edges.find(e => e.id === id);
                            if (edge) {
                                setEdgeToDisconnect(edge);
                                setDisconnectModalOpen(true);
                            }
                        }
                    };
                } else if (sourceNode?.data.bubble.type === 'system') {
                    edgeStyle = { stroke: '#ffffff', strokeWidth: 2 }; // White for system
                } else if (sourceNode?.data.bubble.messages[0]?.sender === 'ai') {
                    edgeStyle = { stroke: '#10b981', strokeWidth: 2 }; // Green for AI
                }

                setEdges((eds) => addEdge({
                    ...connection,
                    type: edgeType,
                    style: edgeStyle,
                    animated: sourceNode?.data.bubble.type === 'file',
                    data: edgeData
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

    const onEdgeClick = (edgeId: string) => {
        const edge = edges.find(e => e.id === edgeId);
        if (edge) {
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

    const addNode = useCallback((parentNodeId: string) => {
        setBoardState(prev => {
            const parentNode = prev.bubbles.find(b => b.id === parentNodeId);
            if (!parentNode) return prev;

            const parentNodePosition = parentNode.position;
            const parentNodeHeight = 100; // Estimate or get from rendered node

            const newPosition = {
                x: parentNodePosition.x,
                y: parentNodePosition.y + parentNodeHeight + 100,
            };

            const newBubble: ChatBubbleType = {
                id: `bubble-${Date.now()}`,
                title: 'New Prompt',
                messages: [{
                    id: `msg-${Date.now()}`,
                    text: 'New prompt...',
                    sender: 'human',
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
                }],
                position: newPosition,
                isShrunk: false,
                type: 'message',
                parentId: parentNode.id,
                handles: [],
            };

            return { ...prev, bubbles: [...prev.bubbles, newBubble] };
        });
    }, [setBoardState]);

    const removeNode = useCallback((nodeId: string) => {
        setBoardState(prev => ({
            ...prev,
            bubbles: prev.bubbles.filter(bubble => bubble.id !== nodeId)
        }));
    }, [setBoardState]);

    const toggleShrink = useCallback((nodeId: string) => {
        setBoardState(prev => ({
            ...prev,
            bubbles: prev.bubbles.map(bubble => {
                if (bubble.id === nodeId) {
                    return { ...bubble, isShrunk: !bubble.isShrunk };
                }
                return bubble;
            })
        }));
    }, [setBoardState]);

    const updateSystemNode = useCallback((nodeId: string, prompt: string, temperature: number, llm: LLMProvider) => {
        setBoardState(prev => ({
            ...prev,
            bubbles: prev.bubbles.map(bubble => {
                if (bubble.id === nodeId && bubble.type === 'system') {
                    return {
                        ...bubble,
                        messages: [{ ...bubble.messages[0], text: prompt }],
                        temperature,
                        llm,
                    };
                }
                return bubble;
            })
        }));
    }, [setBoardState]);


    const edgeTypes = {
        buttonedge: (props: any) => <ButtonEdge {...props} data={{ ...props.data, onEdgeClick }} />,
    };

    useEffect(() => {
        const bubblesWithHandles = boardState.bubbles.map(bubble => {
            const newHandles: NodeHandle[] = [];
            const isHuman = bubble.messages[0]?.sender === 'human';
            const isAI = bubble.messages[0]?.sender === 'ai';

            if (isAI || (isHuman && bubble.type !== 'file')) {
                newHandles.push({ id: `${bubble.id}-top`, type: 'target', position: Position.Top });
            }
            if (bubble.type === 'file') {
                newHandles.push({ id: `${bubble.id}-top`, type: 'source', position: Position.Top });
                newHandles.push({ id: `${bubble.id}-right`, type: 'source', position: Position.Right });
                newHandles.push({ id: `${bubble.id}-bottom`, type: 'source', position: Position.Bottom });
                newHandles.push({ id: `${bubble.id}-left`, type: 'source', position: Position.Left });
            }
            if (bubble.type === 'message') {
                newHandles.push({ id: `${bubble.id}-left`, type: 'target', position: Position.Left });
                newHandles.push({ id: `${bubble.id}-right`, type: 'target', position: Position.Right });
            }
            if (isHuman || isAI) {
                newHandles.push({ id: `${bubble.id}-bottom`, type: 'source', position: Position.Bottom });
            }
            if (bubble.type === 'system') {
                newHandles.push({ id: `${bubble.id}-top`, type: 'source', position: Position.Top });
                newHandles.push({ id: `${bubble.id}-right`, type: 'source', position: Position.Right });
                newHandles.push({ id: `${bubble.id}-left`, type: 'source', position: Position.Left });
                newHandles.push({ id: `${bubble.id}-bottom`, type: 'source', position: Position.Bottom });
                newHandles.push({ id: `${bubble.id}-bottom-button`, type: 'source', position: Position.Bottom });
            }
            return { ...bubble, handles: newHandles };
        });

        const initialNodes = bubblesWithHandles.map((bubble) => {
            let nodeType = 'chatBubble';
            if (bubble.type === 'system') {
                nodeType = 'system';
            }

            return {
                id: bubble.id,
                type: nodeType,
                position: bubble.position,
                data: {
                    bubble,
                    onRemove: removeNode,
                    onToggleShrink: toggleShrink,
                    onAddNode: addNode,
                    isConnecting: !!connectingNode,
                    connectingNode,
                    onUpdateSystemNode: updateSystemNode
                },
            };
        });

        const initialEdges = bubblesWithHandles
            .filter((bubble) => bubble.parentId)
            .map((bubble): Edge | null => {
                const parentBubble = bubblesWithHandles.find(b => b.id === bubble.parentId);
                if (parentBubble?.type === 'system') { return null; }
                let edgeStyle = {};
                const sourceNode = initialNodes.find(n => n.id === bubble.parentId);
                const targetNode = initialNodes.find(n => n.id === bubble.id);

                if (!sourceNode || !targetNode) return null;

                const { sourceHandle, targetHandle } = getClosestConnectionPoint(
                    sourceNode as Node<{ bubble: ChatBubbleType }>,
                    targetNode as Node<{ bubble: ChatBubbleType }>
                );

                if (parentBubble?.messages[0]?.sender === 'human') {
                    edgeStyle = { stroke: '#3b82f6', strokeWidth: 2 };
                } else if (parentBubble?.messages[0]?.sender === 'ai') {
                    edgeStyle = { stroke: '#10b981', strokeWidth: 2 };
                }

                return {
                    id: `e-${bubble.parentId}-${bubble.id}`,
                    source: bubble.parentId!,
                    target: bubble.id,
                    sourceHandle: sourceHandle,
                    targetHandle: targetHandle,
                    type: 'smoothstep',
                    style: edgeStyle,
                };
            }).filter((edge): edge is Edge => edge !== null);

        const systemEdges = bubblesWithHandles
            .filter((bubble) => bubble.parentId)
            .map((bubble): Edge | null => {
                const parentBubble = bubblesWithHandles.find(b => b.id === bubble.parentId);
                if (parentBubble?.type !== 'system') { return null; }
                const sourceNode = initialNodes.find(n => n.id === bubble.parentId);
                const targetNode = initialNodes.find(n => n.id === bubble.id);

                if (sourceNode && targetNode) {
                    const { sourceHandle, targetHandle } = getClosestConnectionPoint(
                        sourceNode as Node<{ bubble: ChatBubbleType }>,
                        targetNode as Node<{ bubble: ChatBubbleType }>
                    );
                    return {
                        id: `e-${bubble.parentId}-${bubble.id}`,
                        source: bubble.parentId!,
                        target: bubble.id,
                        sourceHandle: sourceHandle,
                        targetHandle: targetHandle,
                        type: 'smoothstep',
                        style: { stroke: '#ffffff', strokeWidth: 2 },
                    };
                }
                return null;
            }).filter((edge): edge is Edge => edge !== null);

        const fileEdges = bubblesWithHandles
            .filter(bubble => bubble.connectedTo)
            .map((bubble): Edge | null => {
                const sourceNode = initialNodes.find(n => n.id === bubble.id);
                const targetNode = initialNodes.find(n => n.id === bubble.connectedTo);

                if (sourceNode && targetNode) {
                    const { sourceHandle, targetHandle } = getClosestConnectionPoint(
                        sourceNode as Node<{ bubble: ChatBubbleType }>,
                        targetNode as Node<{ bubble: ChatBubbleType }>
                    );
                    return {
                        id: `e-${bubble.id}-${bubble.connectedTo}`,
                        source: bubble.id,
                        target: bubble.connectedTo!,
                        sourceHandle: sourceHandle,
                        targetHandle: targetHandle,
                        type: 'buttonedge',
                        style: { stroke: '#3b82f6', strokeWidth: 2 },
                        animated: true,
                        data: { onEdgeClick }
                    }
                }
                return null;
            }).filter((edge): edge is Edge => edge !== null);

        setNodes(initialNodes);
        setEdges([...initialEdges, ...systemEdges, ...fileEdges]);
    }, [boardState.bubbles, removeNode, toggleShrink, connectingNode, addNode, updateSystemNode]);

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
            handles: [],
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
        const position = reactFlowInstance.screenToFlowPosition({
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
            handles: [],
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

    const proOptions = { hideAttribution: true };

    return (
        <div className="flex h-screen w-full bg-slate-900">
            <Sidebar
                boards={allBoards}
                onSelectBoard={() => { }}
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
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        isValidConnection={isValidConnection}
                        onNodeDragStop={onNodeDragStop}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}
                        onNodeMouseEnter={(_: React.MouseEvent, node: Node<any>) => setTargetNode(node as Node<{ bubble: ChatBubbleType }>)}
                        onNodeMouseLeave={() => setTargetNode(null)}
                        fitView
                        panOnDrag={!nodes.some(n => n.selected)}
                        proOptions={proOptions}
                    >
                        <Watermark />
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