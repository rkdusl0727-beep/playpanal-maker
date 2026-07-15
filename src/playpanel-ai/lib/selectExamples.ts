import { playpanelExamples } from "../data/playpanel_examples";

export type PlaypanelExample = (typeof playpanelExamples)[number];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreExample(memo: string, example: PlaypanelExample): number {
  const source = normalize(memo);
  const haystack = normalize(
    [example.season, example.category, example.title, ...example.keywords].join(" ")
  );

  let score = 0;
  for (const token of source.split(/[,\s/·]+/).filter(Boolean)) {
    if (haystack.includes(token)) score += token.length >= 2 ? 3 : 1;
  }
  return score;
}

export function selectExamples(memo: string, count = 3): PlaypanelExample[] {
  return [...playpanelExamples]
    .map((example) => ({ example, score: scoreExample(memo, example) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, count))
    .map(({ example }) => example);
}
