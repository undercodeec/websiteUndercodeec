"use client";

import React, { useState, useEffect, useRef } from "react";

const CARD_VIDEOS = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_030111_a9e15665-d379-4a7f-8116-695bbe452ad1.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_171347_f640c30d-ec21-426a-98bc-77e07c2c60cb.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_115655_b4d9cd77-feed-43cd-a198-af78ebdf1f7a.mp4",
];

const CARD_DETAILS = [
  { number: "4232 8908 1121 4892", name: "ZACHARY MERCER", cvv: "382" },
  { number: "4154 7831 9904 5124", name: "SOPHIA MARTINEZ", cvv: "109" },
  { number: "5457 4120 7733 9035", name: "BENJAMIN CARTER", cvv: "764" },
  { number: "4441 5567 1223 2468", name: "EMILY MORRISON", cvv: "491" },
  { number: "5375 8891 2234 7713", name: "JACKSON REID", cvv: "255" },
];

const thicknessLayers = [-1.47, -0.73, 0, 0.73, 1.47];
const cardCount = 5;
const CARD_W = 280;
const CARD_H = Math.round(280 / 1.5925);

export default function AnimatedCards({ activeRef } = {}) {
  const cardsRefs = useRef([]);
  const frameId = useRef(0);
  const progress = useRef(0);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const containerRef = useRef(null);
  const frameCount = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouse.current.targetX = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      mouse.current.targetY = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
    };
    const handleMouseLeave = () => {
      mouse.current.targetX = 0;
      mouse.current.targetY = 0;
    };
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const containerH = containerRef.current?.clientHeight || 500;

    const renderLoop = () => {
      progress.current += 0.012;
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;

      const cards = cardsRefs.current;
      const h = containerH;

      const continuousProgress = progress.current;
      const roundedIndex = Math.round(continuousProgress);
      const diffFromRound = continuousProgress - roundedIndex;
      const easedDiff = Math.sign(diffFromRound) * Math.pow(Math.abs(diffFromRound) * 2, 1.6) / 2;
      const virtualActiveIndex = roundedIndex + easedDiff;

      for (let i = 0; i < cardCount; i++) {
        const card = cards[i];
        if (!card) continue;

        let offset = i - virtualActiveIndex;
        const halfCount = cardCount / 2;
        while (offset > halfCount) offset -= cardCount;
        while (offset < -halfCount) offset += cardCount;

        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset);

        if (absOffset > 3.0) {
          card.style.visibility = "hidden";
          continue;
        } else {
          card.style.visibility = "visible";
        }

        const gap = 28;
        const peekAmount = -40;
        const D = 1350;

        let y = 0, z = 0, rot = 0;

        if (absOffset <= 1) {
          const t = absOffset;
          const easedT = t * t * (3 - 2 * t);
          const targetY = CARD_H + gap;
          y = -sign * (easedT * targetY);
          z = 400 + easedT * (220 - 400);
          rot = easedT * 132;
        } else if (absOffset <= 2) {
          const t = absOffset - 1;
          const easedT = t * t * (3 - 2 * t);
          const yStart = CARD_H + gap;
          const zStart = 220, zEnd = -60, rotStart = 132, rotEnd = 175;
          const sEnd = D / (D - zEnd);
          const yEnd = (h / 2 - peekAmount) / sEnd - CARD_H / 2;
          y = -sign * (yStart + easedT * (yEnd - yStart));
          z = zStart + easedT * (zEnd - zStart);
          rot = rotStart + easedT * (rotEnd - rotStart);
        } else {
          const t = Math.min(absOffset - 2, 1);
          const easedT = t * t * (3 - 2 * t);
          const zStart = -60, zEnd3 = -250, rotStart = 175, rotEnd3 = 195;
          const sEnd2 = D / (D - zStart);
          const yEnd2 = (h / 2 - peekAmount) / sEnd2 - CARD_H / 2;
          const sEnd3 = D / (D - zEnd3);
          const yEnd3 = (h / 2 + 100) / sEnd3 + CARD_H / 2;
          y = -sign * (yEnd2 + easedT * (yEnd3 - yEnd2));
          z = zStart + easedT * (zEnd3 - zStart);
          rot = rotStart + easedT * (rotEnd3 - rotStart);
        }

        const localCardRotation = -sign * rot;
        const centerFactor = Math.max(0, 1 - absOffset);
        const activeTiltX = -mouse.current.y * 12 * centerFactor;
        const activeTiltY = mouse.current.x * 15 * centerFactor;

        card.style.zIndex = Math.round(z).toString();
        card.style.transform = `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${(localCardRotation + activeTiltX).toFixed(2)}deg) rotateY(${activeTiltY.toFixed(2)}deg) rotateZ(-3deg)`;
      }
    };

    const tick = () => {
      frameCount.current++;
      const paused =
        (activeRef && activeRef.current && activeRef.current.active === false) ||
        (typeof document !== "undefined" && document.hidden);
      // Throttle to ~30fps: skip every other frame. Cheap parallax + carousel still feels smooth.
      if (!paused && (frameCount.current & 1) === 0) {
        renderLoop();
      }
      frameId.current = requestAnimationFrame(tick);
    };
    frameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId.current);
  }, [activeRef]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "500px",
        background: "#fff",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1350px",
        borderRadius: "16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: `${CARD_W}px`,
          height: `${CARD_H}px`,
          transformStyle: "preserve-3d",
        }}
      >
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { cardsRefs.current[i] = el; }}
            style={{
              position: "absolute",
              inset: 0,
              width: `${CARD_W}px`,
              height: `${CARD_H}px`,
              transformStyle: "preserve-3d",
            }}
          >
            {thicknessLayers.map((zOffset, layerIdx) => {
              const isFrontFace = layerIdx === thicknessLayers.length - 1;
              const isBackFace = layerIdx === 0;
              const videoSrc = CARD_VIDEOS[i % CARD_VIDEOS.length];

              if (!isFrontFace && !isBackFace) {
                return (
                  <div
                    key={layerIdx}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "14px",
                      border: "1px solid #808080",
                      backgroundColor: "#808080",
                      transform: `translateZ(${zOffset}px)`,
                      pointerEvents: "none",
                      overflow: "hidden",
                    }}
                  />
                );
              }

              if (isFrontFace) {
                return (
                  <div
                    key={layerIdx}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      backgroundColor: "#0f0f0f",
                      transform: `translateZ(${zOffset}px)`,
                      backfaceVisibility: "hidden",
                      pointerEvents: "none",
                      overflow: "hidden",
                      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15)",
                    }}
                  >
                    <video
                      src={videoSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: "14px" }}
                    />
                    <div style={{ position: "absolute", inset: 0, padding: "20px", background: "rgba(0,0,0,0.15)", zIndex: 10 }}>
                      {/* Chip */}
                      <div style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)" }}>
                        <svg width="26" height="26" viewBox="0 0 60 60" fill="none">
                          <path fillRule="evenodd" clipRule="evenodd" d="M20 8H40V14C40.0016 14.5299 40.2128 15.0377 40.5875 15.4125C40.9623 15.7872 41.4701 15.9984 42 16H59V24H42C41.4701 24.0016 40.9623 24.2128 40.5875 24.5875C40.2128 24.9623 40.0016 25.4701 40 26V52H20V8ZM18 8H8.00039C4.47435 8 1.56576 10.6083 1.08 14H18V8ZM1 16V24V26V34V36V44H18V36H1V34H18V26H1V24H18V16H1ZM1.08 46C1.56576 49.3917 4.47435 52 8.00039 52H18V46H1.08ZM42 14V8H52.0004C55.5264 8 58.4342 10.6084 58.92 14H42ZM59 26H42V34H59V26ZM59 36H42V44H59V36ZM52.0004 52H42V46H58.92C58.4342 49.3916 55.5264 52 52.0004 52Z" fill={`url(#chip_grad_${i})`} />
                          <defs>
                            <linearGradient id={`chip_grad_${i}`} x1="30" y1="8" x2="30" y2="52" gradientUnits="userSpaceOnUse">
                              <stop stopColor="white" />
                              <stop offset="1" stopColor="#999999" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      {/* JWT logo top-right */}
                      <div style={{ position: "absolute", right: "18px", top: "16px", opacity: 0.9 }}>
                        <svg width="72" height="auto" viewBox="0 0 341 49" fill="none">
                          <path d="M8.75294 47.68C6.10761 47.68 4.10227 47.04 2.73694 45.76C1.41427 44.48 0.582275 42.7733 0.240941 40.64C-0.100392 38.464 -0.0790588 36.0747 0.304941 33.472C0.731608 30.8267 1.37161 28.1813 2.22494 25.536C3.07827 22.848 3.99561 20.3307 4.97694 17.984C6.00094 15.5947 6.93961 13.5893 7.79294 11.968C8.26227 11.072 8.88094 10.56 9.64894 10.432C10.4169 10.2613 11.1423 10.368 11.8249 10.752C12.5503 11.136 13.0623 11.6907 13.3609 12.416C13.7023 13.1413 13.6383 13.9307 13.1689 14.784C11.2916 18.368 9.79828 21.7813 8.68894 25.024C7.57961 28.2667 6.85427 31.1467 6.51294 33.664C6.21427 36.1387 6.23561 38.1013 6.57694 39.552C6.96094 40.96 7.68628 41.664 8.75294 41.664C9.73428 41.664 10.8009 41.3013 11.9529 40.576C13.1049 39.8507 14.3423 38.5493 15.6649 36.672C17.0303 34.6667 18.3529 32.064 19.6329 28.864C20.9556 25.6213 22.1289 21.8667 23.1529 17.6C23.4089 16.6187 23.8783 15.9573 24.5609 15.616C25.2863 15.2747 26.0329 15.2107 26.8009 15.424C27.5689 15.6373 28.1876 16.064 28.6569 16.704C29.1263 17.3013 29.2543 18.0693 29.0409 19.008C27.9316 23.616 27.3769 27.5627 27.3769 30.848C27.4196 34.1333 27.7609 36.5227 28.4009 38.016C28.8703 39.0827 29.4249 39.8507 30.0649 40.32C30.7476 40.7893 31.4943 41.024 32.3049 41.024C33.1156 41.024 33.9689 40.7253 34.8649 40.128C35.8036 39.488 36.7209 38.4 37.6169 36.864C38.5556 35.328 39.3876 33.216 40.1129 30.528C37.6809 28.48 35.6756 25.7707 34.0969 22.4C32.5183 19.0293 31.7289 15.168 31.7289 10.816C31.7289 8.93867 31.9423 7.21067 32.3689 5.632C32.7956 4.05333 33.5209 2.79467 34.5449 1.856C35.5689 0.874666 36.9769 0.383999 38.7689 0.383999C40.9449 0.383999 42.7156 1.17333 44.0809 2.752C45.4463 4.288 46.4489 6.37867 47.0889 9.024C47.7289 11.6267 48.0063 14.5493 47.9209 17.792C47.8783 21.0347 47.5369 24.3413 46.8969 27.712C47.5369 28.0107 48.2196 28.2453 48.9449 28.416C49.7129 28.5867 50.4809 28.672 51.2489 28.672C52.9983 28.672 54.7903 28.416 56.6249 27.904C58.5023 27.3493 60.1023 26.6453 61.4249 25.792C62.2783 25.2373 63.0676 25.088 63.7929 25.344C64.5183 25.5573 65.0943 26.0053 65.521 26.688C65.9476 27.328 66.1183 28.0533 66.0329 28.864C65.9903 29.632 65.5636 30.272 64.7529 30.784C62.8756 32.0213 60.7423 33.0027 58.3529 33.728C56.0063 34.4533 53.6383 34.816 51.2489 34.816C49.2863 34.816 47.3449 34.4533 45.4249 33.728C44.1876 37.7387 42.5023 40.96 40.3689 43.392C38.2356 45.824 35.5476 47.04 32.3049 47.04C30.2569 47.04 28.3583 46.4427 26.6089 45.248C24.9023 44.0107 23.6223 42.4107 22.7689 40.448C22.5983 40.064 22.4276 39.6587 22.2569 39.232C22.1289 38.8053 22.0223 38.4 21.9369 38.016C21.7236 38.4 21.4889 38.7627 21.2329 39.104C21.0196 39.4453 20.7849 39.7867 20.5289 40.128C18.9503 42.3467 17.1796 44.16 15.2169 45.568C13.2969 46.976 11.1423 47.68 8.75294 47.68ZM41.5849 23.104C42.0116 19.9893 42.1183 17.3653 41.9049 15.232C41.6916 13.0987 41.3503 11.392 40.8809 10.112C40.4116 8.78933 39.9423 7.85067 39.4729 7.296C39.0463 6.69867 38.8116 6.4 38.7689 6.4C38.7689 6.4 38.6836 6.42133 38.5129 6.464C38.3849 6.464 38.2356 6.76267 38.0649 7.36C37.9369 7.91467 37.8729 9.06667 37.8729 10.816C37.8729 12.992 38.1929 15.168 38.8329 17.344C39.4729 19.4773 40.3903 21.3973 41.5849 23.104Z" fill="white"/>
                          <path d="M283.745 13.248C288.055 13.248 291.468 14.5067 293.985 17.024C296.545 19.4987 297.825 23.1467 297.825 27.968V47.488H291.681V28.672C291.681 25.3867 290.892 22.912 289.313 21.248C287.735 19.584 285.473 18.752 282.529 18.752C279.201 18.752 276.577 19.7333 274.657 21.696C272.737 23.616 271.777 26.3893 271.777 30.016V47.488H265.633V13.568H271.521V18.688C272.759 16.9387 274.423 15.5947 276.513 14.656C278.647 13.7173 281.057 13.248 283.745 13.248ZM319.82 31.68L312.78 38.208V47.488H306.636V0H312.78V30.464L331.276 13.568H338.7L324.428 27.584L340.108 47.488H332.556L319.82 31.68Z" fill="white"/>
                        </svg>
                      </div>
                      {/* Intersecting circles bottom-right */}
                      <div style={{ position: "absolute", right: "18px", bottom: "16px", display: "flex", gap: "-10px", alignItems: "center", opacity: 0.9 }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.1)", marginRight: "-8px" }} />
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }} />
                      </div>
                    </div>
                  </div>
                );
              }

              if (isBackFace) {
                const details = CARD_DETAILS[i % CARD_DETAILS.length];
                return (
                  <div
                    key={layerIdx}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      backgroundColor: "#0f0f0f",
                      transform: `translateZ(${zOffset}px) rotateX(180deg)`,
                      backfaceVisibility: "hidden",
                      pointerEvents: "none",
                      overflow: "hidden",
                      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15)",
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, filter: "blur(16px)", transform: "scale(1.15)" }}>
                      <video src={videoSrc} autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ position: "absolute", left: 0, right: 0, top: "16px", height: "32px", background: "rgba(0,0,0,0.85)", zIndex: 10 }} />
                    <div style={{ position: "absolute", left: "16px", bottom: "14px", zIndex: 20, fontFamily: '"JetBrains Mono", monospace' }}>
                      <div style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", color: "white" }}>{details.number}</div>
                      <div style={{ fontSize: "7px", fontWeight: 500, color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em", marginTop: "2px" }}>
                        <span style={{ textTransform: "uppercase" }}>{details.name}</span>
                        <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 6px" }}>•</span>
                        <span>CVV: {details.cvv}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
