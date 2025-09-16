'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    },
    {
      id: 'bubble-2',
      title: 'Zustand Deep Dive',
      sourceMessageId: 'msg-1-1',
      position: { x: 520, y: 80 },
      messages: [
        { id: 'msg-2-1', text: 'Tell me more about Zustand. Why is it gaining popularity?', sender: 'llm', timestamp: '4:03 PM' },
      ],
      isShrunk: false,
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

    board.addEventListener('wheel', handleWheel, { passive: false });
    return () => board.removeEventListener('wheel', handleWheel);
  }, [transform]);

  const handleDrag = (bubbleId: string, data: { x: number, y: number }) => {
    setBoardState(prev => ({
      ...prev,
      bubbles: prev.bubbles.map(b =>
        b.id === bubbleId ? { ...b, position: { x: data.x, y: data.y } } : b
      )
    }));
  };
  
  const handleSendMessage = (text: string, bubbleId: string) => {
    // ... (rest of the function is the same)
  };

  const handleAddNode = (sourceMessageId: string) => {
    // ... (rest of the function is the same)
  };

  const handleSelectBoard = (boardId: string) => {
    // ... (rest of the function is the same)
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const newBubbles = files.map((file, i) => ({
      id: `file-${Date.now()}-${i}`,
      title: file.name,
      messages: [],
      position: { x: e.clientX, y: e.clientY },
      file,
      isShrunk: false,
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
        >
          {showGuide && <Guide onClose={() => setShowGuide(false)} />}
          <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`, transformOrigin: '0 0' }}>
            <Xwrapper>
              {boardState.bubbles.map(bubble => (
                <DraggableBubble
                  key={bubble.id}
                  bubble={bubble}
                  onAddNode={handleAddNode}
                  onToggleShrink={() => toggleShrink(bubble.id)}
                  viewMode={boardState.viewMode}
                  onDrag={(e, data) => handleDrag(bubble.id, data)}
                  onRemove={removeBubble}
                />
              ))}
              {boardState.bubbles.map(bubble => {
                if (bubble.sourceMessageId) {
                  const sourceBubble = boardState.bubbles.find(b => b.messages.some(m => m.id === bubble.sourceMessageId));
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
                      />
                    );
                  }
                }
                return null;
              })}
            </Xwrapper>
          </div>
        </main>
        <Composer bubbles={boardState.bubbles} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}