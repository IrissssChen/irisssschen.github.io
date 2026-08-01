"use client";

import { useEffect, useMemo, useState } from "react";

type Word = {
  id: number;
  word: string;
  reading: string;
  romaji: string;
  meaning: string;
  form: string;
};

const travelWords: Word[] = [
  { id: 0, word: "旅支度", reading: "たびじたく", romaji: "tabijitaku", meaning: "旅行准备", form: "旅支度" },
  { id: 1, word: "暮らす", reading: "くらす", romaji: "kurasu", meaning: "生活、居住", form: "暮らす・暮らします・暮らさない" },
  { id: 2, word: "好き", reading: "すき", romaji: "suki", meaning: "喜欢", form: "好き" },
  { id: 3, word: "季節", reading: "きせつ", romaji: "kisetsu", meaning: "季节", form: "季節" },
  { id: 4, word: "着く", reading: "つく", romaji: "tsuku", meaning: "到达", form: "着く・着きます・着かない" },
  { id: 5, word: "空港", reading: "くうこう", romaji: "kūkō", meaning: "机场", form: "空港" },
  { id: 6, word: "大き", reading: "おおき", romaji: "ōki", meaning: "大的", form: "大きい" },
  { id: 7, word: "聞く", reading: "きく", romaji: "kiku", meaning: "听、询问", form: "聞く・聞きます・聞かない" },
  { id: 8, word: "国", reading: "くに", romaji: "kuni", meaning: "国家", form: "国" },
  { id: 9, word: "日常", reading: "にちじょう", romaji: "nichijō", meaning: "日常", form: "日常" },
  { id: 10, word: "美味し", reading: "おいし", romaji: "oishi", meaning: "好吃的", form: "美味しい" },
  { id: 11, word: "島", reading: "しま", romaji: "shima", meaning: "岛", form: "島" },
  { id: 12, word: "学ぶ", reading: "まなぶ", romaji: "manabu", meaning: "学习", form: "学ぶ・学びます・学ばない" },
  { id: 13, word: "文化", reading: "ぶんか", romaji: "bunka", meaning: "文化", form: "文化" },
  { id: 14, word: "海", reading: "うみ", romaji: "umi", meaning: "海", form: "海" },
  { id: 15, word: "見る", reading: "みる", romaji: "miru", meaning: "看", form: "見る・見ます・見ない" },
  { id: 16, word: "留守", reading: "るす", romaji: "rusu", meaning: "不在家", form: "留守" },
  { id: 17, word: "住む", reading: "すむ", romaji: "sumu", meaning: "居住", form: "住む・住みます・住まない" },
];

const generatedSets = {
  coffee: [
    ["珈琲", "kōhī", "咖啡"],
    ["喫茶店", "kissaten", "咖啡店"],
    ["香り", "kaori", "香气"],
    ["苦味", "nigami", "苦味"],
    ["淹れる", "ireru", "冲泡"],
    ["温か", "atataka", "温暖的"],
  ],
  article: [
    ["環境", "kankyō", "环境"],
    ["暮らす", "kurasu", "生活"],
    ["地域", "chiiki", "地区"],
    ["守る", "mamoru", "守护"],
    ["新し", "atarashi", "新的"],
    ["考える", "kangaeru", "思考"],
  ],
};

const fixedIds = new Set([0, 5, 12]);
const movableIds = travelWords.map((word) => word.id).filter((id) => !fixedIds.has(id));
const initialOrder = travelWords.map((word) => {
  if (fixedIds.has(word.id)) return word.id;
  const index = movableIds.indexOf(word.id);
  return movableIds[(index + 4) % movableIds.length];
});

const puzzleCards = [
  { id: 1, title: "旅のことば", subtitle: "18このことば", level: "ふつう", tone: "blue" },
  { id: 2, title: "町をあるく", subtitle: "18このことば", level: "やさしい", tone: "mint" },
  { id: 3, title: "日本の四季", subtitle: "18このことば", level: "ふつう", tone: "sand" },
];

function Ruby({ children, reading }: { children: string; reading: string }) {
  return (
    <ruby>
      {children}
      <rt>{reading}</rt>
    </ruby>
  );
}

export default function Home() {
  const [topic, setTopic] = useState("コーヒーと喫茶店");
  const [generated, setGenerated] = useState(generatedSets.coffee);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePuzzle, setActivePuzzle] = useState(1);
  const [order, setOrder] = useState(initialOrder);
  const [selected, setSelected] = useState<number | null>(null);
  const [dragged, setDragged] = useState<number | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("kotonoha-completed");
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const correctCount = useMemo(
    () => order.filter((wordId, position) => wordId === position).length,
    [order],
  );
  const solved = correctCount === order.length;

  useEffect(() => {
    if (!solved || completed.includes(activePuzzle)) return;
    const next = [...completed, activePuzzle];
    setCompleted(next);
    localStorage.setItem("kotonoha-completed", JSON.stringify(next));
  }, [solved, activePuzzle, completed]);

  const generateWords = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setGenerated(/^https?:\/\//i.test(topic.trim()) ? generatedSets.article : generatedSets.coffee);
      setIsGenerating(false);
    }, 650);
  };

  const swap = (a: number, b: number) => {
    if (a === b || fixedIds.has(a) || fixedIds.has(b)) return;
    setOrder((current) => {
      const next = [...current];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  };

  const selectNode = (index: number) => {
    if (fixedIds.has(index)) return;
    if (selected === null) {
      setSelected(index);
      return;
    }
    swap(selected, index);
    setSelected(null);
  };

  const choosePuzzle = (id: number) => {
    setActivePuzzle(id);
    setOrder(initialOrder);
    setSelected(null);
    document.getElementById("game")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="app-shell">
      <aside className="side-panel">
        <a className="brand" href="#top" aria-label="ことのは">
          <span className="brand-mark">言</span>
          <span>
            <Ruby reading="kotonoha">言の葉</Ruby>
            <small>ことばを、つなぐ。</small>
          </span>
        </a>

        <nav className="side-nav" aria-label="メインメニュー">
          <a className="active" href="#words"><span>＋</span><Ruby reading="tango">単語</Ruby>をつくる</a>
          <a href="#puzzles"><span>◇</span><Ruby reading="pazuru">パズル</Ruby>をえらぶ</a>
          <a href="#game"><span>↗</span>つづきから</a>
        </nav>

        <div className="side-progress">
          <div className="ring"><span>{completed.length}</span><small>/ 3</small></div>
          <div><strong>こんしゅう</strong><span>よくできました</span></div>
        </div>
        <p className="side-note">ことばの<ruby>音<rt>oto</rt></ruby>をたどって、<br />すべてをただしい<ruby>場所<rt>basho</rt></ruby>へ。</p>
      </aside>

      <section className="content" id="top">
        <header className="topbar">
          <div>
            <p className="eyebrow">KANJI WORD PUZZLE</p>
            <h1><Ruby reading="kotoba">言葉</Ruby>のつながりを、<Ruby reading="tanoshiku">楽しく</Ruby>。</h1>
          </div>
          <div className="streak"><span>●</span><strong>7</strong><small>にち</small></div>
        </header>

        <section className="generator card" id="words">
          <div className="section-title">
            <div className="step">01</div>
            <div>
              <p>テーマ・ウェブページ</p>
              <h2><Ruby reading="tango">単語</Ruby>リストをつくる</h2>
            </div>
            <span className="status-dot">じゅんびOK</span>
          </div>
          <div className="input-row">
            <label>
              <span>テーマ、または URL</span>
              <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="れい：りょこう、https://…" />
            </label>
            <button className="primary" onClick={generateWords} disabled={isGenerating}>
              {isGenerating ? "ことばをさがしています…" : "リストをつくる →"}
            </button>
          </div>
          <p className="helper">かんじで<ruby>書<rt>kaku</rt></ruby>けることばをえらび、どうしは「じしょ・ます・ない」のかたちでまとめます。</p>

          <div className="word-list">
            <div className="list-heading">
              <div><span className="file-mark">あ</span><div><strong>{/^https?:\/\//i.test(topic) ? "ページからのことば" : "コーヒーのことば"}</strong><small>{generated.length}このことば・パズルにちょうどよい</small></div></div>
              <button aria-label="メニュー">•••</button>
            </div>
            <div className="word-grid">
              {generated.map(([word, romaji, meaning], index) => (
                <div className="word-row" key={word}>
                  <span className="word-index">{String(index + 1).padStart(2, "0")}</span>
                  <ruby>{word}<rt>{romaji}</rt></ruby>
                  <span>{meaning}</span>
                </div>
              ))}
            </div>
            <div className="list-footer">
              <span>このリストは 1つのパズルになります</span>
              <button onClick={() => document.getElementById("puzzles")?.scrollIntoView({ behavior: "smooth" })}>パズルをつくる</button>
            </div>
          </div>
        </section>

        <section className="puzzle-section" id="puzzles">
          <div className="section-title section-title-plain">
            <div className="step">02</div>
            <div>
              <p>つぎにあそぶ</p>
              <h2><Ruby reading="pazuru">パズル</Ruby>をえらぶ</h2>
            </div>
          </div>
          <div className="puzzle-cards">
            {puzzleCards.map((card) => (
              <button className={`puzzle-card ${card.tone} ${activePuzzle === card.id ? "chosen" : ""}`} onClick={() => choosePuzzle(card.id)} key={card.id}>
                <div className="mini-grid" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
                <div className="puzzle-card-top"><span>{card.level}</span>{completed.includes(card.id) && <em>クリア</em>}</div>
                <strong>{card.title}</strong>
                <small>{card.subtitle}</small>
                <div className="card-action">{completed.includes(card.id) ? "もういちど" : "はじめる"} <span>→</span></div>
              </button>
            ))}
          </div>
        </section>

        <section className="game card" id="game">
          <div className="game-head">
            <div>
              <p>パズル {String(activePuzzle).padStart(2, "0")}</p>
              <h2>{puzzleCards[activePuzzle - 1].title}</h2>
            </div>
            <div className="game-progress">
              <span><strong>{correctCount}</strong> / {travelWords.length}</span>
              <div><i style={{ width: `${(correctCount / travelWords.length) * 100}%` }} /></div>
            </div>
            <button className="reset" onClick={() => { setOrder(initialOrder); setSelected(null); }}>↻ やりなおす</button>
          </div>

          <div className="rule-note">
            <span>！</span>
            <p>ことばをドラッグ、または 2つタップしていれかえます。<ruby>最後<rt>saigo</rt></ruby>と<ruby>最初<rt>saisho</rt></ruby>の<ruby>音<rt>oto</rt></ruby>をつないでください。</p>
          </div>

          <div className={`board-wrap ${solved ? "solved" : ""}`}>
            <div className="board-lines" aria-hidden="true">
              {Array.from({ length: 17 }, (_, index) => <i key={index} />)}
            </div>
            <div className="puzzle-board" role="group" aria-label="ことばのパズル">
              {order.map((wordId, position) => {
                const word = travelWords[wordId];
                const correct = wordId === position;
                const fixed = fixedIds.has(position);
                return (
                  <button
                    key={position}
                    className={`word-node ${correct ? "correct" : ""} ${fixed ? "fixed" : ""} ${selected === position ? "selected" : ""}`}
                    draggable={!fixed}
                    onDragStart={() => setDragged(position)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => { if (dragged !== null) swap(dragged, position); setDragged(null); }}
                    onClick={() => selectNode(position)}
                    aria-label={`${word.word}、${correct ? "ただしい場所" : "いどうできます"}`}
                  >
                    {correct && <span className="reading">{word.romaji}</span>}
                    <span className="node-word">{word.word}</span>
                    {correct && <span className="tooltip"><strong>{word.form}</strong><small>{word.meaning}</small></span>}
                  </button>
                );
              })}
            </div>
            <div className="orientation-note"><span>↻</span> スマートフォンではたて<ruby>向<rt>muki</rt></ruby>きになります</div>
          </div>

          {solved && (
            <div className="success" role="status">
              <span>◎</span>
              <div><strong>おめでとう！</strong><p>すべてのことばがつながりました。</p></div>
              <button onClick={() => choosePuzzle((activePuzzle % 3) + 1)}>つぎのパズル →</button>
            </div>
          )}
        </section>

        <footer>
          <Ruby reading="kotonoha">言の葉</Ruby>
          <span>まいにち、ひとつのことばから。</span>
          <span>© 2026 KOTONOHA</span>
        </footer>
      </section>
    </main>
  );
}
