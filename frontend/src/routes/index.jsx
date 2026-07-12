import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SettingsModal } from "@/components/SettingsModal";
import LandingCanvas from "@/components/LandingCanvas";
import { getReduceMotion, subscribeReduceMotion } from "@/lib/preferences";
import { useTransition } from "@/lib/transitions";

export const Route = createFileRoute("/")({
  component: Home
});

// Two empty wall patches (percent of viewport). Tuned to the reference image:
// - CREATE ROOM: lit patch between the handprint and the seated figure (upper-center-right)
// - JOIN ROOM: darker patch to the left of the blood stain
const HOTSPOTS = {
  create: { xPct: 50, yPct: 62, w: 280, h: 64, to: "/create-room" },
  join: { xPct: 50, yPct: 74, w: 280, h: 64, to: "/join-room" }
};

function Home() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { setFogPaused } = useTransition();

  useEffect(() => {
    setReduceMotion(getReduceMotion());
    return subscribeReduceMotion(setReduceMotion);
  }, []);

  useEffect(() => {
    setFogPaused(settingsOpen);
    return () => setFogPaused(false);
  }, [settingsOpen, setFogPaused]);

  return (
    <main className="min-h-screen bg-[color:var(--color-bg-base)] text-[color:var(--color-text-primary)]">
      <LandingCanvas reduceMotion={reduceMotion} />
      
      <section className="relative h-screen w-full overflow-hidden select-none flex flex-col items-center justify-center pointer-events-none" style={{ minHeight: 640 }}>
        {/* Settings Button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="absolute top-6 right-6 z-20 pointer-events-auto p-2 opacity-50 hover:opacity-100 transition-opacity"
        >
          <span className="font-mono text-xs tracking-widest text-[#9c9186]">SETTINGS</span>
        </button>

        <div className="z-10 flex flex-col items-center mt-[-10vh]">
          <span className="font-['VT323'] text-xl tracking-widest text-[#9c9186] mb-4">CASE FILE &middot; PROLOGUE</span>
          
          <h1 className="font-['VT323'] text-7xl md:text-8xl lg:text-9xl tracking-wide text-[#e8e1d3] drop-shadow-2xl text-center leading-none" style={{ textShadow: '0px 4px 0px #0a0503' }}>
            The Last<br />Witness
          </h1>
          
          <p className="mt-6 text-xl md:text-2xl font-['VT323'] text-[#9c9186] max-w-md text-center" style={{ textShadow: '0px 2px 0px #0a0503' }}>
            Four remain. One is guilty. The truth lies buried in the dark.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-6 pointer-events-auto">
            <Link
              to="/create-room"
              className="group relative px-8 py-4 bg-[#8a2029] hover:bg-[#a62631] transition-colors"
              style={{ boxShadow: 'inset -4px -4px 0px rgba(0,0,0,0.5), inset 4px 4px 0px rgba(255,255,255,0.2)' }}
            >
              <div className="absolute inset-0 border-4 border-[#1a1113]" />
              <span className="font-['VT323'] text-2xl md:text-3xl tracking-widest text-[#e8e1d3] group-hover:text-white transition-colors" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>CREATE ROOM</span>
            </Link>

            <Link
              to="/join-room"
              className="group relative px-8 py-4 bg-[#4a4541] hover:bg-[#655d56] transition-colors"
              style={{ boxShadow: 'inset -4px -4px 0px rgba(0,0,0,0.5), inset 4px 4px 0px rgba(255,255,255,0.2)' }}
            >
              <div className="absolute inset-0 border-4 border-[#1a1113]" />
              <span className="font-['VT323'] text-2xl md:text-3xl tracking-widest text-[#e8e1d3] group-hover:text-white transition-colors" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>JOIN ROOM</span>
            </Link>
          </div>
        </div>
      </section>

      <HowItWorks />
      <Footer />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );

}



function HowItWorks() {
  const steps = [
  {
    n: "I",
    title: "A new crime, every session",
    body: "The scene, the motive, and the guilty party are freshly generated the moment your room opens. Nothing is prewritten. Nothing repeats."
  },
  {
    n: "II",
    title: "A private dossier for each player",
    body: "Every investigator receives their own file — witnesses interviewed, evidence catalogued, alibis half-remembered. No two dossiers overlap completely."
  },
  {
    n: "III",
    title: "Investigate together",
    body: "Compare notes across the table. Contradict each other. The truth only surfaces when the fragments are laid side by side."
  },
  {
    n: "IV",
    title: "The truth, at the end",
    body: "When the last statement is heard, the case file opens. The full sequence of events is revealed — including what no single investigator could have known alone."
  }];


  return (
    <section className="bg-[color:var(--color-bg-base)] px-6 py-24 md:py-32 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14">
          <span className="tracked-caps text-[11px] text-[color:var(--color-text-tertiary)]">
            The Procedure
          </span>
          <h2 className="font-serif-display mt-3 text-3xl md:text-4xl text-[color:var(--color-text-primary)]">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px bg-[color:var(--color-border-hairline)] md:grid-cols-2">
          {steps.map((s) =>
          <article
            key={s.n}
            className="bg-[color:var(--color-bg-elevated)] p-8 md:p-10">
            
              <div className="font-serif-display text-2xl text-[color:var(--color-accent-blood)]">
                {s.n}
              </div>
              <h3 className="font-serif-display mt-4 text-xl text-[color:var(--color-text-primary)]">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                {s.body}
              </p>
            </article>
          )}
        </div>
      </div>
    </section>);

}

function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border-hairline)] bg-[color:var(--color-bg-base)] px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="tracked-caps text-[10px] text-[color:var(--color-text-tertiary)] opacity-70">
          The Last Witness — Filed under confidential
        </span>
        <span className="tracked-caps text-[10px] text-[color:var(--color-text-tertiary)] opacity-70">
          MMXXVI
        </span>
      </div>
    </footer>);

}