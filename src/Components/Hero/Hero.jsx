import React, { useCallback, useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import HeroIntro, { shouldPlayIntro } from "./HeroIntro";
import HeroConfetti from "./HeroConfetti";
import "./Hero.css";

const DEFAULT_HERO_IMAGE = "/cinema-camera.png";

const TITLE_LINES = [
  { text: "IDEAS", className: "" },
  { text: "DESERVE", className: "" },
  { text: "A BETTER", className: "omt-red" },
  { text: "TAKE.", className: "omt-red omt-outline" },
];

// Camera exploded-view timing (ms)
const CAMERA_START_MS = 250; // after the hero is revealed
const CAMERA_ASSEMBLE_MS = 1500; // parts sliding back together
const CAMERA_WHOLE_MS = 6000; // camera stays whole (one float cycle)
const CAMERA_BROKEN_MS = 2400; // parts stay apart (exploded view)

// Exploded view of the default camera photo (/cinema-camera.png).
// Each part is outlined by hand around the real component in the photo.
// Coordinates are % of the image. dx/dy = how far the part travels when
// exploded, in % of the image width (so it scales on every screen).
const POLY = (points) =>
  `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;

const REAL_CAMERA_PARTS = [
  {
    name: "matte-box",
    clipPath: POLY([[8, 37], [10, 33], [37.5, 30.5], [44, 32], [47.6, 36], [47.6, 72], [40, 74.5], [9, 73], [7.5, 70]]),
    dx: -30, dy: 0, delay: 0,
  },
  {
    name: "matte-box-flag",
    clipPath: POLY([[0, 17], [20.6, 10.2], [29, 14.5], [37.6, 26.5], [37.6, 30.6], [10, 33.2], [0, 22]]),
    dx: -18, dy: -20, rot: -10, delay: 0.05,
  },
  {
    name: "lens",
    clipPath: POLY([[47.6, 39.5], [63, 40.3], [70.3, 43.5], [70.3, 52], [66, 56], [61, 57], [60, 66.5], [47.6, 67.5]]),
    dx: -15, dy: 0, delay: 0.1,
  },
  {
    name: "follow-focus",
    clipPath: POLY([[60, 57], [66, 56], [74.2, 58], [74.2, 74], [60, 74]]),
    dx: -4, dy: 14, delay: 0.15,
  },
  {
    name: "body",
    clipPath: POLY([[70.3, 42], [88, 42], [88, 71.2], [74.2, 71.2], [74.2, 58], [66, 56], [70.3, 52]]),
    dx: 0, dy: 0, delay: 0.2,
  },
  {
    name: "battery",
    clipPath: POLY([[87.8, 41.5], [98.5, 42], [98.5, 71.5], [87.8, 71.5]]),
    dx: 18, dy: 0, delay: 0.1,
  },
  {
    name: "top-rail",
    clipPath: POLY([[44.6, 27.6], [88.8, 27.6], [88.8, 42], [70.3, 43.5], [63, 40.3], [47.6, 39.5], [44.6, 37]]),
    dx: 0, dy: -12, delay: 0.1,
  },
  {
    name: "monitor",
    clipPath: POLY([[56, 0], [85, 0], [88.8, 5], [88.8, 27.6], [56, 27.6], [55.6, 23]]),
    dx: 8, dy: -22, delay: 0,
  },
  {
    name: "top-box",
    clipPath: POLY([[41.5, 14.5], [55.6, 14.5], [55.6, 27.6], [41.5, 27.6]]),
    dx: -3, dy: -26, delay: 0.05,
  },
  {
    name: "baseplate-rods",
    clipPath: POLY([[32.5, 72.4], [40, 74.5], [47.6, 72], [60, 74], [74.2, 74], [74.2, 71.2], [88, 71.2], [98.5, 71.5], [98.5, 80], [32.5, 80]]),
    dx: 0, dy: 12, delay: 0.1,
  },
  {
    name: "tripod-head",
    clipPath: POLY([[50, 79.5], [86, 79.5], [100, 89.5], [100, 97.5], [80, 93], [79, 100], [53, 100], [50, 86]]),
    dx: 0, dy: 24, delay: 0,
  },
];

// Screws floating in the gaps between parts (x, y in %; dx/dy like parts)
const REAL_CAMERA_SCREWS = [
  { x: 47.6, y: 45, dx: -22, dy: 0 },
  { x: 47.6, y: 62, dx: -22, dy: 0 },
  { x: 22, y: 31.5, dx: -24, dy: -9 },
  { x: 69.5, y: 47, dx: -7, dy: 0 },
  { x: 88, y: 50, dx: 9, dy: 0 },
  { x: 88, y: 64, dx: 9, dy: 0 },
  { x: 76, y: 42, dx: 0, dy: -6 },
  { x: 83, y: 42, dx: 0, dy: -6 },
  { x: 72, y: 27.6, dx: 4, dy: -17 },
  { x: 48.5, y: 21, dx: -3, dy: -19 },
  { x: 62, y: 74, dx: -2, dy: 7 },
  { x: 80, y: 71.5, dx: 0, dy: 6 },
  { x: 66, y: 80, dx: 0, dy: 18 },
  { x: 74, y: 80, dx: 0, dy: 18 },
];

// Exploded-view axis lines (through the lens and through the body)
const REAL_CAMERA_GUIDES = [
  { direction: "x", position: 54 },
  { direction: "y", position: 72 },
];

// A custom image from the admin panel won't match the parts above,
// so it falls back to clean horizontal layers that slide apart.
const LAYER_CUTS = [0, 15, 29, 43, 57, 71, 85, 100];

const LAYER_PARTS = LAYER_CUTS.slice(0, -1).map((top, layer) => {
  const bottom = LAYER_CUTS[layer + 1];
  const centerY = (top + bottom) / 2;

  return {
    name: `layer-${layer}`,
    clipPath: POLY([[0, top], [100, top], [100, bottom], [0, bottom]]),
    dx: layer % 2 === 0 ? -3 : 3,
    dy: Math.round((centerY - 50) * 0.55),
    delay: Number(((Math.abs(centerY - 50) / 50) * 0.3).toFixed(2)),
  };
});

const LAYER_GUIDES = [{ direction: "y", position: 50 }];

// Where the photo is actually drawn inside an <img> with object-fit: contain
function getContainedImageBox(img) {
  if (!img || !img.naturalWidth || !img.naturalHeight) return null;

  const boxWidth = img.offsetWidth;
  const boxHeight = img.offsetHeight;
  const scale = Math.min(boxWidth / img.naturalWidth, boxHeight / img.naturalHeight);
  const width = img.naturalWidth * scale;
  const height = img.naturalHeight * scale;

  // The camera <img> is centred with translate(-50%, -50%)
  const boxLeft = img.offsetLeft - boxWidth / 2;
  const boxTop = img.offsetTop - boxHeight / 2;

  return {
    left: boxLeft + (boxWidth - width) / 2,
    top: boxTop + (boxHeight - height) / 2,
    width,
    height,
  };
}

const Hero = () => {
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO_IMAGE);
  const [playIntro] = useState(shouldPlayIntro);
  const [revealed, setRevealed] = useState(() => !playIntro);
  const [celebrate, setCelebrate] = useState(false);
  const [cameraPhase, setCameraPhase] = useState("hidden");
  const [partsBox, setPartsBox] = useState(null);
  const cameraRef = useRef(null);

  const isDefaultImage = heroImage === DEFAULT_HERO_IMAGE;
  const cameraParts = isDefaultImage ? REAL_CAMERA_PARTS : LAYER_PARTS;
  const cameraScrews = isDefaultImage ? REAL_CAMERA_SCREWS : [];
  const cameraGuides = isDefaultImage ? REAL_CAMERA_GUIDES : LAYER_GUIDES;

  // Line the parts up exactly with where the photo is drawn
  const measureParts = useCallback(() => {
    const box = getContainedImageBox(cameraRef.current);
    if (box) setPartsBox(box);
  }, []);

  useEffect(() => {
    const img = cameraRef.current;
    if (!img) return undefined;

    if (img.complete) measureParts();

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measureParts);
      observer.observe(img);
    }
    window.addEventListener("resize", measureParts);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measureParts);
    };
  }, [measureParts, heroImage]);

  // Camera loop: pieces fly together -> whole camera -> breaks apart -> repeat
  useEffect(() => {
    if (!revealed) return undefined;

    let timer = 0;

    const goTo = (phase, delay) => {
      timer = window.setTimeout(() => {
        setCameraPhase(phase);

        if (phase === "assembled") goTo("whole", CAMERA_ASSEMBLE_MS);
        else if (phase === "whole") goTo("broken", CAMERA_WHOLE_MS);
        else if (phase === "broken") goTo("assembled", CAMERA_BROKEN_MS);
      }, delay);
    };

    goTo("assembled", CAMERA_START_MS);

    return () => window.clearTimeout(timer);
  }, [revealed]);

  // Intro finished: show the hero, fire the poppers, then keep the confetti falling
  const handleIntroReveal = useCallback(() => {
    setRevealed(true);
    setCelebrate(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "siteContent", "hero"),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          if (typeof data.imageUrl === "string" && data.imageUrl.trim()) {
            setHeroImage(data.imageUrl);
          } else {
            setHeroImage(DEFAULT_HERO_IMAGE);
          }
        } else {
          setHeroImage(DEFAULT_HERO_IMAGE);
        }
      },
      (error) => {
        console.error("Failed to load Hero image:", error);
        setHeroImage(DEFAULT_HERO_IMAGE);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      {playIntro && <HeroIntro onReveal={handleIntroReveal} />}
      {celebrate && <HeroConfetti />}

      <section
        className={`omt-hero ${revealed ? "is-revealed" : ""}`}
        id="home"
      >
        <div className="omt-hero-grid"></div>
        <div className="omt-hero-glow"></div>

        <div className="omt-hero-counter">
          <span>FRAME</span>
          <strong>001</strong>
          <i></i>
        </div>

        <div className="omt-hero-content">
          <div className="omt-hero-eyebrow">
            <span className="omt-live-dot"></span>
            CREATIVE VIDEO PRODUCTION STUDIO
          </div>

          <h1 className="omt-hero-title" aria-label="Ideas deserve a better take.">
            {TITLE_LINES.map((line, index) => (
              <span
                className={line.className}
                key={line.text}
                aria-hidden="true"
              >
                <span className="omt-title-inner" style={{ "--line": index }}>
                  {line.text}
                </span>
              </span>
            ))}
          </h1>

          <div className="omt-hero-description">
            <span className="omt-description-line"></span>
            <p>
              We shoot. We edit. We create.
              <br />
              Visual stories that make people stop,
              <br />
              watch and remember.
            </p>
          </div>

          <div className="omt-hero-actions">
            <a href="#work" className="omt-hero-primary">
              <span className="omt-play-icon">▶</span>
              Explore Our Work
              <span className="omt-action-arrow">↗</span>
            </a>

            <a href="#services" className="omt-hero-secondary">
              Discover Our Services <span>↓</span>
            </a>
          </div>

          <div className="omt-hero-stats">
            <div>
              <strong>01</strong>
              <span>CREATIVE STUDIO</span>
            </div>

            <div>
              <strong>∞</strong>
              <span>STORIES TO TELL</span>
            </div>

            <div>
              <strong>4K</strong>
              <span>DETAIL IN EVERY FRAME</span>
            </div>
          </div>
        </div>

        <div className={`omt-hero-visual cam-${cameraPhase}`}>
          <div className="omt-visual-ring omt-ring-one"></div>
          <div className="omt-visual-ring omt-ring-two"></div>

          <div className="omt-camera-tag">
            <span className="omt-live-dot"></span>
            PRODUCTION IN PROGRESS
          </div>

          <span className="omt-camera-flash" aria-hidden="true" />

          {/* Exploded view: each real part of the camera moves on its own */}
          <div
            className="omt-camera-parts"
            aria-hidden="true"
            style={
              partsBox
                ? {
                    left: `${partsBox.left}px`,
                    top: `${partsBox.top}px`,
                    width: `${partsBox.width}px`,
                    height: `${partsBox.height}px`,
                    "--u": `${partsBox.width / 100}px`,
                  }
                : { display: "none" }
            }
          >
            {cameraGuides.map((guide) => (
              <span
                key={`${guide.direction}-${guide.position}`}
                className={`omt-guide-line omt-guide-${guide.direction}`}
                style={
                  guide.direction === "x"
                    ? { top: `${guide.position}%` }
                    : { left: `${guide.position}%` }
                }
              />
            ))}

            {cameraParts.map((part) => (
              <img
                key={part.name}
                className="omt-camera-shard"
                src={heroImage}
                alt=""
                draggable={false}
                loading="eager"
                style={{
                  clipPath: part.clipPath,
                  "--dx": part.dx,
                  "--dy": part.dy,
                  "--rot": `${part.rot || 0}deg`,
                  "--d": `${part.delay}s`,
                }}
              />
            ))}

            {cameraScrews.map((screw, index) => (
              <i
                key={index}
                className="omt-guide-screw"
                style={{
                  left: `${screw.x}%`,
                  top: `${screw.y}%`,
                  "--dx": screw.dx,
                  "--dy": screw.dy,
                  "--d": `${(0.25 + index * 0.03).toFixed(2)}s`,
                }}
              />
            ))}
          </div>

          <img
            ref={cameraRef}
            className="omt-hero-camera omt-camera-main"
            src={heroImage}
            alt="Professional cinema camera setup"
            loading="eager"
            onLoad={measureParts}
            onError={() => {
              if (heroImage !== DEFAULT_HERO_IMAGE) {
                setHeroImage(DEFAULT_HERO_IMAGE);
              }
            }}
          />

          <div className="omt-camera-caption">
            <span>CAM 01 / MAIN SHOT</span>
            <span>● REC</span>
          </div>

          <div className="omt-edit-card">
            <div className="omt-edit-top">
              <span>ONE MORE TAKE / EDIT</span>
              <span>4K · 24FPS</span>
            </div>

            <div className="omt-edit-preview">
              <div className="omt-preview-play">▶</div>
              <span>PREVIEW WINDOW</span>
            </div>

            <div className="omt-edit-timeline">
              <span>VIDEO</span>

              <div className="omt-timeline-clips">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>

              <span>AUDIO</span>

              <div className="omt-audio-wave">
                {Array.from({ length: 24 }, (_, i) => (
                  <i key={i}></i>
                ))}
              </div>
            </div>
          </div>

          <div className="omt-handwriting">
            Shoot.
            <br />
            Edit.
            <br />
            Create.
            <br />
            Inspire.
            <span></span>
          </div>
        </div>

        <a className="omt-scroll-hint" href="#about">
          <span>SCROLL TO EXPLORE</span>
          <i></i>
        </a>
      </section>
    </>
  );
};

export default Hero;