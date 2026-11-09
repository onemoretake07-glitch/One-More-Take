import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./Navbar.css";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

const SECTION_IDS = navLinks.map((link) => link.href.slice(1));
const MOBILE_BREAKPOINT = 800;
const HIDE_AFTER_PX = 140;
const AUTO_SCROLL_LOCK_MS = 1000;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeId, setActiveId] = useState("home");

  const headerRef = useRef(null);
  const navRef = useRef(null);
  const linkRefs = useRef({});
  const autoScrollUntil = useRef(0);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Scroll: progress bar, shrink when scrolled, hide on scroll down / show on scroll up
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0;

      headerRef.current?.style.setProperty("--scroll-progress", progress.toFixed(4));
      setScrolled(y > 20);

      if (Date.now() < autoScrollUntil.current) {
        setHidden(false);
        lastY = y;
        return;
      }

      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > HIDE_AFTER_PX);
        lastY = y;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Highlight the link of the section currently on screen
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Sliding red indicator under the active link (desktop)
  const moveIndicator = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;

    const link = linkRefs.current[activeId];
    if (!link) {
      nav.style.setProperty("--indicator-opacity", "0");
      return;
    }

    nav.style.setProperty("--indicator-x", `${link.offsetLeft}px`);
    nav.style.setProperty("--indicator-w", `${link.offsetWidth}px`);
    nav.style.setProperty("--indicator-opacity", "1");
  }, [activeId]);

  useLayoutEffect(() => {
    moveIndicator();
  }, [moveIndicator]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(moveIndicator);
      resizeObserver.observe(nav);
    }

    document.fonts?.ready.then(moveIndicator).catch(() => {});

    return () => resizeObserver?.disconnect();
  }, [moveIndicator]);

  // Mobile menu: lock page scroll, close on Escape or when resized to desktop
  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) setMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  // Smooth scroll that leaves room for the fixed navbar
  const scrollToSection = useCallback((id) => {
    const target = document.getElementById(id);
    if (!target) return false;

    const navHeight = headerRef.current?.offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;

    autoScrollUntil.current = Date.now() + AUTO_SCROLL_LOCK_MS;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    return true;
  }, []);

  const handleLinkClick = (event, href) => {
    const id = href.slice(1);

    if (scrollToSection(id)) {
      event.preventDefault();
      window.history.replaceState(null, "", href);
      setActiveId(id);
    }

    closeMenu();
  };

  const handleBookClick = () => {
    closeMenu();
    scrollToSection("booking");
  };

  const headerClassName = [
    "omt-navbar",
    scrolled ? "is-scrolled" : "",
    hidden && !menuOpen ? "is-hidden" : "",
    menuOpen ? "is-menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header ref={headerRef} className={headerClassName}>
        <a
          href="#home"
          className="omt-navbar-logo"
          onClick={(event) => handleLinkClick(event, "#home")}
          aria-label="One More Take home"
        >
          <img
            src="/One More Take Logo.png"
            alt="One More Take"
          />
        </a>

        <nav
          ref={navRef}
          id="omt-navbar-menu"
          className={`omt-navbar-links ${menuOpen ? "open" : ""}`}
          aria-label="Main navigation"
        >
          <span className="omt-navbar-indicator" aria-hidden="true" />

          {navLinks.map((link, index) => {
            const id = link.href.slice(1);
            const isActive = activeId === id;

            return (
              <a
                key={link.label}
                ref={(element) => {
                  linkRefs.current[id] = element;
                }}
                href={link.href}
                className={`omt-navbar-link ${isActive ? "is-active" : ""}`}
                style={{ "--i": index }}
                aria-label={link.label}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => handleLinkClick(event, link.href)}
              >
                <span className="omt-navbar-link-text">
                  <span data-text={link.label}>{link.label}</span>
                </span>
              </a>
            );
          })}

          <button
            type="button"
            className="omt-navbar-cta"
            style={{ "--i": navLinks.length }}
            onClick={handleBookClick}
          >
            BOOK YOUR SLOT
            <span className="omt-navbar-cta-arrow" aria-hidden="true">↗</span>
          </button>
        </nav>

        <button
          type="button"
          className={`omt-menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="omt-navbar-menu"
        >
          <span />
          <span />
          <span />
        </button>

        <span className="omt-navbar-progress" aria-hidden="true" />
      </header>

      <div
        className={`omt-navbar-backdrop ${menuOpen ? "visible" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </>
  );
};

export default Navbar;