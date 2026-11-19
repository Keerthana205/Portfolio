import { useEffect, useState } from "react";
import { Mail, Menu, X } from "lucide-react";
import { assetUrl } from "../../../assetUrl.js";

const sectionLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Get in Touch", href: "#contact" },
];

export default function PortfolioNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const sections = sectionLinks
      .map(({ href }) => document.querySelector(href))
      .filter(Boolean);
    let frame = null;
    const updateActiveSection = () => {
      frame = null;
      const focusLine = window.innerHeight * 0.35;
      let currentSection = sections[0];

      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= focusLine) currentSection = section;
      });

      if (currentSection) setActiveSection(currentSection.id);
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <header className="portfolio-nav">
      <a className="portfolio-nav__brand" href="#home" aria-label="Keerthana Devan, home">
        <img src={assetUrl("assets/brand/keerthana-logo.webp")} alt="" width="800" height="540" />
      </a>
      <button
        className="portfolio-nav__menu-button"
        type="button"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
      <nav
        className={`portfolio-nav__links${menuOpen ? " portfolio-nav__links--open" : ""}`}
        aria-label="Main navigation"
      >
        {sectionLinks.map((link) => (
          <a
            key={link.href}
            className={[
              link.href === "#contact" ? "portfolio-nav__contact" : "",
              activeSection === link.href.slice(1) ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            href={link.href}
            aria-current={activeSection === link.href.slice(1) ? "location" : undefined}
            onClick={() => {
              setActiveSection(link.href.slice(1));
              closeMenu();
            }}
          >
            {link.label}
            {link.href === "#contact" && <Mail size={16} strokeWidth={2.2} aria-hidden="true" />}
          </a>
        ))}
      </nav>
    </header>
  );
}
