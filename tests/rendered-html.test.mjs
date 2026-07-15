import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the play panel editor", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /어진반/);
  assert.match(html, /놀이를 통한 배움/);
  assert.match(html, /놀이 메모/);
  assert.match(html, /Canva에서 요소 만들기/);
  assert.match(html, /PPT 저장/);
  assert.match(html, /이미지 저장/);
});

test("includes durable persistence and calendar logic", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.match(page, /indexedDB/);
  assert.match(page, /play-panel-maker-state/);
  assert.match(page, /function weekRange/);
  assert.match(page, /firstMonday/);
  assert.match(page, /removeTitleLead/);
  assert.match(page, /p\.photoCount === 4 \? 2/);
  assert.match(page, /<option value=\{4\}>4장<\/option>/);
  assert.match(page, /<option value=\{8\}>8장<\/option>/);
});

test("keeps generation success-first while preserving every core memo step", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const datasetGenerator = await readFile(new URL("src/playpanel-ai/lib/generatePlaypanel.ts", root), "utf8");
  const datasetStyleChecker = await readFile(new URL("src/playpanel-ai/lib/styleChecker.ts", root), "utf8");
  const datasetPrompt = await readFile(new URL("src/playpanel-ai/lib/generateDescription.ts", root), "utf8");
  const datasetTitlePrompt = await readFile(new URL("src/playpanel-ai/lib/generateTitle.ts", root), "utf8");
  const memoFacts = await readFile(new URL("src/playpanel-ai/lib/memoFacts.ts", root), "utf8");
  const forbidden = await readFile(new URL("src/playpanel-ai/data/forbidden.ts", root), "utf8");
  const fewShots = await readFile(new URL("app/play-panel-few-shots.ts", root), "utf8");
  assert.match(page, /generateTeacherPanelDraft/);
  assert.match(page, /selectPlayPanelFewShots\(note, 3\)/);
  assert.ok((fewShots.match(/closingPerspective:/g) || []).length >= 25, "Few-shot examples must include 20–30 classified panel patterns");
  assert.match(fewShots, /export const selectPlayPanelFewShots/);
  assert.match(fewShots, /PLAY_PANEL_FEW_SHOTS_BY_CATEGORY/);
  assert.match(fewShots, /"봄", "여름", "가을", "겨울", "자연물", "그림책", "미술", "과학", "신체", "역할놀이", "요리", "바깥놀이"/);
  assert.match(page, /playpanelGenerationStyles/);
  assert.match(page, /generationStyle: number/);
  assert.match(page, /다시 생성/);
  assert.match(page, /const regenerateFromNote = async/);
  assert.match(page, /onClick=\{\(\)=>regenerateFromNote\(pi\)\}/);
  assert.match(page, /const createCurrentCallModel/);
  assert.match(page, /const callModel = createCurrentCallModel/);
  assert.match(page, /await generatePlaypanel\(submittedMemo, callModel, 5, styleOffset\)/);
  assert.match(page, /play\.note\.trim\(\) !== submittedMemo/);
  assert.match(page, /모델 응답 자체를 읽을 수 없는 드문 경우에도 로컬 초안을 반드시 보여 준다/);
  assert.match(datasetGenerator, /for \(let attempt = 1; attempt <= maxAttempts; attempt \+= 1\)/);
  assert.match(datasetGenerator, /maxAttempts = 5/);
  assert.match(datasetGenerator, /if \(lastResult\) return lastResult/);
  assert.match(datasetGenerator, /selectExamples\(memo, 3\)/);
  assert.match(datasetGenerator, /export async function regenerateDescription/);
  assert.match(datasetGenerator, /validateMemoCoverage\(memo, result\.description\)/);
  assert.match(datasetGenerator, /메모의 핵심 내용이 누락되었습니다/);
  assert.match(datasetGenerator, /description\.trim\(\) === previousDescription\.trim\(\)/);
  assert.doesNotMatch(datasetGenerator, /memoSimilarity|exampleSimilarity|validateMemoCore|jaccard/);
  assert.match(datasetStyleChecker, /charCount < 140 \|\| charCount > 190/);
  assert.match(datasetStyleChecker, /sentences\.length !== 3/);
  assert.match(datasetStyleChecker, /for \(const phrase of forbiddenPhrases\)/);
  assert.doesNotMatch(datasetStyleChecker, /문체|유사도|종결|교육 효과|놀이 장면의 여운/);
  assert.match(datasetPrompt, /놀이 재료, 과정, 확장, 계절, 그림책 여부/);
  assert.match(datasetPrompt, /반드시 반영할 핵심 사실 체크리스트/);
  assert.match(datasetPrompt, /그림책 → 만들기 → 장소 이동 → 놀이 행동 → 게임 확장/);
  assert.match(datasetPrompt, /검사보다 교사가 수정할 수 있는 자연스러운 초안을 제공하는 것을 우선/);
  assert.match(datasetPrompt, /현재 제목 "\$\{title\}"은 고정값/);
  assert.match(datasetPrompt, /제목을 수정하거나 새로 생성하지 마세요/);
  assert.match(datasetPrompt, /마지막 문장은 배움이나 느낌을 해석하지 않습니다/);
  assert.match(datasetPrompt, /메모에 없는 행동, 상호작용, 대화, 감상/);
  assert.match(datasetPrompt, /친구와 이야기하거나 작품을 함께 본 사실이 메모에 없으면/);
  assert.match(datasetTitlePrompt, /만든 것, 놀이 장소, 놀이 대상, 놀이 소재/);
  assert.match(datasetTitlePrompt, /교실로 이어진 놀이/);
  assert.match(page, /교실에 생긴 계곡/);
  assert.match(page, /내가 만든 클레이 아이스크림/);
  assert.match(page, /makeCoverageAwareDescription/);
  assert.match(page, /validateMemoCoverage\(note, description\)/);
  assert.match(memoFacts, /export function analyzeMemo/);
  assert.match(memoFacts, /export function validateMemoCoverage/);
  assert.match(memoFacts, /"pictureBook" \| "material" \| "creation" \| "location" \| "action" \| "extension"/);
  assert.match(memoFacts, /높이\\s\*\(\?:점프\|뛰\)/);
  assert.match(memoFacts, /멀리\\s\*\(\?:점프\|뛰\)/);
  for (const phrase of ["서로 살펴보며", "생각을 나누며", "느낌을 나누며", "상상력을 발휘하며", "서로의 작품을 감상하며"]) {
    assert.match(forbidden, new RegExp(phrase));
  }

  const regenerationStart = page.indexOf("const regenerateFromNote = async");
  const regenerationEnd = page.indexOf("const publishDraft", regenerationStart);
  const regenerationBlock = page.slice(regenerationStart, regenerationEnd);
  assert.ok(regenerationStart >= 0 && regenerationEnd > regenerationStart, "재생성 함수가 독립적으로 존재해야 합니다");
  assert.match(regenerationBlock, /const fixedTitle = targetPlay\.title/);
  assert.match(regenerationBlock, /previousDescription/);
  assert.match(regenerationBlock, /description: generated\.description/);
  assert.doesNotMatch(regenerationBlock, /title:\s*(?:generated|fallback)\./);
  assert.doesNotMatch(regenerationBlock, /setPlayTitle|generatePlaypanel\(/);
  assert.doesNotMatch(regenerationBlock, /regenerationCount\s*%|nextCount\s*%|%\s*2/);
});
