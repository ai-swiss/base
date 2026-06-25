// The visible half of a shortcut: a small <kbd> chip placed WHERE the action lives. Always fed
// from the SHORTCUTS table — never a hand-written combo — so the screen and the handlers can't
// drift apart.

import { keyLabel } from "../lib.ts";

export function Kbd({ k }: { k: string }) {
  return <kbd className="kbd">{keyLabel(k, navigator.platform)}</kbd>;
}
