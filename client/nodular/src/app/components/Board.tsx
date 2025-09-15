'use client';

import React, { useState, useRef } from 'react';
import { BoardState, Message, ChatBubbleType, LLMProvider, ViewMode } from '../types';
import Sidebar from './Sidebar';
import BoardHeader from './BoardHeader';
import Composer from './Composer';
import { Xwrapper } from 'react-xarrows';
import Xarrow from 'react-xarrows';
import DraggableBubble from './DraggableBubble'; // Import the new component
import Guide from './Guide'; // We will create this next

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
  const [selectedLLM, setSelectedLLM] = useState<LLMProvider>('openai');
  const [showGuide, setShowGuide] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);

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
    // ... (rest of the function is the same)
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const toggleShrink = (bubbleId: string) => {
    // ... (rest of the function is the same)
  };

  const setViewMode = (mode: ViewMode) => {
    setBoardState(prev => ({ ...prev, viewMode: mode }));
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
          <Xwrapper>
            {boardState.bubbles.map(bubble => (
              <DraggableBubble
                key={bubble.id}
                bubble={bubble}
                onAddNode={handleAddNode}
                onToggleShrink={() => toggleShrink(bubble.id)}
                viewMode={boardState.viewMode}
                onDrag={(e, data) => handleDrag(bubble.id, data)}
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
        </main>
        <Composer bubbles={boardState.bubbles} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}