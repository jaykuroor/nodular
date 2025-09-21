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

import { BoardState, Message, ChatBubbleType, LLMProvider, ViewMode } from '../types';
import Sidebar from './Sidebar';
import BoardHeader from './BoardHeader';
import Guide from './Guide';
import ChatBubbleNode from './ChatBubbleNode';
import DisconnectModal from './DisconnectModal';
import ButtonEdge from './ButtonEdge';
import SystemNode from './SystemPromptNode';
import Watermark from './Watermark';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

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
    const sourceElement = document.getElementById(sourceNode.id);
    const targetElement = document.getElementById(targetNode.id);

    let sourceHandles: string[] = [`${sourceNode.id}-bottom`];
    let targetHandles: string[] = [`${targetNode.id}-top`];

    if (!sourceElement || !targetElement) {
        return { sourceHandle: sourceHandles[0], targetHandle: targetHandles[0] };
    }

    if (sourceNode.data.bubble.type === 'file') {
        sourceHandles = ['top', 'right', 'bottom', 'left'].map(pos => `${sourceNode.id}-${pos}`);
    } else if (sourceNode.data.bubble.type === 'system') {
        sourceHandles = ['right', 'top', 'left', 'bottom'].map(pos => `${sourceNode.id}-${pos}`);
    }

    if (targetNode.data.bubble.type === 'message' && targetNode.data.bubble.messages[0]?.sender === 'human') {
        if (sourceNode.data.bubble.type === 'system' || (sourceNode.data.bubble.type === 'message' && sourceNode.data.bubble.messages[0]?.sender === 'ai')) {
            targetHandles = [`${targetNode.id}-top`];
        } else {
            targetHandles = ['top', 'right', 'left'].map(pos => `${targetNode.id}-${pos}`);
        }
    } else if (targetNode.data.bubble.type === 'message' && targetNode.data.bubble.messages[0]?.sender === 'ai') {
        targetHandles = ['right', 'left', 'top'].map(pos => `${targetNode.id}-${pos}`);
    }


    let minDistance = Infinity;
    let bestConnection = { sourceHandle: sourceHandles[0], targetHandle: targetHandles[0] };

    const getHandleCoords = (node: Node, handleId: string) => {
        const handlePosition = handleId.split('-').pop();
        const nodeElement = document.getElementById(node.id);
        if (!nodeElement) return { x: node.position.x, y: node.position.y };
        const nodeWidth = nodeElement.offsetWidth;
        const nodeHeight = nodeElement.offsetHeight;

        switch (handlePosition) {
            case 'top':
                return { x: node.position.x + nodeWidth / 2, y: node.position.y };
            case 'bottom':
                return { x: node.position.x + nodeWidth / 2, y: node.position.y + nodeHeight };
            case 'left':
                return { x: node.position.x, y: node.position.y + nodeHeight / 2 };
            case 'right':
                return { x: node.position.x + nodeWidth, y: node.position.y + nodeHeight / 2 };
            default:
                return { x: node.position.x, y: node.position.y };
        }
    };


    sourceHandles.forEach(sourceHandle => {
        targetHandles.forEach(targetHandle => {
            const sourceCoords = getHandleCoords(sourceNode, sourceHandle);
            const targetCoords = getHandleCoords(targetNode, targetHandle);

            const distance = Math.sqrt(Math.pow(sourceCoords.x - targetCoords.x, 2) + Math.pow(sourceCoords.y - targetCoords.y, 2));

            if (distance < minDistance) {
                minDistance = distance;
                bestConnection = {
                    sourceHandle: sourceHandle,
                    targetHandle: targetHandle,
                };
            }
        });
    });

    return bestConnection;
};


function FlowBoard() {
    const [boardState, setBoardState] = useState<BoardState>(initialBoard);
    const [nodes, setNodes] = useState<Node<{ bubble: ChatBubbleType, onUpdateText: (text: string) => void, isSelected: boolean }>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedLLM, setSelectedLLM] = useState<LLMProvider>('gpt-oss-120b');
    const [showGuide, setShowGuide] = useState(true);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const reactFlowInstance = useReactFlow();

    const [isDisconnectModalOpen, setDisconnectModalOpen] = useState(false);
    const [edgeToDisconnect, setEdgeToDisconnect] = useState<Edge | null>(null);
    const [connectingNode, setConnectingNode] = useState<any>(null);
    const [targetNode, setTargetNode] = useState<Node<{ bubble: ChatBubbleType }> | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const onNodesChange: OnNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds as Node[]) as Node<{ bubble: ChatBubbleType, onUpdateText: (text: string) => void, isSelected: boolean }>[]);
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
                    text: '',
                    sender: 'human',
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
                }],
                position: newPosition,
                isShrunk: false,
                type: 'message',
                parentId: parentNode.id
            };

            setSelectedNodeId(newBubble.id);
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

    const onUpdateNodeText = useCallback((nodeId: string, text: string) => {
        setBoardState(prev => ({
            ...prev,
            bubbles: prev.bubbles.map(bubble => {
                if (bubble.id === nodeId) {
                    const newMessages = [...bubble.messages];
                    newMessages[0] = { ...newMessages[0], text };
                    return { ...bubble, messages: newMessages };
                }
                return bubble;
            })
        }));
    }, [setBoardState]);

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    };

    const edgeTypes = {
        buttonedge: (props: any) => <ButtonEdge {...props} data={{ ...props.data, onEdgeClick }} />,
    };

    useEffect(() => {
        const initialNodes = boardState.bubbles.map((bubble) => {
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
                    onUpdateSystemNode: updateSystemNode,
                    onUpdateText: (text: string) => onUpdateNodeText(bubble.id, text),
                    isSelected: selectedNodeId === bubble.id,
                },
                className: selectedNodeId === bubble.id ? 'selected-node' : '',
            };
        });

        const allNodesForEdges = initialNodes.map(n => ({...n, data: { bubble: n.data.bubble }}));

        const initialEdges = boardState.bubbles
            .filter((bubble) => bubble.parentId)
            .map((bubble): Edge | null => {
                const parentBubble = boardState.bubbles.find(b => b.id === bubble.parentId);
                if (parentBubble?.type === 'system') { return null; }
                let edgeStyle = {};
                const sourceNode = allNodesForEdges.find(n => n.id === bubble.parentId);
                const targetNode = allNodesForEdges.find(n => n.id === bubble.id);

                if (!sourceNode || !targetNode) return null;

                const { sourceHandle, targetHandle } = getClosestConnectionPoint(
                    sourceNode as Node<{ bubble: ChatBubbleType }>,
                    targetNode as Node<{ bubble: ChatBubbleType }>
                );

                if (parentBubble?.messages[0]?.sender === 'human') {
                    edgeStyle = { stroke: '#3b82f6', strokeWidth: 2 };
                } else if (parentBubble?.messages[0]?.sender === 'ai') {
                    edgeStyle = { stroke: '#ffffff', strokeWidth: 2 };
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

        const systemEdges = boardState.bubbles
            .filter((bubble) => bubble.parentId)
            .map((bubble): Edge | null => {
                const parentBubble = boardState.bubbles.find(b => b.id === bubble.parentId);
                if (parentBubble?.type !== 'system') { return null; }
                const sourceNode = allNodesForEdges.find(n => n.id === bubble.parentId);
                const targetNode = allNodesForEdges.find(n => n.id === bubble.id);

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

        const fileEdges = boardState.bubbles
            .filter(bubble => bubble.connectedTo)
            .map((bubble): Edge | null => {
                const sourceNode = allNodesForEdges.find(n => n.id === bubble.id);
                const targetNode = allNodesForEdges.find(n => n.id === bubble.connectedTo);

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

        setNodes(initialNodes as Node<{ bubble: ChatBubbleType, onUpdateText: (text: string) => void, isSelected: boolean }>[]);
        setEdges([...initialEdges, ...systemEdges, ...fileEdges]);
    }, [boardState.bubbles, removeNode, toggleShrink, connectingNode, addNode, updateSystemNode, selectedNodeId]);


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
            fileUrl: URL.createObjectURL(file)
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

    const handleNext = () => {
        if (!selectedNodeId) return;
        const children = edges.filter(edge => edge.source === selectedNodeId).map(edge => edge.target);
        if (children.length === 1) {
            setSelectedNodeId(children[0]);
        }
    };

    const handlePrev = () => {
        if (!selectedNodeId) return;
        const parentEdge = edges.find(edge => edge.target === selectedNodeId);
        if (parentEdge) {
            setSelectedNodeId(parentEdge.source);
        }
    };

    const handleAddPrompt = () => {
        if (!selectedNodeId) return;
        addNode(selectedNodeId);
    };

    const selectedNode = nodes.find(node => node.id === selectedNodeId)?.data.bubble;
    const childrenCount = selectedNode ? edges.filter(edge => edge.source === selectedNodeId).length : 0;
    const isResponseNode = selectedNode?.type === 'message' && selectedNode.messages[0]?.sender === 'ai';

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
                        onNodeClick={onNodeClick}
                        fitView
                        panOnDrag={!nodes.some(n => n.selected)}
                        proOptions={proOptions}
                    >
                        <Watermark />
                        <Controls style={{ top: 20, right: 20, left: 'auto', bottom: 'auto' }} />
                        <Background />
                    </ReactFlow>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                        <button onClick={handlePrev} className="glass-pane p-2 rounded-full hover:!bg-blue-700 hover:cursor-pointer hover:scale-110"><ChevronLeft /></button>
                        {isResponseNode && (
                            <button onClick={handleAddPrompt} className="glass-pane p-2 rounded-full hover:!bg-blue-700 hover:cursor-pointer hover:scale-110"><Plus /></button>
                        )}
                        {(!isResponseNode || childrenCount <= 1) && (
                            <button onClick={handleNext} className="glass-pane p-2 rounded-full hover:!bg-blue-700 hover:cursor-pointer hover:scale-110"><ChevronRight /></button>
                        )}
                    </div>
                </main>
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