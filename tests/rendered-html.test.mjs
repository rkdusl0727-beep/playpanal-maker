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

test("locks parent-facing play descriptions to the approved writing rules", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const fewShots = await readFile(new URL("app/play-panel-few-shots.ts", root), "utf8");
  assert.match(page, /text\.length < 150 \|\| text\.length > 180/);
  assert.match(page, /sentences\.length !== 3/);
  assert.match(page, /panelTitleIssues/);
  assert.match(page, /title\.length < 8 \|\| title\.length > 16/);
  assert.match(page, /같은 종결 표현을 반복할 수 없습니다/);
  assert.match(page, /교육적 효과\|학습 목표\|발달시켰다/);
  assert.match(page, /달콤한 여름 디저트/);
  assert.match(page, /아이들은 말랑말랑한 클레이로 아이스크림 모형을 꾸미고/);
  assert.match(page, /const playClosingSentence = \(note: string, variant = 0\)/);
  assert.match(page, /① 표현/);
  assert.match(page, /⑩ 계절 경험/);
  assert.match(page, /금지된 AI 문구와 유사한 표현은 사용할 수 없습니다/);
  assert.doesNotMatch(page, /return "손끝으로 모양을 만들어 가며 각자의 생각을 담아 표현하는 즐거움을 느껴 볼 수 있었어요/);
  assert.match(page, /블록으로 만든 놀이 공간/);
  assert.match(page, /알록달록 꾸미기 놀이/);
  assert.match(page, /재료·계절·놀이 결과가 보이는 제목/);
  assert.match(page, /copiesMemoStructure/);
  assert.match(page, /memoStructureSimilarity\(note, description\) >= 0\.3/);
  assert.match(page, /extractMemoFacts/);
  assert.match(page, /generateTeacherPanelDraft/);
  assert.match(page, /selectPlayPanelFewShots\(note, 3\)/);
  assert.match(page, /copiesFewShotExpression/);
  assert.match(page, /!audit\.copiedFewShot/);
  assert.match(page, /repeatedAcrossPanel/);
  assert.match(page, /① 사실 추출 → ② 관련 예시 1~3개 선택/);
  assert.match(page, /⑤ 놀이패널 스타일 검사 → ⑥ AI 표현 검사/);
  assert.match(page, /const playPanelStyleIssues/);
  assert.match(page, /playSceneVisible/);
  assert.match(page, /notReportOrDailyLog/);
  assert.match(page, /processCentered/);
  assert.match(page, /notResultOnly/);
  assert.match(page, /lingeringPlayEnding/);
  assert.match(page, /playPanelStyle/);
  assert.match(page, /보고서나 활동일지 표현 대신 놀이패널 문체/);
  assert.match(page, /놀이 결과보다 선택하고 탐색하고 이어 가는 과정을 중심/);
  assert.match(page, /마지막 문장은 교육 효과가 아니라 놀이 장면의 따뜻한 여운/);
  assert.match(page, /형식적이거나 AI스러운 표현 대신 담임교사의 자연스러운 기록/);
  assert.match(page, /장마를 담은 물방울/);
  assert.match(page, /비가 이어지는 장마 풍경을 떠올리며/);
  assert.match(page, /restateCopiedMemo/);
  assert.match(page, /입력은 메모입니다/);
  assert.match(page, /만 5세 담임교사가 부모에게 오늘의 놀이를 소개하는 관찰 기록/);
  assert.match(page, /메모를 축약하지 말고 놀이패널 제목으로 새롭게 작성/);
  assert.doesNotMatch(page, /return "색과 선으로 펼친 우리 생각"/);
  assert.doesNotMatch(page, /return "생각을 모아 만든 우리 세상"/);
  assert.doesNotMatch(page, /재료와 방법을 스스로 선택해 표현하는 모습/);
  assert.ok((fewShots.match(/closingPerspective:/g) || []).length >= 25, "Few-shot examples must include 20–30 classified panel patterns");
  assert.match(fewShots, /export const selectPlayPanelFewShots/);
  assert.match(fewShots, /PLAY_PANEL_FEW_SHOTS_BY_CATEGORY/);
  assert.match(fewShots, /"봄", "여름", "가을", "겨울", "자연물", "그림책", "미술", "과학", "신체", "역할놀이", "요리", "바깥놀이"/);
  assert.doesNotMatch(fewShots, /상상력과 표현력을 넓혀 나갔습니다|재료의 특성을 탐색하며/);
  assert.doesNotMatch(page, /candidates\.unshift\(exactFewShot\.description\)/);
});
