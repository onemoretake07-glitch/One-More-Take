import React from "react";
import { safeLink, useSiteContent } from "../../content/useSiteContent";
import "./Footer.css";

const SOCIALS = [
  { key: "instagram", label: "Instagram", short: "IG" },
  { key: "youtube", label: "YouTube", short: "YT" },
  { key: "linkedin", label: "LinkedIn", short: "IN" },
];

export default function Footer() {
  const content = useSiteContent("footer");

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <footer className="omt-footer">
      <button
        className="footer-logo"
        onClick={() => scrollTo("home")}
        aria-label="Back to home"
      >
        <span className="logo-mark">
          <i />
        </span>
        <span>{content.brandName}</span>
      </button>

      <nav className="footer-nav" aria-label="Footer navigation">
        {[
          ["home", "Home"],
          ["about", "About"],
          ["work", "Work"],
          ["services", "Services"],
          ["contact", "Contact"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => scrollTo(id)}>
            {label}
          </button>
        ))}
      </nav>

      <div className="footer-social">
        {SOCIALS.map((social) => {
          const link = safeLink(content[social.key], "");
          if (!link) return null;

          return (
            <a
              key={social.key}
              href={link}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
            >
              {social.short}
            </a>
          );
        })}
      </div>

      <p className="footer-copyright">
        © {new Date().getFullYear()} {content.copyrightName}. All rights reserved.
      </p>
    </footer>
  );
}
