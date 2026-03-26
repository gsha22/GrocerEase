/** Keyword → emoji for deal title hints (shared across UI). */
export const DEAL_TITLE_KEYWORD_EMOJI: Record<string, string> = {
  lamb: "🥩",
  meat: "🥩",
  ramen: "🍜",
  noodle: "🍜",
  produce: "🥕",
  tomato: "🍅",
  vegetable: "🥦",
  fruit: "🍎",
  fish: "🐟",
  dairy: "🧀",
};

export function inferDealTitleEmoji(title: string): string {
  const lower = title.toLowerCase();
  for (const [keyword, emoji] of Object.entries(DEAL_TITLE_KEYWORD_EMOJI)) {
    if (lower.includes(keyword)) return emoji;
  }
  return "🏷";
}
