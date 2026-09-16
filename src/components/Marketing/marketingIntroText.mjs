export function splitAnimatedWords(text) {
  return text.match(/\S+|\s+/g)?.map((token) => (
    /^\s+$/.test(token)
      ? { type: "space", value: token }
      : { type: "word", characters: Array.from(token) }
  )) ?? [];
}
