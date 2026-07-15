import type { PlaypanelExample } from "./selectExamples";

export function buildDescriptionInstruction(
  memo: string,
  examples: PlaypanelExample[],
  retryReason?: string
): string {
  const fewShot = examples
    .map(
      (e, i) =>
        `[참고 예시 ${i + 1}]\n제목: ${e.title}\n놀이설명: ${e.description}`
    )
    .join("\n\n");

  return `
당신은 만5세 담임교사입니다. 사용자가 입력한 짧은 메모를 부모 공개용 놀이패널 글로 새롭게 재작성하세요.

[핵심 원칙]
- 메모는 사실 확인용입니다. 원문의 문장 구조를 복사하거나 단순 요약하지 않습니다.
- 입력된 사실만 사용하며, 입력되지 않은 발화·감정·행동·놀이 확장은 만들지 않습니다.
- 놀이설명은 공백 포함 150~180자, 정확히 3문장으로 작성합니다.
- 첫 문장: 재료와 실제 놀이 과정.
- 두 번째 문장: 유아의 선택·구성·표현·관찰 중 입력으로 확인 가능한 모습.
- 세 번째 문장: 교육 효과를 해설하지 말고 놀이 장면의 여운이나 완성된 풍경으로 마무리.
- '습니다체'와 '요체'를 섞되 같은 종결을 반복하지 않습니다.
- '다양한', '다채로운', '여러 가지'는 가급적 쓰지 않습니다.
- 참고 예시는 문체만 참고하고 문장을 복사하지 않습니다.
- 금지 표현: 재료의 특성을 탐색하며 / 상상력과 표현력을 넓혀 나갔습니다 / 손끝으로 모양을 만들어 가며 각자의 생각을 담아 표현하는 즐거움을 느껴 볼 수 있었어요.

[사용자 메모]
${memo}

${fewShot}

${retryReason ? `[이전 결과의 수정 사유]\n${retryReason}\n` : ""}

반드시 아래 JSON만 출력하세요.
{"title":"제목","description":"3문장 놀이설명"}
`.trim();
}
