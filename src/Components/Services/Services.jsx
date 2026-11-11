
import React from "react";
import { useSiteContent } from "../../content/useSiteContent";
import { SectionTitle } from "../../content/ContentText";
import "./Services.css";

const Services = ({ onGenerateQuotation }) => {
  const content = useSiteContent("services");
  const services = content.items.filter((service) => service.title);

  const handleServiceQuotation = (service) => {
    if (onGenerateQuotation) {
      onGenerateQuotation({
        type: "service",
        name: service.title,
        description: service.description,
        includes: service.tags,
      });
    } else {
      // Fallback if the quotation handler hasn't been passed
      sessionStorage.setItem(
        "omt-selected-quotation-plan",
        JSON.stringify({
          type: "service",
          name: service.title,
          description: service.description,
          includes: service.tags,
        })
      );

      window.location.href = "/quotation";
    }
  };

  const goToContact = () => {
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section id="services" className="omt-services">
      <div className="omt-services-header">
        <div className="omt-services-heading reveal">
          <div className="omt-services-label">
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
        </div>

        <p className="omt-services-intro reveal delay-1">
          {content.intro}
        </p>
      </div>

      <div className="omt-services-list">
        {services.map((service, index) => (
          <article
            className="omt-service-card reveal"
            key={index}
            style={{ "--service-index": index }}
          >
            <span className="omt-service-number">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="omt-service-main">
              <h3>{service.title}</h3>

              <p>{service.description}</p>

              <div className="omt-service-tags">
                {service.tags.filter(Boolean).map((tag, tagIndex) => (
                  <span key={tagIndex}>{tag}</span>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="omt-service-arrow"
              aria-label={`Get quotation for ${service.title}`}
              onClick={() => handleServiceQuotation(service)}
            >
              ↗
            </button>
          </article>
        ))}
      </div>

      <div className="omt-services-bottom reveal">
        <span>{content.bottomText}</span>

        <button
          type="button"
          className="omt-services-create-btn"
          onClick={goToContact}
        >
          {content.bottomButton} <b>↗</b>
        </button>
      </div>
    </section>
  );
};

export default Services;
