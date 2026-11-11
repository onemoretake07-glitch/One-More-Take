import React from "react";
import { digitsOnly, useSiteContent } from "../../content/useSiteContent";
import { MultiLine, SectionTitle } from "../../content/ContentText";

function Contact() {
  const content = useSiteContent("contact");

  const whatsappNumber = digitsOnly(content.whatsappNumber);
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(content.whatsappMessage)}`
    : "";
  const phoneLink = digitsOnly(content.phone);

  return (
    <section id="contact" className="contact">
      <div className="contact-image" aria-hidden="true" />
      <div className="contact-red-light" aria-hidden="true" />

      <div className="contact-inner">
        <div className="contact-main reveal">
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

          {whatsappLink && (
            <a
              className="whatsapp-btn magnetic"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              <span className="magnetic-inner">
                <span>◉</span>
                {content.whatsappButton}
                <b>↗</b>
              </span>
            </a>
          )}
        </div>

        <div className="contact-details reveal delay-1">
          {content.address && (
            <div className="contact-item">
              <span>⌖</span>
              <div>
                <small>OUR STUDIO</small>
                <p>
                  <MultiLine text={content.address} />
                </p>
              </div>
            </div>
          )}

          {content.email && (
            <div className="contact-item">
              <span>✉</span>
              <div>
                <small>EMAIL</small>
                <p>
                  <a href={`mailto:${content.email.trim()}`}>{content.email}</a>
                </p>
              </div>
            </div>
          )}

          {content.phone && (
            <div className="contact-item">
              <span>◔</span>
              <div>
                <small>PHONE</small>
                <p>
                  <a href={`tel:+${phoneLink}`}>{content.phone}</a>
                </p>
              </div>
            </div>
          )}

          {content.hours && (
            <div className="contact-item">
              <span>◷</span>
              <div>
                <small>WORKING HOURS</small>
                <p>
                  <MultiLine text={content.hours} />
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="contact-script" aria-hidden="true">
          <MultiLine text={content.script.join("\n")} />
        </div>
      </div>
    </section>
  );
}

export default Contact;
