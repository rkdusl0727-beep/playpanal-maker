"use client";

import { ChangeEvent, DragEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";

type Photo = { src: string; x: number; y: number } | null;
type PptxConstructor = new () => any;
type Play = {
  id: number;
  title: string;
  description: string;
  publishedTitle: string;
  publishedDescription: string;
  learning: string;
  note: string;
  approved: boolean;
  photos: Photo[];
  photoCount: 4 | 6 | 8;
  isBookPlay: boolean;
  bookCover: Photo;
};

const samples = [
  ["바닥에 표현해 본 여름", "하늘정원 바닥에 야외용 분필로 여름에 떠오르는 모습을 마음껏 그리고 색칠해 보았어요. 시원한 바다와 물고기, 파도 등을 자유롭게 표현하며 친구들과 함께 커다란 여름 풍경을 완성했습니다.", "계절의 특징을 탐색하고, 생각과 느낌을 미술 재료로 자유롭게 표현했습니다."],
  ["그림책 독후활동 · 여름의 태양", "여름이 물러온다 그림책을 함께 읽고 기억에 남은 장면을 이야기했어요. 책 표지에 여름 태양을 살펴보고 우리만의 느낌과 색으로 다시 구성하며 다양한 재료의 질감을 경험했습니다.", "이야기를 주의 깊게 듣고 자신의 경험과 연결해 창의적으로 표현했습니다."],
  ["교실에서 찾은 여름소리", "교실에 있는 다양한 물건과 놀잇감, 도구를 활용해 여름 소리를 찾아보았어요. 파도 소리와 귀뚜라미 소리, 빗소리와 천둥 소리를 직접 만들며 주변 사물의 소리를 비교했습니다.", "주변의 소리에 관심을 갖고 여러 사물의 소리를 비교하고 탐색했습니다."],
  ["여름소리 찍어요 · 만화", "다양한 여름 소리를 들어보고 느껴지는 소리를 몸짓과 표정으로 나타냈어요. 친구의 모습을 사진으로 찍고 여러 장면을 순서대로 이어 붙이며 여름 소리가 담긴 재미있는 만화를 만들었습니다.", "소리를 시각적으로 표현하고 친구의 생각을 존중하며 이야기를 함께 구성했습니다."],
  ["비 오는 날의 수채화", "비 오는 날 창밖의 풍경과 빗방울이 떨어지는 모습을 자세히 관찰했어요. 크레파스로 빗방울과 물웅덩이를 그리고 그 위에 물감이 번지는 모습을 실험하며 비 오는 날의 분위기를 표현했습니다.", "날씨 변화를 관찰하고 물감의 번짐을 실험하며 아름다움을 느꼈습니다."],
];

const monthlyBackgrounds = [
  { name: "포근한 겨울", css: "linear-gradient(155deg,#eaf5ff 0%,#ffffff 52%,#cfe8fa 100%)", color: "EAF5FF" },
  { name: "새봄 기다림", css: "linear-gradient(155deg,#f5ecff 0%,#fff7fb 52%,#d9e8ff 100%)", color: "F5ECFF" },
  { name: "봄 새싹", css: "linear-gradient(155deg,#e8f8de 0%,#fffbe8 52%,#cfeec8 100%)", color: "E8F8DE" },
  { name: "봄꽃", css: "linear-gradient(155deg,#ffe8f0 0%,#fffbea 52%,#dff5e5 100%)", color: "FFE8F0" },
  { name: "초록 숲", css: "linear-gradient(155deg,#dff4de 0%,#f4ffe9 52%,#bfe3d1 100%)", color: "DFF4DE" },
  { name: "초여름", css: "linear-gradient(155deg,#dff7f2 0%,#fffde8 52%,#bce7e6 100%)", color: "DFF7F2" },
  { name: "시원한 물빛", css: "linear-gradient(155deg,#bfeeff 0%,#e9f9ff 50%,#9ad7f4 100%)", color: "BFEEFF" },
  { name: "여름 바다", css: "linear-gradient(155deg,#b7e8ff 0%,#e7fbff 48%,#82cbed 100%)", color: "B7E8FF" },
  { name: "가을 시작", css: "linear-gradient(155deg,#fff0c9 0%,#fff8e8 52%,#e8d39d 100%)", color: "FFF0C9" },
  { name: "단풍", css: "linear-gradient(155deg,#ffd7b5 0%,#fff1d7 52%,#e9a97d 100%)", color: "FFD7B5" },
  { name: "늦가을", css: "linear-gradient(155deg,#ead9c6 0%,#fff7eb 52%,#cbb29a 100%)", color: "EAD9C6" },
  { name: "겨울 눈꽃", css: "linear-gradient(155deg,#e7f2ff 0%,#ffffff 52%,#c8d9ef 100%)", color: "E7F2FF" },
];

const makePlay = (i: number): Play => ({
  id: Date.now() + i,
  title: "",
  description: "",
  publishedTitle: "",
  publishedDescription: "",
  learning: samples[i]?.[2] || "놀이를 통해 발견한 배움을 기록해 주세요.",
  note: "",
  approved: false,
  photos: Array(8).fill(null),
  photoCount: 6,
  isBookPlay: i === 1,
  bookCover: null,
});

function weekRange(year: number, month: number, week: number) {
  const first = new Date(year, month - 1, 1);
  // A month's first week starts on the Monday on or before the 1st.
  // For example, July 2026 week 1 is Jun 29–Jul 3 and week 5 is Jul 27–31.
  const firstMonday = new Date(first);
  const day = first.getDay();
  firstMonday.setDate(1 - ((day + 6) % 7) + (week - 1) * 7);
  const end = new Date(firstMonday);
  end.setDate(end.getDate() + 4);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return [iso(firstMonday), iso(end)];
}

const pretty = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

// AI/규칙 기반 문장을 합칠 때 같은 문장이 반복되지 않도록 정리한다.
const dedupeSentences = (value: string) => {
  const seen = new Set<string>();
  return value
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => {
      const key = sentence.replace(/\s+/g, " ").replace(/[.!?]+$/, "").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(" ");
};

// 메모체는 편집용 입력에서만 허용하고, 생성 결과와 신문에는 완성형 문장만 남긴다.
const finalizeDescription = (value: string) => {
  let text = value
    .replace(/천정/g, "천장")
    .replace(/읽고책/g, "읽고 책")
    .replace(/태양을꾸/g, "태양을 꾸")
    .replace(/숨을불어/g, "숨을 불어")
    .replace(/느낄수/g, "느낄 수")
    .replace(/만듦/g, "만들어보았어요")
    .replace(/만듬/g, "만들어보았어요")
    .replace(/([가-힣])하고([가-힣])/g, "$1하고 $2")
    .replace(/([가-힣])고([가-힣])/g, "$1고 $2")
    .replace(/(살펴|관찰해|그려|만들어|꾸며|읽어|놀이해|표현해|탐색해|완성해|매달아|붙여|접어|오려|찍어|불어|섞어|칠해|그어|이어|쌓아|놓아|담아|찾아|느껴|만져|흔들어)봄\s*([,，])/g, "$1보고$2")
    .replace(/(관찰|표현|이야기|탐색|완성|놀이|기뻐|좋아|즐거워|궁금해)함\s*([,，])/g, "$1하며$2")
    .replace(/했음\s*([,，])/g, "했고$1")
    .replace(/(살펴|관찰해|그려|만들어|꾸며|읽어|놀이해|표현해|탐색해|완성해|매달아|붙여|접어|오려|찍어|불어|섞어|칠해|그어|이어|쌓아|놓아|담아|찾아|느껴|만져|흔들어)봄(?=\s*[.!?]|$)/g, "$1보았어요")
    .replace(/관찰함(?=\s*[.!?]|$)/g, "관찰해보았어요")
    .replace(/표현함(?=\s*[.!?]|$)/g, "표현해보았어요")
    .replace(/이야기함(?=\s*[.!?]|$)/g, "이야기를 나누었어요")
    .replace(/탐색함(?=\s*[.!?]|$)/g, "탐색해보았어요")
    .replace(/완성함(?=\s*[.!?]|$)/g, "완성했답니다")
    .replace(/놀이함(?=\s*[.!?]|$)/g, "놀이했어요")
    .replace(/기뻐함(?=\s*[.!?]|$)/g, "기뻐했답니다")
    .replace(/좋아함(?=\s*[.!?]|$)/g, "좋아했어요")
    .replace(/즐거워함(?=\s*[.!?]|$)/g, "즐거워했답니다")
    .replace(/궁금해함(?=\s*[.!?]|$)/g, "궁금해했어요")
    .replace(/했음(?=\s*[.!?]|$)/g, "했어요")
    .replace(/있었음(?=\s*[.!?]|$)/g, "있었어요")
    .replace(/느꼈음(?=\s*[.!?]|$)/g, "느꼈어요")
    .replace(/즐거웠음(?=\s*[.!?]|$)/g, "즐거웠어요")
    .replace(/신기했음(?=\s*[.!?]|$)/g, "신기했어요")
    .replace(/나타냄(?=\s*[.!?]|$)/g, "나타내보았어요")
    .replace(/보임(?=\s*[.!?]|$)/g, "보였어요")
    .replace(/붙임(?=\s*[.!?]|$)/g, "붙여보았어요")
    .replace(/매달아둠(?=\s*[.!?]|$)/g, "매달아두었어요")
    .replace(/해봄(?=\s*[.!?]|$)/g, "해보았어요")
    .replace(/만들어봄(?=\s*[.!?]|$)/g, "만들어보았어요")
    .replace(/그려봄(?=\s*[.!?]|$)/g, "그려보았어요")
    .replace(/살펴봄(?=\s*[.!?]|$)/g, "살펴보았어요")
    .replace(/매달아봄(?=\s*[.!?]|$)/g, "매달아 감상해보았어요")
    .replace(/([가-힣]+)함(?=\s*[.!?]|$)/g, "$1했어요")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/([.!?])(?=\S)/g, "$1 ")
    .replace(/\.{2,}/g, ".")
    .replace(/\s{2,}/g, " ")
    .replace(/완성한\s+작품([은을이가의])/g, "완성한\u00a0작품$1")
    .trim();
  if (text && !/[.!?]$/.test(text)) text += ".";
  return dedupeSentences(text);
};

const fitDescriptionToPanel = (value: string) => {
  let text = finalizeDescription(value)
    .replace(/함께 이야기를 나누어보았어요/g, "이야기를 나누었어요")
    .replace(/서로의 생각을 나누어보았어요/g, "생각을 나누었어요")
    .replace(/자신만의 방법으로/g, "자유롭게")
    .replace(/다양한 모습으로 나타날 수 있음을/g, "다르게 표현될 수 있음을")
    .replace(/놀이 과정에서 느낀 점을/g, "느낀 점을")
    .replace(/천천히 살펴보며/g, "살펴보며");
  // 짧은 메모라고 해서 모든 놀이에 같은 문장을 덧붙이지 않는다.
  // 메모에 담긴 장면을 보존한 결과를 그대로 사용하고, 중복 문장만 제거한다.
  return dedupeSentences(text);
};

const removeTitleLead = (description: string, title: string) => {
  const cleanTitle = title.trim();
  if (!cleanTitle) return description;
  const escaped = cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return description.replace(new RegExp(`^\\s*${escaped}\\s*[,.:·-]?\\s*`, "i"), "").trim();
};

const naturalizeNoteBase = (note: string, playTitle: string) => {
  const context = `${note} ${playTitle}`;
  if (/모자이크/.test(context) && /(모빌|교실\s*천장)/.test(context) && /(빗방울|물방울)/.test(context) && /색종이/.test(context)) {
    return "비 오는 날씨를 보며 빗방울의 모습을 표현해보았어요. 빗방울 도안에 남색, 파란색, 하늘색 색종이를 찢어 붙여 모자이크로 꾸미고, 완성한 작품을 모빌로 만들어 교실 천장에 매달았답니다. 천장에 매단 알록달록한 색종이 모빌을 살펴보며 느낀 점을 자연스럽게 나누어보았어요.";
  }
  if (/(비\s*가?\s*오는|비오는|비 오는)/.test(context) && /(하늘정원|옥상정원)/.test(context) && /물웅덩이/.test(context) && /우산/.test(context)) {
    const secretPicture = /비밀\s*그림/.test(context) ? " 물감으로 배경을 칠하자 비밀 그림처럼 빗방울이 나타나는 과정을 경험했답니다." : " 물감으로 배경을 칠해 비 오는 풍경을 표현했답니다.";
    const feeling = /즐거워함|기뻐/.test(context) ? " 즐거움을 느끼며" : "";
    return `비가 오는 날씨에 하늘정원으로 가서 우산을 쓰고 비 오는 풍경을 탐색해보았어요. 교실로 돌아와 하늘정원에서 본 비 오는 모습을 크레파스로 그리고, 빗방울과 물웅덩이를 그린 후${secretPicture} 물감 위로 드러나는 빗방울을 살펴보고 우산 쓴 자신의 모습을 그 위에 붙이며${feeling} 비 오는 날의 풍경을 표현해 볼 수 있었어요.`;
  }
  if (/분필/.test(context) && /(하늘정원|옥상정원|옥상|정원)/.test(context) && /바닥/.test(context)) {
    const sea = /바다생물|바다 생물|물고기|거북이/.test(context);
    const fruit = /여름과일|여름 과일|수박|참외/.test(context);
    const subjects = sea && fruit ? "바다 생물과 여름 과일" : sea ? "물고기와 거북이 등 바다 생물" : fruit ? "수박과 참외 등 여름 과일" : "여름에 떠오르는 다양한 모습";
    return `야외용 분필을 들고 하늘정원으로 나가 바닥에 여름 풍경을 그려보았어요. ${subjects}을 자유롭게 표현하고, 친구와 생각을 나누며 커다란 협동 작품도 완성했답니다. 서로의 그림이 하나의 여름 풍경으로 이어지는 모습을 살펴보며 느낀 점을 자연스럽게 나누어보았어요.`;
  }
  if (/여름이\s*(?:물러|몰려)온다/.test(context) && /태양/.test(context)) {
    const bookTitle = /여름이\s*몰려온다/.test(context) ? "여름이 몰려온다" : "여름이 물러온다";
    return `「${bookTitle}」를 함께 읽으며 책 표지에 담긴 여름 태양을 살펴보았어요. 습자지를 뭉쳐 태양을 꾸미고, 파란색으로 칠한 구름에는 숨을 불어 우리만의 장면을 완성했답니다. 완성한 작품은 교실 천장에 매달아 감상하며 이야기의 장면을 다시 떠올려 볼 수 있었어요.`;
  }
  if (/우드락/.test(context) && /(판화|찍어|찍는)/.test(context) && /소리/.test(context)) {
    return "여름 소리 그림책을 함께 읽으며 어떤 소리가 떠오르는지 이야기를 나누어보았어요. 매미와 파도, 빗방울 등 여름의 다양한 소리를 모아 우드락 위에 연필로 선과 모양을 새긴 후 물감을 발라 판화로 표현해 볼 수 있었어요.";
  }
  if (/여름\s*소리|소리/.test(context) && /(말로\s*써|써봄|써\s*봄|낱말|어휘|글자|말로\s*나타)/.test(context)) {
    return "여름 소리를 귀 기울여 듣고 어떤 소리인지 눈을 감고 맞혀보며 소리의 특징을 자세히 살펴보았어요. 다양한 여름 소리에 대해 이야기를 나눈 뒤, 소리를 나타내는 말을 떠올려 말해보고 알맞은 낱말로 써보았답니다. 친구가 고른 낱말을 함께 읽어보며 소리와 말이 연결되는 즐거움을 느끼고, 자신의 생각을 글자로 표현하는 문해 경험을 쌓아보았어요.";
  }
  if (/(구름|비가\s*되는|쉐이빙폼|색소|수조)/.test(context) && /관찰|실험|떨어/.test(context)) {
    return "구름에서 비가 되는 과정을 알아보기 위해 수조에 쉐이빙폼을 뿌리고 구름을 만들어보았어요. 그 위에 색소를 떨어뜨리자 색소가 점점 아래로 내려가는 모습을 자세히 관찰하며 비가 내리는 모습을 탐색했답니다. 눈앞에서 나타나는 변화를 살펴보고 구름과 비의 관계를 자신의 말로 이야기해보며 자연 현상을 알아가는 즐거움을 느껴보았어요.";
  }
  if (/(스프레이건|물총|물놀이)/.test(context) && /(페트병|하늘정원|옥상정원|연결)/.test(context)) {
    return "스프레이건을 페트병에 연결해 물총을 만들어보고 하늘정원으로 올라가 물총놀이를 시작했어요. 직접 만든 물총으로 물을 뿌리며 놀이 방법을 바꾸어 시도하고, 친구와 물의 방향과 거리를 비교하며 즐겁게 놀이를 이어갔답니다. 함께 만든 물놀이 공간에서 서로의 생각을 나누고 안전하게 움직이며 놀이를 마무리해보았어요.";
  }
  if (/(블록|놀잇감)/.test(context) && /(여름소리|여름 소리)/.test(context)) {
    const connectedSounds = /(?:만든|만들어본|우리(?:가)?\s*만든)\s*소리(?:를|들을)?\s*연결|소리(?:를|들을)?\s*연결/.test(context);
    const connectedPhrase = connectedSounds ? " 우리가 만든 소리를 차례로 연결해보며" : "";
    return /확장활동/.test(context)
      ? `어제 관심을 보였던 여름 소리를 다시 들어보고, 교실의 블록과 악기, 색연필 등 다양한 놀잇감으로 소리를 만들어보았어요. 친구와 두 명씩 짝을 지어 파도, 천둥, 매미, 빗소리와 빗방울 소리를 표현하고,${connectedPhrase} 여름 소리 놀이로 자연스럽게 확장되고 있답니다.`
      : `어제 관심을 보였던 여름 소리를 다시 들어보고, 교실의 블록과 악기, 색연필 등 다양한 놀잇감으로 소리를 만들어보았어요. 친구와 두 명씩 짝을 지어 파도, 천둥, 매미, 빗소리와 빗방울 소리를 표현하고,${connectedPhrase} 느낀 점을 자연스럽게 나누어보았어요.`;
  }
  if (/실험활동|실험|가설|변화|녹아|녹는|섞어|번짐|관찰/.test(context) && /실험|변화|관찰|살펴/.test(context)) {
    return "재료와 현상을 자세히 살펴보며 어떤 변화가 나타날지 함께 예상해보았어요. 직접 재료를 섞고 움직여보며 달라지는 모습을 관찰하고, 결과를 친구들과 비교해 이야기 나누었답니다. 반복해서 시도하는 과정에서 원인과 결과를 생각해보며 자신만의 방법으로 탐구하는 즐거움을 느껴보았어요.";
  }
  if (/자연탐구|자연|식물|꽃|나뭇잎|곤충|생태|날씨|하늘|흙|씨앗/.test(context) && /관찰|살펴|찾아|탐색|기록/.test(context)) {
    return "주변의 자연물을 자세히 관찰하며 색, 모양, 냄새와 움직임에서 발견한 특징을 이야기해보았어요. 관심이 가는 자연물을 찾아 서로 비교하고, 달라지는 모습을 살펴보며 생명과 자연의 변화를 알아갔답니다. 관찰한 내용을 자신의 말과 그림으로 표현하며 자연을 소중히 대하는 태도를 키워볼 수 있었어요.";
  }
  if (/신체놀이|신체활동|몸짓|달리|뛰|점프|던지|굴리|균형|기어|움직임|협응/.test(context)) {
    return "몸을 움직여 다양한 동작을 시도하며 움직임의 방향과 속도를 조절해보았어요. 달리고, 뛰고, 구르고, 균형을 잡는 과정에서 몸의 움직임을 느끼고 친구와 놀이 방법을 의논했답니다. 서로의 움직임을 살펴보며 공간을 안전하게 사용하고 신체 협응과 조절력을 기르는 즐거운 시간이었어요.";
  }
  const details = note.trim().split(/[.\n]+/).map(part => part.trim()).filter(Boolean).map((part, index) => {
    let sentence = part
      .replace(/^(아이들은?|아이들이|유아들은?|유아들이|어린이들은?|어린이들이|친구들은?|친구들이|아이가|유아가)\s*/, "")
      .replace(/을 가지고/g, "을 들고")
      .replace(/를 가지고/g, "를 활용해")
      .replace(/으로 가서/g, "으로 나가")
      .replace(/친구와 짝을 정해서/g, "친구와 짝을 지어")
      .replace(/함께 생각하는 여름\s*소리는 무엇인지 이야기 나누고/g, "여름에 들을 수 있는 소리를 함께 떠올려 이야기 나눈 뒤")
      .replace(/이야기 나누고/g, "이야기를 나눈 뒤")
      .replace(/메미/g, "매미")
      .replace(/소리등/g, "소리 등")
      .replace(/만듦/g, "만들어보았어요")
      .replace(/만듬/g, "만들어보았어요")
      .replace(/여름풍경을 바닥에/g, "바닥에 여름 풍경을")
      .replace(/(을|를|에)\s*그림\s*([,，])/g, "$1 그리고$2")
      .replace(/거북이\s*물고기등\s*다양하게\s*그림그리고\s*친구들과\s*함께\s*합동그림도\s*그려봄$/g, "거북이와 물고기 등 다양한 모습을 그리고, 친구들과 함께 합동 그림도 완성해보았어요")
      .replace(/거북이\s*물고기\s*등\s*다양하게\s*그림$/g, "거북이와 물고기 등 다양한 모습을 그려 넣었답니다")
      .replace(/만들어봄\s*([,，])/g, "만들어보고$1")
      .replace(/그려봄\s*([,，])/g, "그려보고$1")
      .replace(/해봄\s*([,，])/g, "해보고$1")
      .replace(/관찰함\s*([,，])/g, "관찰하고$1")
      .replace(/표현함\s*([,，])/g, "표현하고$1")
      .replace(/이야기함\s*([,，])/g, "이야기하고$1")
      .replace(/탐색함\s*([,，])/g, "탐색하고$1")
      .replace(/완성함\s*([,，])/g, "완성하고$1")
      .replace(/살펴봄\s*([,，])/g, "살펴보고$1")
      .replace(/관찰함\s*([,，])/g, "관찰하며$1")
      .replace(/놀이함\s*([,，])/g, "놀이하며$1")
      .replace(/기뻐함\s*([,，])/g, "기뻐하며$1")
      .replace(/좋아함\s*([,，])/g, "좋아하며$1")
      .replace(/즐거워함\s*([,，])/g, "즐거워하며$1")
      .replace(/궁금해함\s*([,，])/g, "궁금해하며$1")
      .replace(/했음\s*([,，])/g, "했고$1")
      .replace(/(매달아|붙여|꾸며|읽어|살펴|접어|오려|찍어|불어|섞어|칠해|그어|이어|쌓아|놓아|담아|찾아|느껴|만져|흔들어)봄\s*([,，])/g, "$1보고$2")
      .replace(/(매달아|붙여|꾸며|읽어|살펴|접어|오려|찍어|불어|섞어|칠해|그어|이어|쌓아|놓아|담아|찾아|느껴|만져|흔들어)봄/g, "$1보았어요")
      .replace(/만들어봄/g, "만들어보았어요")
      .replace(/그려봄/g, "그려보았어요")
      .replace(/해봄/g, "해보았어요")
      .replace(/관찰함/g, "관찰해보았어요")
      .replace(/표현함/g, "표현해보았어요")
      .replace(/이야기함/g, "이야기를 나누어보았어요")
      .replace(/탐색함/g, "탐색해보았어요")
      .replace(/완성함/g, "완성해보았어요")
      .replace(/살펴봄/g, "살펴보았어요")
      .replace(/관찰함/g, "관찰했어요")
      .replace(/놀이함/g, "놀이했어요")
      .replace(/기뻐함/g, "기뻐했답니다")
      .replace(/좋아함/g, "좋아했어요")
      .replace(/즐거워함/g, "즐거워했답니다")
      .replace(/궁금해함/g, "궁금해했어요")
      .replace(/그려봄$/g, "그려보았어요")
      .replace(/해봄$/g, "해보았어요")
      .replace(/만들어봄$/g, "만들어보았어요")
      .replace(/관찰함$/g, "관찰해보았어요")
      .replace(/표현함$/g, "표현해보았어요")
      .replace(/했음$/g, "했어요")
      .replace(/함$/g, "해보았어요")
      .replace(/그림$/g, "그려보았어요");
    if (index > 0) sentence = sentence.replace(/^(아이들은?|아이들이|유아들은?|유아들이|친구들은?|친구들이|어린이들은?|어린이들이)\s*/, "");
    return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
  });
  const varied = details.map((sentence, index) => {
    if (index % 3 === 1) return sentence.replace(/해보았어요\.$/, "했답니다.").replace(/어보았어요\.$/, "어보았답니다.");
    if (index % 3 === 2) return sentence
      .replace(/표현해보았어요\.$/, "표현하는 즐거움을 느꼈어요.")
      .replace(/탐색해보았어요\.$/, "탐색하며 즐거움을 느꼈어요.")
      .replace(/만들어보았어요\.$/, "만드는 즐거움을 느꼈어요.")
      .replace(/그려보았어요\.$/, "그리는 즐거움을 느꼈어요.");
    return sentence;
  });
  let story = finalizeDescription(varied.join(" "));
  const hasPeerPlay = /친구|짝|함께|협동/.test(context);
  const closing = /클레이|아이스크림|모양|색/.test(context)
    ? "완성한 모양을 서로 살펴보며 재료의 느낌과 생각을 자연스럽게 나누어보았어요."
    : /비|빗방울|물웅덩이|우산/.test(context)
      ? "비 오는 날의 모습을 다시 떠올리며 관찰한 장면과 느낌을 이야기해보았어요."
      : /소리|말|낱말|어휘|글자/.test(context)
        ? "놀이에서 발견한 소리와 말을 서로 들려주며 표현의 즐거움을 나누어보았어요."
        : hasPeerPlay ? "서로의 표현을 살펴보며 느낀 점을 자연스럽게 나누어보았어요." : "놀이를 이어가며 새롭게 발견한 점을 이야기해보았어요.";
  if ((story.match(/[.!?]/g)?.length ?? 0) < 2 && !story.includes(closing.replace(/[.!?]$/, ""))) {
    story = `${story} ${closing}`;
  }
  if (/확장활동/.test(context) && !/확장되고 있답니다/.test(story)) {
    story = story.replace(/(?:해보았어요|했어요|했답니다|느꼈어요|나누었어요)\.$/, "하며 앞선 놀이의 관심이 새로운 놀이로 자연스럽게 확장되고 있답니다.");
  }
  return finalizeDescription(story);
};

// 마지막 문장은 배움을 설명하거나 평가하지 않고, 메모에서 확인되는
// 놀이 장면이 어떻게 이어졌는지를 부모가 그려 볼 수 있게 마무리한다.
const playClosingSentence = (note: string) => {
  const context = note;
  if (/소리|말로|낱말|어휘|글자|읽고|읽어|써봄|써\s*봄|말로\s*나타/.test(context)) {
    return "소리와 낱말을 하나둘 연결하며 떠오른 생각을 말과 글로 담아 가는 놀이가 이어졌답니다.";
  }
  if (/실험|변화|관찰|색소|구름|비가|섞어|번짐|자연|식물|꽃|나뭇잎|곤충|씨앗/.test(context)) {
    return "눈앞에서 달라지는 모습을 차근차근 살펴보며 궁금한 장면을 따라 놀이를 이어 갈 수 있었어요.";
  }
  if (/달리|뛰|점프|균형|기어|움직임|몸짓|물총|물놀이|신체/.test(context)) {
    return "몸의 움직임과 거리를 스스로 조절하며 친구들과 안전하게 놀이를 이어 나갔습니다.";
  }
  if (/친구|짝|함께|협동|나누|서로|공동/.test(context)) {
    return "서로의 놀이를 살펴보고 방법을 나누며 저마다의 생각을 담은 놀이가 이어졌답니다.";
  }
  if (/미술|그림|색|물감|분필|클레이|색종이|모자이크|모빌|꾸미|표현|만들/.test(context)) {
    return "손끝으로 모양을 만들어 가며 저마다의 생각을 담아 표현하는 즐거움을 느껴 볼 수 있었어요.";
  }
  return "놀이에서 발견한 모습을 차근차근 살펴보며 저마다의 방법으로 놀이를 이어 갈 수 있었어요.";
};

const restateCopiedMemo = (note: string) => {
  const materials = ["클레이", "휴지심", "색종이", "자연물", "분필", "물감", "우드락", "연필", "블록", "악기", "페트병", "크레파스", "습자지"]
    .filter(material => note.includes(material)).slice(0, 3);
  const result = [
    [/아이스크림/, "아이스크림"], [/아이스바/, "아이스바"], [/팥빙수|빙수/, "팥빙수"], [/물방울/, "물방울"],
    [/판화/, "판화"], [/모빌/, "모빌"], [/물총/, "물총"], [/여름\s*풍경/, "여름 풍경"], [/소리/, "소리 놀이"],
    [/그림/, "그림"], [/쌓기|블록/, "블록 공간"],
  ].find(([pattern]) => (pattern as RegExp).test(note))?.[1] as string | undefined;
  if (!materials.length && !result) return "";
  const materialText = materials.length ? materials.join("·") : "놀이 재료";
  const resultText = result || "놀이 작품";
  const asObject = (word: string) => {
    const code = word.charCodeAt(word.length - 1);
    const hasBatchim = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
    return `${word}${hasBatchim ? "을" : "를"}`;
  };
  const first = /그림책|책을\s*읽/.test(note)
    ? `그림책을 함께 읽은 뒤 ${asObject(materialText)} 활용해 ${resultText}에 떠오른 장면을 담아 보았습니다.`
    : `${asObject(materialText)} 손끝으로 살펴보며 ${asObject(resultText)} 차근차근 만들어 보았습니다.`;
  const second = /친구|함께|협동|짝/.test(note)
    ? `모양과 쓰임을 하나둘 맞추어 가고 친구의 표현과 어우러지도록 놀이를 이어 가는 모습이 보였답니다.`
    : `재료를 만지고 모양을 다듬는 과정을 거치며 떠오른 모습을 정성껏 완성해 가는 모습이 보였답니다.`;
  return dedupeSentences(`${first} ${second} ${playClosingSentence(note)}`);
};

const formalizePanelSentence = (sentence: string) => sentence
  .replace(/[.!?]+$/, "")
  .replace(/해\s*보았어요$/g, "해 보았습니다")
  .replace(/해보았어요$/g, "해 보았습니다")
  .replace(/보았어요$/g, "보았습니다")
  .replace(/했답니다$/g, "했습니다")
  .replace(/했어요$/g, "했습니다")
  .replace(/느꼈어요$/g, "느껴 보았습니다")
  .replace(/나누었어요$/g, "나누어 보았습니다")
  .replace(/이어갔어요$/g, "이어 나갔습니다")
  .replace(/이어갔답니다$/g, "이어 나갔습니다")
  .replace(/했습니다$/g, "해 보았습니다");

const observationSentence = (sentence: string, note: string) => {
  const body = sentence.replace(/[.!?]+$/, "");
  const converted = body
    .replace(/느낀 점을 자연스럽게 나누어보았어요$/g, "느낌과 생각을 서로 나누는 모습이 보였답니다")
    .replace(/이야기를 나누어보았어요$/g, "생각을 말로 표현하는 모습이 보였답니다")
    .replace(/이야기를 나누었어요$/g, "생각을 말로 표현하는 모습이 보였답니다")
    .replace(/표현해\s*보았어요$/g, "각자의 방식으로 표현하는 모습이 보였답니다")
    .replace(/표현해보았어요$/g, "각자의 방식으로 표현하는 모습이 보였답니다")
    .replace(/완성했답니다$/g, "정성껏 완성하는 모습이 보였답니다")
    .replace(/완성했어요$/g, "정성껏 완성하는 모습이 보였답니다")
    .replace(/만들어보았어요$/g, "재료를 선택해 구성하는 모습이 보였답니다")
    .replace(/살펴보았어요$/g, "특징을 자세히 살펴보는 모습이 보였답니다")
    .replace(/탐색했답니다$/g, "변화를 자세히 탐색하는 모습이 보였답니다");
  if (/모습이 보였답니다$/.test(converted)) return `${converted}.`;
  if (/친구|함께|짝|협동/.test(note)) return `${formalizePanelSentence(body)}, 친구와 생각을 주고받으며 놀이를 이어 가는 모습이 보였답니다.`;
  if (/관찰|실험|변화|살펴/.test(note)) return `${formalizePanelSentence(body)}, 눈앞의 변화를 차근차근 살펴보는 모습이 보였답니다.`;
  if (/꾸미|장식|색칠|그리|붙이|접기|오리/.test(note)) return `${formalizePanelSentence(body)}, 색과 모양을 차근차근 더해 가는 모습이 보였답니다.`;
  if (/만들|쌓기|구성|연결/.test(note)) return `${formalizePanelSentence(body)}, 모양을 하나둘 완성해 가는 모습이 보였답니다.`;
  return `${formalizePanelSentence(body)}, 놀이의 흐름을 차근차근 이어 가는 모습이 보였답니다.`;
};

const toPanelDescription = (note: string, story: string) => {
  if (/클레이/.test(note) && /아이스크림/.test(note) && /휴지심/.test(note) && /아이스바/.test(note)) {
    return "아이들은 말랑말랑한 클레이로 아이스크림 모형을 꾸미고, 휴지심을 활용해 알록달록한 아이스바도 만들어 보았어요. 좋아하는 맛과 색을 떠올려 재료를 선택하고, 장식과 무늬를 더하며 저마다의 여름 디저트를 완성했답니다. 손끝으로 모양을 만들어 가며 각자의 생각을 담아 표현하는 즐거움을 느껴 볼 수 있었어요.";
  }
  if (/클레이/.test(note) && /아이스크림/.test(note)) {
    return "아이들은 말랑말랑한 클레이를 조물조물 만지며 시원한 아이스크림 모양을 만들어 보았습니다. 손끝으로 크기와 모양을 차근차근 다듬고 장식을 더해, 저마다 떠올린 아이스크림을 완성하는 모습이 보였답니다. 완성된 모양을 하나둘 살펴보며 생각을 작품으로 이어 가는 즐거움을 느껴 볼 수 있었어요.";
  }
  const sentences = dedupeSentences(story).split(/(?<=[.!?])\s+/).filter(Boolean);
  const first = `${formalizePanelSentence(sentences[0] || note)}.`;
  const secondSource = sentences[1] || sentences[0] || note;
  const second = observationSentence(secondSource, note);
  const third = playClosingSentence(note);
  return dedupeSentences(`${first} ${second} ${third}`);
};

const normalizedMemoText = (value: string) => value
  .replace(/(?:해봄|해보았음|했음|있음|나타남|관찰함|표현함|놀이함|만들기|만들었음|함)/g, "")
  .replace(/[^가-힣A-Za-z0-9]/g, "");

const copiesMemoStructure = (note: string, value: string) => {
  const output = normalizedMemoText(value);
  return note
    .split(/[\n,.!?]+/)
    .map(part => normalizedMemoText(part))
    .filter(part => part.length >= 14)
    .some(part => output.includes(part));
};

const panelDescriptionIssues = (value: string, note = "") => {
  const text = value.trim();
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const issues: string[] = [];
  if (sentences.length !== 3) issues.push("정확히 3문장이어야 합니다");
  if (text.length < 150 || text.length > 180) issues.push("150~180자로 작성해 주세요");
  const endings = sentences.map(sentence => sentence.match(/(?:보았습니다|모습을 보였습니다|모습이 보였답니다|이어 나갔습니다|이어졌답니다|넓혀 나갔습니다|보았어요|했답니다|수 있었어요|보였어요|나타났어요|완성했어요|즐겨 보았어요|꾸며 보았어요|담아 보았어요)\.$/)?.[0] || "");
  if (endings.filter(Boolean).length !== sentences.length) issues.push("부드러운 부모 공개용 종결 표현을 사용해 주세요");
  if (new Set(endings).size !== endings.length) issues.push("같은 종결 표현을 반복할 수 없습니다");
  const varietyCount = text.match(/다양한|다채로운|여러 가지/g)?.length ?? 0;
  if (varietyCount > 1) issues.push("'다양한·다채로운·여러 가지'는 1회 이하로 사용해 주세요");
  if (/교육적 효과|학습 목표|발달시켰다/.test(text)) issues.push("딱딱한 교육 용어는 사용할 수 없습니다");
  if (/재료의 특성을 탐색하며|상상력과 표현력을 넓혀 나갔습니다|자신만의 .{0,20} 표현했습니다/.test(text)) issues.push("반복적인 AI 문구 대신 실제 놀이 장면을 작성해 주세요");
  if (/(?:해봄|해보았음|볼\s*수\s*있었음|나타남|관찰함|표현함|놀이함|했음|있음|함)(?:[.!?]|$)/.test(text)) issues.push("메모체 종결은 사용할 수 없습니다");
  if (note && copiesMemoStructure(note, text)) issues.push("메모 문장을 이어 쓰지 말고 새로운 문장으로 재서술해 주세요");
  return issues;
};

const panelTitleIssues = (value: string, note = "") => {
  const title = value.trim().replace(/\s+/g, " ");
  const issues: string[] = [];
  if (title.length < 8 || title.length > 16) issues.push("제목은 8~16자로 작성해 주세요");
  if (/색과 선으로 펼친 우리 생각|생각을 담다|즐거운 표현|상상의 세계|창의력을 키워요|생각을 모아 만든 우리 세상/.test(title)) issues.push("재료·계절·놀이 결과가 보이는 제목으로 작성해 주세요");
  if (note && normalizedMemoText(note).startsWith(normalizedMemoText(title))) issues.push("메모를 축약하지 말고 놀이패널 제목으로 새롭게 작성해 주세요");
  return issues;
};

const preserveMemoCore = (note: string, story: string) => {
  const coreTerms = [
    "하늘정원", "옥상정원", "교실", "운동장", "바닥", "천장", "우산", "빗소리", "빗방울", "물웅덩이", "비밀그림",
    "크레파스", "분필", "물감", "습자지", "색종이", "우드락", "연필", "빨대", "블록", "악기", "놀잇감", "판화", "모자이크", "모빌",
    "태양", "구름", "파도", "물고기", "거북이", "여름 과일", "수박", "참외", "매미", "천둥", "소리", "그림책", "책 표지", "합동 그림", "협동 작품",
  ];
  const missing = coreTerms.filter(term => note.includes(term) && !story.includes(term));
  if (!missing.length) return story;
  const joined = missing.slice(0, 7).join(", ");
  return finalizeDescription(`${story.replace(/[.!?]\s*$/, "")} ${joined} 장면을 함께 살펴보며 놀이를 이어가보았어요.`);
};

const makeNewspaperTitle = (note: string, currentTitle: string, isBookPlay: boolean) => {
  const source = `${note} ${currentTitle}`.replace(/\s+/g, " ");
  if (/클레이/.test(source) && /아이스크림/.test(source)) return "달콤한 여름 디저트";
  if (/팥빙수|오레오\s*빙수/.test(source)) return "그림책 속 시원한 팥빙수";
  if (/장마/.test(source) && /물방울/.test(source)) return "장마를 담은 물방울";
  if (/자연물/.test(source) && /디저트|아이스크림|빙수/.test(source)) return "자연물로 꾸민 여름 디저트";
  if (/모자이크/.test(source) && /모빌/.test(source) && /물방울/.test(source)) return "알록달록 모자이크 물방울 모빌";
  if (/모자이크/.test(source) && /모빌/.test(source)) return "알록달록 색종이 모자이크 모빌";
  if (/우드락|판화|찍어내/.test(source) && /소리/.test(source)) return "여름 소리를 찍어낸 우드락 판화";
  if (/소리/.test(source) && /(말로\s*써|써봄|낱말|어휘|글자)/.test(source)) return "여름 소리를 낱말로 담아요";
  if (/(구름|비가\s*되는|쉐이빙폼|색소|수조)/.test(source)) return "쉐이빙폼 구름에서 내리는 색소 비";
  if (/(스프레이건|물총|물놀이)/.test(source) && /페트병/.test(source)) return "페트병으로 만든 우리 물총놀이";
  if (/실험활동|실험|가설|변화|녹아|섞어/.test(source)) return "재료의 변화를 발견하는 실험놀이";
  if (/꽃|나뭇잎|꽃잎/.test(source)) return "꽃과 나뭇잎을 만나요";
  if (/곤충|생태|씨앗|식물|자연탐구/.test(source)) return "자연을 살펴보는 탐구 놀이";
  if (/신체놀이|신체활동|달리|뛰|점프|균형|기어|움직임/.test(source)) return "몸의 움직임으로 펼친 신체놀이";
  if (/블록|놀잇감/.test(source) && /여름소리|여름 소리/.test(source)) return "블록과 놀잇감으로 만든 여름 소리";
  if (/빨대|불어/.test(source) && /물감/.test(source)) return "후후 불어 피어난 물감 그림";
  if (/비|빗방울/.test(source) && /번지|수채/.test(source)) return "번지는 물감으로 그린 비 오는 날";
  if (/사진/.test(source) && /만화|장면/.test(source)) return "사진으로 이어 만든 우리들의 만화";
  if (/물길/.test(source)) return "도구를 이어 만든 시원한 물길";
  if (/얼음/.test(source) && /그림|색|물감/.test(source)) return "사르르 녹으며 그리는 얼음 그림";
  if (/자연물|나뭇잎|꽃잎/.test(source) && /꾸미|만들/.test(source)) return "자연물로 완성한 우리들의 작품";
  if (isBookPlay && /소리|말|의성어|의태어/.test(source) && /만화|사진|장면/.test(source)) return "그림책 속 소리를 만화로 담아요";
  if (isBookPlay && /소리|말|의성어|의태어/.test(source)) return "그림책에서 만난 재미있는 소리";
  if (isBookPlay && /태양|햇빛|햇살/.test(source)) return "그림책에서 만난 여름의 태양";
  if (isBookPlay && /비|빗방울|장마/.test(source)) return "그림책에서 만난 비 오는 날";
  if (isBookPlay) return "그림책에서 시작된 우리들의 이야기";
  if (/분필/.test(source) && /옥상|정원/.test(source)) return "옥상정원에 펼쳐진 우리의 풍경";
  if (/분필/.test(source) && /바닥/.test(source)) return "바닥이 커다란 도화지가 되었어요";
  if (/물감/.test(source) && /빨대|불어/.test(source)) return "바람으로 피어난 물감 그림";
  if (/비|빗방울|수채|번짐/.test(source)) return "물감으로 만난 비 오는 날";
  if (/소리|악기|노래|리듬/.test(source)) return "우리 주변에서 찾은 소리";
  if (/꽃|나뭇잎|나무|숲|자연/.test(source)) return "자연물로 이어진 놀이";
  if (/블록|쌓기|쌓아|구성/.test(source)) return "블록으로 만든 놀이 공간";
  if (/그림|색|미술|꾸미|표현/.test(source)) return "알록달록 꾸미기 놀이";
  if (/물놀이|바다|파도|물고기/.test(source)) return "물과 함께 발견한 여름 이야기";
  const compact = note
    .replace(/^\s*(확장활동\s*[:：]?\s*)?/, "")
    .replace(/(해봄|했음|함|있음|나타남|살펴봄|관찰함|표현함)\s*$/, "")
    .replace(/[.!?。]+.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (compact) {
    const nouns = compact
      .replace(/아이들은?|유아들은?|친구들과?|함께/g, "")
      .replace(/(으로|에서|하며|하고|하여|위해|통해)\s*/g, " ")
      .trim();
    if (nouns.length <= 24) return nouns;
    return `${nouns.slice(0, 22).trim()} 이야기`;
  }
  return "오늘 함께한 놀이 이야기";
};

const withAnd = (word: string) => {
  const last = word.charCodeAt(word.length - 1);
  const hasBatchim = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return `${word}${hasBatchim ? "과" : "와"}`;
};
const withObject = (word: string) => {
  const last = word.charCodeAt(word.length - 1);
  const hasBatchim = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return `${word}${hasBatchim ? "을" : "를"}`;
};
const joinKorean = (items: string[]) => items.length < 2 ? items[0] || "다양한 놀이 요소" : `${items.slice(0, -2).join(", ")}${items.length > 2 ? ", " : ""}${withAnd(items.at(-2)!)} ${items.at(-1)}`;

const makeWeeklyLearning = (allPlays: Play[], theme: string) => {
  const approved = allPlays.filter(play => play.approved);
  const source = approved.map(play => `${play.publishedTitle} ${play.publishedDescription}`).join(" ");
  const elements = [
    [/태양|햇빛|햇살/, "태양"], [/바다|파도|물고기|물놀이/, "바다"], [/비|빗방울|물웅덩이|수채/, "비"],
    [/소리|악기|노래|리듬|천둥|귀뚜라미/, `${theme.includes("여름") ? "여름 " : ""}소리`], [/꽃|나뭇잎|나무|숲|정원/, "자연"],
    [/그림책|이야기|동화/, "이야기"], [/색|선|그림|물감|분필|미술/, "색과 선"], [/블록|쌓기|구성/, "구성과 공간"],
  ].filter(([pattern]) => (pattern as RegExp).test(source)).map(([, label]) => label as string).slice(0, 4);
  const subject = joinKorean([...new Set(elements)]);
  const seasonal = /여름|태양|바다|비|파도/.test(`${theme} ${source}`)
    ? "놀이 속에서 계절의 특징을 자연스럽게 알아보았어요"
    : `${theme}에 담긴 특징을 자연스럽게 발견해보았어요`;
  return `이번 주에 유아들은 ${subject}와 관련된 모습을 여러 재료와 방법으로 탐색하며 ${seasonal}. 다양한 미술 재료와 도구를 활용해 떠오른 생각과 느낌을 자신만의 방법으로 창의적으로 표현하고, 친구들과 함께 풍경과 소리를 만들며 서로의 표현을 감상했어요. 놀이를 함께 완성해가는 과정에서 친구의 생각을 존중하고 즐겁게 소통하며, 필요한 도구를 안전하게 사용하고 관심이 이어지는 방향으로 놀이를 스스로 확장해보는 경험을 했답니다.`;
};

const saveBlobWithPicker = async (blob: Blob, suggestedName: string) => {
  const picker = (window as Window & { showSaveFilePicker?: (options?: unknown) => Promise<{ createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }> }> }).showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker({ suggestedName, types: [{ description: "놀이 패널 파일", accept: { [blob.type || "application/octet-stream"]: [`.${suggestedName.split(".").pop()}`] } }] });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = suggestedName; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const htmlToPlain = (html: string) => {
  if (typeof document === "undefined") return html.replace(/<[^>]*>/g, "");
  const box = document.createElement("div"); box.innerHTML = html;
  return box.textContent || "";
};

const htmlToPptRuns = (html: string, fallback: string) => {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const runs: Array<{ text: string; options: { color: string } }> = [];
  const walk = (node: Node, color: string) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) runs.push({ text: node.textContent, options: { color: color.replace("#", "").toUpperCase() } });
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const nextColor = el.style.color || color;
      el.childNodes.forEach(child => walk(child, nextColor));
      if ((el.tagName === "DIV" || el.tagName === "P") && el.nextSibling) runs.push({ text: "\n", options: { color: nextColor.replace("#", "").toUpperCase() } });
    }
  };
  doc.body.firstElementChild?.childNodes.forEach(node => walk(node, fallback));
  return runs;
};

const containedImageRect = (src: string, x: number, y: number, w: number, h: number) => new Promise<{x:number;y:number;w:number;h:number}>((resolve) => {
  const image = new Image();
  image.onload = () => {
    const scale = Math.min(w / image.naturalWidth, h / image.naturalHeight);
    const fittedW = image.naturalWidth * scale;
    const fittedH = image.naturalHeight * scale;
    resolve({ x: x + (w - fittedW) / 2, y: y + (h - fittedH) / 2, w: fittedW, h: fittedH });
  };
  image.onerror = () => resolve({ x, y, w, h });
  image.src = src;
});

function RichColorEditor({ html, onChange, label }: { html: string; onChange: (html: string, text: string) => void; label: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<Range | null>(null);
  const [color, setColor] = useState("#172332");
  const rememberSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) rangeRef.current = selection.getRangeAt(0).cloneRange();
  };
  const emit = () => { const el = editorRef.current; if (el) onChange(el.innerHTML, el.textContent || ""); };
  const applyColor = (nextColor = color) => {
    const selection = window.getSelection();
    if (rangeRef.current && selection && !rangeRef.current.collapsed) {
      // Extract and wrap the complete saved range. This handles selections that
      // cross existing colored spans (execCommand can color only part of them).
      selection.removeAllRanges();
      selection.addRange(rangeRef.current);
      const selected = rangeRef.current.extractContents();
      const colored = document.createElement("span");
      colored.style.color = nextColor;
      colored.appendChild(selected);
      rangeRef.current.insertNode(colored);
      const applied = document.createRange();
      applied.selectNodeContents(colored);
      selection.removeAllRanges();
      selection.addRange(applied);
      rangeRef.current = applied.cloneRange();
    }
    editorRef.current?.focus(); rememberSelection(); emit();
  };
  return <div className="rich-editor-wrap">
    <div className="rich-label"><b>{label}</b><span>글자를 드래그한 뒤 색상을 적용하세요</span></div>
    <div ref={editorRef} className="rich-editor" contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: html }} onInput={emit} onSelect={rememberSelection} onMouseUp={rememberSelection} onKeyUp={rememberSelection} onPaste={e=>{e.preventDefault();document.execCommand("insertText",false,e.clipboardData.getData("text/plain"));emit()}} />
    <div className="rich-color-tools"><input aria-label={`${label} 선택 색상`} type="color" value={color} onMouseDown={rememberSelection} onChange={e=>{setColor(e.target.value);applyColor(e.target.value)}} /><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>applyColor()}>선택 글자에 색상 적용</button></div>
  </div>;
}

export default function Home() {
  const now = new Date();
  const initial = weekRange(now.getFullYear(), 7, 2);
  const [title, setTitle] = useState("어진반 놀이로 배우다");
  const [titleHtml, setTitleHtml] = useState("어진반 <span style=\"color:#0877bd\">놀이로 배우다</span>");
  const [theme, setTheme] = useState("뜨거운 여름");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(7);
  const [week, setWeek] = useState(2);
  const [start, setStart] = useState(initial[0]);
  const [end, setEnd] = useState(initial[1]);
  const [plays, setPlays] = useState<Play[]>(() => Array.from({ length: 5 }, (_, i) => makePlay(i)));
  const [weeklyLearning, setWeeklyLearning] = useState("");
  const [learningTitleHtml, setLearningTitleHtml] = useState("<span style=\"color:#075f9b\">놀이를 통한</span> <span style=\"color:#0877bd\">배움</span>");
  const [backgroundCss, setBackgroundCss] = useState(monthlyBackgrounds[6].css);
  const [backgroundColor, setBackgroundColor] = useState(`#${monthlyBackgrounds[6].color}`);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundX, setBackgroundX] = useState(50);
  const [backgroundY, setBackgroundY] = useState(50);
  const [logoImage, setLogoImage] = useState<string | null>("/kindergarten-logo.png");
  const panelRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("default");
  const storageKeyRef = useRef("play-panel-maker-state-default");

  // Keep each shared workspace separate on this browser so a refresh does not reset it.
  useEffect(() => {
    const load = async () => {
      const queryWorkspaceId = new URLSearchParams(window.location.search).get("w");
      const loadedWorkspaceId = queryWorkspaceId?.match(/^[A-Za-z0-9_-]{6,80}$/)?.[0] || "default";
      setWorkspaceId(loadedWorkspaceId);
      storageKeyRef.current = `play-panel-maker-state-${loadedWorkspaceId}`;
      const dbKey = `state-${loadedWorkspaceId}`;
      let saved: Record<string, unknown> | null = null;
      try {
        saved = await new Promise<Record<string, unknown> | null>((resolve) => {
          const request = window.indexedDB?.open("play-panel-maker", 1);
          if (!request) return resolve(null);
          request.onupgradeneeded = () => request.result.createObjectStore("state");
          request.onsuccess = () => {
            const tx = request.result.transaction("state", "readonly");
            const get = tx.objectStore("state").get(dbKey);
            get.onsuccess = () => {
              const value = (get.result as Record<string, unknown> | undefined) || null;
              if (value || loadedWorkspaceId === "default") return resolve(value);
              const legacy = tx.objectStore("state").get("latest");
              legacy.onsuccess = () => resolve((legacy.result as Record<string, unknown> | undefined) || null);
              legacy.onerror = () => resolve(null);
            };
            get.onerror = () => resolve(null);
          };
          request.onerror = () => resolve(null);
        });
      } catch { saved = null; }
      if (!saved) {
        try {
          const raw = window.localStorage.getItem(storageKeyRef.current);
          if (raw) saved = JSON.parse(raw) as Record<string, unknown>;
          if (!saved && loadedWorkspaceId !== "default") {
            const legacy = window.localStorage.getItem("play-panel-maker-state");
            if (legacy) saved = JSON.parse(legacy) as Record<string, unknown>;
          }
        } catch { saved = null; }
      }
      if (saved) {
        if (typeof saved.title === "string") setTitle(saved.title);
        if (typeof saved.titleHtml === "string") setTitleHtml(saved.titleHtml);
        if (typeof saved.theme === "string") setTheme(saved.theme);
        if (typeof saved.year === "number") setYear(saved.year);
        if (typeof saved.month === "number") setMonth(saved.month);
        if (typeof saved.week === "number") setWeek(saved.week);
        if (typeof saved.start === "string") setStart(saved.start);
        if (typeof saved.end === "string") setEnd(saved.end);
        if (Array.isArray(saved.plays)) setPlays(saved.plays as Play[]);
        if (typeof saved.weeklyLearning === "string") setWeeklyLearning(saved.weeklyLearning);
        if (typeof saved.learningTitleHtml === "string") setLearningTitleHtml(saved.learningTitleHtml);
        if (typeof saved.backgroundCss === "string") setBackgroundCss(saved.backgroundCss);
        if (typeof saved.backgroundColor === "string") setBackgroundColor(saved.backgroundColor);
        if (typeof saved.backgroundImage === "string" || saved.backgroundImage === null) setBackgroundImage(saved.backgroundImage as string | null);
        if (typeof saved.backgroundX === "number") setBackgroundX(saved.backgroundX);
        if (typeof saved.backgroundY === "number") setBackgroundY(saved.backgroundY);
        if (typeof saved.logoImage === "string" || saved.logoImage === null) setLogoImage(saved.logoImage as string | null);
      }
      setHydrated(true);
    };
    void load();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state = { title, titleHtml, theme, year, month, week, start, end, plays, weeklyLearning, learningTitleHtml, backgroundCss, backgroundColor, backgroundImage, backgroundX, backgroundY, logoImage };
    try { window.localStorage.setItem(storageKeyRef.current, JSON.stringify(state)); } catch { /* IndexedDB below can hold larger image data. */ }
    try {
      const request = window.indexedDB?.open("play-panel-maker", 1);
      if (request) {
        request.onupgradeneeded = () => request.result.createObjectStore("state");
        request.onsuccess = () => {
          const db = request.result;
          db.transaction("state", "readwrite").objectStore("state").put(state, `state-${storageKeyRef.current.replace("play-panel-maker-state-", "")}`);
        };
      }
    } catch { /* Keep the in-memory state if browser storage is unavailable. */ }
  }, [hydrated, workspaceId, title, titleHtml, theme, year, month, week, start, end, plays, weeklyLearning, learningTitleHtml, backgroundCss, backgroundColor, backgroundImage, backgroundX, backgroundY, logoImage]);

  const openCanva = () => {
    window.open("https://www.canva.com/", "_blank", "noopener,noreferrer");
  };
  const photoDragRef = useRef<{ pi: number; si: number; x: number; y: number; startX: number; startY: number; width: number; height: number } | null>(null);
  const orderDragRef = useRef<{ pi: number; si: number } | null>(null);

  const updateRange = (y: number, m: number, w: number) => {
    const [s, e] = weekRange(y, m, w); setStart(s); setEnd(e);
  };
  const updatePlay = (idx: number, patch: Partial<Play>) => {
    if (patch.approved === false) setWeeklyLearning("");
    setPlays(v => v.map((p, i) => i === idx ? { ...p, ...patch } : p));
  };
  const generateFromNote = (idx: number, note: string) => {
    if (!note.trim()) return;
    setPlays(current => current.map((p, i) => {
      if (i !== idx) return p;
      const generatedTitle = makeNewspaperTitle(note, "", p.isBookPlay);
      const memoStory = preserveMemoCore(note, naturalizeNoteBase(note, generatedTitle));
      let generatedDescription = fitDescriptionToPanel(removeTitleLead(toPanelDescription(note, memoStory), generatedTitle));
      // 생성 결과가 메모의 긴 문장을 그대로 포함하면 한 번 더 교사 문체로 재서술한다.
      if (copiesMemoStructure(note, generatedDescription)) {
        const restated = restateCopiedMemo(note);
        if (restated) generatedDescription = fitDescriptionToPanel(restated);
      }
      return { ...p, note, title: generatedTitle, description: generatedDescription, approved: false };
    }));
  };
  const publishDraft = (idx: number, title: string, description: string) => {
    const completedDescription = fitDescriptionToPanel(removeTitleLead(description, title));
    const note = plays[idx]?.note || "";
    if (panelTitleIssues(title, note).length || panelDescriptionIssues(completedDescription, note).length) return;
    const next = plays.map((play, i) => i === idx ? { ...play, title, description: completedDescription, publishedTitle: title, publishedDescription: completedDescription, approved: true } : play);
    setPlays(next);
    if (next.every(play => play.approved)) setWeeklyLearning(makeWeeklyLearning(next, theme));
  };
  const allPlaysApproved = plays.every(play => play.approved);
  const missing = useMemo(() => {
    const items: string[] = [];
    if (!title.trim()) items.push("상단 제목");
    if (!theme.trim()) items.push("놀이 주제");
    if (!start || !end) items.push("놀이 기간");
    plays.forEach((p, i) => {
      if (!p.title.trim()) items.push(`${i + 1}번 놀이 제목`);
      else if (panelTitleIssues(p.title, p.note).length) items.push(`${i + 1}번 놀이 제목 확인`);
      if (!p.description.trim()) items.push(`${i + 1}번 놀이 설명`);
      else {
        const descriptionIssues = panelDescriptionIssues(p.description, p.note);
        if (descriptionIssues.length) items.push(`${i + 1}번 놀이 설명 규칙 확인`);
      }
      if (!p.approved) items.push(`${i + 1}번 AI 문장 승인`);
      if (p.isBookPlay && !p.bookCover) items.push(`${i + 1}번 그림책 표지`);
    });
    if (!plays.some(p => p.isBookPlay)) items.push("그림책 활동 1개 이상");
    if (!weeklyLearning.trim()) items.push("한 주 전체 놀이를 통한 배움");
    return items;
  }, [title, theme, start, end, plays, weeklyLearning]);

  const upload = (e: ChangeEvent<HTMLInputElement>, pi: number, si: number) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    const available = Math.max(0, plays[pi].photoCount - si);
    const selected = files.slice(0, available);
    Promise.all(selected.map(file => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    }))).then(images => setPlays(v => v.map((p, i) => {
      if (i !== pi) return p;
      const photos = [...p.photos];
      images.forEach((src, index) => { photos[si + index] = { src, x: 50, y: 50 }; });
      return { ...p, photos };
    })));
    e.target.value = "";
  };
  const movePhoto = (pi: number, from: number, to: number) => {
    setPlays(current => current.map((p, i) => {
      if (i !== pi || to < 0 || to >= p.photoCount) return p;
      const photos = [...p.photos];
      [photos[from], photos[to]] = [photos[to], photos[from]];
      return { ...p, photos };
    }));
  };
  const startPhotoOrderDrag = (e: DragEvent<HTMLDivElement>, pi: number, si: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${pi}:${si}`);
    orderDragRef.current = { pi, si };
  };
  const dropPhotoOrder = (e: DragEvent<HTMLDivElement>, pi: number, si: number) => {
    e.preventDefault();
    const drag = orderDragRef.current;
    if (drag && drag.pi === pi && drag.si !== si) movePhoto(pi, drag.si, si);
    orderDragRef.current = null;
  };
  const startPhotoDrag = (e: ReactPointerEvent<HTMLImageElement>, pi: number, si: number, ph: Photo) => {
    if (!ph) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    photoDragRef.current = { pi, si, x: ph.x, y: ph.y, startX: e.clientX, startY: e.clientY, width: rect.width, height: rect.height };
  };
  const dragPhoto = (e: ReactPointerEvent<HTMLImageElement>) => {
    const drag = photoDragRef.current;
    if (!drag) return;
    const x = Math.max(0, Math.min(100, drag.x - ((e.clientX - drag.startX) / drag.width) * 100));
    const y = Math.max(0, Math.min(100, drag.y - ((e.clientY - drag.startY) / drag.height) * 100));
    setPlays(current => current.map((p, i) => {
      if (i !== drag.pi || !p.photos[drag.si]) return p;
      const photos = [...p.photos]; photos[drag.si] = { ...photos[drag.si]!, x, y }; return { ...p, photos };
    }));
  };
  const endPhotoDrag = () => { photoDragRef.current = null; };

  const uploadBackground = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBackgroundImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const setBookCoverFile = (file: File, pi: number) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => updatePlay(pi, { bookCover: { src: String(reader.result), x: 50, y: 50 } });
    reader.readAsDataURL(file);
  };
  const uploadBookCover = (e: ChangeEvent<HTMLInputElement>, pi: number) => {
    const file = e.target.files?.[0]; if (file) setBookCoverFile(file, pi);
  };
  const dropBookCover = (e: DragEvent<HTMLLabelElement>, pi: number) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0]; if (file) setBookCoverFile(file, pi);
  };

  const uploadLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const applyMonthBackground = (m: number) => {
    const bg = monthlyBackgrounds[m - 1];
    setBackgroundCss(bg.css); setBackgroundColor(`#${bg.color}`); setBackgroundImage(null);
  };

  const renderPanelDataUrl = async () => {
    const node = panelRef.current; if (!node) return null;
    const clone = node.cloneNode(true) as HTMLElement;
    // Export must use the exact same A4 viewport as the on-screen preview.
    // Letting the clone grow to its content height changes `background-size: cover`
    // and makes uploaded backgrounds appear zoomed/cropped in the saved file.
    clone.style.width = "794px"; clone.style.height = "1123px"; clone.style.minHeight = "1123px"; clone.style.maxHeight = "1123px"; clone.style.margin = "0"; clone.style.transform = "none"; clone.style.overflow = "hidden";
    const originals = [node, ...Array.from(node.querySelectorAll<HTMLElement>("*"))];
    const copies = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("*"))];
    originals.forEach((original, index) => {
      const copy = copies[index]; if (!copy) return;
      const computed = window.getComputedStyle(original);
      for (let i = 0; i < computed.length; i += 1) {
        const property = computed.item(i);
        copy.style.setProperty(property, computed.getPropertyValue(property), computed.getPropertyPriority(property));
      }
    });
    clone.style.height = "1123px"; clone.style.minHeight = "1123px"; clone.style.maxHeight = "1123px"; clone.style.overflow = "hidden";
    const cloneImages = Array.from(clone.querySelectorAll<HTMLImageElement>("img"));
    await Promise.all(cloneImages.map(async image => {
      if (!image.getAttribute("src") || image.getAttribute("src")!.startsWith("data:")) return;
      try {
        const response = await fetch(image.src); const blob = await response.blob();
        image.src = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
      } catch { /* 외부 이미지가 없는 경우에도 나머지 패널은 저장 */ }
    }));
    const measureHost = document.createElement("div");
    measureHost.style.cssText = "position:absolute;left:-10000px;top:0;width:794px;visibility:hidden;pointer-events:none;";
    measureHost.appendChild(clone); document.body.appendChild(measureHost);
    const renderHeight = 1123;
    measureHost.remove();
    const stylesheetText = Array.from(document.styleSheets).flatMap(sheet => {
      try { return Array.from(sheet.cssRules).map(rule => rule.cssText); } catch { return []; }
    }).join("\n");
    const fontData = async (path: string) => {
      try {
        const buffer = await fetch(path).then(response => response.arrayBuffer());
        let binary = ""; const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
        return `data:font/ttf;base64,${btoa(binary)}`;
      } catch { return path; }
    };
    const [cookieRun, freeRegular, freeMedium] = await Promise.all([
      fontData("/fonts/CookieRun-Black.ttf"), fontData("/fonts/Freesentation-Regular.ttf"), fontData("/fonts/Freesentation-Medium.ttf"),
    ]);
    const embeddedFonts = `@font-face{font-family:'CookieRun Black';src:url('${cookieRun}') format('truetype');font-weight:900}@font-face{font-family:'Freesentation';src:url('${freeRegular}') format('truetype');font-weight:400}@font-face{font-family:'Freesentation';src:url('${freeMedium}') format('truetype');font-weight:500}`;
    const xml = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="${renderHeight}"><foreignObject width="794" height="${renderHeight}"><div xmlns="http://www.w3.org/1999/xhtml"><style>${embeddedFonts}${stylesheetText}</style>${xml}</div></foreignObject></svg>`;
    const img = new Image(); img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode();
    const canvas = document.createElement("canvas"); canvas.width = 1588; canvas.height = 2246;
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  const exportPng = async () => {
    const dataUrl = await renderPanelDataUrl(); if (!dataUrl) return;
    const response = await fetch(dataUrl); const blob = await response.blob();
    if (blob) await saveBlobWithPicker(blob, `${theme}-놀이패널.png`);
  };

  const exportPpt = async () => {
    const PptxGenJS = (window as unknown as { PptxGenJS?: PptxConstructor }).PptxGenJS;
    if (!PptxGenJS) { window.alert("PPT 저장 모듈을 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요."); return; }
    const panelDataUrl = await renderPanelDataUrl(); if (!panelDataUrl) return;
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: "A4_PORTRAIT", width: 8.267, height: 11.693 });
    pptx.layout = "A4_PORTRAIT";
    const exactSlide = pptx.addSlide();
    exactSlide.addImage({ data: panelDataUrl, x: 0, y: 0, w: 8.267, h: 11.693 });
    const exactBlob = await (pptx.write as unknown as (options: { outputType: string }) => Promise<Blob>)({ outputType: "blob" });
    await saveBlobWithPicker(exactBlob, `${theme}-놀이패널.pptx`);
    return;
    pptx.author = "어진반";
    pptx.subject = `${theme} 주간 놀이 패널`;
    pptx.title = title;
    pptx.company = "어진반";
    pptx.lang = "ko-KR";
    pptx.theme = { headFontFace: "CookieRun Black", bodyFontFace: "Freesentation", lang: "ko-KR" };
    const slide = pptx.addSlide();
    slide.background = { color: backgroundColor.replace("#", "").toUpperCase() };
    if (backgroundImage) slide.addImage({ data: backgroundImage, x: 0, y: 0, w: 8.267, h: 11.693 });
    slide.addShape(pptx.ShapeType.arc, { x: 6.65, y: .55, w: 2.2, h: 2.2, rotate: 18, fill: { color: "B8E8FA", transparency: 25 }, line: { color: "B8E8FA", transparency: 100 } });
    slide.addShape(pptx.ShapeType.arc, { x: -.6, y: 9.1, w: 2.2, h: 2.2, rotate: 205, fill: { color: "8FD2F0", transparency: 35 }, line: { color: "8FD2F0", transparency: 100 } });
    slide.addShape(pptx.ShapeType.line, { x: .32, y: .12, w: 7.6, h: 0, line: { color: "172332", width: 2.2 } });
    slide.addText(htmlToPptRuns(titleHtml, "#172332"), { x: .32, y: .2, w: 7.6, h: .42, fontFace: "CookieRun Black", fontSize: 26, bold: true, align: "center", margin: 0, breakLine: false });
    slide.addText(theme, { x: .32, y: .65, w: 7.6, h: .35, fontFace: "Freesentation", fontSize: 19, bold: true, align: "center", color: "172332", margin: 0 });
    slide.addText(`놀이기간: ${month}월 ${week}주(${pretty(start)} ~ ${pretty(end)})`, { x: 3.75, y: .95, w: 4.17, h: .27, fontFace: "Freesentation", fontSize: 11, bold: true, align: "right", color: "172332", margin: 0 });
    slide.addShape(pptx.ShapeType.line, { x: .32, y: 1.2, w: 7.6, h: 0, line: { color: "172332", width: .8 } });

    const positions = [
      { x: .32, y: 1.12, w: 3.7, h: 2.7 }, { x: 4.22, y: 1.12, w: 3.7, h: 2.7 },
      { x: .32, y: 4.0, w: 3.7, h: 2.7 }, { x: 4.22, y: 4.0, w: 3.7, h: 2.7 },
      { x: .32, y: 6.88, w: 7.6, h: 2.02 },
    ];
    for (const [i, p] of plays.slice(0, 5).entries()) {
      const box = positions[i];
      const wide = i === 4;
      const photoX = box.x, photoY = box.y;
      const photoW = wide ? 3.42 : box.w;
      const photoH = wide ? 1.45 : 1.15;
      const gap = .025;
      const columns = p.photoCount === 4 ? 2 : p.photoCount === 8 ? 4 : 3;
      const cellW = (photoW - gap * (columns - 1)) / columns;
      const cellH = (photoH - gap) / 2;
      for (const [j, ph] of p.photos.slice(0, p.photoCount).entries()) {
        const x = photoX + (j % columns) * (cellW + gap);
        const y = photoY + Math.floor(j / columns) * (cellH + gap);
        const photoSrc = ph?.src;
        if (typeof photoSrc === "string") {
          const fitted = await containedImageRect(photoSrc as string, x, y, cellW, cellH);
          slide.addImage({ data: photoSrc as string, ...fitted });
        }
        else {
          slide.addShape(pptx.ShapeType.rect, { x, y, w: cellW, h: cellH, fill: { color: "FFFFFF", transparency: 38 }, line: { color: "FFFFFF", transparency: 100 } });
          slide.addText(String(j + 1), { x, y: y + cellH / 2 - .07, w: cellW, h: .14, fontSize: 7, bold: true, align: "center", color: "65A6C3", margin: 0 });
        }
      }
      const textX = wide ? box.x + 3.6 : box.x;
      const textY = wide ? box.y : box.y + 1.24;
      const textW = wide ? 4.0 : box.w;
      const pptTitle = /확장활동/.test(p.note)
        ? [{ text: "확장활동 ", options: { color: "C94F1D", bold: true } }, { text: p.publishedTitle, options: { color: "172332", bold: true } }]
        : p.publishedTitle;
      slide.addText(pptTitle, { x: textX, y: textY, w: textW, h: .26, fontFace: "Freesentation", fontSize: wide ? 12 : 10.5, bold: true, align: "center", color: "172332", margin: 0, breakLine: false });
      const coverW = wide ? .72 : .62;
      const safeCoverSrc = ((p.bookCover as { src?: string } | null)?.src ?? "") as string;
      if (p.isBookPlay && safeCoverSrc.length > 0) {
        const coverRect = await containedImageRect(safeCoverSrc, textX, textY + .31, coverW, wide ? 1.02 : .92);
        slide.addImage({ data: safeCoverSrc, ...coverRect });
      }
      const descX = p.isBookPlay ? textX + coverW + .08 : textX;
      const descW = p.isBookPlay ? textW - coverW - .08 : textW;
      slide.addText(p.publishedDescription, { x: descX, y: textY + .31, w: descW, h: wide ? 1.18 : 1.05, fontFace: "Freesentation", fontSize: wide ? 10 : 9.4, color: "172332", margin: .02, valign: "top", breakLine: false, fit: "shrink" });
    }
    slide.addShape(pptx.ShapeType.line, { x: .32, y: 9.15, w: 7.6, h: 0, line: { color: "0C6BA4", width: 2.3 } });
    slide.addText(htmlToPptRuns(learningTitleHtml, "#075f9b"), { x: .32, y: 9.25, w: 3.4, h: .36, fontFace: "CookieRun Black", fontSize: 17, bold: true, margin: 0 });
    slide.addText(weeklyLearning, { x: .32, y: 9.66, w: 7.6, h: 1.55, fontFace: "Freesentation", fontSize: 10.5, bold: true, color: "172332", margin: 0, valign: "top", breakLine: false, fit: "shrink" });
    if (logoImage) {
      let logoData = logoImage;
      if (!logoData.startsWith("data:")) {
        const blob = await fetch(logoData).then(response => response.blob());
        logoData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob);
        });
      }
      slide.addImage({ data: logoData, x: 5.77, y: 11.28, w: 2.15, h: .36 });
    }
    const blob = await (pptx.write as unknown as (options: { outputType: string }) => Promise<Blob>)({ outputType: "blob" });
    await saveBlobWithPicker(blob, `${theme}-놀이패널.pptx`);
  };

  return <main className="app-shell">
    <aside className="editor no-print">
      <div className="editor-head"><p className="eyebrow">PLAY PANEL MAKER</p><h1>주간 놀이 패널</h1><p>내용을 입력하면 오른쪽 A4 패널에 바로 반영됩니다.</p></div>
      <section className="settings">
        <RichColorEditor label="패널 제목" html={titleHtml} onChange={(html,text)=>{setTitleHtml(html);setTitle(text)}} />
        <label>이번 주 놀이 주제<input value={theme} onChange={e => setTheme(e.target.value)} /></label>
        <div className="date-row">
          <label>연도<select value={year} onChange={e => { const v=+e.target.value; setYear(v); updateRange(v,month,week); }}>{[2025,2026,2027,2028].map(v=><option key={v}>{v}</option>)}</select></label>
          <label>월<select value={month} onChange={e => { const v=+e.target.value; setMonth(v); updateRange(year,v,week); applyMonthBackground(v); }}>{Array.from({length:12},(_,i)=>i+1).map(v=><option key={v}>{v}</option>)}</select></label>
          <label>주차<select value={week} onChange={e => { const v=+e.target.value; setWeek(v); updateRange(year,month,v); }}>{[1,2,3,4,5].map(v=><option key={v}>{v}</option>)}</select></label>
        </div>
        <div className="date-row two"><label>시작일<input type="date" value={start} onChange={e=>setStart(e.target.value)} /></label><label>종료일<input type="date" value={end} onChange={e=>setEnd(e.target.value)} /></label></div>
        <div className="background-editor">
          <div className="section-title"><b>패널 배경</b><span>{month}월 · {monthlyBackgrounds[month-1].name}</span></div>
          <div className="canva-tools">
            <button type="button" className="canva-open-btn" onClick={openCanva}>Canva에서 요소 만들기</button>
            <span>캔바에서 만든 배경·장식 이미지를 저장한 뒤 아래에 추가하세요.</span>
          </div>
          <label className="upload background-upload canva-drop-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const file=e.dataTransfer.files?.[0];if(file?.type.startsWith("image/")){const reader=new FileReader();reader.onload=()=>setBackgroundImage(String(reader.result));reader.readAsDataURL(file)}}}><span>{backgroundImage?"배경 이미지 변경 · 클릭 또는 드래그":"배경 이미지 선택 · 캔바 이미지를 드래그"}</span><input hidden type="file" accept="image/*" onChange={uploadBackground}/></label>
          {backgroundImage&&<div className="background-focus"><label>좌우 초점<input type="range" min="0" max="100" value={backgroundX} onChange={e=>setBackgroundX(+e.target.value)} /></label><label>상하 초점<input type="range" min="0" max="100" value={backgroundY} onChange={e=>setBackgroundY(+e.target.value)} /></label><button className="text-btn" onClick={()=>applyMonthBackground(month)}>기본 배경으로 되돌리기</button></div>}
        </div>
      </section>
      <div className="play-tabs">{plays.map((p,i)=><a key={p.id} href={`#edit-${p.id}`}>{i+1}</a>)}<span>{plays.length}/6개</span></div>
      {plays.map((p, pi) => <section className="play-editor" id={`edit-${p.id}`} key={p.id}>
        <div className="section-title"><b>{pi+1}. 놀이 기록</b>{plays.length>5&&<button className="text-btn" onClick={()=>setPlays(v=>v.filter((_,i)=>i!==pi))}>삭제</button>}</div>
        <label className="book-toggle"><input type="checkbox" checked={p.isBookPlay} onChange={e=>updatePlay(pi,{isBookPlay:e.target.checked})}/><span>이 놀이는 그림책 활동이에요</span></label>
        {p.isBookPlay&&<div className="book-cover-editor"><div className="section-title"><b>그림책 표지 업로드</b><span>사진 6칸과 별도로 저장됩니다</span></div><label className="upload background-upload book-drop-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>dropBookCover(e,pi)}><span>{p.bookCover?"그림책 표지 수정 · 클릭 또는 드래그":"클릭 또는 드래그해서 업로드"}</span><input hidden type="file" accept="image/*" onChange={e=>uploadBookCover(e,pi)}/></label>{p.bookCover&&<><label>좌우 초점<input type="range" min="0" max="100" value={p.bookCover.x} onChange={e=>updatePlay(pi,{bookCover:{...p.bookCover!,x:+e.target.value}})}/></label><label>상하 초점<input type="range" min="0" max="100" value={p.bookCover.y} onChange={e=>updatePlay(pi,{bookCover:{...p.bookCover!,y:+e.target.value}})}/></label></>}</div>}
        <label>놀이 메모 <span className="memo-guide">메모를 적고 <kbd>Enter</kbd>를 누르면 제목과 설명이 만들어집니다 <i>·</i> 줄바꿈은 <kbd>Shift + Enter</kbd></span><textarea value={p.note} onChange={e=>updatePlay(pi,{note:e.target.value,title:"",description:"",publishedTitle:"",publishedDescription:"",approved:false})} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing)e.preventDefault()}} onKeyUp={e=>{if(e.key==="Enter"&&!e.shiftKey)generateFromNote(pi,e.currentTarget.value)}} placeholder="예: 파란 물감과 흰 물감을 섞고 빨대로 불어 비 오는 모습을 표현함"/></label>
        {(p.title || p.description) && <div className="draft-result"><div className="draft-result-head"><b>생성된 놀이신문</b><span>위에서 다듬은 내용이 그대로 신문에 반영됩니다</span></div><label>놀이 제목 <span className="description-guide">8~16자 ({p.title.trim().length}자)</span><input value={p.title} onChange={e=>updatePlay(pi,{title:e.target.value,approved:false})}/></label>{panelTitleIssues(p.title,p.note).length>0&&<p className="description-rule-error">{panelTitleIssues(p.title,p.note).join(" · ")}</p>}<label>놀이 설명 <span className="description-guide">부모 공개용 3문장 · 150~180자 ({p.description.trim().length}자)</span><textarea className={`newspaper-description ${p.isBookPlay?"book-description":""} ${pi===4?"wide-description":""}`} rows={6} value={p.description} onChange={e=>updatePlay(pi,{description:e.target.value,approved:false})} onBlur={e=>updatePlay(pi,{description:fitDescriptionToPanel(e.currentTarget.value),approved:false})}/></label>{panelDescriptionIssues(p.description,p.note).length>0&&<p className="description-rule-error">{panelDescriptionIssues(p.description,p.note).join(" · ")}</p>}<button className={p.approved?"approved":"approve"} disabled={p.approved||panelTitleIssues(p.title,p.note).length>0||panelDescriptionIssues(p.description,p.note).length>0} onClick={()=>publishDraft(pi,p.title,p.description)}>{p.approved?"✓ 반영 완료":"확인"}</button></div>}
        <div className="photo-count-row"><p className="mini-label">Shift로 여러 장을 선택하면 선택한 칸부터 순서대로 채워집니다</p><label>사진 수<select value={p.photoCount} onChange={e=>updatePlay(pi,{photoCount:+e.target.value as 4|6|8})}><option value={4}>4장</option><option value={6}>6장</option><option value={8}>8장</option></select></label></div>
        <div className="photo-controls">{p.photos.slice(0,p.photoCount).map((ph,si)=><div className="photo-control" key={si} draggable onDragStart={e=>startPhotoOrderDrag(e,pi,si)} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move"}} onDrop={e=>dropPhotoOrder(e,pi,si)} onDragEnd={()=>{orderDragRef.current=null}}>
          <label className="upload"><span>{ph?`${si+1}번 사진 변경`:`＋ ${si+1}번 사진`}</span><input hidden multiple type="file" accept="image/*" onChange={e=>upload(e,pi,si)}/></label>
          <span className="photo-drag-hint">드래그해서 순서 변경</span>
          {ph&&<><label>좌우 <input type="range" min="0" max="100" value={ph.x} onChange={e=>{const photos=[...p.photos];photos[si]={...ph,x:+e.target.value};updatePlay(pi,{photos})}}/></label><label>상하 <input type="range" min="0" max="100" value={ph.y} onChange={e=>{const photos=[...p.photos];photos[si]={...ph,y:+e.target.value};updatePlay(pi,{photos})}}/></label></>}
        </div>)}</div>
      </section>)}
      <section className="play-editor weekly-editor"><RichColorEditor label="놀이를 통한 배움 타이틀" html={learningTitleHtml} onChange={(html)=>setLearningTitleHtml(html)} /><label>한 주 전체 배움 내용 <span className="description-guide">{allPlaysApproved?"모든 놀이와 학습 요소를 종합해 5줄로 생성되었습니다 · 직접 수정 가능":"모든 놀이 설명을 확인하면 마지막에 자동 생성됩니다"}</span><textarea rows={5} value={weeklyLearning} disabled={!allPlaysApproved} placeholder="모든 놀이 설명 확인 후 생성" onChange={e=>setWeeklyLearning(e.target.value)} /></label></section>
      <section className="play-editor logo-editor"><div className="section-title"><b>어린이집 로고</b><span>패널 제일 하단에 표시됩니다</span></div><label className="upload background-upload"><span>{logoImage?"로고 이미지 변경":"＋ 로고 이미지 등록"}</span><input hidden type="file" accept="image/*" onChange={uploadLogo}/></label>{logoImage&&<button className="text-btn" onClick={()=>setLogoImage(null)}>로고 삭제</button>}</section>
      {plays.length<6&&<button className="add-play" onClick={()=>setPlays(v=>[...v,makePlay(v.length)])}>＋ 놀이 하나 더 추가</button>}
    </aside>

    <section className="preview-area">
      <div className="toolbar no-print"><div><strong>A4 세로 미리보기</strong><span>{missing.length?` · ${missing.length}개 확인 필요`:" · 출력 준비 완료"}</span></div><div><button type="button" disabled={false} onClick={()=>window.print()}>PDF 저장</button><button type="button" disabled={false} onClick={exportPpt}>PPT 저장</button><button type="button" className="primary" disabled={false} onClick={exportPng}>이미지 저장</button></div></div>
      <article className="panel" ref={panelRef} style={{background:backgroundImage?`${backgroundColor} url(${backgroundImage}) no-repeat`:backgroundCss,backgroundSize:backgroundImage?"contain":"cover",backgroundPosition:`${backgroundX}% ${backgroundY}%`}}>
        <header className="panel-header"><div><h2 dangerouslySetInnerHTML={{__html:titleHtml}}/><h3>{theme}</h3></div><p>놀이기간: {month}월 {week}주({pretty(start)} ~ {pretty(end)})</p></header>
        <div className="panel-grid">{plays.map((p,i)=>{ const visibleTitle = p.publishedTitle || p.title; const visibleDescription = p.publishedDescription || p.description; return <section className={`play-card card-${i} ${p.isBookPlay?"has-book-card":""}`} key={p.id}>
          <div className={`photo-grid photos-${p.photoCount}`}>{p.photos.slice(0,p.photoCount).map((ph,j)=><div className="photo-slot" key={j}>{ph?<img src={ph.src} alt={`${visibleTitle} ${j+1}`} draggable={false} onPointerDown={e=>startPhotoDrag(e,i,j,ph)} onPointerMove={dragPhoto} onPointerUp={endPhotoDrag} onPointerCancel={endPhotoDrag} style={{objectPosition:`${ph.x}% ${ph.y}%`}}/>:<span>{j+1}</span>}</div>)}</div>
          <div className={`play-copy ${p.isBookPlay?"book-copy":""}`}><h4>{/확장활동/.test(p.note)&&<span className="expansion-badge">확장활동</span>}{visibleTitle}</h4>{p.isBookPlay?<div className="book-copy-body"><div className={`book-cover-slot ${p.bookCover?"has-cover":""}`}>{p.bookCover?<img src={p.bookCover.src} alt={`${visibleTitle || "놀이"} 그림책 표지`} style={{objectPosition:`${p.bookCover.x}% ${p.bookCover.y}%`}}/>:<span>그림책<br/>표지</span>}</div><p>{visibleDescription}</p></div>:<p>{visibleDescription}</p>}</div>
        </section>})}</div>
        <footer><b dangerouslySetInnerHTML={{__html:learningTitleHtml}}/><p>{weeklyLearning}</p>{logoImage&&<img className="panel-logo" src={logoImage} alt="어린이집 로고"/>}</footer>
      </article>
    </section>
  </main>;
}
