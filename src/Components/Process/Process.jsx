import React from "react";
import { useSiteContent } from "../../content/useSiteContent";
import { MultiLine, SectionTitle } from "../../content/ContentText";
import "./Process.css";

// The first 5 steps have their own small illustration
function StepVisual({ index }) {
  if (index === 0) {
    return (
      <div className="paper-lines">
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  }
  if (index === 1) return <div className="mini-camera">◉</div>;
  if (index === 2) {
    return (
      <div className="mini-edit">
        <i />
        <i />
        <i />
      </div>
    );
  }
  if (index === 3) {
    return (
      <div className="color-wheels">
        <i />
        <i />
        <i />
      </div>
    );
  }
  return <div className="deliver-icon">↗</div>;
}

export default function Process() {
  const content = useSiteContent("process");

  return (
    <section className="process">
      <div className="process-bg" />

      <div className="process-inner">
        <div className="process-intro reveal">
          <div className="section-label light">
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

          <p>
            <MultiLine text={content.intro} />
          </p>
        </div>

        <div className="process-track">
          <div className="process-line">
            <span />
          </div>

          {content.steps.map((step, index) => (
            <div
              className={`process-step reveal delay-${index % 5}`}
              key={index}
            >
              <small>{String(index + 1).padStart(2, "0")}</small>

              <div className="process-card">
                <div className={`process-visual pv-${index % 5}`}>
                  <StepVisual index={index} />
                </div>
              </div>

              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
