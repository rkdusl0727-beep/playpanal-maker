import { forbiddenPhrases } from "../data/forbidden";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  charCount: number;
}

export function countKoreanCharacters(text: string): number {
  return [...text.trim()].length;
}

export function validatePlaypanel(title: string, description: string): ValidationResult {
  const errors: string[] = [];
  const charCount = countKoreanCharacters(description);
  const sentences = description.split(/[.!?]\s*/).filter(Boolean);
  const processText = sentences.slice(0, 2).join(" ");
  const lastSentence = sentences.at(-1) ?? "";
  const processActions = processText.match(/고르|살펴|만지|접|오리|붙이|그리|칠하|쌓|연결|다듬|누르|불어|섞|찍|움직|만들|꾸미|이어/g)?.length ?? 0;

  if (title.length < 8 || title.length > 16) {
    errors.push("제목은 8~16자로 작성해야 합니다.");
  }
  if (charCount < 150 || charCount > 180) {
    errors.push(`놀이설명은 공백 포함 150~180자여야 합니다. 현재 ${charCount}자입니다.`);
  }
  if (sentences.length !== 3) {
    errors.push(`놀이설명은 정확히 3문장이어야 합니다. 현재 ${sentences.length}문장입니다.`);
  }
  for (const phrase of forbiddenPhrases) {
    if (description.includes(phrase)) {
      errors.push(`금지 표현이 포함되었습니다: ${phrase}`);
    }
  }
  const repeatedEnding = description.match(/(했어요|했답니다|보였어요|보았습니다|있었어요)\./g) ?? [];
  if (repeatedEnding.length >= 3 && new Set(repeatedEnding).size === 1) {
    errors.push("같은 종결 표현이 반복되었습니다.");
  }
  if (/활동을\s*(?:실시|진행)|관찰\s*결과|평가하|지도하|유도하|본\s*활동|이를\s*통해|종합적으로|효과적으로/.test(description)) {
    errors.push("보고서나 활동일지가 아닌 부모 공개용 놀이패널 문체여야 합니다.");
  }
  if (processActions < 2) {
    errors.push("놀이 결과만 나열하지 말고 선택·탐색·표현의 과정을 구체적으로 보여 주세요.");
  }
  if (/교육|학습|발달|능력|효과|목표|향상|증진|배웠|알게\s*되|도움이\s*되/.test(lastSentence)) {
    errors.push("마지막 문장은 교육 효과가 아닌 놀이 장면의 여운으로 마무리해야 합니다.");
  }
  return { ok: errors.length === 0, errors, charCount };
}
