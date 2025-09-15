'use client';

import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import ChatBubble from './ChatBubble';
import { ChatBubbleType, ViewMode } from '../types';

interface DraggableBubbleProps {
  bubble: ChatBubbleType;
  onAddNode: (sourceMessageId: string) => void;
  onToggleShrink: () => void;
  viewMode: ViewMode;
  onDrag: (e: any, data: { x: number, y: number }) => void;
}

export default function DraggableBubble({
  bubble,
  onAddNode,
  onToggleShrink,
  viewMode,
  onDrag
}: DraggableBubbleProps) {
  const nodeRef = useRef(null);

  return (
    <Draggable
      key={bubble.id}
      position={bubble.position}
      nodeRef={nodeRef}
      onDrag={onDrag}
    >
      <div ref={nodeRef} style={{ position: 'absolute' }}>
        <ChatBubble
          bubble={bubble}
          onAddNode={onAddNode}
          onToggleShrink={onToggleShrink}
          viewMode={viewMode}
        />
      </div>
    </Draggable>
  );
}