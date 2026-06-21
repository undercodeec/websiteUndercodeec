"use client";

import React from "react";

export default function DisintegrateDemo() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "500px",
        background: "#000",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="thanos-dissolve" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="4" result="noise">
              <animate
                attributeName="baseFrequency"
                values="0.015;0.05;0.015"
                keyTimes="0;0.55;1"
                dur="7s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G">
              <animate
                attributeName="scale"
                values="0;0;8;60;160;260;0;0"
                keyTimes="0;0.3;0.4;0.5;0.6;0.7;0.78;1"
                dur="7s"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>

      <div className="dissolve-stack">
        <div className="dissolve-card card-a">
          <span className="card-label">EFECTOS PREMIUM</span>
          <h3>Undercodeec</h3>
          <p>Diseño que desafía la gravedad</p>
        </div>
        <div className="dissolve-card card-b">
          <span className="card-label">PARTICLE FX</span>
          <h3>Ash Dissolve</h3>
          <p>Animaciones cinematográficas</p>
        </div>
        <div className="dissolve-card card-c">
          <span className="card-label">MOTION DESIGN</span>
          <h3>Sin límites</h3>
          <p>Webs que se sienten vivas</p>
        </div>
      </div>

      <style jsx>{`
        .dissolve-stack {
          position: relative;
          width: 320px;
          height: 200px;
          filter: url(#thanos-dissolve);
        }
        .dissolve-card {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: white;
          box-shadow: 0 24px 60px rgba(96, 11, 86, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.12);
          opacity: 0;
          animation: thanosCycle 21s ease-in-out infinite;
        }
        .card-a {
          background: linear-gradient(135deg, #600b56 0%, #150e23 100%);
          animation-delay: 0s;
        }
        .card-b {
          background: linear-gradient(135deg, #1a0033 0%, #ff007a 100%);
          animation-delay: 7s;
        }
        .card-c {
          background: linear-gradient(135deg, #0f172a 0%, #6366f1 100%);
          animation-delay: 14s;
        }
        .card-label {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          opacity: 0.75;
          margin-bottom: 8px;
        }
        .dissolve-card h3 {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 6px 0;
        }
        .dissolve-card p {
          font-size: 14px;
          opacity: 0.8;
          margin: 0;
        }
        @keyframes thanosCycle {
          0% { opacity: 0; transform: scale(0.96); }
          5% { opacity: 1; transform: scale(1); }
          30% { opacity: 1; transform: scale(1); }
          37% { opacity: 0; transform: scale(1.02); }
          100% { opacity: 0; transform: scale(0.96); }
        }
      `}</style>
    </div>
  );
}
