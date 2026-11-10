// The list contract exposes the latest message at messages[0] (also used by
// realtime.mjs), including message ID DESC when message dates tie. The backend
// orders globally before pagination; this helper only orders the returned page.
// Empty chats have no activity: neither createdAt nor updatedAt ranks them.
export function conversationActivityAt(conversation) {
  const value = conversation?.messages?.[0]?.createdAt;
  if (value && Number.isFinite(new Date(value).getTime())) return value;
  return undefined;
}

export function sortInboxConversations(conversations) {
  return [...conversations].sort((left, right) => {
    const leftTime = new Date(conversationActivityAt(left)).getTime();
    const rightTime = new Date(conversationActivityAt(right)).getTime();
    const difference = (Number.isFinite(rightTime) ? rightTime : -Infinity)
      - (Number.isFinite(leftTime) ? leftTime : -Infinity);
    if (difference && !Number.isNaN(difference)) return difference;
    // A fixed ID tie-break keeps equal/missing timestamps stable even when the
    // server returns the same page in a different order on the next poll.
    const leftId = String(left.id);
    const rightId = String(right.id);
    return leftId < rightId ? -1 : leftId > rightId ? 1 : 0;
  });
}

export function createInboxRequestGuard() {
  let version = 0;
  return {
    next: () => ++version,
    isCurrent: (requestVersion) => requestVersion === version,
    invalidate: () => { version += 1; },
  };
}

export function inboxPageWithinTotal(page, totalPages) {
  return Math.max(1, Math.min(page, totalPages || 1));
}
