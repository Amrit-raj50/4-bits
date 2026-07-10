import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createRoom, MODE_LABELS } from "@/lib/rooms";
import { setStoredName, getStoredName } from "@/lib/player-id";

import wallImage from "@/assets/the great wall.png";

export const Route = createFileRoute("/create-room")({
  component: CreateRoom
});

const MODES = ["classic_mansion", "cyber_crime", "haunted_house"];

function CreateRoom() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState(getStoredName());
  const [maxMembers, setMaxMembers] = useState(5);
  const [mode, setMode] = useState("classic_mansion");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = name.trim().length >= 2 && hostName.trim().length >= 2 && !submitting;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      setStoredName(hostName.trim());
      const { code } = await createRoom({
        name: name.trim(),
        mode,
        maxMembers,
        hostName: hostName.trim()
      });
      navigate({ to: "/lobby/$code", params: { code } });
    } catch (err) {
      console.error(err);
      setError("Could not open the case file. Try again in a moment.");
      setSubmitting(false);
    }
  };

  return (
    <main 
      className="min-h-screen bg-[color:var(--color-bg-base)] px-6 py-16"
      style={{
        backgroundImage: `linear-gradient(rgba(10,8,9,0.85), rgba(10,8,9,0.85)), url("${wallImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="mx-auto max-w-xl">
        <Link
          to="/"
          className="tracked-caps text-[10px] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]">
          
          ← Back
        </Link>

        <div className="mt-8">
          <span className="tracked-caps text-[11px] text-[color:var(--color-text-tertiary)]">
            New Case File
          </span>
          <h1 className="font-serif-display mt-2 text-4xl md:text-5xl text-[color:var(--color-text-primary)]">
            Create Room
          </h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-10 border p-8 md:p-10"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            borderColor: "var(--color-border-hairline-strong)"
          }}>
          
          <label className="block">
            <span className="tracked-caps block text-[11px] text-[color:var(--color-text-secondary)]">
              Case Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="The Ashford Manor Incident"
              maxLength={60}
              className="mt-2 w-full border-0 border-b bg-transparent px-0 py-2 text-lg text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-accent-blood)]"
              style={{ borderBottomColor: "var(--color-border-hairline-strong)" }}
              required />
            
          </label>

          <label className="mt-8 block">
            <span className="tracked-caps block text-[11px] text-[color:var(--color-text-secondary)]">
              Your Investigator Name
            </span>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Inspector Vale"
              maxLength={40}
              className="mt-2 w-full border-0 border-b bg-transparent px-0 py-2 text-lg text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-accent-blood)]"
              style={{ borderBottomColor: "var(--color-border-hairline-strong)" }}
              required />
            
          </label>

          <div className="mt-10">
            <span className="tracked-caps block text-[11px] text-[color:var(--color-text-secondary)]">
              Total Investigators
            </span>
            <div className="mt-3 inline-flex border" style={{ borderColor: "var(--color-border-hairline-strong)" }}>
              {[3, 4, 5].map((n, i) =>
              <button
                type="button"
                key={n}
                onClick={() => setMaxMembers(n)}
                className="px-8 py-3 font-serif-display text-lg transition-colors"
                style={{
                  backgroundColor: maxMembers === n ? "var(--color-accent-blood)" : "transparent",
                  color: maxMembers === n ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  borderLeft: i > 0 ? "1px solid var(--color-border-hairline-strong)" : "none"
                }}>
                
                  {n}
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-[color:var(--color-text-tertiary)]">
              Minimum three investigators required to begin. Maximum five.
            </p>
          </div>

          <div className="mt-10">
            <span className="tracked-caps block text-[11px] text-[color:var(--color-text-secondary)]">
              Mystery Setting
            </span>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              {MODES.map((m) => {
                const active = mode === m;
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMode(m)}
                    className="border p-4 text-left transition-colors"
                    style={{
                      borderColor: active ?
                      "var(--color-accent-blood)" :
                      "var(--color-border-hairline)",
                      backgroundColor: active ?
                      "rgba(113,26,36,0.10)" :
                      "transparent"
                    }}>
                    
                    <span className="font-serif-display block text-base text-[color:var(--color-text-primary)]">
                      {MODE_LABELS[m]}
                    </span>
                    <span className="mt-1 block text-[11px] text-[color:var(--color-text-tertiary)]">
                      {m === "classic_mansion" && "Estates, drawing rooms, old money."}
                      {m === "cyber_crime" && "Cold servers, warmer motives."}
                      {m === "haunted_house" && "Something unresolved remains."}
                    </span>
                  </button>);

              })}
            </div>
          </div>

          {error &&
          <p className="mt-8 text-sm text-[color:var(--color-accent-blood-hover)]">{error}</p>
          }

          <div className="mt-10 flex items-center justify-between border-t border-[color:var(--color-border-hairline)] pt-6">
            <span className="tracked-caps text-[10px] text-[color:var(--color-text-tertiary)]">
              A unique code will be assigned on submit
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className="tracked-caps px-6 py-3 text-[11px] transition-colors"
              style={{
                backgroundColor: canSubmit ?
                "var(--color-accent-blood)" :
                "transparent",
                color: canSubmit ?
                "var(--color-text-primary)" :
                "var(--color-text-tertiary)",
                border: `1px solid ${canSubmit ? "var(--color-accent-blood)" : "var(--color-border-hairline)"}`,
                cursor: canSubmit ? "pointer" : "not-allowed"
              }}>
              
              {submitting ? "Opening…" : "Open the Case"}
            </button>
          </div>
        </form>
      </div>
    </main>);

}