import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSiteContent } from "../../content/useSiteContent";
import "./HeroIntro.css";

// Timeline (ms)
const BRAND_AT_MS = 900; // lens has landed, brand name appears
const LEAVE_AT_MS = 2700; // lens opens and reveals the website
const REVEAL_AFTER_LEAVE_MS = 300; // hero animations start
const REMOVE_AFTER_LEAVE_MS = 1400; // intro removed from page

// Words with the index of their first letter across the whole name (for the stagger)
const withLetterOffsets = (words) =>
  words.map((word, wordIndex) => ({
    word,
    offset: words.slice(0, wordIndex).join("").length,
  }));

// Plays on every page load. Only skipped when the visitor opens a link
// straight to another section (e.g. /#contact), so they land there directly.
export function shouldPlayIntro() {
  if (typeof window === "undefined") return false;

  const hash = window.location.hash;
  return !hash || hash === "#home";
}

const HeroIntro = ({ onReveal }) => {
  const content = useSiteContent("intro");
  const brandWords = withLetterOffsets(
    content.brandWords.map((word) => word.trim()).filter(Boolean)
  );
  const slogan = content.slogan.map((word) => word.trim()).filter(Boolean);
  const [phase, setPhase] = useState("lens"); // lens | brand | leaving
  const [removed, setRemoved] = useState(false);

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

  // Lens lands -> brand name -> lens opens onto the website
  useEffect(() => {
    leavingRef.current = false;

    later(() => setPhase("brand"), BRAND_AT_MS);
    later(leave, LEAVE_AT_MS);

    return clearTimers;
  }, [leave]);

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
      {/* The dark screen is the shadow around this circle.
          When it grows, the website appears through it like a lens opening. */}
      <span className="omt-intro-iris" aria-hidden="true" />

      <div className="omt-intro-stage">
        <span className="omt-intro-glow" aria-hidden="true" />
        <span className="omt-intro-noise" aria-hidden="true" />

        <div className="omt-intro-center">
          <div className="omt-intro-lens" aria-hidden="true">
            <span className="omt-intro-ripple" />
            <span className="omt-intro-ripple omt-intro-ripple-two" />
            <img src="/intro-lens.jpg" alt="" draggable={false} />
            <span className="omt-intro-lens-shine" />
          </div>

          <div className="omt-intro-brand" aria-hidden="true">
            <h2 className="omt-intro-title">
              {brandWords.map(({ word, offset }, wordIndex) => (
                <span
                  className={`omt-intro-word ${
                    wordIndex === brandWords.length - 1 && brandWords.length > 1 ? "is-red" : ""
                  }`}
                  key={`${word}-${wordIndex}`}
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

            {slogan.length > 0 && (
              <p className="omt-intro-slogan">
                {slogan.map((word, index) => (
                  <React.Fragment key={`${word}-${index}`}>
                    {index > 0 && <i />}
                    {word}
                  </React.Fragment>
                ))}
              </p>
            )}

            <span className="omt-intro-line" />
          </div>
        </div>

        <button type="button" className="omt-intro-skip" onClick={leave}>
          SKIP INTRO <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default HeroIntro;
