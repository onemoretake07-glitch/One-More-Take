import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./HeroIntro.css";

const FPS = 24;

// Timeline (ms)
const COUNT_STEP_MS = 550; // 3 -> 2 -> 1
const BRAND_AT_MS = COUNT_STEP_MS * 3; // brand name appears
const LEAVE_AT_MS = BRAND_AT_MS + 1300; // shutter opens
const REVEAL_AFTER_LEAVE_MS = 250; // hero animations start
const REMOVE_AFTER_LEAVE_MS = 1300; // intro removed from page

const BRAND_WORDS = ["ONE", "MORE", "TAKE"].map((word, wordIndex, words) => ({
  word,
  // index of this word's first letter across the whole name (for the stagger)
  offset: words.slice(0, wordIndex).join("").length,
}));

// Plays on every page load. Only skipped when the visitor opens a link
// straight to another section (e.g. /#contact), so they land there directly.
export function shouldPlayIntro() {
  if (typeof window === "undefined") return false;

  const hash = window.location.hash;
  return !hash || hash === "#home";
}

const formatTimecode = (elapsedMs) => {
  const totalFrames = Math.floor((elapsedMs / 1000) * FPS);
  const frames = totalFrames % FPS;
  const seconds = Math.floor(totalFrames / FPS) % 60;
  const minutes = Math.floor(totalFrames / (FPS * 60)) % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return `00:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
};

const HeroIntro = ({ onReveal }) => {
  const [count, setCount] = useState(3);
  const [phase, setPhase] = useState("countdown"); // countdown | brand | leaving
  const [removed, setRemoved] = useState(false);

  const timecodeRef = useRef(null);
  const timersRef = useRef([]);
  const leavingRef = useRef(false);
  const onRevealRef = useRef(onReveal);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const later = (callback, delay) => {
    timersRef.current.push(window.setTimeout(callback, delay));
  };

  const leave = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    clearTimers();
    setPhase("leaving");

    later(() => onRevealRef.current?.(), REVEAL_AFTER_LEAVE_MS);
    later(() => setRemoved(true), REMOVE_AFTER_LEAVE_MS);
  }, []);

  // Countdown -> brand -> shutter opens
  useEffect(() => {
    leavingRef.current = false;

    later(() => setCount(2), COUNT_STEP_MS);
    later(() => setCount(1), COUNT_STEP_MS * 2);
    later(() => setPhase("brand"), BRAND_AT_MS);
    later(leave, LEAVE_AT_MS);

    return clearTimers;
  }, [leave]);

  // Running REC timecode (updates the text directly, no re-render)
  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const tick = (now) => {
      if (timecodeRef.current) {
        timecodeRef.current.textContent = formatTimecode(now - start);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Lock page scroll while the intro covers the screen; Escape / Enter skips
  useEffect(() => {
    if (removed) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" || event.key === "Enter") leave();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [removed, leave]);

  if (removed || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`omt-intro is-${phase}`}
      role="status"
      aria-label="Loading One More Take"
    >
      <div className="omt-intro-half omt-intro-top" aria-hidden="true" />
      <div className="omt-intro-half omt-intro-bottom" aria-hidden="true" />
      <span className="omt-intro-flash" aria-hidden="true" />

      <div className="omt-intro-stage">
        <span className="omt-intro-noise" aria-hidden="true" />

        {/* Viewfinder corners */}
        <span className="omt-intro-corner omt-corner-tl" aria-hidden="true" />
        <span className="omt-intro-corner omt-corner-tr" aria-hidden="true" />
        <span className="omt-intro-corner omt-corner-bl" aria-hidden="true" />
        <span className="omt-intro-corner omt-corner-br" aria-hidden="true" />

        <div className="omt-intro-hud omt-hud-top" aria-hidden="true">
          <span className="omt-intro-rec">
            <i />
            REC
            <b ref={timecodeRef}>00:00:00:00</b>
          </span>
          <span>4K · 24FPS · ISO 800</span>
        </div>

        {/* Film leader countdown */}
        <div className="omt-intro-leader" aria-hidden="true">
          <span className="omt-leader-sweep" />
          <span className="omt-leader-ring omt-leader-ring-outer" />
          <span className="omt-leader-ring omt-leader-ring-inner" />
          <span className="omt-leader-cross omt-leader-cross-x" />
          <span className="omt-leader-cross omt-leader-cross-y" />
          <strong className="omt-leader-number" key={count}>
            {count}
          </strong>
        </div>

        {/* Brand reveal */}
        <div className="omt-intro-brand" aria-hidden="true">
          <p className="omt-intro-slate">SCENE 01 &nbsp;/&nbsp; TAKE 01</p>

          <h2 className="omt-intro-title">
            {BRAND_WORDS.map(({ word, offset }) => (
              <span
                className={`omt-intro-word ${word === "TAKE" ? "is-red" : ""}`}
                key={word}
              >
                {word.split("").map((letter, letterPosition) => {
                  const index = offset + letterPosition;

                  return (
                    <span className="omt-intro-letter-mask" key={`${word}-${index}`}>
                      <span className="omt-intro-letter" style={{ "--i": index }}>
                        {letter}
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h2>

          <p className="omt-intro-tagline">We shoot. We edit. We create.</p>
        </div>

        <div className="omt-intro-hud omt-hud-bottom">
          <span className="omt-intro-progress" aria-hidden="true">
            <i />
          </span>

          <button type="button" className="omt-intro-skip" onClick={leave}>
            SKIP INTRO <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HeroIntro;
