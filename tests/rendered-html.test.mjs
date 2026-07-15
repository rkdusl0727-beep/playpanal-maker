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
  assert.match(page, /text\.length < 150 \|\| text\.length > 180/);
  assert.match(page, /sentences\.length !== 3/);
  assert.match(page, /panelTitleIssues/);
  assert.match(page, /length >= 8 && length <= 16/);
  assert.match(page, /같은 종결 표현을 반복할 수 없습니다/);
  assert.match(page, /교육적 효과\|학습 목표\|발달시켰다/);
  assert.match(page, /달콤한 여름 디저트/);
  assert.match(page, /아이들은 말랑말랑한 클레이로 아이스크림 모형을 꾸미고/);
});
