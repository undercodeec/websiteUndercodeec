// Only real input events can renew an admin session. Network traffic, timers,
// visibility changes and device wake-ups are deliberately not activity.
export function listenForAdminHumanActivity(document, send, now = Date.now) {
  let lastSentAt = -Infinity;
  let pending = false;
  const onInput = (event) => {
    if (!event.isTrusted || document.hidden || (event.type === "keydown" && event.repeat)) return;
    const time = now();
    if (pending || time - lastSentAt < 60_000) return;
    pending = true;
    Promise.resolve().then(send).then(() => {
      lastSentAt = time;
    }).catch(() => {
      // A later human input can retry a failed network request.
    }).finally(() => { pending = false; });
  };
  document.addEventListener("pointerdown", onInput);
  document.addEventListener("keydown", onInput);
  return () => {
    document.removeEventListener("pointerdown", onInput);
    document.removeEventListener("keydown", onInput);
  };
}
