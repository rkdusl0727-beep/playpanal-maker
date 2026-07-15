export type MemoFactCategory = "pictureBook" | "material" | "creation" | "location" | "action" | "extension";

export interface MemoCoreFact {
  category: MemoFactCategory;
  label: string;
  order: number;
  requiredGroups: string[][];
}

export interface MemoAnalysis {
  facts: MemoCoreFact[];
  orderedSteps: string[];
}

const CATEGORY_LABELS: Record<MemoFactCategory, string> = {
  pictureBook: "그림책",
  material: "사용 재료",
  creation: "만든 것",
  location: "놀이 장소",
  action: "놀이 행동",
  extension: "놀이 확장",
};

const MATERIALS = [
  "클레이", "점토", "휴지심", "색종이", "종이", "분필", "물감", "크레파스", "우드락", "연필",
  "빨대", "블록", "악기", "놀잇감", "페트병", "스프레이건", "습자지", "자연물", "나뭇잎", "꽃잎",
  "모래", "물", "얼음", "색소", "쉐이빙폼", "수조", "천", "종이컵", "빨래집게", "풀", "가위",
];

const LOCATIONS = [
  "우리 교실", "교실", "폭포수 아래 계곡", "계곡", "하늘정원", "옥상정원", "정원", "운동장", "놀이터",
  "바깥", "창가", "창문", "천장", "바닥", "수조", "숲", "산책로", "실외", "실내",
];

const EXTENSIONS = ["게임", "역할놀이", "가게놀이", "전시", "환경구성", "공동작품", "협동작품", "합동그림"];

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/[「」『』“”‘’'"·:;()[\]{}]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const compact = (value: string) => normalize(value).replace(/\s+/g, "");

const unique = <T,>(items: T[]) => [...new Set(items)];

const splitSteps = (memo: string) => memo
  .replace(/\r/g, "")
  .split(/\n+|\s*(?:→|➡|▶)\s*|[;]+|(?<=[.!?])\s+|\s*,\s*/)
  .map((step) => step.replace(/^[-•▪︎☑✓\d.)\s]+/, "").trim())
  .filter(Boolean);

const contentTokens = (value: string) => normalize(value)
  .split(/\s+/)
  .map((token) => token
    .replace(/(?:으로|에서|에게|까지|부터|처럼|하고|하며|해서|하여|으로써)$/g, "")
    .replace(/(?:은|는|이|가|을|를|에|의|와|과|도|로)$/g, "")
    .replace(/(?:읽기|만들기|놀이하기|해보기|해봄|했음|있음|나타남|관찰함|표현함|놀이함|만들었음|함)$/g, "")
    .trim())
  .filter((token) => token.length >= 2 && !/^(아이들|유아들|친구들|오늘|활동|놀이)$/.test(token));

const nounGroups = (value: string, limit = 3) => contentTokens(value)
  .filter((token) => !/읽|만들|꾸미|그리|접|찍|쌓|관찰|살펴|표현|점프|뛰|확장|이어|게임/.test(token))
  .slice(0, limit)
  .map((token) => [token]);

const addFact = (facts: MemoCoreFact[], fact: MemoCoreFact) => {
  const key = `${fact.category}:${compact(fact.label)}`;
  if (!facts.some((item) => `${item.category}:${compact(item.label)}` === key)) facts.push(fact);
};

const bookTitleGroups = (step: string) => {
  const beforeBook = step.split(/그림책|동화책|책/)[0].trim();
  const tokens = contentTokens(beforeBook).slice(-3);
  return tokens.length ? tokens.map((token) => [token]) : [];
};

const actionGroups = (step: string): string[][] => {
  const groups: string[][] = [];
  if (/높이\s*(?:점프|뛰)/.test(step)) groups.push(["높이", "높게", "높은"], ["점프", "뛰"]);
  if (/멀리\s*(?:점프|뛰)/.test(step)) groups.push(["멀리", "먼", "거리"], ["점프", "뛰"]);
  if (/눈을\s*감/.test(step)) groups.push(["눈을감", "눈감"]);
  if (/맞히|맞추/.test(step)) groups.push(["맞히", "맞추"]);
  if (/관찰|살펴/.test(step)) groups.push(["관찰", "살펴"]);
  if (/그리|색칠/.test(step)) groups.push(["그리", "색칠"]);
  if (/접기|접어|접고/.test(step)) groups.push(["접"]);
  if (/찍기|찍어|판화/.test(step)) groups.push(["찍", "판화"]);
  // "점프하는 개구리 만들기"처럼 만든 것의 이름에 들어간 동작어는
  // 실제 놀이 행동으로 중복 추출하지 않는다.
  if (/점프|뛰/.test(step) && !/만들|완성|꾸미|그리|접기|접어|찍기|오리|쌓기|구성/.test(step) && groups.length === 0) {
    groups.push(["점프", "뛰"]);
  }
  return groups;
};

export function analyzeMemo(memo: string): MemoAnalysis {
  const steps = splitSteps(memo);
  const facts: MemoCoreFact[] = [];

  steps.forEach((step, order) => {
    if (/그림책|동화책|책을?\s*(?:함께\s*)?읽|독후/.test(step)) {
      addFact(facts, {
        category: "pictureBook",
        label: step,
        order,
        requiredGroups: [...bookTitleGroups(step), ["그림책", "동화책", "책"], ["읽"]],
      });
    }

    const matchedMaterials = MATERIALS
      .filter((material) => compact(step).includes(compact(material)))
      .sort((a, b) => compact(b).length - compact(a).length)
      .filter((material, index, items) => !items.slice(0, index).some((specific) => compact(specific).includes(compact(material))));
    matchedMaterials.forEach((material) => {
      addFact(facts, { category: "material", label: material, order, requiredGroups: [[material]] });
    });

    if (/만들|완성|꾸미|접기|접어|그리|찍기|판화|오리|쌓기|구성/.test(step)) {
      const object = step
        .replace(/^(?:그림책|동화책|책).{0,30}읽(?:기|고|은 뒤)?\s*/g, "")
        .replace(/(?:만들기|만듦|만들었음|만들어.*|완성.*|꾸미.*|접기.*|접어.*|그리.*|찍기.*|오리.*|쌓기.*|구성.*)$/g, "")
        .trim();
      const groups = nounGroups(object || step);
      if (groups.length) {
        addFact(facts, {
          category: "creation",
          label: object || step,
          order,
          requiredGroups: [...groups, ["만들", "완성", "꾸미", "접", "그리", "찍", "오리", "쌓", "구성"]],
        });
      }
    }

    const matchedLocations = LOCATIONS.filter((location) => compact(step).includes(compact(location)));
    if (matchedLocations.length) {
      const mostSpecific = matchedLocations.sort((a, b) => compact(b).length - compact(a).length)[0];
      const contextual = /폭포/.test(step) && /계곡/.test(step) ? "교실 폭포수 아래 계곡" : mostSpecific;
      const groups = unique([...(contextual.includes("교실") ? ["교실"] : []), ...(contextual.includes("폭포") ? ["폭포"] : []), ...(contextual.includes("계곡") ? ["계곡"] : []), mostSpecific])
        .map((term) => [term]);
      addFact(facts, { category: "location", label: contextual, order, requiredGroups: groups });
    }

    const groups = actionGroups(step);
    if (groups.length) addFact(facts, { category: "action", label: step, order, requiredGroups: groups });

    const matchedExtensions = EXTENSIONS.filter((extension) => compact(step).includes(compact(extension)));
    if (/확장|이어|계속/.test(step) || matchedExtensions.length) {
      const extension = matchedExtensions[0] || "놀이 확장";
      addFact(facts, {
        category: "extension",
        label: step,
        order,
        requiredGroups: [[extension], ["확장", "이어", "계속", "활용", "게임"]],
      });
    }
  });

  return { facts: facts.sort((a, b) => a.order - b.order), orderedSteps: steps };
}

const groupMatches = (description: string, group: string[]) => {
  const source = compact(description);
  return group.some((term) => source.includes(compact(term)));
};

export function missingMemoFacts(analysis: MemoAnalysis, description: string): MemoCoreFact[] {
  return analysis.facts.filter((fact) => fact.requiredGroups.length > 0 && !fact.requiredGroups.every((group) => groupMatches(description, group)));
}

export function validateMemoCoverage(memo: string, description: string) {
  const analysis = analyzeMemo(memo);
  const missing = missingMemoFacts(analysis, description);
  return { ok: missing.length === 0, analysis, missing };
}

export function formatMemoChecklist(analysis: MemoAnalysis): string {
  if (!analysis.facts.length) return "- 메모에서 확인되는 놀이 사실을 빠짐없이 반영합니다.";
  return analysis.facts
    .map((fact, index) => `${index + 1}. [${CATEGORY_LABELS[fact.category]}] ${fact.label}`)
    .join("\n");
}
