import React from "react";
import { useSiteContent } from "../../content/useSiteContent";
import { MultiLine, SectionTitle } from "../../content/ContentText";
import "./About.css";

const About = () => {
  const content = useSiteContent("about");

  return (
    <section id="about" className="about section">
      <div className="about-left reveal">
        <div className="section-label">
          <span></span>
          {content.label}
        </div>

        <h2>
          <SectionTitle
            lines={content.titleLines}
            accent={content.titleAccent}
            accentNewLine={content.accentNewLine}
          />
        </h2>

        <div className="about-decoration" aria-hidden="true">
          <span>OMT</span>
          <i></i>
        </div>
      </div>

      <div className="about-right reveal delay-1">
        <p className="large-copy">
          <MultiLine text={content.leadText} />
        </p>

        {content.paragraphs.filter(Boolean).map((paragraph, index) => (
          <p key={index}>
            <MultiLine text={paragraph} />
          </p>
        ))}

        <div className="about-signature">
          <span>{content.signatureLight}</span>
          <b>{content.signatureBold}</b>
        </div>

        <a href="#services" className="about-link">
          {content.linkText}
          <span>↗</span>
        </a>
      </div>
    </section>
  );
};

export default About;
