import { BrowserRouter, Route, Routes, Outlet, Navigate, useLocation } from "react-router-dom";
import IntroPage from "../pages/Intro/IntroPage.jsx";
import PortfolioPage from "../pages/Portfolio/PortfolioPage.jsx";

const routerBasename =
  import.meta.env.BASE_URL === "/"
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, "");

function PortfolioLayout() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isReplay =
    location.state?.replay === true || searchParams.get("replay") === "true";
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

  const isIntroActive =
    location.pathname === "/intro" ||
    (location.pathname === "/" && (!hasSeenIntro || isReplay));

  return (
    <>
      <div
        className="portfolio-host"
        aria-hidden={isIntroActive ? "true" : undefined}
        inert={isIntroActive}
        style={
          isIntroActive
            ? { pointerEvents: "none", userSelect: "none" }
            : undefined
        }
      >
        <PortfolioPage />
      </div>
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route element={<PortfolioLayout />}>
          <Route path="/" element={<IntroPage />} />
          <Route path="/intro" element={<IntroPage forceReplay />} />
          <Route path="/portfolio" element={null} />
          <Route path="*" element={<Navigate to="/portfolio" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
