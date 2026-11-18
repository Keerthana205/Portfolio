import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2, Github, Linkedin, Mail, MapPin, Send, X } from "lucide-react";
import { socialLinks } from "../../../data/portfolioContent.js";
import SectionHeading from "./SectionHeading.jsx";

const EMAIL = "keerthanadevan@gmail.com";
const FORM_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT;
let didWarnMissingFormEndpoint = false;

export default function ContactSection() {
  const [status, setStatus] = useState("idle");
  const [fieldErrors, setFieldErrors] = useState({});
  const [toastType, setToastType] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);
  const successTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const toastExitTimerRef = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(successTimerRef.current);
    window.clearTimeout(toastTimerRef.current);
    window.clearTimeout(toastExitTimerRef.current);
  }, []);

  const dismissToast = () => {
    window.clearTimeout(toastTimerRef.current);
    window.clearTimeout(toastExitTimerRef.current);
    toastTimerRef.current = null;
    setToastExiting(true);
    toastExitTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
      setToastExiting(false);
      setToastType(null);
      toastExitTimerRef.current = null;
    }, 350);
  };

  const showToast = (type) => {
    window.clearTimeout(toastTimerRef.current);
    window.clearTimeout(toastExitTimerRef.current);
    toastExitTimerRef.current = null;
    setToastType(type);
    setToastExiting(false);
    setToastVisible(true);
    toastTimerRef.current = window.setTimeout(dismissToast, 5000);
  };

  const showSuccess = (form) => {
    window.clearTimeout(successTimerRef.current);
    form.reset();
    setFieldErrors({});
    setStatus("success");
    showToast("success");
    successTimerRef.current = window.setTimeout(() => setStatus("idle"), 6000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "submitting") return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (String(formData.get("_gotcha") ?? "").trim()) {
      showSuccess(form);
      return;
    }

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const errors = {
      name: name ? "" : "Please enter your name.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? ""
        : "Please enter a valid email address.",
      message: message ? "" : "Please enter a message.",
    };
    setFieldErrors(errors);
    window.clearTimeout(successTimerRef.current);
    successTimerRef.current = null;
    if (Object.values(errors).some(Boolean)) {
      setStatus("idle");
      return;
    }

    const endpoint = FORM_ENDPOINT?.trim();
    if (!endpoint) {
      setStatus("error");
      showToast("error");
      if (!didWarnMissingFormEndpoint) {
        if (import.meta.env.DEV) {
          console.warn("VITE_FORMSPREE_ENDPOINT is not configured.");
        }
        didWarnMissingFormEndpoint = true;
      }
      return;
    }

    formData.set("_subject", `Portfolio message from ${name}`);
    setStatus("submitting");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Form submission failed.");
      showSuccess(form);
    } catch {
      setStatus("error");
      showToast("error");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title" data-reveal-group data-nav-theme="dark">
      <img
        className="contact-section__flower"
        src="/assets/decor/red-hibiscus.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        data-reveal
      />
      <div className="page-container contact-section__inner">
        <div className="contact-section__copy" data-scroll-flow>
          <SectionHeading
            eyebrow="Have an idea or opportunity?"
            id="contact-title"
            title={<>Let’s Build<br />Something Together</>}
            light
          />
          <p className="contact-section__intro">
            Have an idea, opportunity, or just want to say hi? I’d love to hear from you.
          </p>
          <ul className="contact-links">
            <li>
              <Mail size={17} aria-hidden="true" />
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            {socialLinks.map((link) => (
              <li key={link.label}>
                {link.label === "LinkedIn" ? (
                  <Linkedin size={17} aria-hidden="true" />
                ) : (
                  <Github size={17} aria-hidden="true" />
                )}
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.href.replace(/^https:\/\//, "")}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </li>
            ))}
            <li>
              <MapPin size={17} aria-hidden="true" />
              <span>Cherthala, Kerala</span>
            </li>
          </ul>
        </div>
        <form className="contact-form" onSubmit={handleSubmit} data-scroll-flow noValidate>
          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px" }}
          />
          <label>
            Your Name
                <input
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
                  maxLength={100}
              required
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
            />
            {fieldErrors.name && <span className="contact-form__error" id="contact-name-error">{fieldErrors.name}</span>}
          </label>
          <label>
            Your Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              maxLength={254}
              required
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
            />
            {fieldErrors.email && <span className="contact-form__error" id="contact-email-error">{fieldErrors.email}</span>}
          </label>
          <label>
            Message
            <textarea
              name="message"
              rows="4"
              placeholder="Write your message..."
              maxLength={4000}
              required
              aria-invalid={fieldErrors.message ? true : undefined}
              aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
            />
            {fieldErrors.message && <span className="contact-form__error" id="contact-message-error">{fieldErrors.message}</span>}
          </label>
          <button className="button button--ivory contact-form__submit" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? (
              <>Sending... <span className="contact-form__spinner" aria-hidden="true" /></>
            ) : (
              <>Send Message <Send size={14} aria-hidden="true" /></>
            )}
          </button>
        </form>
      </div>
      {createPortal(
        <div
          className={`contact-toast${toastType ? ` contact-toast--${toastType}` : ""}${toastVisible ? " is-visible" : ""}${toastExiting ? " is-exiting" : ""}`}
          role="status"
          aria-live="polite"
          aria-hidden={!toastVisible}
          inert={!toastVisible || toastExiting}
        >
          {toastType && (
            toastType === "success" ? (
              <CheckCircle2 className="contact-toast__icon" size={19} aria-hidden="true" />
            ) : (
              <AlertCircle className="contact-toast__icon" size={19} aria-hidden="true" />
            )
          )}
          <span className="contact-toast__message">
            {toastType && (toastType === "success"
              ? "Thanks! Your message has been sent."
              : "Something went wrong. Please try again.")}
          </span>
          <button
            className="contact-toast__dismiss"
            type="button"
            aria-label="Dismiss"
            tabIndex={toastVisible && !toastExiting ? 0 : -1}
            onClick={dismissToast}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>,
        document.body,
      )}
    </section>
  );
}
