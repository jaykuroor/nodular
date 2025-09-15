import type { CSSProperties } from 'react';

export default function BubbleMenu() {
  return (
    <>
      {/* Dotted Background */}
      <style>{`
        .bubble-menu-background {
          position: fixed;
          inset: 0;
          z-index: -1;
          background: radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
      <div className="bubble-menu-background" />
    </>
  );
}