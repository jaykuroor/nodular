'use client';

import { useState } from 'react';
import { BoardState, Message, ChatBubbleType, LLMProvider } from '../types';
import Sidebar from './Sidebar';
import BoardHeader from './BoardHeader';
import ChatBubble from './ChatBubble';
import Composer from './Composer';
import BubbleMenu from './BubbleMenu';

// Expanded initial data for a richer demo
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
        { id: 'msg-1-2', text: 'The top contenders are Redux Toolkit, Zustand, Jotai, and Recoil. Each has its own strengths depending on project scale and complexity.', sender: 'llm', timestamp: '4:02 PM' },
      ],
    },
    {
      id: 'bubble-2',
      title: 'Zustand Deep Dive',
      sourceMessageId: 'msg-1-2', // Branched from the first bubble's LLM response
      position: { x: 520, y: 80 },
      messages: [
        { id: 'msg-2-1', text: 'Tell me more about Zustand. Why is it gaining popularity?', sender: 'llm', timestamp: '4:03 PM' },
      ],
    },
  ],
};

const allBoards = [
  { id: 'board-1', name: 'State Management Research' },
  { id: 'board-2', name: 'Q3 Marketing Strategy' },
  { id: 'board-3', name: 'API Design Document' },
];

export default function AppContainer() {
  const [boardState, setBoardState] = useState<BoardState>(initialBoard);
  const [selectedLLM, setSelectedLLM] = useState<LLMProvider>('openai');

  const handleSendMessage = (text: string, bubbleId: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // TBD: This state update should come from a backend response
    setBoardState(prev => ({
      ...prev,
      bubbles: prev.bubbles.map(b => 
        b.id === bubbleId ? { ...b, messages: [...b.messages, newMessage] } : b
      )
    }));
  };

  const handleAddNode = (sourceMessageId: string) => {
    // Find the bubble containing the source message
    const sourceBubble = boardState.bubbles.find(b => b.messages.some(m => m.id === sourceMessageId));
    if (!sourceBubble) return;

    const newBubble: ChatBubbleType = {
      id: `bubble-${Date.now()}`,
      title: 'New Branch',
      sourceMessageId,
      position: { x: sourceBubble.position.x, y: sourceBubble.position.y + 500 }, // Position below source
      messages: [{
        id: `msg-${Date.now()}`,
        text: `Continuing from your last point...`,
        sender: 'llm',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }],
    };

    // TBD: This state update should come from a backend response
    setBoardState(prev => ({ ...prev, bubbles: [...prev.bubbles, newBubble] }));
  };

  const handleSelectBoard = (boardId: string) => {
    // TBD: Fetch board data from backend using boardId
    console.log(`Loading board ${boardId}`);
    // For demo, we just reload the initial state
    setBoardState(initialBoard);
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
        <BoardHeader boardName={boardState.name} />
<main className="relative flex-1 overflow-auto p-8">
  {/* Canvas for bubbles */}
  {boardState.bubbles.map(bubble => (
    <ChatBubble
      key={bubble.id}
      bubble={bubble}
      onAddNode={handleAddNode}
    />
  ))}
</main>
<BubbleMenu/>
        <Composer bubbles={boardState.bubbles} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}