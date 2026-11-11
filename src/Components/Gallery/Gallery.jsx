import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useSiteContent } from "../../content/useSiteContent";
import "./Gallery.css";

export default function Gallery() {
  const content = useSiteContent("gallery");
  const [galleryItems, setGalleryItems] = useState([]);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "siteContent", "gallery"),
      (snapshot) => {
        const data = snapshot.exists() ? snapshot.data() : {};
        const items = Array.isArray(data.images) ? data.images : [];

        setGalleryItems(
          items.filter((item) => item.url).map((item, index) => ({
            id: item.id || item.publicId || item.url || String(index),
            title: item.title || `Creative Project ${index + 1}`,
            category: item.category || "CREATIVE PRODUCTION",
            description: item.description || "A story brought to life.",
            image: item.url,
          }))
        );

        setActive(0);
      },
      (error) => {
        console.error("Failed to load gallery:", error);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (galleryItems.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % galleryItems.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [galleryItems.length]);

  const next = () => {
    if (!galleryItems.length) return;
    setActive((current) => (current + 1) % galleryItems.length);
  };

  const previous = () => {
    if (!galleryItems.length) return;
    setActive(
      (current) => (current - 1 + galleryItems.length) % galleryItems.length
    );
  };

  return (
    <section className="omt-gallery" id="gallery">
      <div className="omt-gallery-heading">
        <span className="omt-gallery-eyebrow">{content.eyebrow}</span>
        <h2>
          {content.titleStart} <span>{content.titleAccent}</span>
        </h2>
        <p>{content.description}</p>
      </div>

      {galleryItems.length === 0 ? (
        <p className="omt-gallery-empty">
          {content.emptyText}
        </p>
      ) : (
        <>
          <div className="omt-carousel">
            {galleryItems.map((project, index) => {
              const total = galleryItems.length;
              const rawOffset = (index - active + total) % total;
              const position =
                rawOffset > Math.floor(total / 2)
                  ? rawOffset - total
                  : rawOffset;

              const distance = Math.abs(position);
              const scale = Math.max(0.61, 1 - distance * 0.13);
              const opacity = Math.max(0.12, 1 - distance * 0.28);
              const brightness = Math.max(0.4, 1 - distance * 0.18);

              return (
                <article
                  key={project.id}
                  className={`omt-carousel-card ${
                    index === active ? "is-active" : ""
                  }`}
                  style={{
                    "--position": position,
                    "--offset": `${position * 68}%`,
                    "--scale": scale,
                    "--rotate": `${position * -9}deg`,
                    "--opacity": opacity,
                    "--brightness": brightness,
                    "--layer": 10 - distance,
                  }}
                  onClick={() => setActive(index)}
                  aria-label={`Show ${project.title}`}
                  aria-current={index === active ? "true" : undefined}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    draggable="false"
                  />

                  <div className="omt-carousel-overlay">
                    <span>{project.category}</span>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="omt-gallery-controls">
            <button
              type="button"
              className="omt-gallery-arrow"
              onClick={previous}
              aria-label="Previous image"
            >
              ←
            </button>

            <div className="omt-gallery-dots">
              {galleryItems.map((project, index) => (
                <button
                  type="button"
                  key={project.id}
                  className={active === index ? "active" : ""}
                  onClick={() => setActive(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={active === index ? "true" : undefined}
                />
              ))}
            </div>

            <button
              type="button"
              className="omt-gallery-arrow"
              onClick={next}
              aria-label="Next image"
            >
              →
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        className="omt-gallery-view-all"
        onClick={() => navigate("/gallery")}
      >
        View All Projects <span>↗</span>
      </button>
    </section>
  );
}