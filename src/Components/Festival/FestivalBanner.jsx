import React from "react";
import { useSiteContent, safeLink } from "../../content/useSiteContent";
import { getFestivalStatus } from "../../content/festival";
import { MultiLine } from "../../content/ContentText";
import "./FestivalBanner.css";

const THEMES = ["red", "gold", "purple", "green", "blue"];
const LIGHT_COUNT = 18;
const SPARKLE_COUNT = 22;

// First homepage section for festival offers. Controlled from
// Admin -> Festival Section (on/off switch, dates, text, image, theme).
export default function FestivalBanner({ revealed = true }) {
  const festival = useSiteContent("festival");

  if (getFestivalStatus(festival) !== "live") return null;

  const theme = THEMES.includes(festival.theme) ? festival.theme : "red";
  const buttonLink = safeLink(festival.buttonLink, "#booking");
  const isExternal = buttonLink.startsWith("https://");

  return (
    <section
      id="festival"
      className={`omt-festival theme-${theme} ${revealed ? "is-revealed" : ""} ${
        festival.image ? "has-image" : ""
      }`}
      aria-label={festival.title || "Festival offer"}
    >
      {/* Hanging string lights */}
      <div className="omt-festival-lights" aria-hidden="true">
        {Array.from({ length: LIGHT_COUNT }, (_, index) => (
          <i key={index} style={{ "--i": index }} />
        ))}
      </div>

      <div className="omt-festival-rays" aria-hidden="true" />

      {festival.showConfetti && (
        <div className="omt-festival-sparkles" aria-hidden="true">
          {Array.from({ length: SPARKLE_COUNT }, (_, index) => (
            <i key={index} style={{ "--i": index }} />
          ))}
        </div>
      )}

      <div className="omt-festival-inner">
        <div className="omt-festival-content">
          {festival.eyebrow && (
            <span className="omt-festival-eyebrow">
              <b aria-hidden="true">✦</b>
              {festival.eyebrow}
            </span>
          )}

          {festival.title && <h2 className="omt-festival-title">{festival.title}</h2>}

          {festival.subtitle && (
            <p className="omt-festival-subtitle">
              <MultiLine text={festival.subtitle} />
            </p>
          )}

          <div className="omt-festival-actions">
            {festival.offerText && (
              <span className="omt-festival-offer">
                <span aria-hidden="true">%</span>
                {festival.offerText}
              </span>
            )}

            {festival.buttonText && (
              <a
                className="omt-festival-button"
                href={buttonLink}
                {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {festival.buttonText}
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>

        <div className="omt-festival-visual" aria-hidden={!festival.image}>
          {festival.image ? (
            <img src={festival.image} alt={festival.title || "Festival offer"} />
          ) : (
            <div className="omt-festival-emblem">
              <span className="omt-festival-ring" />
              <span className="omt-festival-ring ring-two" />
              <span className="omt-festival-star">✦</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
