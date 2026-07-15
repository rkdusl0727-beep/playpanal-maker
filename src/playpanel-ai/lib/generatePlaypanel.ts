import { selectExamples } from "./selectExamples";
import { buildDescriptionInstruction, buildRegenerationInstruction } from "./generateDescription";
import { validatePlaypanel } from "./styleChecker";

export const playpanelGenerationStyles = [
  "따뜻한 부모 공개용",
  "놀이 장면이 잘 보이는 문체",
  "감성적인 놀이패널 문체",
  "놀이 과정 중심 문체",
  "놀이 확장 중심 문체",
] as const;

export interface PlaypanelResult {
  title: string;
  description: string;
  validationPassed: boolean;
  styleIndex: number;
}

export interface RegeneratedDescriptionResult {
  description: string;
  validationPassed: boolean;
  styleIndex: number;
}

export interface RegenerateDescriptionInput {
  memo: string;
  title: string;
  previousDescription: string;
  callModel: ModelCaller;
  maxAttempts?: number;
  styleOffset?: number;
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

function parseDescriptionJson(raw: string): string {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  if (typeof parsed.description !== "string") throw new Error("모델 출력에 description이 없습니다.");
  return parsed.description;
}

export async function generatePlaypanel(
  memo: string,
  callModel: ModelCaller,
  maxAttempts = 5,
  styleOffset = 0,
): Promise<PlaypanelResult> {
  if (!memo.trim()) throw new Error("놀이 메모를 입력해 주세요.");

  const examples = selectExamples(memo, 3);
  let retryReason = "";
  let lastResult: PlaypanelResult | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const styleIndex = (styleOffset + attempt - 1) % playpanelGenerationStyles.length;
      const prompt = buildDescriptionInstruction(memo, examples, retryReason, playpanelGenerationStyles[styleIndex]);
      const raw = await callModel(prompt);
      const parsed = parseModelJson(raw);
      const result: PlaypanelResult = { ...parsed, validationPassed: false, styleIndex };
      lastResult = result;
      const validation = validatePlaypanel(result.title, result.description);

      if (validation.ok) return { ...result, validationPassed: true };
      retryReason = validation.errors.join("\n- ");
    } catch (error) {
      retryReason = error instanceof Error ? error.message : "모델 출력을 확인할 수 없습니다.";
    }
  }

  // 최소 검사에 모두 실패해도 교사가 수정할 수 있도록 마지막 초안을 제공한다.
  if (lastResult) return lastResult;
  throw new Error("모델에서 확인 가능한 초안을 받지 못했습니다.");
}

export async function regenerateDescription({
  memo,
  title,
  previousDescription,
  callModel,
  maxAttempts = 5,
  styleOffset = 0,
}: RegenerateDescriptionInput): Promise<RegeneratedDescriptionResult> {
  if (!memo.trim()) throw new Error("놀이 메모를 입력해 주세요.");
  const examples = selectExamples(memo, 3);
  let retryReason = "";
  let lastResult: RegeneratedDescriptionResult | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const styleIndex = (styleOffset + attempt - 1) % playpanelGenerationStyles.length;
      const prompt = buildRegenerationInstruction(memo, title, previousDescription, examples, retryReason, playpanelGenerationStyles[styleIndex]);
      const description = parseDescriptionJson(await callModel(prompt));
      const result = { description, validationPassed: false, styleIndex };
      lastResult = result;
      if (description.trim() === previousDescription.trim()) {
        retryReason = "이전 설명과 완전히 같습니다. 제목은 그대로 두고 설명의 문장 흐름과 마지막 장면만 새롭게 작성하세요.";
        continue;
      }
      const validation = validatePlaypanel(title, description);
      if (validation.ok) return { ...result, validationPassed: true };
      retryReason = validation.errors.join("\n- ");
    } catch (error) {
      retryReason = error instanceof Error ? error.message : "모델 출력을 확인할 수 없습니다.";
    }
  }

  if (lastResult && lastResult.description.trim() !== previousDescription.trim()) return lastResult;
  throw new Error("모델에서 확인 가능한 설명 초안을 받지 못했습니다.");
}
