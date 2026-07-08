"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

const CURSOR_WIDTH = 52;
const CURSOR_HEIGHT = 52;
const HOTSPOT_X = 8;
const HOTSPOT_Y = 8;

const CODE_TO_ARROW_SEGMENTS = [
  {
    from: [20, 18, 14, 26],
    to: [17, 14, 17, 39],
  },
  {
    from: [14, 26, 20, 34],
    to: [17, 14, 36.5, 31.5],
  },
  {
    from: [28.5, 16.5, 23.5, 36],
    to: [29.5, 31.5, 34.5, 43],
  },
  {
    from: [32, 18, 38, 26],
    to: [24.5, 34, 17, 39],
  },
  {
    from: [38, 26, 32, 34],
    to: [24.5, 34, 29.5, 45],
  },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function parseRgb(colorValue) {
  if (!colorValue) return null;
  const match = colorValue.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
  if (parts.length < 3) return null;
  return {
    r: parts[0],
    g: parts[1],
    b: parts[2],
    a: Number.isFinite(parts[3]) ? parts[3] : 1,
  };
}

function parseHex(colorValue) {
  if (!colorValue) return null;
  const hex = colorValue.replace("#", "").trim();
  if (![3, 4, 6, 8].includes(hex.length)) return null;

  const normalized =
    hex.length <= 4
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;

  const hasAlpha = normalized.length === 8;
  const int = Number.parseInt(normalized, 16);
  if (Number.isNaN(int)) return null;

  return {
    r: hasAlpha ? (int >> 24) & 255 : (int >> 16) & 255,
    g: hasAlpha ? (int >> 16) & 255 : (int >> 8) & 255,
    b: hasAlpha ? (int >> 8) & 255 : int & 255,
    a: hasAlpha ? (int & 255) / 255 : 1,
  };
}

function getPerceivedLuminance({ r, g, b }) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getColorMeta(color) {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === color.r) {
      hue = ((color.g - color.b) / delta) % 6;
    } else if (max === color.g) {
      hue = (color.b - color.r) / delta + 2;
    } else {
      hue = (color.r - color.g) / delta + 4;
    }
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  const luminance = getPerceivedLuminance(color);
  const saturation = max === 0 ? 0 : delta / max;

  return { hue, luminance, saturation };
}

function extractColorsFromCssValue(value) {
  if (!value || value === "none") return [];

  const colors = [];
  const hexMatches = value.match(/#[0-9a-fA-F]{3,8}/g) || [];
  const rgbMatches = value.match(/rgba?\([^)]*\)/gi) || [];

  hexMatches.forEach((hex) => {
    const parsed = parseHex(hex);
    if (parsed) colors.push(parsed);
  });

  rgbMatches.forEach((rgb) => {
    const parsed = parseRgb(rgb);
    if (parsed) colors.push(parsed);
  });

  return colors;
}

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const shellRef = useRef(null);
  const lineRefs = useRef([]);
  const rafRef = useRef(null);
  const morphRef = useRef({ value: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef(false);
  const pressedRef = useRef(false);
  const invertedRef = useRef(false);

  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
  );

  const updateGeometry = () => {
    CODE_TO_ARROW_SEGMENTS.forEach((segment, index) => {
      const line = lineRefs.current[index];
      if (!line) return;

      const [x1a, y1a, x2a, y2a] = segment.from;
      const [x1b, y1b, x2b, y2b] = segment.to;
      const t = morphRef.current.value;

      line.setAttribute("x1", `${lerp(x1a, x1b, t)}`);
      line.setAttribute("y1", `${lerp(y1a, y1b, t)}`);
      line.setAttribute("x2", `${lerp(x2a, x2b, t)}`);
      line.setAttribute("y2", `${lerp(y2a, y2b, t)}`);
    });
  };

  const updateStrokeStyle = (useWhiteStroke) => {
    if (invertedRef.current === useWhiteStroke) return;
    invertedRef.current = useWhiteStroke;

    lineRefs.current.forEach((line) => {
      if (!line) return;
      line.setAttribute("stroke", useWhiteStroke ? "#FFFFFF" : "url(#codeCursorGradient)");
    });
  };

  const detectDarkBackground = (x, y) => {
    if (typeof document === "undefined") return false;

    let node = document.elementFromPoint(x, y);
    if (
      node?.closest?.("[data-cursor-noinvert='true']") ||
      node?.closest?.(".dropDownMenu") ||
      node?.closest?.(".subDropDown")
    ) {
      return false;
    }

    while (node) {
      if (node?.getAttribute?.("data-cursor-noinvert") === "true") {
        return false;
      }

      if (
        node?.classList?.contains("dropDownMenu") ||
        node?.classList?.contains("subDropDown")
      ) {
        return false;
      }

      const styles = window.getComputedStyle(node);
      const solidColor = parseRgb(styles.backgroundColor);
      if (solidColor && solidColor.a > 0.12) {
        const { luminance, hue, saturation } = getColorMeta(solidColor);
        if (luminance < 92) return true;
        if (luminance < 122 && hue >= 260 && hue <= 335 && saturation > 0.28) {
          return true;
        }
      }

      const gradientColors = extractColorsFromCssValue(styles.backgroundImage);
      if (gradientColors.length > 0) {
        const relevantColors = gradientColors.filter((color) => color.a > 0.08);
        if (relevantColors.length > 0) {
          const darkEnough = relevantColors.some((color) => {
            const { luminance, hue, saturation } = getColorMeta(color);
            if (luminance < 112) return true;
            return hue >= 260 && hue <= 335 && saturation > 0.22 && luminance < 136;
          });

          if (darkEnough) return true;
        }
      }
      node = node.parentElement;
    }

    const bodyColor = parseRgb(window.getComputedStyle(document.body).backgroundColor);
    if (bodyColor) {
      const { luminance } = getColorMeta(bodyColor);
      if (luminance < 92) return true;
    }

    return false;
  };

  useEffect(() => {
    if (isTouchDevice) return;

    const cursorNode = cursorRef.current;
    if (!cursorNode) return;

    updateGeometry();

    const render = () => {
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * 0.22;
      current.y += (target.y - current.y) * 0.22;

      cursorNode.style.transform = `translate3d(${current.x - HOTSPOT_X}px, ${current.y - HOTSPOT_Y}px, 0)`;
      rafRef.current = requestAnimationFrame(render);
    };

    const setHoverState = (active) => {
      if (hoveredRef.current === active) return;
      hoveredRef.current = active;

      if (shellRef.current) {
        animate(shellRef.current, {
          scale: active ? 1.06 : 1,
          duration: 170,
          ease: "outQuad",
        });
      }
    };

    const morphTo = (value, duration, ease) => {
      animate(morphRef.current, {
        value,
        duration,
        ease,
        onUpdate: updateGeometry,
      });
    };

    const isClickableTarget = (target) => {
      try {
        return (
          target.tagName.toLowerCase() === "a" ||
          target.tagName.toLowerCase() === "button" ||
          target.closest("a") ||
          target.closest("button") ||
          window.getComputedStyle(target).cursor === "pointer"
        );
      } catch {
        return false;
      }
    };

    const onMouseMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      updateStrokeStyle(detectDarkBackground(e.clientX, e.clientY));

      if (!isVisible) {
        currentRef.current = { x: e.clientX, y: e.clientY };
        setIsVisible(true);
      }
    };

    const onMouseOver = (e) => {
      setHoverState(isClickableTarget(e.target));
    };

    const onMouseDown = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      pressedRef.current = true;
      morphTo(1, 180, "outQuad");
    };

    const onMouseUp = () => {
      pressedRef.current = false;
      morphTo(0, 220, "outExpo");
    };

    const onMouseLeave = () => {
      setIsVisible(false);
      setHoverState(false);
      pressedRef.current = false;
      morphTo(0, 160, "outQuad");
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    rafRef.current = requestAnimationFrame(render);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [isTouchDevice, isVisible]);

  if (isTouchDevice) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (pointer: fine) {
              * {
                cursor: none !important;
              }
            }
          `,
        }}
      />
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: CURSOR_WIDTH,
          height: CURSOR_HEIGHT,
          pointerEvents: "none",
          zIndex: 99999999,
          willChange: "transform",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 120ms ease-out",
        }}
      >
        <svg
          width={CURSOR_WIDTH}
          height={CURSOR_HEIGHT}
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient
              id="codeCursorGradient"
              x1="10"
              y1="12"
              x2="42"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#600b56" />
              <stop offset="0.3" stopColor="#270f31" />
              <stop offset="0.73" stopColor="#efa238" />
              <stop offset="1" stopColor="#efa238" />
            </linearGradient>
          </defs>

          <g ref={shellRef} style={{ transformOrigin: "26px 26px" }}>
            {CODE_TO_ARROW_SEGMENTS.map((_, index) => (
              <line
                key={index}
                ref={(node) => {
                  lineRefs.current[index] = node;
                }}
                stroke="url(#codeCursorGradient)"
                strokeWidth={index === 2 ? "3.5" : "3.15"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        </svg>
      </div>
    </>
  );
}
