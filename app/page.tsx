"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

type Photo = { src: string; x: number; y: number } | null;
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
  photoCount: 6 | 8;
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
  const firstMonday = new Date(first);
  const day = first.getDay();
  firstMonday.setDate(1 + ((8 - (day || 7)) % 7) + (week - 1) * 7);
  const end = new Date(firstMonday);
  end.setDate(end.getDate() + 4);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return [iso(firstMonday), iso(end)];
}

const pretty = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const naturalizeNote = (note: string, playTitle: string) => {
  const context = `${note} ${playTitle}`;
  if (/(블록|놀잇감)/.test(context) && /(여름소리|여름 소리)/.test(context)) {
    return "다양한 블록과 놀잇감을 살펴보며 친구와 짝을 지어 여름에 들을 수 있는 소리를 함께 떠올려보았어요. 매미, 파도, 빗소리, 천둥, 물방울 소리 등을 몸짓과 말, 도구로 표현하며 서로의 생각을 나누었답니다. 주변에서 들리는 소리의 특징을 비교하고 자신만의 방법으로 나타내는 즐거움을 느꼈어요.";
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
      .replace(/여름풍경을 바닥에/g, "바닥에 여름 풍경을")
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
      .replace(/만들어봄/g, "만들어보았어요")
      .replace(/그려봄/g, "그려보았어요")
      .replace(/해봄/g, "해보았어요")
      .replace(/관찰함/g, "관찰해보았어요")
      .replace(/표현함/g, "표현해보았어요")
      .replace(/이야기함/g, "이야기를 나누어보았어요")
      .replace(/탐색함/g, "탐색해보았어요")
      .replace(/완성함/g, "완성해보았어요")
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
  return varied.join(" ");
};

const makeNewspaperTitle = (note: string, currentTitle: string, isBookPlay: boolean) => {
  const source = `${note} ${currentTitle}`.replace(/\s+/g, " ");
  if (/모자이크/.test(source) && /모빌/.test(source) && /물방울/.test(source)) return "알록달록 모자이크 물방울 모빌";
  if (/모자이크/.test(source) && /모빌/.test(source)) return "알록달록 색종이 모자이크 모빌";
  if (/우드락|판화|찍어내/.test(source) && /소리/.test(source)) return "여름 소리를 찍어낸 우드락 판화";
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
  if (/꽃|나뭇잎|나무|숲|자연/.test(source)) return "자연에서 발견한 새로운 모습";
  if (/블록|쌓|구성|만들/.test(source)) return "생각을 모아 만든 우리 세상";
  if (/그림|색|미술|꾸미|표현/.test(source)) return "색과 선으로 펼친 우리 생각";
  if (/물놀이|바다|파도|물고기/.test(source)) return "물과 함께 발견한 여름 이야기";
  return "놀이 속에서 발견한 새로운 생각";
};

const withAnd = (word: string) => {
  const last = word.charCodeAt(word.length - 1);
  const hasBatchim = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return `${word}${hasBatchim ? "과" : "와"}`;
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
    ? "계절의 특징을 자연스럽게 알아보았어요"
    : `${theme}에 담긴 특징을 자연스럽게 발견해보았어요`;
  const exploration = `이번 주에 유아들은 ${subject} 등 다양한 놀이 요소를 여러 가지 재료와 방법으로 탐색하며 ${seasonal}.`;
  const expression = "놀이에 필요한 재료와 도구를 안전하게 사용하고 손과 몸의 움직임을 조절하며 자신의 생각과 느낌을 창의적으로 표현했답니다.";
  const together = "친구들과 놀이 방법과 발견한 점을 이야기하고 서로의 표현을 존중하며 함께 놀이를 만들어가는 즐거움을 경험했어요.";
  return `${exploration} ${expression} ${together}`;
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
  const applyColor = () => {
    const selection = window.getSelection();
    if (rangeRef.current && selection) { selection.removeAllRanges(); selection.addRange(rangeRef.current); }
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, color);
    editorRef.current?.focus(); rememberSelection(); emit();
  };
  return <div className="rich-editor-wrap">
    <div className="rich-label"><b>{label}</b><span>글자를 드래그한 뒤 색상을 적용하세요</span></div>
    <div ref={editorRef} className="rich-editor" contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: html }} onInput={emit} onMouseUp={rememberSelection} onKeyUp={rememberSelection} onPaste={e=>{e.preventDefault();document.execCommand("insertText",false,e.clipboardData.getData("text/plain"));emit()}} />
    <div className="rich-color-tools"><input aria-label={`${label} 선택 색상`} type="color" value={color} onChange={e=>setColor(e.target.value)} /><button type="button" onMouseDown={e=>e.preventDefault()} onClick={applyColor}>선택 글자에 색상 적용</button></div>
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
      const generatedDescription = naturalizeNote(note, generatedTitle);
      return { ...p, note, title: generatedTitle, description: generatedDescription, approved: false };
    }));
  };
  const publishDraft = (idx: number, title: string, description: string) => {
    const next = plays.map((play, i) => i === idx ? { ...play, title, description, publishedTitle: title, publishedDescription: description, approved: true } : play);
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
      if (!p.description.trim()) items.push(`${i + 1}번 놀이 설명`);
      else if (p.description.trim().length < 55) items.push(`${i + 1}번 놀이 설명 3줄 이상`);
      if (!p.approved) items.push(`${i + 1}번 AI 문장 승인`);
      if (p.isBookPlay && !p.bookCover) items.push(`${i + 1}번 그림책 표지`);
    });
    if (!plays.some(p => p.isBookPlay)) items.push("그림책 활동 1개 이상");
    if (!weeklyLearning.trim()) items.push("한 주 전체 놀이를 통한 배움");
    return items;
  }, [title, theme, start, end, plays, weeklyLearning]);

  const upload = (e: ChangeEvent<HTMLInputElement>, pi: number, si: number) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPlays(v => v.map((p, i) => i !== pi ? p : { ...p, photos: p.photos.map((ph, j) => j === si ? { src: String(reader.result), x: 50, y: 50 } : ph) }));
    reader.readAsDataURL(file);
  };

  const uploadBackground = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBackgroundImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const uploadBookCover = (e: ChangeEvent<HTMLInputElement>, pi: number) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updatePlay(pi, { bookCover: { src: String(reader.result), x: 50, y: 50 } });
    reader.readAsDataURL(file);
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

  const exportPng = async () => {
    const node = panelRef.current; if (!node) return;
    const clone = node.cloneNode(true) as HTMLElement;
    clone.style.width = "794px"; clone.style.height = "1123px";
    const xml = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123"><foreignObject width="100%" height="100%">${xml}</foreignObject></svg>`;
    const img = new Image(); img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode(); const canvas = document.createElement("canvas"); canvas.width = 1588; canvas.height = 2246;
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const a = document.createElement("a"); a.download = `${theme}-놀이패널.png`; a.href = canvas.toDataURL("image/png"); a.click();
  };

  const exportPpt = async () => {
    const { default: PptxGenJS } = await import("pptxgenjs");
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: "A4_PORTRAIT", width: 8.267, height: 11.693 });
    pptx.layout = "A4_PORTRAIT";
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
    slide.addText(theme, { x: .32, y: .67, w: 7.6, h: .31, fontFace: "Freesentation", fontSize: 17, bold: true, align: "center", color: "172332", margin: 0 });
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
      const columns = p.photoCount === 8 ? 4 : 3;
      const cellW = (photoW - gap * (columns - 1)) / columns;
      const cellH = (photoH - gap) / 2;
      p.photos.slice(0, p.photoCount).forEach((ph, j) => {
        const x = photoX + (j % columns) * (cellW + gap);
        const y = photoY + Math.floor(j / columns) * (cellH + gap);
        if (ph) slide.addImage({ data: ph.src, x, y, w: cellW, h: cellH });
        else {
          slide.addShape(pptx.ShapeType.rect, { x, y, w: cellW, h: cellH, fill: { color: "FFFFFF", transparency: 38 }, line: { color: "FFFFFF", transparency: 100 } });
          slide.addText(String(j + 1), { x, y: y + cellH / 2 - .07, w: cellW, h: .14, fontSize: 7, bold: true, align: "center", color: "65A6C3", margin: 0 });
        }
      });
      const textX = wide ? box.x + 3.6 : box.x;
      const textY = wide ? box.y : box.y + 1.24;
      const textW = wide ? 4.0 : box.w;
      slide.addText(p.publishedTitle, { x: textX, y: textY, w: textW, h: .26, fontFace: "Freesentation", fontSize: wide ? 12 : 10.5, bold: true, align: "center", color: "172332", margin: 0, breakLine: false });
      const coverW = wide ? .72 : .62;
      if (p.isBookPlay && p.bookCover) {
        const coverRect = await containedImageRect(p.bookCover.src, textX, textY + .31, coverW, wide ? 1.02 : .92);
        slide.addImage({ data: p.bookCover.src, ...coverRect });
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
    await pptx.writeFile({ fileName: `${theme}-놀이패널.pptx` });
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
          <div className="background-row"><label>배경색<input type="color" value={backgroundColor} onChange={e=>{setBackgroundColor(e.target.value);setBackgroundCss(e.target.value);setBackgroundImage(null)}} /></label><label className="upload background-upload"><span>＋ 배경 이미지 선택</span><input hidden type="file" accept="image/*" onChange={uploadBackground}/></label></div>
          {backgroundImage&&<div className="background-focus"><label>좌우 초점<input type="range" min="0" max="100" value={backgroundX} onChange={e=>setBackgroundX(+e.target.value)} /></label><label>상하 초점<input type="range" min="0" max="100" value={backgroundY} onChange={e=>setBackgroundY(+e.target.value)} /></label><button className="text-btn" onClick={()=>applyMonthBackground(month)}>기본 배경으로 되돌리기</button></div>}
        </div>
      </section>
      <div className="play-tabs">{plays.map((p,i)=><a key={p.id} href={`#edit-${p.id}`}>{i+1}</a>)}<span>{plays.length}/6개</span></div>
      {plays.map((p, pi) => <section className="play-editor" id={`edit-${p.id}`} key={p.id}>
        <div className="section-title"><b>{pi+1}. 놀이 기록</b>{plays.length>5&&<button className="text-btn" onClick={()=>setPlays(v=>v.filter((_,i)=>i!==pi))}>삭제</button>}</div>
        <label className="book-toggle"><input type="checkbox" checked={p.isBookPlay} onChange={e=>updatePlay(pi,{isBookPlay:e.target.checked})}/><span>이 놀이는 그림책 활동이에요</span></label>
        {p.isBookPlay&&<div className="book-cover-editor"><div className="section-title"><b>그림책 표지</b><span>사진 6칸과 별도로 저장됩니다</span></div><label className="upload background-upload"><span>{p.bookCover?"표지 이미지 변경":"＋ 표지 이미지 등록"}</span><input hidden type="file" accept="image/*" onChange={e=>uploadBookCover(e,pi)}/></label>{p.bookCover&&<><label>좌우 초점<input type="range" min="0" max="100" value={p.bookCover.x} onChange={e=>updatePlay(pi,{bookCover:{...p.bookCover!,x:+e.target.value}})}/></label><label>상하 초점<input type="range" min="0" max="100" value={p.bookCover.y} onChange={e=>updatePlay(pi,{bookCover:{...p.bookCover!,y:+e.target.value}})}/></label></>}</div>}
        <label>놀이 메모 <span className="memo-guide">메모를 적고 <kbd>Enter</kbd>를 누르면 제목과 설명이 만들어집니다 <i>·</i> 줄바꿈은 <kbd>Shift + Enter</kbd></span><textarea value={p.note} onChange={e=>updatePlay(pi,{note:e.target.value,title:"",description:"",publishedTitle:"",publishedDescription:"",approved:false})} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing)e.preventDefault()}} onKeyUp={e=>{if(e.key==="Enter"&&!e.shiftKey)generateFromNote(pi,e.currentTarget.value)}} placeholder="예: 파란 물감과 흰 물감을 섞고 빨대로 불어 비 오는 모습을 표현함"/></label>
        {(p.title || p.description) && <div className="draft-result"><div className="draft-result-head"><b>생성된 놀이신문</b><span>위에서 다듬은 내용이 그대로 신문에 반영됩니다</span></div><label>놀이 제목<input value={p.title} onChange={e=>updatePlay(pi,{title:e.target.value,approved:false})}/></label><label>놀이 설명 <span className="description-guide">실제 놀이신문과 같은 글꼴·크기·줄 간격 ({p.description.trim().length}자)</span><textarea className={`newspaper-description ${p.isBookPlay?"book-description":""} ${pi===4?"wide-description":""}`} rows={5} value={p.description} onChange={e=>updatePlay(pi,{description:e.target.value,approved:false})}/></label><button className={p.approved?"approved":"approve"} disabled={p.approved} onClick={()=>publishDraft(pi,p.title,p.description)}>{p.approved?"✓ 반영 완료":"확인"}</button></div>}
        <div className="photo-count-row"><p className="mini-label">사진 데이터는 항상 8칸 · 사용하지 않는 칸은 null 저장</p><label>사진 수<select value={p.photoCount} onChange={e=>updatePlay(pi,{photoCount:+e.target.value as 6|8})}><option value={6}>6장</option><option value={8}>8장</option></select></label></div>
        <div className="photo-controls">{p.photos.slice(0,p.photoCount).map((ph,si)=><div className="photo-control" key={si}>
          <label className="upload"><span>{ph?`${si+1}번 사진 변경`:`＋ ${si+1}번 사진`}</span><input hidden type="file" accept="image/*" onChange={e=>upload(e,pi,si)}/></label>
          {ph&&<><label>좌우 <input type="range" min="0" max="100" value={ph.x} onChange={e=>{const photos=[...p.photos];photos[si]={...ph,x:+e.target.value};updatePlay(pi,{photos})}}/></label><label>상하 <input type="range" min="0" max="100" value={ph.y} onChange={e=>{const photos=[...p.photos];photos[si]={...ph,y:+e.target.value};updatePlay(pi,{photos})}}/></label></>}
        </div>)}</div>
      </section>)}
      <section className="play-editor weekly-editor"><RichColorEditor label="놀이를 통한 배움 타이틀" html={learningTitleHtml} onChange={(html)=>setLearningTitleHtml(html)} /><label>한 주 전체 배움 내용 <span className="description-guide">{allPlaysApproved?"모든 놀이를 종합해 생성되었습니다 · 직접 수정 가능 · 최대 5줄":"모든 놀이 설명을 확인하면 마지막에 자동 생성됩니다"}</span><textarea rows={5} value={weeklyLearning} disabled={!allPlaysApproved} placeholder="모든 놀이 설명 확인 후 생성" onChange={e=>setWeeklyLearning(e.target.value)} /></label></section>
      <section className="play-editor logo-editor"><div className="section-title"><b>어린이집 로고</b><span>패널 제일 하단에 표시됩니다</span></div><label className="upload background-upload"><span>{logoImage?"로고 이미지 변경":"＋ 로고 이미지 등록"}</span><input hidden type="file" accept="image/*" onChange={uploadLogo}/></label>{logoImage&&<button className="text-btn" onClick={()=>setLogoImage(null)}>로고 삭제</button>}</section>
      {plays.length<6&&<button className="add-play" onClick={()=>setPlays(v=>[...v,makePlay(v.length)])}>＋ 놀이 하나 더 추가</button>}
    </aside>

    <section className="preview-area">
      <div className="toolbar no-print"><div><strong>A4 세로 미리보기</strong><span>{missing.length?` · ${missing.length}개 확인 필요`:" · 출력 준비 완료"}</span></div><div><button disabled={!!missing.length} onClick={()=>window.print()}>PDF 저장</button><button disabled={!!missing.length} onClick={exportPpt}>PPT 저장</button><button className="primary" disabled={!!missing.length} onClick={exportPng}>이미지 저장</button></div></div>
      <article className="panel" ref={panelRef} style={{background:backgroundImage?`url(${backgroundImage})`:backgroundCss,backgroundSize:"cover",backgroundPosition:`${backgroundX}% ${backgroundY}%`}}>
        <header className="panel-header"><div><h2 dangerouslySetInnerHTML={{__html:titleHtml}}/><h3>{theme}</h3></div><p>놀이기간: {month}월 {week}주({pretty(start)} ~ {pretty(end)})</p></header>
        <div className="panel-grid">{plays.map((p,i)=><section className={`play-card card-${i} ${p.isBookPlay?"has-book-card":""}`} key={p.id}>
          <div className={`photo-grid photos-${p.photoCount}`}>{p.photos.slice(0,p.photoCount).map((ph,j)=><div className="photo-slot" key={j}>{ph?<img src={ph.src} alt={`${p.approved?p.publishedTitle:p.title} ${j+1}`} style={{objectPosition:`${ph.x}% ${ph.y}%`}}/>:<span>{j+1}</span>}</div>)}</div>
          <div className={`play-copy ${p.isBookPlay?"book-copy":""}`}><h4>{p.publishedTitle}</h4>{p.isBookPlay?<div className="book-copy-body"><div className="book-cover-slot">{p.bookCover?<img src={p.bookCover.src} alt={`${p.publishedTitle || "놀이"} 그림책 표지`} style={{objectPosition:`${p.bookCover.x}% ${p.bookCover.y}%`}}/>:<span>그림책<br/>표지</span>}</div><p>{p.publishedDescription}</p></div>:<p>{p.publishedDescription}</p>}</div>
        </section>)}</div>
        <footer><b dangerouslySetInnerHTML={{__html:learningTitleHtml}}/><p>{weeklyLearning}</p>{logoImage&&<img className="panel-logo" src={logoImage} alt="어린이집 로고"/>}</footer>
      </article>
    </section>
  </main>;
}
