import { useEffect, useState } from "react";
import {
  getReduceMotion,
  setReduceMotion,
  subscribeReduceMotion } from
"@/lib/preferences";

export function SettingsModal({
  open,
  onClose



}) {
  const [reduce, setReduce] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setReduce(getReduceMotion());
    return subscribeReduceMotion(setReduce);
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), reduce ? 0 : 400);
    return () => window.clearTimeout(t);
  }, [open, reduce]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const toggleReduce = () => {
    const next = !reduce;
    setReduce(next);
    setReduceMotion(next);
  };

  const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
  const openDur = reduce ? 0 : 350;
  const scrimDur = reduce ? 0 : 250;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Investigator Preferences">
      
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{
          backgroundColor: "rgba(0,0,0,0.72)",
          opacity: visible ? 1 : 0,
          transition: `opacity ${scrimDur}ms ${EASE}`
        }} />
      
      <div
        className="relative w-full max-w-md border p-8"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          borderColor: "var(--color-border-hairline-strong)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: `opacity ${openDur}ms ${EASE}, transform ${openDur}ms ${EASE}`
        }}>
        
        <div className="flex items-start justify-between">
          <div>
            <span className="tracked-caps text-[10px] text-[color:var(--color-text-tertiary)]">
              Preferences
            </span>
            <h2 className="font-serif-display mt-2 text-2xl text-[color:var(--color-text-primary)]">
              Investigator Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tracked-caps text-[10px] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]">
            
            Close
          </button>
        </div>

        <div className="mt-8 border-t border-[color:var(--color-border-hairline)] pt-6">
          <label className="flex items-start justify-between gap-6 cursor-pointer">
            <span>
              <span className="tracked-caps block text-[11px] text-[color:var(--color-text-secondary)]">
                Reduce Motion
              </span>
              <span className="mt-2 block text-sm text-[color:var(--color-text-secondary)]">
                Disable the fog and cursor-follow effects. The scene appears
                fully revealed on load.
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={reduce}
              onClick={toggleReduce}
              className="relative mt-1 h-6 w-11 shrink-0 border transition-colors"
              style={{
                borderColor: reduce ?
                "var(--color-accent-blood)" :
                "var(--color-border-hairline-strong)",
                backgroundColor: reduce ?
                "var(--color-accent-blood)" :
                "transparent"
              }}>
              
              <span
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 transition-all"
                style={{
                  left: reduce ? "calc(100% - 18px)" : "2px",
                  backgroundColor: "var(--color-text-primary)"
                }} />
              
            </button>
          </label>
        </div>
      </div>
    </div>);

}