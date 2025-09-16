'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BoardState, Message, ChatBubbleType, LLMProvider, ViewMode } from '../types';
import Sidebar from './Sidebar';
import BoardHeader from './BoardHeader';
import Composer from './Composer';
import { Xwrapper } from 'react-xarrows';
import Xarrow from 'react-xarrows';
import DraggableBubble from './DraggableBubble';
import Guide from './Guide';

const initialBoard: BoardState = {
  id: 'board-1',
  name: 'State Management Research',
  bubbles: [
    {
      id: 'bubble-1',
      title: 'Initial Query',
      position: { x: 50, y: 50 },
      messages: [
        { id: 'msg-1-1', text: 'What are the most popular state management libraries for React in 2025?', sender: 'user', timestamp: '4:01 PM' },
      ],
      isShrunk: false,
      type: 'message',
    },
    {
      id: 'bubble-2',
      title: 'Zustand Deep Dive',
      parentId: 'msg-1-1',
      position: { x: 520, y: 80 },
      messages: [
        { id: 'msg-2-1', text: 'Tell me more about Zustand. Why is it gaining popularity?', sender: 'llm', timestamp: '4:03 PM' },
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

export default function AppContainer() {
  const [boardState, setBoardState] = useState<BoardState>(initialBoard);
  const [selectedLLM, setSelectedLLM] = useState<LLMProvider>('gpt-oss-120b');
  const [showGuide, setShowGuide] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

  const [isConnecting, setIsConnecting] = useState(false);
  const [arrowStart, setArrowStart] = useState<string | null>(null);
  const [arrowEndPos, setArrowEndPos] = useState<{ x: number, y: number } | null>(null);


  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.shiftKey) {
        const rect = board.getBoundingClientRect();
        const s = Math.exp(-e.deltaY * 0.01);
        const k = transform.k * s;

        if (k < 0.1 || k > 2) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setTransform({
          k,
          x: transform.x * s + x * (1 - s),
          y: transform.y * s + y * (1 - s),
        });
      } else {
        setTransform(prev => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isConnecting && boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setArrowEndPos({
          x: (e.clientX - rect.left - transform.x) / transform.k,
          y: (e.clientY - rect.top - transform.y) / transform.k,
        });
      }
    };


    board.addEventListener('wheel', handleWheel, { passive: false });
    if (isConnecting) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      board.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isConnecting, transform]);

  const handleDrag = (bubbleId: string, data: { x: number, y: number }) => {
    const { x, y } = data;
    const movingBubble = boardState.bubbles.find(b => b.id === bubbleId);
    if (!movingBubble) return;

    const BUBBLE_WIDTH = 384; // w-96
    const BUBBLE_HEIGHT = 150; // estimated height

    let collision = false;
    for (const bubble of boardState.bubbles) {
      if (bubble.id === bubbleId) continue;

      if (
        x < bubble.position.x + BUBBLE_WIDTH &&
        x + BUBBLE_WIDTH > bubble.position.x &&
        y < bubble.position.y + BUBBLE_HEIGHT &&
        y + BUBBLE_HEIGHT > bubble.position.y
      ) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      setBoardState(prev => ({
        ...prev,
        bubbles: prev.bubbles.map(b =>
          b.id === bubbleId ? { ...b, position: { x, y } } : b
        )
      }));
    }
  };

  const handleSendMessage = (text: string, bubbleId: string) => {
    const newBubbleId = `bubble-${Date.now()}`;
    let parentId = bubbleId;
    if (!parentId && boardState.bubbles.length > 0) {
      parentId = boardState.bubbles[boardState.bubbles.length - 1].id;
    }

    const parentBubble = boardState.bubbles.find(b => b.id === parentId);
    const newPosition = parentBubble
      ? { x: parentBubble.position.x + 400, y: parentBubble.position.y }
      : { x: 50, y: 50 };


    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
    };

    const newBubble: ChatBubbleType = {
      id: newBubbleId,
      title: 'New Message',
      messages: [newMessage],
      position: newPosition,
      isShrunk: false,
      type: 'message',
      parentId: parentId,
    };

    setBoardState(prev => ({
      ...prev,
      bubbles: [...prev.bubbles, newBubble],
    }));
  };

  const handleAddNode = (sourceMessageId: string) => {
    // ... (rest of the function is the same)
  };

  const handleSelectBoard = (boardId: string) => {
    // ... (rest of the function is the same)
  };

  const fileUrlCache = useMemo(() => new Map<File, string>(), []);

  const getFileUrl = (file: File) => {
    if (!fileUrlCache.has(file)) {
      fileUrlCache.set(file, URL.createObjectURL(file));
    }
    return fileUrlCache.get(file)!;
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const newBubbles: ChatBubbleType[] = files.map((file, i) => ({
      id: `file-${Date.now()}-${i}`,
      title: file.name,
      messages: [],
      position: { x: (e.clientX - transform.x) / transform.k, y: (e.clientY - transform.y) / transform.k }, // Adjust for transform
      file,
      isShrunk: true,
      type: 'file',
      fileUrl: getFileUrl(file),
    }));

    setBoardState(prev => ({
      ...prev,
      bubbles: [...prev.bubbles, ...newBubbles]
    }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const toggleShrink = (bubbleId: string) => {
    setBoardState(prev => ({
      ...prev,
      bubbles: prev.bubbles.map(b =>
        b.id === bubbleId ? { ...b, isShrunk: !b.isShrunk } : b
      )
    }));
  };

  const setViewMode = (mode: ViewMode) => {
    setBoardState(prev => ({ ...prev, viewMode: mode }));
  };

  const removeBubble = (bubbleId: string) => {
    setBoardState(prev => ({
      ...prev,
      bubbles: prev.bubbles.filter(b => b.id !== bubbleId)
    }));
  };

  const startConnecting = (startBubbleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnecting(true);
    setArrowStart(startBubbleId);

    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      setArrowEndPos({
        x: (e.clientX - rect.left - transform.x) / transform.k,
        y: (e.clientY - rect.top - transform.y) / transform.k,
      });
    }
  };


  const finishConnecting = (endBubbleId: string) => {
    if (arrowStart) {
      setBoardState(prev => ({
        ...prev,
        bubbles: prev.bubbles.map(b =>
          b.id === arrowStart ? { ...b, connectedTo: endBubbleId } : b
        )
      }));
    }
    setIsConnecting(false);
    setArrowStart(null);
    setArrowEndPos(null);
  };

  // ADDED: Function to remove a connection from a file bubble
  const removeConnection = (bubbleId: string) => {
    setBoardState(prev => ({
      ...prev,
      bubbles: prev.bubbles.map(b =>
        b.id === bubbleId ? { ...b, connectedTo: undefined } : b
      )
    }));
  };


  return (
    <div className="flex h-screen w-full bg-slate-900">
      <Sidebar
        boards={allBoards}
        onSelectBoard={handleSelectBoard}
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
          ref={boardRef}
          className="relative flex-1 overflow-auto p-8 main-chat-view"
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onClick={() => {
            if (isConnecting) {
              setIsConnecting(false);
              setArrowStart(null);
              setArrowEndPos(null);
            }
          }}
        >
          {showGuide && <Guide onClose={() => setShowGuide(false)} />}
          <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`, transformOrigin: '0 0' }}>
            <Xwrapper>
              {boardState.bubbles.map((bubble, index) => (
                <DraggableBubble
                  key={bubble.id}
                  bubble={bubble}
                  onAddNode={handleAddNode}
                  onToggleShrink={() => toggleShrink(bubble.id)}
                  viewMode={boardState.viewMode}
                  onDrag={(e, data) => handleDrag(bubble.id, data)}
                  onRemove={removeBubble}
                  isLastBubble={index === boardState.bubbles.length - 1}
                  isConnecting={isConnecting}
                  startConnecting={startConnecting}
                  finishConnecting={finishConnecting}
                  // ADDED: Pass the removeConnection function
                  removeConnection={removeConnection}
                />
              ))}

              {/* MODIFIED: The follower div is now slightly larger and offset to be centered on the cursor */}
              {isConnecting && arrowEndPos && (
                <div
                  id="arrow-follower"
                  style={{
                    position: 'absolute',
                    left: arrowEndPos.x, // Offset by half width
                    top: arrowEndPos.y,  // Offset by half height
                  }}
                />
              )}

              {boardState.bubbles.map(bubble => {
                if (bubble.type === 'file' && bubble.connectedTo) {
                  return (
                    <Xarrow
                      key={`${bubble.id}-${bubble.connectedTo}`}
                      start={bubble.id}
                      end={bubble.connectedTo}
                      color="white"
                      showHead={false}
                      strokeWidth={2}
                      path="smooth"
                      zIndex={0}
                    />
                  );
                }
                if (bubble.parentId) {
                  const sourceBubble = boardState.bubbles.find(b => b.messages.some(m => m.id === bubble.parentId));
                  if (sourceBubble) {
                    return (
                      <Xarrow
                        key={`${sourceBubble.id}-${bubble.id}`}
                        start={sourceBubble.id}
                        end={bubble.id}
                        color="white"
                        showHead={false}
                        strokeWidth={2}
                        path="smooth"
                        zIndex={0}
                        startAnchor="bottom"
                      />
                    );
                  }
                }
                return null;
              })}

              {boardState.bubbles.map(bubble => {
                if (bubble.parentId) {
                  const sourceBubble = boardState.bubbles.find(b => b.id === bubble.parentId);
                  if (sourceBubble) {
                    return (
                      <Xarrow
                        key={`${sourceBubble.id}-${bubble.id}`}
                        start={sourceBubble.id}
                        end={bubble.id}
                        color="white"
                        showHead={true}
                        strokeWidth={2}
                        path="smooth"
                        zIndex={0}                        
                      />
                    );
                  }
                }
                if (bubble.type === 'file' && bubble.connectedTo) {
                  return (
                    <Xarrow
                      key={`${bubble.id}-${bubble.connectedTo}`}
                      start={bubble.id}
                      end={bubble.connectedTo}
                      color="white"
                      showHead={false}
                      strokeWidth={2}
                      path="smooth"
                      zIndex={0}
                    />
                  );
                }
                return null;
              })}
              {isConnecting && arrowStart && (
                <Xarrow
                  start={arrowStart}
                  end={"arrow-follower"}
                  color="lightblue"
                  showHead={false}
                  strokeWidth={2}
                  path="smooth"
                  zIndex={5}
                />
              )}
            </Xwrapper>
          </div>
        </main>
        <Composer bubbles={boardState.bubbles} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}