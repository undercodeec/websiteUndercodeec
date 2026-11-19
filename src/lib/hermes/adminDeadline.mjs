// Never infer a lifetime from local traffic or from a cached user. The server
// returns an epoch-millisecond deadline for the currently authenticated admin.
export function remainingAdminTime(expiresAt, now = Date.now()) {
  return Number.isSafeInteger(expiresAt) && expiresAt > now ? expiresAt - now : 0;
}

export function watchAdminDeadline(window, expiresAt, onExpire) {
  const remaining = remainingAdminTime(expiresAt);
  if (!remaining) {
    onExpire();
    return () => {};
  }
  const timer = window.setTimeout(onExpire, remaining);
  return () => window.clearTimeout(timer);
}
