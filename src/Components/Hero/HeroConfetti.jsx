import React, { useEffect, useRef } from "react";

const COLORS = [
  "#ed111b",
  "#ff4d55",
  "#c40d16",
  "#111111",
  "#ffc93c",
  "#ff8a00",
  "#ff6fa5",
];

const SHOWER_DELAY_MS = 350;
const RAIN_PER_SECOND = 14; // continuous falling confetti (desktop)
const RAIN_PER_SECOND_MOBILE = 7;
const RIBBON_TRAIL = 14;

const random = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function createParticle(x, y, angleDeg, speed, type) {
  const angle = (angleDeg * Math.PI) / 180;

  return {
    type,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: pick(COLORS),
    size: type === "ribbon" ? random(4, 6) : random(6, 11),
    ratio: random(1.3, 1.9),
    rotation: random(0, Math.PI * 2),
    rotationSpeed: random(-0.25, 0.25),
    tilt: random(0, Math.PI * 2),
    tiltSpeed: random(0.08, 0.2),
    wobble: random(0, Math.PI * 2),
    wobbleSpeed: random(0.05, 0.12),
    wobbleAmount: type === "ribbon" ? random(1.5, 3) : random(0.4, 1.2),
    drag: type === "ribbon" ? 0.95 : random(0.952, 0.962),
    gravity: type === "ribbon" ? 0.22 : random(0.22, 0.28),
    trail: [],
  };
}

// Party popper burst from a corner
function burst(particles, x, y, baseAngle, count, ribbons, power) {
  for (let i = 0; i < count; i += 1) {
    const type = Math.random() < 0.3 ? "circle" : "paper";
    particles.push(
      createParticle(x, y, baseAngle + random(-16, 16), power * random(0.55, 1), type)
    );
  }

  for (let i = 0; i < ribbons; i += 1) {
    particles.push(
      createParticle(x, y, baseAngle + random(-12, 12), power * random(0.7, 1), "ribbon")
    );
  }
}

// Gentle confetti rain from the top
function shower(particles, width, count) {
  for (let i = 0; i < count; i += 1) {
    const type = Math.random() < 0.12 ? "ribbon" : Math.random() < 0.3 ? "circle" : "paper";
    particles.push(
      createParticle(random(0, width), random(-80, -10), random(70, 110), random(0, 3), type)
    );
  }
}

function drawParticle(ctx, p) {
  ctx.fillStyle = p.color;
  ctx.strokeStyle = p.color;

  if (p.type === "ribbon") {
    if (p.trail.length < 2) return;

    ctx.lineWidth = p.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p.trail[0].x, p.trail[0].y);

    for (let i = 1; i < p.trail.length; i += 1) {
      const point = p.trail[i];
      const curl = Math.sin(p.wobble + i * 0.9) * 3;
      ctx.lineTo(point.x + curl, point.y);
    }

    ctx.stroke();
    return;
  }

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  // Flipping paper look: squash one side with the tilt
  ctx.scale(1, Math.cos(p.tilt));

  if (p.type === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-p.size / 2, (-p.size * p.ratio) / 2, p.size, p.size * p.ratio);
  }

  ctx.restore();
}

const HeroConfetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const isSmall = width < 700;
    const power = height * (isSmall ? 0.05 : 0.046);
    const perSide = isSmall ? 55 : 95;
    const ribbonsPerSide = isSmall ? 8 : 14;

    const particles = [];
    burst(particles, -10, height + 10, isSmall ? -70 : -58, perSide, ribbonsPerSide, power);
    burst(particles, width + 10, height + 10, isSmall ? -110 : -122, perSide, ribbonsPerSide, power);

    // Keep raining only while the Hero is on screen (saves battery/CPU)
    let heroVisible = true;
    let observer = null;
    const heroSection = document.getElementById("home");
    if (heroSection && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
      });
      observer.observe(heroSection);
    }

    const rainPerSecond = isSmall ? RAIN_PER_SECOND_MOBILE : RAIN_PER_SECOND;
    let rainBudget = 0;
    let showered = false;
    let frame = 0;
    const start = performance.now();
    let last = start;

    const tick = (now) => {
      const elapsed = now - start;
      const dt = Math.min((now - last) / (1000 / 60), 3); // 60fps steps, capped
      last = now;

      if (!showered && elapsed > SHOWER_DELAY_MS) {
        showered = true;
        shower(particles, width, isSmall ? 40 : 80);
      }

      // Continuous confetti rain after the first big burst
      if (showered && heroVisible) {
        rainBudget += (rainPerSecond * dt) / 60;
        const count = Math.floor(rainBudget);
        if (count > 0) {
          rainBudget -= count;
          shower(particles, width, count);
        }
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        const drag = Math.pow(p.drag, dt);

        p.vx *= drag;
        p.vy = p.vy * drag + p.gravity * dt;
        p.wobble += p.wobbleSpeed * dt;
        p.x += (p.vx + Math.sin(p.wobble) * p.wobbleAmount) * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotationSpeed * dt;
        p.tilt += p.tiltSpeed * dt;

        if (p.type === "ribbon") {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > RIBBON_TRAIL) p.trail.shift();
        }

        if (p.y > height + 60 || p.x < -120 || p.x > width + 120) {
          particles.splice(i, 1);
          continue;
        }

        drawParticle(ctx, p);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10000,
        pointerEvents: "none",
      }}
    />
  );
};

export default HeroConfetti;