"use client";
import React, { useEffect, useRef, useState } from "react";

interface FuzzyTextProps {
  children: React.ReactNode;
  fontSize?: number | string;
  fontWeight?: string | number;
  fontFamily?: string;
  color?: string;
  enableHover?: boolean;
  baseIntensity?: number;
  hoverIntensity?: number;
  fuzzRange?: number;
  fps?: number;
  direction?: "horizontal" | "vertical" | "both";
  transitionDuration?: number;
  clickEffect?: boolean;
  glitchMode?: boolean;
  glitchInterval?: number;
  glitchDuration?: number;
  gradient?: string[] | null;
  letterSpacing?: number;
  className?: string;
}

const FuzzyText: React.FC<FuzzyTextProps> = ({
  children,
  fontSize = "clamp(2.5rem, 12vw, 8rem)",
  fontWeight = 1000,
  fontFamily = "inherit",
  color = "#fff",
  enableHover = true,
  baseIntensity = 0.3,
  hoverIntensity = 0.8,
  fuzzRange = 30,
  fps = 120,
  direction = "horizontal",
  transitionDuration = 0,
  clickEffect = false,
  glitchMode = true,
  glitchInterval = 3000,
  glitchDuration = 500,
  gradient = null,
  letterSpacing = 0,
  className = "",
}) => {
  const canvasRef = useRef<
    HTMLCanvasElement & { cleanupFuzzyText?: () => void }
  >(null);

  // 🔥 THIS is the key for responsiveness
  const [resizeKey, setResizeKey] = useState(0);

  // Listen to window resize
  useEffect(() => {
    const onResize = () => setResizeKey((k) => k + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let animationFrameId = 0;
    let isCancelled = false;
    let glitchTimeoutId: ReturnType<typeof setTimeout>;
    let glitchEndTimeoutId: ReturnType<typeof setTimeout>;
    let clickTimeoutId: ReturnType<typeof setTimeout>;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = async () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const computedFontFamily =
        fontFamily === "inherit"
          ? window.getComputedStyle(canvas).fontFamily || "sans-serif"
          : fontFamily;

      const fontSizeStr =
        typeof fontSize === "number" ? `${fontSize}px` : fontSize;

      const fontString = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;

      try {
        await document.fonts.load(fontString);
      } catch {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      let numericFontSize: number;
      if (typeof fontSize === "number") {
        numericFontSize = fontSize;
      } else {
        const temp = document.createElement("span");
        temp.style.fontSize = fontSize;
        document.body.appendChild(temp);
        numericFontSize = parseFloat(window.getComputedStyle(temp).fontSize);
        document.body.removeChild(temp);
      }

      const text = React.Children.toArray(children).join("");

      const offscreen = document.createElement("canvas");
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      offCtx.font = fontString;
      offCtx.textBaseline = "alphabetic";

      let totalWidth = 0;
      if (letterSpacing !== 0) {
        for (const char of text) {
          totalWidth += offCtx.measureText(char).width + letterSpacing;
        }
        totalWidth -= letterSpacing;
      } else {
        totalWidth = offCtx.measureText(text).width;
      }

      const metrics = offCtx.measureText(text);
      const ascent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const descent =
        metrics.actualBoundingBoxDescent ?? numericFontSize * 0.25;

      const textWidth = Math.ceil(totalWidth);
      const textHeight = Math.ceil(ascent + descent);

      offscreen.width = textWidth + 20;
      offscreen.height = textHeight;

      offCtx.font = fontString;
      offCtx.textBaseline = "alphabetic";

      if (gradient && gradient.length >= 2) {
        const grad = offCtx.createLinearGradient(0, 0, offscreen.width, 0);
        gradient.forEach((c, i) =>
          grad.addColorStop(i / (gradient.length - 1), c),
        );
        offCtx.fillStyle = grad;
      } else {
        offCtx.fillStyle = color;
      }

      let x = 10;
      if (letterSpacing !== 0) {
        for (const char of text) {
          offCtx.fillText(char, x, ascent);
          x += offCtx.measureText(char).width + letterSpacing;
        }
      } else {
        offCtx.fillText(text, 10, ascent);
      }

      const marginX = fuzzRange + 20;
      const marginY =
        direction === "vertical" || direction === "both" ? fuzzRange + 10 : 0;

      canvas.width = offscreen.width + marginX * 2;
      canvas.height = offscreen.height + marginY * 2;

      ctx.setTransform(1, 0, 0, 1, marginX, marginY);

      let currentIntensity = baseIntensity;
      let targetIntensity = baseIntensity;
      let lastFrame = 0;
      const frameTime = 1000 / fps;

      let isHovering = false;
      let isClicking = false;
      let isGlitching = false;

      const startGlitchLoop = () => {
        if (!glitchMode || isCancelled) return;
        glitchTimeoutId = setTimeout(() => {
          isGlitching = true;
          glitchEndTimeoutId = setTimeout(() => {
            isGlitching = false;
            startGlitchLoop();
          }, glitchDuration);
        }, glitchInterval);
      };

      if (glitchMode) startGlitchLoop();

      const run = (t: number) => {
        if (isCancelled) return;
        if (t - lastFrame < frameTime) {
          animationFrameId = requestAnimationFrame(run);
          return;
        }
        lastFrame = t;

        ctx.clearRect(-marginX, -marginY, canvas.width, canvas.height);

        if (isClicking || isGlitching) targetIntensity = 1;
        else if (isHovering) targetIntensity = hoverIntensity;
        else targetIntensity = baseIntensity;

        currentIntensity =
          transitionDuration > 0
            ? currentIntensity +
              (targetIntensity - currentIntensity) *
                (frameTime / transitionDuration)
            : targetIntensity;

        for (let y = 0; y < offscreen.height; y++) {
          const dx =
            direction !== "vertical"
              ? (Math.random() - 0.5) * fuzzRange * currentIntensity
              : 0;
          const dy =
            direction !== "horizontal"
              ? (Math.random() - 0.5) * fuzzRange * 0.5 * currentIntensity
              : 0;

          ctx.drawImage(
            offscreen,
            0,
            y,
            offscreen.width,
            1,
            dx,
            y + dy,
            offscreen.width,
            1,
          );
        }

        animationFrameId = requestAnimationFrame(run);
      };

      animationFrameId = requestAnimationFrame(run);

      const handleMove = (e: MouseEvent) => {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        isHovering =
          x >= marginX &&
          x <= marginX + textWidth &&
          y >= marginY &&
          y <= marginY + textHeight;
      };

      const handleLeave = () => (isHovering = false);

      if (enableHover) {
        canvas.addEventListener("mousemove", handleMove);
        canvas.addEventListener("mouseleave", handleLeave);
      }

      canvas.cleanupFuzzyText = () => {
        cancelAnimationFrame(animationFrameId);
        clearTimeout(glitchTimeoutId);
        clearTimeout(glitchEndTimeoutId);
        clearTimeout(clickTimeoutId);
        canvas.removeEventListener("mousemove", handleMove);
        canvas.removeEventListener("mouseleave", handleLeave);
      };
    };

    init();

    return () => {
      isCancelled = true;
      if (canvas.cleanupFuzzyText) canvas.cleanupFuzzyText();
    };
  }, [
    resizeKey, // 🔥 THIS is what makes it responsive
    children,
    fontSize,
    fontWeight,
    fontFamily,
    color,
    enableHover,
    baseIntensity,
    hoverIntensity,
    fuzzRange,
    fps,
    direction,
    transitionDuration,
    clickEffect,
    glitchMode,
    glitchInterval,
    glitchDuration,
    gradient,
    letterSpacing,
  ]);

  return <canvas ref={canvasRef} className={className} />;
};

export default FuzzyText;
