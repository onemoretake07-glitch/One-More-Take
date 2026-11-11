import React from "react";
import { useSiteContent } from "../../content/useSiteContent";
import { SectionTitle } from "../../content/ContentText";
import "./Experience.css";

export default function Experience() {
  const content = useSiteContent("experience");

  return (
    <section id="experience" className="experience section">
      <div className="experience-heading reveal">
        <div className="section-label">
          <span />
          {content.label}
        </div>

        <h2>
          <SectionTitle
            lines={content.titleLines}
            accent={content.titleAccent}
            accentNewLine={content.accentNewLine}
          />
        </h2>

        <p>{content.intro}</p>
      </div>

      <div className="experience-grid">
        {content.stats.map((stat, index) => (
          <article
            className={`experience-card reveal delay-${index % 4}`}
            key={index}
          >
            <span className="experience-index">
              {String(index + 1).padStart(2, "0")}
            </span>

            <strong>{stat.number}</strong>

            <h3>{stat.title}</h3>

            <p>{stat.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
