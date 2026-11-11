import React from "react";
import { useSiteContent } from "../../content/useSiteContent";
import { SectionTitle } from "../../content/ContentText";
import "./Work.css";

export default function Work() {
  const content = useSiteContent("work");
  const projects = content.projects.filter((project) => project.image);

  const handleContact = () => {
    const contactSection = document.getElementById("contact");

    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section id="work" className="work section">
      <div className="work-header">
        <div className="work-heading">
          <div className="work-label">
            <span className="work-label-line"></span>
            {content.label}
          </div>

          <h2 className="work-title">
            <SectionTitle
              lines={content.titleLines}
              accent={content.titleAccent}
              accentNewLine={content.accentNewLine}
            />
          </h2>

          <p className="work-description">{content.description}</p>
        </div>

        <button
          type="button"
          className="work-cta"
          onClick={handleContact}
        >
          {content.buttonText}
          <span className="work-cta-arrow">↗</span>
        </button>
      </div>

      <div className="work-grid">
        {projects.map((project, index) => (
          <article
            className={`work-card work-card-${(index % 5) + 1}`}
            key={index}
          >
            <img
              className="work-image"
              src={project.image}
              alt={`${project.title} - One More Take`}
              loading="lazy"
            />

            <div className="work-overlay"></div>

            <span className="work-number">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="work-category">
              {project.category}
            </span>

            <div className="work-info">
              <div className="work-info-content">
                <span className="work-info-label">
                  ONE MORE TAKE /{" "}
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3>{project.title}</h3>
              </div>

              <span className="work-card-arrow" aria-hidden="true">
                ↗
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="work-bottom">
        {content.bottomWords.filter(Boolean).map((word, index) => (
          <span key={index}>{word}</span>
        ))}
      </div>
    </section>
  );
}
