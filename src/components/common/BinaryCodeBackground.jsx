"use client";

import React, { useEffect, useState } from 'react';

const BINARY_ROWS = 18;
const BINARY_COLS = 64;
const COLUMN_SPEEDS = Array.from({ length: BINARY_COLS }, (_, col) => (col % 5) + 1);
const COLUMN_OFFSETS = Array.from({ length: BINARY_COLS }, (_, col) => (col * 7) % 19);

const BINARY_CSS = `
.uc-binary-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  color: rgba(255, 255, 255, 0.16);
  font-family: "Courier New", monospace;
  font-size: clamp(11px, 1.1vw, 14px);
  line-height: 1.85;
  letter-spacing: 0.3em;
  white-space: nowrap;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0));
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0));
}

.uc-binary-bg__row {
  width: max-content;
  min-width: 112%;
  transform: translateX(-6%);
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.uc-binary-bg__cell {
  display: inline-block;
  min-width: 1ch;
  text-align: center;
}
`;

export default function BinaryCodeBackground() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFrame((prev) => (prev + 1) % 100000);
    }, 260);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <>
      <style>{BINARY_CSS}</style>
      <div className="uc-binary-bg" aria-hidden="true">
        {Array.from({ length: BINARY_ROWS }, (_, row) => (
          <div key={row} className="uc-binary-bg__row">
            {Array.from({ length: BINARY_COLS }, (_, col) => {
              const phase = frame * COLUMN_SPEEDS[col] + COLUMN_OFFSETS[col] + row * 3;
              const char = (phase + Math.floor(phase / 3) + col) % 2 === 0 ? '1' : '0';

              return (
                <span key={col} className="uc-binary-bg__cell">
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
