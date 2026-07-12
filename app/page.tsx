"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

type Photo = { src: string; x: number; y: number } | null;
type Play = {
  id: number;
  title: string;
  description: string;
  learning: string;
  note: string;
  approved: boolean;
  photos: Photo[];
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
  title: samples[i]?.[0] || "새로운 여름 놀이",
  description: samples[i]?.[1] || "놀이 모습을 기록해 주세요.",
  learning: samples[i]?.[2] || "놀이를 통해 발견한 배움을 기록해 주세요.",
  note: "",
  approved: true,
  photos: Array(6).fill(null),
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

export default function Home() {
  const now = new Date();
  const initial = weekRange(now.getFullYear(), 7, 2);
  const [title, setTitle] = useState("어진반 놀이로 배우다");
  const [theme, setTheme] = useState("뜨거운 여름");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(7);
  const [week, setWeek] = useState(2);
  const [start, setStart] = useState(initial[0]);
  const [end, setEnd] = useState(initial[1]);
  const [plays, setPlays] = useState<Play[]>(() => Array.from({ length: 5 }, (_, i) => makePlay(i)));
  const [weeklyLearning, setWeeklyLearning] = useState("여름의 태양과 바다, 비와 다양한 여름 소리를 여러 재료와 방법으로 탐색하며 계절의 특징을 자연스럽게 알아보았습니다. 자신의 생각과 느낌을 창의적으로 표현하고, 친구들과 함께 여름 풍경과 소리를 만들며 서로의 표현을 감상하고 소통하는 경험을 했습니다.");
  const [backgroundCss, setBackgroundCss] = useState(monthlyBackgrounds[6].css);
  const [backgroundColor, setBackgroundColor] = useState(`#${monthlyBackgrounds[6].color}`);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundX, setBackgroundX] = useState(50);
  const [backgroundY, setBackgroundY] = useState(50);
  const panelRef = useRef<HTMLDivElement>(null);

  const updateRange = (y: number, m: number, w: number) => {
    const [s, e] = weekRange(y, m, w); setStart(s); setEnd(e);
  };
  const updatePlay = (idx: number, patch: Partial<Play>) => setPlays(v => v.map((p, i) => i === idx ? { ...p, ...patch } : p));
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
    });
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

  const applyMonthBackground = (m: number) => {
    const bg = monthlyBackgrounds[m - 1];
    setBackgroundCss(bg.css); setBackgroundColor(`#${bg.color}`); setBackgroundImage(null);
  };

  const generate = (idx: number) => {
    const p = plays[idx]; const note = p.note.trim() || "아이들이 여름 재료를 탐색하고 친구와 함께 놀이함";
    updatePlay(idx, {
      description: `${note}. 아이들은 놀이에 필요한 재료와 방법을 스스로 선택하고 탐색했습니다. 놀이 과정에서 자신의 생각과 느낌을 자유롭게 표현했으며, 친구의 이야기를 귀 기울여 듣고 서로의 경험을 즐겁게 나누었습니다.`,
      approved: false,
    });
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
    slide.addText(title, { x: .32, y: .22, w: 4.8, h: .35, fontFace: "CookieRun Black", fontSize: 22, bold: true, color: "172332", margin: 0, breakLine: false });
    slide.addText(theme, { x: .32, y: .64, w: 3.1, h: .28, fontFace: "Arial", fontSize: 15, bold: true, color: "0877BD", margin: 0 });
    slide.addText(`놀이기간: ${month}월 ${week}주(${pretty(start)} ~ ${pretty(end)})`, { x: 4.55, y: .48, w: 3.35, h: .27, fontFace: "Arial", fontSize: 9.5, bold: true, align: "right", color: "172332", margin: 0 });

    const positions = [
      { x: .32, y: 1.12, w: 3.7, h: 2.7 }, { x: 4.22, y: 1.12, w: 3.7, h: 2.7 },
      { x: .32, y: 4.0, w: 3.7, h: 2.7 }, { x: 4.22, y: 4.0, w: 3.7, h: 2.7 },
      { x: .32, y: 6.88, w: 7.6, h: 2.02 },
    ];
    plays.slice(0, 5).forEach((p, i) => {
      const box = positions[i];
      const wide = i === 4;
      const photoX = box.x, photoY = box.y;
      const photoW = wide ? 3.42 : box.w;
      const photoH = wide ? 1.45 : 1.15;
      const gap = .025;
      const cellW = (photoW - gap * 2) / 3;
      const cellH = (photoH - gap) / 2;
      p.photos.forEach((ph, j) => {
        const x = photoX + (j % 3) * (cellW + gap);
        const y = photoY + Math.floor(j / 3) * (cellH + gap);
        if (ph) slide.addImage({ data: ph.src, x, y, w: cellW, h: cellH });
        else {
          slide.addShape(pptx.ShapeType.rect, { x, y, w: cellW, h: cellH, fill: { color: "FFFFFF", transparency: 38 }, line: { color: "FFFFFF", transparency: 100 } });
          slide.addText(String(j + 1), { x, y: y + cellH / 2 - .07, w: cellW, h: .14, fontSize: 7, bold: true, align: "center", color: "65A6C3", margin: 0 });
        }
      });
      const textX = wide ? box.x + 3.6 : box.x;
      const textY = wide ? box.y : box.y + 1.24;
      const textW = wide ? 4.0 : box.w;
      slide.addText(p.title, { x: textX, y: textY, w: textW, h: .26, fontFace: "Freesentation", fontSize: wide ? 12 : 10.5, bold: true, align: "center", color: "172332", margin: 0, breakLine: false });
      slide.addText(p.description, { x: textX, y: textY + .31, w: textW, h: wide ? 1.18 : 1.05, fontFace: "Freesentation", fontSize: wide ? 8 : 7.4, color: "172332", margin: .02, valign: "top", breakLine: false, fit: "shrink" });
    });
    slide.addShape(pptx.ShapeType.line, { x: .32, y: 9.15, w: 7.6, h: 0, line: { color: "0C6BA4", width: 2.3 } });
    slide.addText("놀이를 통한 배움", { x: .32, y: 9.25, w: 3.4, h: .36, fontFace: "CookieRun Black", fontSize: 17, bold: true, color: "075F9B", margin: 0 });
    slide.addText(weeklyLearning, { x: .32, y: 9.66, w: 7.6, h: 1.55, fontFace: "Freesentation", fontSize: 8.5, bold: true, color: "172332", margin: 0, valign: "top", breakLine: false, fit: "shrink" });
    await pptx.writeFile({ fileName: `${theme}-놀이패널.pptx` });
  };

  return <main className="app-shell">
    <aside className="editor no-print">
      <div className="editor-head"><p className="eyebrow">PLAY PANEL MAKER</p><h1>주간 놀이 패널</h1><p>내용을 입력하면 오른쪽 A4 패널에 바로 반영됩니다.</p></div>
      <section className="settings">
        <label>패널 제목<input value={title} onChange={e => setTitle(e.target.value)} /></label>
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
        <div className="section-title"><b>{pi+1}. {p.title || "제목 없음"}</b>{plays.length>5&&<button className="text-btn" onClick={()=>setPlays(v=>v.filter((_,i)=>i!==pi))}>삭제</button>}</div>
        <label>놀이 제목<input value={p.title} onChange={e=>updatePlay(pi,{title:e.target.value})}/></label>
        <label>교사 관찰 메모<textarea value={p.note} onChange={e=>updatePlay(pi,{note:e.target.value})} placeholder="아이들의 말, 행동, 놀이 흐름을 적어주세요."/></label>
        <button className="ai-button" onClick={()=>generate(pi)}>✦ AI 문장 만들기</button>
        <label>놀이에 대한 설명 <span className="description-guide">3줄 이상 · 최대 6줄 권장 ({p.description.trim().length}자)</span><textarea rows={6} value={p.description} onChange={e=>updatePlay(pi,{description:e.target.value,approved:false})}/></label>
        <button className={p.approved?"approved":"approve"} onClick={()=>updatePlay(pi,{approved:!p.approved})}>{p.approved?"✓ 승인 완료":"문장 확인 후 승인"}</button>
        <p className="mini-label">사진 6칸 · 빈칸은 자동으로 null 저장</p>
        <div className="photo-controls">{p.photos.map((ph,si)=><div className="photo-control" key={si}>
          <label className="upload"><span>{ph?`${si+1}번 사진 변경`:`＋ ${si+1}번 사진`}</span><input hidden type="file" accept="image/*" onChange={e=>upload(e,pi,si)}/></label>
          {ph&&<><label>좌우 <input type="range" min="0" max="100" value={ph.x} onChange={e=>{const photos=[...p.photos];photos[si]={...ph,x:+e.target.value};updatePlay(pi,{photos})}}/></label><label>상하 <input type="range" min="0" max="100" value={ph.y} onChange={e=>{const photos=[...p.photos];photos[si]={...ph,y:+e.target.value};updatePlay(pi,{photos})}}/></label></>}
        </div>)}</div>
      </section>)}
      <section className="play-editor weekly-editor"><div className="section-title"><b>한 주 전체 놀이를 통한 배움</b></div><label>패널 최하단에 한 번만 표시됩니다<textarea value={weeklyLearning} onChange={e=>setWeeklyLearning(e.target.value)} /></label></section>
      {plays.length<6&&<button className="add-play" onClick={()=>setPlays(v=>[...v,makePlay(v.length)])}>＋ 놀이 하나 더 추가</button>}
    </aside>

    <section className="preview-area">
      <div className="toolbar no-print"><div><strong>A4 세로 미리보기</strong><span>{missing.length?` · ${missing.length}개 확인 필요`:" · 출력 준비 완료"}</span></div><div><button disabled={!!missing.length} onClick={()=>window.print()}>PDF 출력</button><button disabled={!!missing.length} onClick={exportPpt}>PPT 다운로드</button><button className="primary" disabled={!!missing.length} onClick={exportPng}>이미지 저장</button></div></div>
      {!!missing.length&&<div className="missing no-print"><b>출력 전 확인:</b> {missing.slice(0,4).join(", ")}{missing.length>4&&` 외 ${missing.length-4}개`}</div>}
      <article className="panel" ref={panelRef} style={{background:backgroundImage?`url(${backgroundImage})`:backgroundCss,backgroundSize:"cover",backgroundPosition:`${backgroundX}% ${backgroundY}%`}}>
        <header className="panel-header"><div><h2>{title}</h2><h3>{theme}</h3></div><p>놀이기간: {month}월 {week}주({pretty(start)} ~ {pretty(end)})</p></header>
        <div className="panel-grid">{plays.map((p,i)=><section className={`play-card card-${i}`} key={p.id}>
          <div className="photo-grid">{p.photos.map((ph,j)=><div className="photo-slot" key={j}>{ph?<img src={ph.src} alt={`${p.title} ${j+1}`} style={{objectPosition:`${ph.x}% ${ph.y}%`}}/>:<span>{j+1}</span>}</div>)}</div>
          <div className="play-copy"><h4>{p.title}</h4><p>{p.description}</p></div>
        </section>)}</div>
        <footer><b>놀이를 통한 배움</b><p>{weeklyLearning}</p></footer>
      </article>
    </section>
  </main>;
}
