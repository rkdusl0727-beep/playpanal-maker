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
  ["바닥에 표현해 본 여름", "물결과 햇살을 다양한 재료로 표현하며 친구들과 여름 풍경을 만들었어요.", "계절의 특징을 탐색하고, 생각과 느낌을 미술 재료로 자유롭게 표현했습니다."],
  ["그림책 독후활동 · 여름의 태양", "그림책을 읽고 기억에 남은 여름의 모습을 색과 모양으로 다시 구성했어요.", "이야기를 주의 깊게 듣고 자신의 경험과 연결해 창의적으로 표현했습니다."],
  ["교실에서 찾은 여름소리", "교실의 물건과 도구를 활용해 빗소리, 파도 소리 등 여름의 소리를 찾아보았어요.", "주변의 소리에 관심을 갖고 여러 사물의 소리를 비교하고 탐색했습니다."],
  ["여름소리 찍어요 · 만화", "여름 소리를 몸짓과 표정으로 나타내고 사진을 이어 재미있는 만화를 만들었어요.", "소리를 시각적으로 표현하고 친구의 생각을 존중하며 이야기를 함께 구성했습니다."],
  ["비 오는 날의 수채화", "비 오는 날 창밖의 모습을 관찰하고 번지는 물감으로 빗방울을 표현했어요.", "날씨 변화를 관찰하고 물감의 번짐을 실험하며 아름다움을 느꼈습니다."],
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
      if (!p.learning.trim()) items.push(`${i + 1}번 놀이 배움`);
      if (!p.approved) items.push(`${i + 1}번 AI 문장 승인`);
    });
    return items;
  }, [title, theme, start, end, plays]);

  const upload = (e: ChangeEvent<HTMLInputElement>, pi: number, si: number) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPlays(v => v.map((p, i) => i !== pi ? p : { ...p, photos: p.photos.map((ph, j) => j === si ? { src: String(reader.result), x: 50, y: 50 } : ph) }));
    reader.readAsDataURL(file);
  };

  const generate = (idx: number) => {
    const p = plays[idx]; const note = p.note.trim() || "아이들이 여름 재료를 탐색하고 친구와 함께 놀이함";
    updatePlay(idx, {
      description: `${note}. 아이들은 놀이 과정에서 자신의 생각을 자유롭게 표현하고 친구들과 즐겁게 경험을 나누었습니다.`,
      learning: "주변 환경을 탐색하며 궁금한 점을 스스로 발견하고, 다양한 방법으로 표현하는 과정에서 창의성과 협력하는 태도를 키웠습니다.",
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

  return <main className="app-shell">
    <aside className="editor no-print">
      <div className="editor-head"><p className="eyebrow">PLAY PANEL MAKER</p><h1>주간 놀이 패널</h1><p>내용을 입력하면 오른쪽 A4 패널에 바로 반영됩니다.</p></div>
      <section className="settings">
        <label>패널 제목<input value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label>이번 주 놀이 주제<input value={theme} onChange={e => setTheme(e.target.value)} /></label>
        <div className="date-row">
          <label>연도<select value={year} onChange={e => { const v=+e.target.value; setYear(v); updateRange(v,month,week); }}>{[2025,2026,2027,2028].map(v=><option key={v}>{v}</option>)}</select></label>
          <label>월<select value={month} onChange={e => { const v=+e.target.value; setMonth(v); updateRange(year,v,week); }}>{Array.from({length:12},(_,i)=>i+1).map(v=><option key={v}>{v}</option>)}</select></label>
          <label>주차<select value={week} onChange={e => { const v=+e.target.value; setWeek(v); updateRange(year,month,v); }}>{[1,2,3,4,5].map(v=><option key={v}>{v}</option>)}</select></label>
        </div>
        <div className="date-row two"><label>시작일<input type="date" value={start} onChange={e=>setStart(e.target.value)} /></label><label>종료일<input type="date" value={end} onChange={e=>setEnd(e.target.value)} /></label></div>
      </section>
      <div className="play-tabs">{plays.map((p,i)=><a key={p.id} href={`#edit-${p.id}`}>{i+1}</a>)}<span>{plays.length}/6개</span></div>
      {plays.map((p, pi) => <section className="play-editor" id={`edit-${p.id}`} key={p.id}>
        <div className="section-title"><b>{pi+1}. {p.title || "제목 없음"}</b>{plays.length>5&&<button className="text-btn" onClick={()=>setPlays(v=>v.filter((_,i)=>i!==pi))}>삭제</button>}</div>
        <label>놀이 제목<input value={p.title} onChange={e=>updatePlay(pi,{title:e.target.value})}/></label>
        <label>교사 관찰 메모<textarea value={p.note} onChange={e=>updatePlay(pi,{note:e.target.value})} placeholder="아이들의 말, 행동, 놀이 흐름을 적어주세요."/></label>
        <button className="ai-button" onClick={()=>generate(pi)}>✦ AI 문장 만들기</button>
        <label>놀이에 대한 설명<textarea value={p.description} onChange={e=>updatePlay(pi,{description:e.target.value,approved:false})}/></label>
        <label>놀이를 통한 배움<textarea value={p.learning} onChange={e=>updatePlay(pi,{learning:e.target.value,approved:false})}/></label>
        <button className={p.approved?"approved":"approve"} onClick={()=>updatePlay(pi,{approved:!p.approved})}>{p.approved?"✓ 승인 완료":"문장 확인 후 승인"}</button>
        <p className="mini-label">사진 6칸 · 빈칸은 자동으로 null 저장</p>
        <div className="photo-controls">{p.photos.map((ph,si)=><div className="photo-control" key={si}>
          <label className="upload"><span>{ph?`${si+1}번 사진 변경`:`＋ ${si+1}번 사진`}</span><input hidden type="file" accept="image/*" onChange={e=>upload(e,pi,si)}/></label>
          {ph&&<><label>좌우 <input type="range" min="0" max="100" value={ph.x} onChange={e=>{const photos=[...p.photos];photos[si]={...ph,x:+e.target.value};updatePlay(pi,{photos})}}/></label><label>상하 <input type="range" min="0" max="100" value={ph.y} onChange={e=>{const photos=[...p.photos];photos[si]={...ph,y:+e.target.value};updatePlay(pi,{photos})}}/></label></>}
        </div>)}</div>
      </section>)}
      {plays.length<6&&<button className="add-play" onClick={()=>setPlays(v=>[...v,makePlay(v.length)])}>＋ 놀이 하나 더 추가</button>}
    </aside>

    <section className="preview-area">
      <div className="toolbar no-print"><div><strong>A4 세로 미리보기</strong><span>{missing.length?` · ${missing.length}개 확인 필요`:" · 출력 준비 완료"}</span></div><div><button disabled={!!missing.length} onClick={()=>window.print()}>PDF 출력</button><button className="primary" disabled={!!missing.length} onClick={exportPng}>이미지 저장</button></div></div>
      {!!missing.length&&<div className="missing no-print"><b>출력 전 확인:</b> {missing.slice(0,4).join(", ")}{missing.length>4&&` 외 ${missing.length-4}개`}</div>}
      <article className="panel" ref={panelRef}>
        <header className="panel-header"><div><h2>{title}</h2><h3>{theme}</h3></div><p>놀이기간: {month}월 {week}주({pretty(start)} ~ {pretty(end)})</p></header>
        <div className="panel-grid">{plays.map((p,i)=><section className={`play-card card-${i}`} key={p.id}>
          <div className="photo-grid">{p.photos.map((ph,j)=><div className="photo-slot" key={j}>{ph?<img src={ph.src} alt={`${p.title} ${j+1}`} style={{objectPosition:`${ph.x}% ${ph.y}%`}}/>:<span>{j+1}</span>}</div>)}</div>
          <div className="play-copy"><h4>{p.title}</h4><p>{p.description}</p><div className="learning"><b>놀이를 통한 배움</b><p>{p.learning}</p></div></div>
        </section>)}</div>
        <footer><b>놀이를 통한 배움</b><p>{plays.map(p=>p.learning).join(" ")}</p></footer>
      </article>
    </section>
  </main>;
}
