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
  void title;
  const errors: string[] = [];
  const charCount = countKoreanCharacters(description);
  const sentences = description.split(/[.!?]\s*/).filter(Boolean);

  if (charCount < 140 || charCount > 190) {
    errors.push(`놀이설명은 공백 포함 140~190자를 권장합니다. 현재 ${charCount}자입니다.`);
  }
  if (sentences.length !== 3) {
    errors.push(`놀이설명은 정확히 3문장이어야 합니다. 현재 ${sentences.length}문장입니다.`);
  }
  for (const phrase of forbiddenPhrases) {
    if (description.includes(phrase)) {
      errors.push(`금지 표현이 포함되었습니다: ${phrase}`);
    }
  }
  return { ok: errors.length === 0, errors, charCount };
}
