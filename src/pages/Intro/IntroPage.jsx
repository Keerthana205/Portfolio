import { useLayoutEffect, useRef } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import gsap from "gsap";
import "./intro.css";

const NAME_AFTER_MARK = "EERTHANA DEVAN";

function BackgroundLayers() {
  return (
    <svg
      className="intro-background-art"
      viewBox="0 0 1362 768"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="upper-left-layer"
        d="M0 0h310C238 42 204 91 0 147V0Z"
      />
      <path
        className="upper-left-curve"
        d="M0 89C93 72 117 26 205 0m-205 56C60 45 100 19 158 0"
      />
      <path
        className="distant-wave"
        d="M0 454c75 14 103 51 171 51 52 0 72-26 107-12 77 30 134 99 230 130 106 35 211 27 293-5 75-30 131-68 201-63 56 5 64 27 124 17 61-10 103-45 145-37 38 7 61 19 91 12v133H0V454Z"
      />
      <path
        className="near-wave"
        d="M0 526c92 28 142 47 223 42 83-6 146 16 226 55 96 47 185 72 295 53 130-23 199-77 296-82 93-5 120 33 203 4 41-15 80-38 119-36v206H0V526Z"
      />
      <path
        className="lower-curve"
        d="M750 691c181-33 292-113 423-118 74-3 116 6 189 0"
      />
    </svg>
  );
}

function NameAccent() {
  return (
    <svg
      className="name-accent"
      viewBox="0 0 54 46"
      fill="none"
      aria-hidden="true"
    >
      <path d="M7 36 17 7m5 27 15-18m-5 27 19-13" />
    </svg>
  );
}

function PortfolioFlourish() {
  return (
    <svg
      className="portfolio-flourish"
      viewBox="0 0 230 40"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 34C43 12 96-3 120 2c18 4-7 14-27 20-9 3-10 8 1 8 21 0 54-22 131-22" />
    </svg>
  );
}

export default function IntroPage({ forceReplay = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const sceneRef = useRef(null);
  const navigateRef = useRef(navigate);
  const isExitingRef = useRef(false);
  const searchParams = new URLSearchParams(location.search);
  const isReplay =
    forceReplay ||
    location.state?.replay === true ||
    searchParams.get("replay") === "true";

  const hasSeenIntro = (() => {
    try {
      return (
        typeof window !== "undefined" &&
        window.sessionStorage.getItem("hasSeenPortfolioIntro") === "true"
      );
    } catch {
      return false;
    }
  })();

  useLayoutEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useLayoutEffect(() => {
    if (hasSeenIntro && !isReplay) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const scene = sceneRef.current;
    if (!scene) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const logo = scene.querySelector(".intro-logo");
    const name = scene.querySelector(".intro-name");
    const nameLetters = scene.querySelectorAll(".name-letter");
    const nameAccent = scene.querySelector(".name-accent");
    const series = scene.querySelector(".portfolio-series");
    const flourish = scene.querySelector(".portfolio-flourish");
    const characterVideo = scene.querySelector(".intro-character-video");
    const characterFallback = scene.querySelector(
      ".intro-character-fallback",
    );
    const useAnimatedImageFallback =
      !characterVideo.canPlayType('video/webm; codecs="vp9"');
    let character = characterVideo;
    let fallbackTimer;
    let safetyTimer;
    let introTimeline = null;

    const exitIntro = (isSkip = false) => {
      if (isExitingRef.current) return;
      isExitingRef.current = true;
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(safetyTimer);

      try {
        window.sessionStorage.setItem("hasSeenPortfolioIntro", "true");
      } catch (error) {
        console.error("Unable to save intro state in sessionStorage.", error);
      }

      document.body.style.overflow = previousOverflow;

      if (reducedMotion) {
        if (characterVideo && !characterVideo.paused) {
          characterVideo.pause();
        }
        navigateRef.current("/portfolio", { replace: true });
        return;
      }

      const duration = isSkip ? 0.38 : 0.85;
      const ease = isSkip ? "power2.out" : "power2.inOut";

      gsap.to(scene, {
        autoAlpha: 0,
        duration,
        ease,
        onComplete: () => {
          if (characterVideo && !characterVideo.paused) {
            characterVideo.pause();
          }
          navigateRef.current("/portfolio", { replace: true });
        },
      });
    };

    scene._handleExit = exitIntro;

    const handleVideoEnded = () => {
      if (introTimeline && introTimeline.isActive()) {
        introTimeline.eventCallback("onComplete", () => exitIntro(false));
      } else {
        exitIntro(false);
      }
    };

    if (characterVideo) {
      characterVideo.addEventListener("ended", handleVideoEnded);
      characterVideo.addEventListener("error", () => exitIntro(false));
    }

    if (reducedMotion) {
      gsap.set(nameAccent, { autoAlpha: 1 });
      gsap.set(".skip-intro", { autoAlpha: 1, y: 0 });
      gsap.set([logo, name, series, flourish, character], {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
      });
      safetyTimer = window.setTimeout(() => exitIntro(false), 3000);
      return () => {
        window.clearTimeout(safetyTimer);
        document.body.style.overflow = previousOverflow;
      };
    }

    if (useAnimatedImageFallback) {
      characterVideo.removeAttribute("src");
      characterVideo.load();
      characterVideo.hidden = true;
      characterFallback.hidden = false;
      character = characterFallback;
    }

    const context = gsap.context(() => {
      const logoBounds = logo.getBoundingClientRect();
      const initialShift =
        window.innerWidth / 2 - (logoBounds.left + logoBounds.width / 2);
      const letterStagger = 0.065;
      const letterDuration = 0.34;
      const typingDuration =
        letterDuration + (nameLetters.length - 1) * letterStagger;

      gsap.set(logo, {
        opacity: 1,
        x: initialShift,
        z: 1000,
        scale: 2.3,
      });
      gsap.set(name, { x: initialShift });
      gsap.set(nameLetters, { autoAlpha: 0, y: 12 });
      gsap.set(nameAccent, { autoAlpha: 0, y: 5, scale: 0.92 });
      gsap.set([series, flourish, character], { autoAlpha: 0, y: 14 });
      gsap.set(".skip-intro", { autoAlpha: 0, y: -8 });

      const timeline = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          if (characterVideo && characterVideo.ended) {
            exitIntro(false);
          }
        },
      });
      introTimeline = timeline;

      timeline
        .to(".skip-intro", { autoAlpha: 1, y: 0, duration: 0.45 }, 0.15)
        .to(
          logo,
          {
            z: 0,
            scale: 1,
            duration: 1.45,
            ease: "power3.out",
          },
          0,
        )
        .to(
          nameLetters,
          {
            autoAlpha: 1,
            y: 0,
            duration: letterDuration,
            stagger: letterStagger,
            ease: "power2.out",
          },
          ">+=0.2",
        )
        .to(
          [logo, name],
          { x: 0, duration: typingDuration, ease: "power1.inOut" },
          "<",
        )
        .to(
          nameAccent,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.35 },
          ">",
        )
        .to(
          series,
          { autoAlpha: 1, y: 0, duration: 0.65 },
          ">-0.05",
        )
        .to(
          flourish,
          { autoAlpha: 1, y: 0, duration: 0.6 },
          "<0.12",
        )
        .to(
          character,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            onStart: () => {
              if (useAnimatedImageFallback) {
                characterFallback.src = characterFallback.dataset.src;
                fallbackTimer = window.setTimeout(
                  () => exitIntro(false),
                  (109 / 24) * 1000,
                );
                return;
              }

              characterVideo.play().catch((error) => {
                console.error(
                  "Unable to play the intro character video.",
                  error,
                );
                exitIntro(false);
              });
            },
          },
          "<0.1",
        );
    }, scene);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(safetyTimer);
      if (characterVideo) {
        characterVideo.removeEventListener("ended", handleVideoEnded);
      }
      document.body.style.overflow = previousOverflow;
      if (characterVideo && !characterVideo.paused) {
        characterVideo.pause();
      }
      context.revert();
    };
  }, [hasSeenIntro, isReplay]);

  const skipIntro = () => {
    const scene = sceneRef.current;
    if (scene && scene._handleExit) {
      scene._handleExit(true);
    } else {
      try {
        window.sessionStorage.setItem("hasSeenPortfolioIntro", "true");
      } catch (error) {
        console.error("Unable to save intro state in sessionStorage.", error);
      }
      navigate("/portfolio", { replace: true });
    }
  };

  if (hasSeenIntro && !isReplay) {
    return <Navigate to="/portfolio" replace />;
  }

  return (
    <main className="intro-scene" ref={sceneRef}>
      <BackgroundLayers />

      <section className="intro-content" aria-labelledby="intro-title">
        <button className="skip-intro" type="button" onClick={skipIntro}>
          Skip Intro <span aria-hidden="true">→</span>
        </button>

        <div className="name-lockup">
          <img
            className="intro-logo"
            src="/assets/brand/keerthana-logo.webp"
            alt=""
          />
          <h1 className="intro-name" id="intro-title" aria-label="Keerthana Devan">
            {NAME_AFTER_MARK.split("").map((letter, index) =>
              letter === " " ? (
                <span
                  className="name-space"
                  aria-hidden="true"
                  key={`space-${index}`}
                >
                  {" "}
                </span>
              ) : (
                <span
                  className="name-letter"
                  aria-hidden="true"
                  key={`${letter}-${index}`}
                >
                  {letter}
                </span>
              ),
            )}
          </h1>
          <NameAccent />
        </div>

        <div className="portfolio-series">
          <span className="series-rule" />
          <p>Portfolio Series</p>
          <span className="series-rule" />
        </div>
        <PortfolioFlourish />
      </section>

      <div className="character-stage">
        <video
          className="intro-character intro-character-video"
          src="/assets/characters/intro-character-waving-transparent-full.webm"
          aria-label="Animated character smiling and waving both hands"
          muted
          playsInline
          preload="auto"
          onError={(event) => {
            console.error(
              "Unable to load the intro character video.",
              event.currentTarget.error,
            );
          }}
        />
        <img
          className="intro-character intro-character-fallback"
          data-src="/assets/characters/intro-character-waving-transparent-fallback.webp"
          alt=""
          aria-hidden="true"
          hidden
          onError={() => {
            console.error("Unable to load the animated character fallback.");
          }}
        />
      </div>
    </main>
  );
}
