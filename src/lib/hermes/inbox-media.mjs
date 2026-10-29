export function inboxMediaKind(message) {
  if (message?.type === 'AUDIO' && ['CONTACT', 'HERMES'].includes(message.sender)) {
    return 'audio';
  }
  if (message?.sender !== 'CONTACT') return null;
  if (message.type === 'IMAGE') return 'image';
  if (message.type === 'DOCUMENT') return 'document';
  return null;
}
