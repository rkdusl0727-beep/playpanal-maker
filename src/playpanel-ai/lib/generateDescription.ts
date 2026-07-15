import type { PlaypanelExample } from "./selectExamples";
import { analyzeMemo, formatMemoChecklist } from "./memoFacts";

export function buildDescriptionInstruction(
  memo: string,
  examples: PlaypanelExample[],
  retryReason?: string,
  styleName = "따뜻한 부모 공개용"
): string {
  const memoAnalysis = analyzeMemo(memo);
  const fewShot = examples
    .map(
      (e, i) =>
        `[참고 예시 ${i + 1}]\n제목: ${e.title}\n놀이설명: ${e.description}`
    )
    .join("\n\n");

  return `
당신은 만5세 담임교사입니다. 사용자가 입력한 짧은 메모를 부모 공개용 놀이패널 글로 새롭게 재작성하세요.

[핵심 원칙]
- 메모에서 놀이 재료, 과정, 확장, 계절, 그림책 여부를 파악합니다.
- 아래 핵심 사실 체크리스트의 항목을 하나도 생략하지 않습니다.
- 메모에 그림책 → 만들기 → 장소 이동 → 놀이 행동 → 게임 확장처럼 순서가 있으면 그 순서를 유지합니다.
- 놀이가 여러 단계라면 대표 활동 하나만 고르거나 단순화하지 말고 가능한 모든 단계를 3문장 안에 자연스럽게 연결합니다.
- 메모에서는 확인 가능한 사실만 사용하고 원문 문장 구조는 가져오지 않습니다.
- 메모에 없는 행동, 상호작용, 대화, 감상, 유아의 생각이나 심리를 추측해 추가하지 않습니다.
- 친구와 이야기하거나 작품을 함께 본 사실이 메모에 없으면 '서로 살펴보며', '생각·느낌·의견을 나누며', '작품을 감상하며' 같은 상호작용을 만들지 않습니다.
- 입력된 사실을 바탕으로 부모가 읽기 편한 새로운 제목과 설명을 만듭니다.
- 놀이설명은 공백 포함 140~190자, 정확히 3문장으로 작성합니다.
- 검사보다 교사가 수정할 수 있는 자연스러운 초안을 제공하는 것을 우선합니다.
- 참고 예시는 문체만 참고하고 문장을 복사하지 않습니다.
- 마지막 문장은 배움이나 느낌을 해석하지 않습니다.
- 메모에 기록된 사실을 바탕으로 놀이가 이어진 모습, 작품의 활용, 달라진 교실 환경, 완성된 놀이 공간, 확장된 역할놀이 또는 계속된 또래 놀이 중 하나의 마지막 장면으로 끝맺습니다.
- 위 마지막 장면이 메모에 없다면 임의로 만들지 말고, 메모에 기록된 결과물이 완성된 상태로 마무리합니다.
- 금지 표현: 재료의 특성을 탐색하며 / 상상력과 표현력을 넓혀 나갔습니다 / 손끝으로 모양을 만들어 가며 각자의 생각을 담아 표현하는 즐거움을 느껴 볼 수 있었어요 / 즐거움을 느껴 볼 수 있었어요 / 풍성한 놀이가 되었어요 / 생각을 더해 갔어요 / 표현력을 넓혀 나갔습니다 / 뿌듯함이 번졌습니다 / 한층 풍성한 장면을 완성했어요 / 놀이가 더욱 즐거워졌어요.

[선택 문체]
${styleName}

[사용자 메모]
${memo}

[반드시 반영할 핵심 사실 체크리스트]
${formatMemoChecklist(memoAnalysis)}

${fewShot}

${retryReason ? `[이전 결과의 수정 사유]\n${retryReason}\n` : ""}

반드시 아래 JSON만 출력하세요.
{"title":"제목","description":"3문장 놀이설명"}
`.trim();
}

export function buildRegenerationInstruction(
  memo: string,
  title: string,
  previousDescription: string,
  examples: PlaypanelExample[],
  retryReason?: string,
  styleName = "따뜻한 부모 공개용",
): string {
  const base = buildDescriptionInstruction(memo, examples, retryReason, styleName);
  return `${base}

[재생성 전용 규칙]
- 현재 제목 "${title}"은 고정값입니다.
- 제목을 수정하거나 새로 생성하지 마세요.
- 이전 설명과 다른 문장 흐름과 마무리로 놀이 설명만 새롭게 작성하세요.
- 마지막 문장은 배움이나 느낌을 해석하지 않습니다.
- 놀이의 이어짐, 작품의 활용, 교실의 변화, 완성된 놀이 공간, 역할놀이의 확장, 친구들과 계속된 놀이 중 실제 메모에 맞는 마지막 장면으로 마무리합니다.

[이전 설명]
${previousDescription}

JSON에는 description만 필수입니다. title이 포함되더라도 사용되지 않습니다.`;
}
