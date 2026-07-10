import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState } from

"react";
import { useNavigate } from "@tanstack/react-router";
import { getReduceMotion, subscribeReduceMotion } from "./preferences";


















const TransitionContext = createContext(null);

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition outside provider");
  return ctx;
}

const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
const SAFETY_MS = 2000;

export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [fogPaused, setFogPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const safetyRef = useRef(null);

  useEffect(() => {
    setReduce(getReduceMotion());
    return subscribeReduceMotion(setReduce);
  }, []);

  const clearSafety = () => {
    if (safetyRef.current) {
      window.clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
  };

  const runTransition = useCallback(
    (kind, target, origin) => {
      if (reduce) {
        // Simple fade
        setState({ kind, originX: origin.x, originY: origin.y, phase: "closing", caption: "" });
        window.setTimeout(() => {
          navigate({ to: target.to, params: target.params });
          setState((s) => s ? { ...s, phase: "opening" } : s);
          window.setTimeout(() => setState(null), 180);
        }, 90);
        return;
      }

      const caption =
      kind === "exhale" ? "O P E N I N G   T H E   C A S E   F I L E" : "S T E P P I N G   I N T O   T H E   C A S E";
      setState({ kind, originX: origin.x, originY: origin.y, phase: "closing", caption });

      // exhale: fog-in 500 + held 350, sweep: sweep 500 + held 300
      const closeMs = kind === "exhale" ? 500 : 500;
      const holdMs = kind === "exhale" ? 350 : 300;

      const navigateAt = closeMs + holdMs;
      const totalMs = navigateAt + 600;

      window.setTimeout(() => {
        navigate({ to: target.to, params: target.params });
        setState((s) => s ? { ...s, phase: "opening" } : s);
      }, navigateAt);

      window.setTimeout(() => setState(null), totalMs);

      clearSafety();
      safetyRef.current = window.setTimeout(() => setState(null), SAFETY_MS);
    },
    [navigate, reduce]
  );

  useEffect(() => () => clearSafety(), []);

  const ctx = useMemo(
    () => ({ fogPaused, setFogPaused, runTransition }),
    [fogPaused, runTransition]
  );

  return (
    <TransitionContext.Provider value={ctx}>
      {children}
      <TransitionOverlay state={state} reduce={reduce} />
    </TransitionContext.Provider>);

}

function TransitionOverlay({
  state,
  reduce



}) {
  if (!state) return null;

  if (reduce) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100]"
        style={{
          backgroundColor: "var(--color-bg-base)",
          opacity: state.phase === "closing" ? 1 : 0,
          transition: `opacity 180ms ${EASE}`
        }} />);


  }

  const { kind, originX, originY, phase, caption } = state;

  // Common caption element
  const captionEl =
  <div
    className="pointer-events-none fixed inset-0 z-[102] flex items-center justify-center"
    style={{
      opacity: phase === "closing" ? 1 : 0,
      transition: `opacity 400ms ${EASE}`
    }}>
    
      <span
      className="tracked-caps text-[11px]"
      style={{
        color: "var(--color-text-secondary)",
        letterSpacing: "0.4em"
      }}>
      
        {caption}
      </span>
    </div>;


  if (kind === "exhale") {
    // Fog exhales in, holds, then dissipates as new page fades up.
    return (
      <>
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[101]"
          style={{
            background:
            "radial-gradient(ellipse at 20% 30%, rgba(230,220,200,0.10), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(200,190,175,0.09), transparent 60%), var(--color-bg-base)",
            opacity: phase === "closing" ? 1 : 0,
            transition:
            phase === "closing" ?
            `opacity 500ms ${EASE}` :
            `opacity 600ms ${EASE}`
          }} />
        
        {captionEl}
      </>);

  }

  // sweep: a growing clear disc pushes fog outward from the click origin,
  // then the destination fades up.
  const maxR = Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY)
  );
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[101]"
        style={{
          background: "var(--color-bg-base)",
          opacity: phase === "closing" ? 0 : 0,
          transition: `opacity 600ms ${EASE}`
          // Use clip-path to punch a growing hole through a full-screen scrim.
          // Start with the scrim visible only at closing? We instead skip a scrim
          // and rely on the caption + subsequent opening fade — matches the spec
          // (clear scene revealed, then destination cross-fades in).
        }} />
      
      {/* Opening fade for destination page */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[101]"
        style={{
          backgroundColor: "var(--color-bg-base)",
          opacity: phase === "closing" ? 0 : 0.001, // negligible; destination handles its own fade
          transition: `opacity 600ms ${EASE}`
        }} />
      
      {/* Radial "clearing" pulse — a soft luminous ring expanding outward */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[101]"
        style={{
          background: `radial-gradient(circle at ${originX}px ${originY}px, rgba(232,225,211,0.18) 0%, rgba(232,225,211,0.06) 20%, rgba(232,225,211,0) 45%)`,
          transform: phase === "closing" ? `scale(1)` : `scale(1.4)`,
          transformOrigin: `${originX}px ${originY}px`,
          opacity: phase === "closing" ? 1 : 0,
          transition: `opacity 500ms ${EASE}, transform 500ms ${EASE}`,
          // hint at outward push
          maskImage: `radial-gradient(circle at ${originX}px ${originY}px, black 0px, black ${maxR * 0.9}px, transparent ${maxR}px)`,
          WebkitMaskImage: `radial-gradient(circle at ${originX}px ${originY}px, black 0px, black ${maxR * 0.9}px, transparent ${maxR}px)`
        }} />
      
      {captionEl}
    </>);

}