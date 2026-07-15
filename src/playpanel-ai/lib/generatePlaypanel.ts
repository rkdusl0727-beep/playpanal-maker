import { selectExamples } from "./selectExamples";
import { buildDescriptionInstruction } from "./generateDescription";
import { validatePlaypanel } from "./styleChecker";
import { jaccardSimilarity } from "./similarityChecker";

export interface PlaypanelResult {
  title: string;
  description: string;
}

export type ModelCaller = (prompt: string) => Promise<string>;

function parseModelJson(raw: string): PlaypanelResult {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  if (typeof parsed.title !== "string" || typeof parsed.description !== "string") {
    throw new Error("모델 출력에 title 또는 description이 없습니다.");
  }
  return parsed;
}

export async function generatePlaypanel(
  memo: string,
  callModel: ModelCaller,
  maxAttempts = 3
): Promise<PlaypanelResult> {
  if (!memo.trim()) throw new Error("놀이 메모를 입력해 주세요.");

  const examples = selectExamples(memo, 3);
  let retryReason = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const prompt = buildDescriptionInstruction(memo, examples, retryReason);
      const raw = await callModel(prompt);
      const result = parseModelJson(raw);
      const validation = validatePlaypanel(result.title, result.description);

      const memoSimilarity = jaccardSimilarity(memo, result.description);
      const exampleSimilarity = Math.max(
        ...examples.map((e) => jaccardSimilarity(e.description, result.description))
      );

      const errors = [...validation.errors];
      if (memoSimilarity > 0.55) {
        errors.push("입력 메모의 문장 구조를 지나치게 그대로 사용했습니다.");
      }
      if (exampleSimilarity > 0.62) {
        errors.push("참고 예시의 문장을 지나치게 따라 썼습니다.");
      }

      if (errors.length === 0) return result;
      retryReason = errors.join("\n- ");
    } catch (error) {
      retryReason = error instanceof Error ? error.message : "모델 출력을 확인할 수 없습니다.";
    }
  }

  throw new Error("놀이패널 생성 결과가 품질 검사를 통과하지 못했습니다.");
}
