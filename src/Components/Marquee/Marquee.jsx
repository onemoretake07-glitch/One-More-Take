import React from "react";
import { useSiteContent } from "../../content/useSiteContent";
import "./Marquee.css";

const Marquee = () => {
  const content = useSiteContent("marquee");
  const items = content.items.filter(Boolean);

  if (items.length === 0) return null;

  return (
    <section className="marquee-section">
      <div className="marquee-track">
        {[...items, ...items].map((item, index) => (
          <div className="marquee-item" key={index}>
            <span>{item}</span>
            <span className="marquee-star">✳</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Marquee;
