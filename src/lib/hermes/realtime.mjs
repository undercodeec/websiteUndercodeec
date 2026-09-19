export function customerMessageEventsFromConversations(
  conversations,
  previousMessageIds,
) {
  const nextMessageIds = new Map();
  const events = [];

  for (const conversation of conversations || []) {
    const latest = conversation?.messages?.[0];
    nextMessageIds.set(conversation.id, latest?.id);
    if (
      previousMessageIds !== null &&
      latest?.id &&
      latest.sender === "CONTACT" &&
      previousMessageIds.get(conversation.id) !== latest.id
    ) {
      events.push({
        messageId: latest.id,
        conversationId: conversation.id,
        contactId: conversation.contactId,
        contactName:
          conversation.contact?.name || conversation.contact?.waId || "Cliente",
        content: latest.content || `[${latest.type || "Mensaje"}]`,
        messageType: latest.type || "UNKNOWN",
        createdAt: latest.createdAt,
      });
    }
  }

  return { events, nextMessageIds };
}
