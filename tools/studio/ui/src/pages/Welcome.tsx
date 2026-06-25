// The Welcome screen: Studio was launched on a directory that is not a BASE yet. A short, numbered
// path — (1) create the minimal structure, (2) open it in your AI tool, (3) go further — instead of
// competing cards. Step 1 is the creation GATE: the exact files are listed, each expandable to its
// full content, and nothing is written before the click. The plan comes from the server and is
// re-computed there on POST; this screen never sends content, it only consents.

import { useState } from "react";
import { api, type StudioContext } from "../api.ts";
import { useCopy } from "../copy.ts";
import { errorText } from "../lib.ts";

type WelcomeContext = Extract<StudioContext, { mode: "welcome" }>;

export function Welcome({ context, onInitialized }: { context: WelcomeContext; onInitialized: () => void }) {
  const copy = useCopy();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.init();
      onInitialized();
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  };

  const n = context.plan.length;

  return (
    <div className="welcome">
      <header className="welcome-hero">
        <h1>{copy.welcome.heroTitle}</h1>
        <p className="welcome-lede">{diagnosticOf(context, copy)}</p>
      </header>

      <ol className="welcome-steps">
        <li className="welcome-step">
          <span className="step-num" aria-hidden>1</span>
          <div className="step-body">
            <h2 className="step-title">{copy.welcome.step1Title}</h2>
            <p className="subtle">{copy.welcome.step1Body(n)}</p>
            <section aria-label={copy.welcome.planAria} className="welcome-plan">
              {context.plan.map((entry) => (
                <details key={entry.path} className="welcome-file">
                  <summary>
                    <code className="path">{entry.path}</code>
                    <span className="subtle"> ({entry.reason})</span>
                  </summary>
                  <pre>{entry.content}</pre>
                </details>
              ))}
            </section>
            {error && <p className="error">{copy.common.errorPrefix}{error}</p>}
            <button className="primary" disabled={busy} onClick={create}>
              {busy ? copy.welcome.creating : copy.welcome.createFiles}
            </button>
          </div>
        </li>

        <li className="welcome-step">
          <span className="step-num" aria-hidden>2</span>
          <div className="step-body">
            <h2 className="step-title">{copy.welcome.step2Title}</h2>
            <p>
              {copy.welcome.step2Pre}<strong>{copy.welcome.step2Strong}</strong>
              {copy.welcome.step2Post}<code>{copy.welcome.step2Code}</code>{copy.welcome.step2End}
            </p>
            <CopyableCommand command={`cd "${context.path}" && claude`} />
          </div>
        </li>

        <li className="welcome-step">
          <span className="step-num" aria-hidden>3</span>
          <div className="step-body">
            <h2 className="step-title">{copy.welcome.step3Title}</h2>
            <p>
              <strong>{copy.welcome.importStrong}</strong>{copy.welcome.importPre}<code>{copy.welcome.importCode}</code>{copy.welcome.importPost}
            </p>
            <p>
              <strong>{copy.welcome.scratchStrong}</strong>{copy.welcome.scratchPre}<code>{copy.welcome.scratchCode}</code>{copy.welcome.scratchPost}
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}

// A command shown verbatim with a copy button. If the clipboard API is missing (no secure
// context), the button simply isn't rendered — never a button that silently does nothing.
function CopyableCommand({ command }: { command: string }) {
  const copy = useCopy();
  const [copied, setCopied] = useState(false);
  const canCopy = typeof navigator !== "undefined" && Boolean(navigator.clipboard);
  return (
    <div className="welcome-cmd">
      <code>{command}</code>
      {canCopy && (
        <button
          className="ghost small"
          onClick={async () => {
            await navigator.clipboard.writeText(command);
            setCopied(true);
          }}
        >
          {copied ? copy.welcome.copied : copy.welcome.copy}
        </button>
      )}
    </div>
  );
}

function diagnosticOf(context: WelcomeContext, copy: ReturnType<typeof useCopy>): string {
  const d = context.detection;
  switch (d.type) {
    case "collection":
      return copy.welcome.diagCollection(d.roots.length, context.label);
    case "loose":
      return d.hasSkillNames
        ? copy.welcome.diagLooseSkills(context.label)
        : copy.welcome.diagLooseMarkdown(d.markdownCount, context.label);
    case "empty":
      return copy.welcome.diagEmpty(context.label);
    default:
      return copy.welcome.diagDefault(context.label);
  }
}
