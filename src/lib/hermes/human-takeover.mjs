export async function startHumanTakeover(api, { conversationId, reason, reasonDetail, userId }) {
  const handoff = await api.createHandoff(conversationId, reason, reasonDetail);
  if (handoff.assignedAgentId && handoff.assignedAgentId !== userId) {
    return { handoff, taken: false, assignedElsewhere: true };
  }

  try {
    await api.takeHandoff(handoff.id);
    return { handoff, taken: true, assignedElsewhere: false };
  } catch (takeError) {
    return { handoff, taken: false, assignedElsewhere: false, takeError };
  }
}
