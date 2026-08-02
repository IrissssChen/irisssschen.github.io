const words = [
  ["動く","うごく","ugoku","移动","動く・動き・動か"],
  ["国","くに","kuni","国家","国"],
  ["荷物","にもつ","nimotsu","行李","荷物"],
  ["日没","にちぼつ","nichibotsu","日落","日没"],
  ["着く","つく","tsuku","到达","着く・着き・着か"],
  ["続く","つづく","tsuzuku","继续","続く・続き・続か"],
  ["付く","つく","tsuku","附着","付く・付き・付か"],
  ["暮らす","くらす","kurasu","生活、居住","暮らす・暮らし・暮らさ"],
  ["繰り返す","くりかえす","kurikaesu","重复","繰り返す・繰り返し・繰り返さ"],
  ["崩す","くずす","kuzusu","弄乱、拆散","崩す・崩し・崩さ"],
  ["好き","すき","suki","喜欢","好き"],
  ["素敵","すてき","suteki","出色、漂亮","素敵"],
  ["聞か","きか","kika","听、询问","聞く・聞き・聞か"],
  ["効か","きか","kika","奏效","効く・効き・効か"],
  ["気づか","きづか","kizuka","察觉","気づく・気づき・気づか"],
  ["貸し","かし","kashi","借出","貸す・貸し・貸さ"],
  ["悲し","かなし","kanashi","悲伤的","悲しい"],
  ["島","しま","shima","岛","島"],
];
const generatedSets = {
  coffee: [["珈琲","こーひー","kōhī","咖啡"],["喫茶店","きっさてん","kissaten","咖啡店"],["香り","かおり","kaori","香气"],["苦味","にがみ","nigami","苦味"],["淹れる","いれる","ireru","冲泡","淹れる・淹れ・淹れ"],["温か","あたたか","atataka","温暖的","温かい"]],
  study: [["読む","よむ","yomu","阅读","読む・読み・読ま"],["向き","むき","muki","方向"],["昔","むかし","mukashi","从前"],["記憶","きおく","kioku","记忆"],["基本","きほん","kihon","基础"],["試験","しけん","shiken","考试"]],
  article: [["環境","かんきょう","kankyō","环境"],["暮らす","くらす","kurasu","生活","暮らす・暮らし・暮らさ"],["地域","ちいき","chiiki","地区"],["守る","まもる","mamoru","守护","守る・守り・守ら"],["新し","あたらし","atarashi","新的","新しい"],["考える","かんがえる","kangaeru","思考","考える・考え・考え"]],
};
const puzzles = [
  { id: 1, title: "旅のことば", subtitle: "18このことば", level: "ふつう", tone: "blue" },
  { id: 2, title: "町をあるく", subtitle: "18このことば", level: "やさしい", tone: "mint" },
  { id: 3, title: "日本の四季", subtitle: "18このことば", level: "ふつう", tone: "sand" },
];
const graphEdges = [
  [0,1],
  [1,2],[1,3],
  [2,4],[2,5],
  [3,5],[3,6],
  [4,7],[4,8],
  [5,8],
  [6,8],[6,9],
  [7,10],
  [8,10],[8,11],
  [9,11],
  [10,12],[10,13],
  [11,13],[11,14],
  [12,15],
  [13,15],[13,16],
  [14,16],
  [15,17],[16,17],
];
const graphPositions = [
  [4,1],[4,2],[3,3],[3,4],[2,5],[3,6],[3,7],[4,8],[4,9],
  [5,8],[5,7],[6,6],[6,5],[5,4],[5,3],[4,4],[4,5],[4,6],
  [2,2],[6,2],[2,8],[6,8],
];
const mapPositions = {
  honeycomb: graphPositions,
  diamond: [
    [4,1],[3,2],[2,3],[1,4],[1,5],[2,6],[3,7],[4,8],[4,9],
    [5,8],[6,7],[7,6],[7,5],[6,4],[5,3],[4,4],[3,5],[4,6],
    [2,2],[6,2],[2,8],[6,8],
  ],
  branch: [
    [4,1],[4,2],[4,3],[3,4],[2,5],[1,6],[2,7],[3,6],[4,5],
    [5,4],[6,5],[7,6],[6,7],[5,6],[4,7],[4,8],[4,9],[5,8],
    [2,2],[6,2],[2,8],[6,8],
  ],
  spiral: [
    [1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[2,7],[3,7],
    [4,7],[5,7],[6,7],[7,7],[7,6],[7,5],[7,4],[6,4],[5,4],
    [2,2],[6,2],[2,8],[6,8],
  ],
  wave: [
    [2,1],[1,2],[2,3],[3,4],[2,5],[1,6],[2,7],[3,8],[2,9],
    [4,9],[5,8],[4,7],[3,6],[4,5],[5,4],[4,3],[3,2],[4,1],
    [2,2],[6,2],[2,8],[6,8],
  ],
};
// Each configuration contains four independent four-word chains. Every edge is
// diagonal, and any unused tail of the fourth chain stays away from the four
// outer corners so incomplete puzzles remain visually balanced.
const hexDiamondConfigurations = {
  0: [
    [
      [[3,2],[2,3],[1,4],[2,5]], [[6,5],[5,6],[4,7],[3,6]],
      [[7,4],[6,3],[5,2],[4,1]], [[3,4],[4,5],[5,4],[4,3]],
    ],
    [
      [[1,4],[2,5],[3,6],[4,5]], [[6,3],[5,2],[4,1],[3,2]],
      [[7,4],[6,5],[5,6],[4,7]], [[2,3],[3,4],[4,3],[5,4]],
    ],
    [
      [[1,4],[2,3],[3,2],[4,3]], [[6,5],[5,6],[4,7],[3,6]],
      [[7,4],[6,3],[5,2],[4,1]], [[2,5],[3,4],[4,5],[5,4]],
    ],
  ],
  1: [
    [
      [[3,2],[2,3],[1,4],[2,5]], [[4,1],[5,2],[6,3],[5,4]],
      [[7,4],[6,5],[5,6],[4,7]], [[3,6],[4,5],[3,4],[4,3]],
    ],
    [
      [[1,4],[2,5],[3,6],[4,5]], [[5,2],[4,1],[3,2],[2,3]],
      [[7,4],[6,5],[5,6],[4,7]], [[6,3],[5,4],[4,3],[3,4]],
    ],
    [
      [[1,4],[2,3],[3,2],[4,3]], [[5,6],[4,7],[3,6],[2,5]],
      [[7,4],[6,3],[5,2],[4,1]], [[6,5],[5,4],[4,5],[3,4]],
    ],
  ],
  2: [
    [
      [[1,4],[2,5],[3,6],[4,5]], [[4,1],[5,2],[6,3],[5,4]],
      [[7,4],[6,5],[5,6],[4,7]], [[2,3],[3,2],[4,3],[3,4]],
    ],
    [
      [[1,4],[2,3],[3,2],[4,3]], [[4,1],[5,2],[6,3],[5,4]],
      [[7,4],[6,5],[5,6],[4,7]], [[2,5],[3,6],[4,5],[3,4]],
    ],
    [
      [[1,4],[2,3],[3,2],[4,3]], [[4,7],[3,6],[2,5],[3,4]],
      [[7,4],[6,3],[5,2],[4,1]], [[5,6],[6,5],[5,4],[4,5]],
    ],
  ],
  3: [
    [
      [[1,4],[2,3],[3,2],[4,3]], [[4,1],[5,2],[6,3],[5,4]],
      [[7,4],[6,5],[5,6],[4,5]], [[4,7],[3,6],[2,5],[3,4]],
    ],
    [
      [[1,4],[2,3],[3,4],[4,5]], [[5,6],[4,7],[3,6],[2,5]],
      [[6,5],[7,4],[6,3],[5,4]], [[3,2],[4,1],[5,2],[4,3]],
    ],
    [
      [[1,4],[2,3],[3,2],[4,3]], [[4,7],[3,6],[2,5],[3,4]],
      [[4,1],[5,2],[6,3],[5,4]], [[7,4],[6,5],[5,6],[4,5]],
    ],
  ],
  4: [
    [
      [[1,4],[2,3],[3,2],[4,3]], [[4,1],[5,2],[6,3],[5,4]],
      [[4,7],[3,6],[2,5],[3,4]], [[7,4],[6,5],[5,6],[4,5]],
    ],
    [
      [[1,4],[2,3],[3,4],[4,5]], [[5,6],[4,7],[3,6],[2,5]],
      [[6,3],[5,2],[4,1],[3,2]], [[7,4],[6,5],[5,4],[4,3]],
    ],
    [
      [[1,4],[2,3],[3,4],[4,5]], [[4,3],[5,2],[4,1],[3,2]],
      [[5,6],[4,7],[3,6],[2,5]], [[6,3],[7,4],[6,5],[5,4]],
    ],
    [
      [[1,4],[2,5],[3,6],[4,5]], [[4,7],[5,6],[6,5],[5,4]],
      [[7,4],[6,3],[5,2],[4,1]], [[3,2],[2,3],[3,4],[4,3]],
    ],
  ],
};
// Word i still maps directly to slot i; configurations only move those slots.
const hexVertexPositions = hexDiamondConfigurations[4][0].flat();
const tutorialHexPositions = [
  [1,4],
  [2,3],[2,5],
  [3,2],[3,4],[3,6],
];
const fixedByDifficulty = {
  easy: [0, 1, 5, 8, 10, 17],
  normal: [0, 1, 10],
  hard: [0],
};
const PUZZLE_GENERATION_VERSION = 18;
const TUTORIAL_LIST_ID = "tutorial-study";
const TUTORIAL_EDGES = [[0,1],[0,2],[1,3],[1,4],[2,5]];

function tutorialVocabulary() {
  return {
    id: TUTORIAL_LIST_ID,
    title: "学習",
    source: "",
    tutorial: true,
    mapMode: "hex",
    words: generatedSets.study.map(item => [...item]),
    createdAt: 0,
  };
}

const hiddenVerbLabels = {
  "動く": "動（じしょ）",
  "着く": "着（じしょ）",
  "続く": "続（じしょ）",
  "付く": "付（じしょ）",
  "暮らす": "暮（じしょ）",
  "繰り返す": "繰り返（じしょ）",
  "崩す": "崩（じしょ）",
  "聞か": "聞（ない）",
  "効か": "効（ない）",
  "気づか": "気づ（ない）",
  "貸し": "貸（ます）",
};
let difficulty = localStorage.getItem("kotonoha-difficulty") || "normal";
let endingMode = localStorage.getItem("kotonoha-ending") || "shown";
let theme = localStorage.getItem("kotonoha-theme") || "dark";
let fixed = new Set(fixedByDifficulty[difficulty] || fixedByDifficulty.normal);
let allowedSignatures = [];
let order = [];
let active = 1;
let selected = null;
let dragged = null;
let completed = JSON.parse(localStorage.getItem("kotonoha-completed") || "[]");
let completionRecords = JSON.parse(localStorage.getItem("kotonoha-completion-records") || "{}");
if (!Object.keys(completionRecords).length && completed.length) {
  completionRecords = Object.fromEntries(completed.map(id => [id, "blue"]));
  localStorage.setItem("kotonoha-completion-records", JSON.stringify(completionRecords));
}
let readingMode = localStorage.getItem("kotonoha-reading") || "hiragana";
let betaMapMode = localStorage.getItem("kotonoha-beta-map") || "hex";
let currentGeneratedList = generatedSets.study;
let currentGeneratedTitle = "学習";
let currentGeneratedSource = "";
let autoSaveReady = false;
let saveTimer = null;
let hasSavedGame = false;
let pendingPuzzleId = 1;
let selectedMap = "honeycomb";
let activeWords = words.map(item => [...item]);
let activeEdges = [...graphEdges];
let activeListId = TUTORIAL_LIST_ID;
let randomSeed = 0;
let accountUser = null;
let pendingListMapMode = "hex";
let vocabularyLists = [tutorialVocabulary()];

const el = id => document.getElementById(id);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);
}

function compactTopicTitle(value) {
  const normalized = String(value || "").normalize("NFKC").trim();
  const jlpt = normalized.match(/\bN[1-5]\b/i);
  if (jlpt) return jlpt[0].toUpperCase();
  const translations = [
    [/\btravel\b/i, "旅行"],
    [/\bfood\b|\bcooking\b/i, "料理"],
    [/\bcoffee\b|\bcafe\b/i, "珈琲"],
    [/\buniversity\b|\bcollege\b/i, "大学"],
    [/\bseason/i, "四季"],
    [/\bsummer\s*festival\b/i, "夏祭"],
    [/\bvocab(?:ulary)?\b|\bwords?\b/i, "語彙"],
  ];
  for (const [pattern, japanese] of translations) {
    if (pattern.test(normalized)) return japanese;
  }
  const keyword = normalized.split(/[・、,／/]|(?:\s+と\s+)|(?:と(?=[\p{Script=Han}\u3040-\u30ff]))/u)
    .map(part => part.trim())
    .find(Boolean);
  return [...(keyword || "ことば")].slice(0, 8).join("");
}

function currentVocabulary() {
  return vocabularyLists.find(list => list.id === activeListId) || vocabularyLists[0];
}

function activateVocabulary(listId) {
  const list = vocabularyLists.find(item => item.id === listId);
  if (!list) return;
  activeListId = list.id;
  betaMapMode = list.mapMode === "hex" ? "hex" : "standard";
  currentGeneratedList = list.words;
  currentGeneratedTitle = list.title;
  currentGeneratedSource = list.source || "";
}

function listCardMarkup(list, detailed = false) {
  const preview = list.words.slice(0, detailed ? 18 : 7)
    .map(([word]) => escapeHtml(word))
    .join("・");
  return `<article class="vocabulary-card-shell">
    <button class="vocabulary-card ${list.id === activeListId ? "active" : ""}" data-open-list="${escapeHtml(list.id)}">
      <span class="vocab-reading">${list.tutorial ? "TUTORIAL" : "ことば"}</span>
      <strong>${escapeHtml(list.title)}</strong>
      <small>${list.words.length}このことば${list.source ? "・ページから" : ""}</small>
      <span class="vocab-preview">${preview}${list.words.length > (detailed ? 18 : 7) ? "…" : ""}</span>
    </button>
    ${list.tutorial ? "" : `<button class="vocabulary-delete" data-delete-list="${escapeHtml(list.id)}" aria-label="${escapeHtml(list.title)}を削除">削除</button>`}
  </article>`;
}

function bindVocabularyCards(container) {
  container.querySelectorAll("[data-open-list]").forEach(button => button.addEventListener("click", () => {
    activateVocabulary(button.dataset.openList);
    renderGenerated();
    renderCards();
    el("library-modal").hidden = true;
    openEditor();
  }));
  container.querySelectorAll("[data-delete-list]").forEach(button => button.addEventListener("click", () => {
    deleteVocabularyList(button.dataset.deleteList);
  }));
}

function renderGenerated() {
  const visibleLists = vocabularyLists.slice(0, 3);
  el("vocabulary-cards").innerHTML = visibleLists.map(list => listCardMarkup(list)).join("");
  bindVocabularyCards(el("vocabulary-cards"));
  el("open-library").hidden = vocabularyLists.length <= 3;
  el("all-vocabulary-cards").innerHTML = vocabularyLists.map(list => listCardMarkup(list, true)).join("");
  bindVocabularyCards(el("all-vocabulary-cards"));
}

function deleteVocabularyList(listId) {
  const list = vocabularyLists.find(item => item.id === listId);
  if (!list || list.tutorial) return;
  if (!window.confirm(`「${list.title}」と、このことばリストから作ったパズルをすべて削除しますか？`)) return;
  vocabularyLists = vocabularyLists.filter(item => item.id !== listId);
  const completionPrefix = `connected-v6:${listId}:`;
  completed = completed.filter(key => typeof key !== "string" || !key.startsWith(completionPrefix));
  completionRecords = Object.fromEntries(
    Object.entries(completionRecords).filter(([key]) => !key.startsWith(completionPrefix))
  );
  localStorage.setItem("kotonoha-completed", JSON.stringify(completed));
  localStorage.setItem("kotonoha-completion-records", JSON.stringify(completionRecords));
  puzzleGroupCache.clear();
  if (activeListId === listId) {
    activateVocabulary(TUTORIAL_LIST_ID);
    active = 1;
    const group = puzzleGroups(currentVocabulary())[0];
    activeWords = group.words.map(item => [...item]);
    activeEdges = (group.edges || []).map(edge => [...edge]);
    selectedMap = group.map;
    rebuildPuzzle();
    el("game").hidden = true;
  }
  renderGenerated();
  renderCards();
  scheduleAutoSave();
}

function supplementalPool() {
  const connectors = [
    ["晩御飯","ばんごはん","bangohan","晚饭"],["本屋","ほんや","honya","书店"],
    ["先生","せんせい","sensei","老师"],["天気","てんき","tenki","天气"],
    ["漢字","かんじ","kanji","汉字"],["新聞","しんぶん","shinbun","报纸"],
    ["文化","ぶんか","bunka","文化"],["散歩","さんぽ","sanpo","散步"],
    ["漫画","まんが","manga","漫画"],["鉛筆","えんぴつ","enpitsu","铅笔"],
    ["電話","でんわ","denwa","电话"],["料理","りょうり","ryouri","料理"],
    ["林檎","りんご","ringo","苹果"],["時間","じかん","jikan","时间"],
    ["入口","いりぐち","iriguchi","入口"],["地下鉄","ちかてつ","chikatetsu","地铁"],
    ["机","つくえ","tsukue","书桌"],["駅前","えきまえ","ekimae","车站前"],
    ["映画","えいが","eiga","电影"],["学校","がっこう","gakkou","学校"],
    ["海","うみ","umi","海"],["店","みせ","mise","商店"],
    ["世界","せかい","sekai","世界"],["医者","いしゃ","isha","医生"],
    ["写真","しゃしん","shashin","照片"],["神社","じんじゃ","jinja","神社"],
    ["野菜","やさい","yasai","蔬菜"],["椅子","いす","isu","椅子"],
    ["空","そら","sora","天空"],["来週","らいしゅう","raishuu","下周"],
    ["上手","じょうず","jouzu","擅长"],["図書館","としょかん","toshokan","图书馆"],
    ["名前","なまえ","namae","名字"],["英語","えいご","eigo","英语"],
    ["音楽","おんがく","ongaku","音乐"],["曇り","くもり","kumori","阴天"],
    ["旅行","りょこう","ryokou","旅行"],["運動","うんどう","undou","运动"],
    ["大学","だいがく","daigaku","大学"],["果物","くだもの","kudamono","水果"],
    ["飲み物","のみもの","nomimono","饮料"],["乗り物","のりもの","norimono","交通工具"],
    ["勉強","べんきょう","benkyou","学习"],["教室","きょうしつ","kyoushitsu","教室"],
    ["質問","しつもん","shitsumon","问题"],["問題","もんだい","mondai","问题"],
    ["大人","おとな","otona","成年人"],["朝","あさ","asa","早晨"],
    ["桜","さくら","sakura","樱花"],["冷蔵庫","れいぞうこ","reizouko","冰箱"],
    ["公園","こうえん","kouen","公园"],["会社","かいしゃ","kaisha","公司"],
    ["病院","びょういん","byouin","医院"],["月","つき","tsuki","月亮"],
    ["切符","きっぷ","kippu","车票"],["帽子","ぼうし","boushi","帽子"],
    ["留守","るす","rusu","不在家"],["半分","はんぶん","hanbun","一半"],
    ["雰囲気","ふんいき","funiki","氛围"],["返事","へんじ","henji","答复"],
    ["利用","りよう","riyou","利用"],["内容","ないよう","naiyou","内容"],
    ["中学校","ちゅうがっこう","chuugakkou","中学"],["数学","すうがく","suugaku","数学"],
    ["入学","にゅうがく","nyuugaku","入学"],["美術","びじゅつ","bijutsu","美术"],
    ["研究","けんきゅう","kenkyuu","研究"],["雪","ゆき","yuki","雪"],
    ["行事","ぎょうじ","gyouji","活动"],["言い方","いいかた","iikata","说法"],
    ["印刷","いんさつ","insatsu","印刷"],["椎茸","しいたけ","shiitake","香菇"],
    ["方法","ほうほう","houhou","方法"],["給料","きゅうりょう","kyuuryou","工资"],
    ["法律","ほうりつ","houritsu","法律"],
    ["プロ野球","ぷろやきゅう","puroyakyuu","职业棒球"],["習慣","しゅうかん","shuukan","习惯"],
    ["楽","らく","raku","轻松"],["東京","とうきょう","toukyou","东京"],
    ["人間","にんげん","ningen","人类"],["図","ず","zu","图"],
    ["パリ市","ぱりし","parishi","巴黎市"],
    ["ヒーター室","ひーたーしつ","hiitaashitsu","暖气室"],
  ];
  return [
    ...words,
    ...generatedSets.coffee,
    ...generatedSets.article,
    ...connectors,
  ].map(item => item.length >= 5 ? [...item] : [...item, item[0]]);
}

function themedSupplementalPool(sourceWords) {
  const lyricWords = [
    ["星","ほし","hoshi","星星"],["光","ひかり","hikari","光芒"],["心","こころ","kokoro","心；心灵"],
    ["夜","よる","yoru","夜晚"],["夢","ゆめ","yume","梦；梦想"],["涙","なみだ","namida","眼泪"],
    ["風","かぜ","kaze","风"],["雨","あめ","ame","雨"],["記憶","きおく","kioku","记忆"],
    ["季節","きせつ","kisetsu","季节"],["景色","けしき","keshiki","景色"],["声","こえ","koe","声音"],
    ["静か","しずか","shizuka","安静；宁静","静かな"],["優し","やさし","yasashi","温柔的","優しい"],["美し","うつくし","utsukushi","美丽的","美しい"],
    ["願い","ねがい","negai","愿望"],["思い","おもい","omoi","思念；心意"],["朝焼け","あさやけ","asayake","朝霞"],
    ["夕焼け","ゆうやけ","yuuyake","晚霞"],["流れ星","ながれぼし","nagareboshi","流星"],["木漏れ日","こもれび","komorebi","林间阳光"],
    ["旋律","せんりつ","senritsu","旋律"],["響き","ひびき","hibiki","回响"],["言葉","ことば","kotoba","话语"],
    ["微笑み","ほほえみ","hohoemi","微笑"],["孤独","こどく","kodoku","孤独"],["希望","きぼう","kibou","希望"],
    ["想い出","おもいで","omoide","回忆"],["青春","せいしゅん","seishun","青春"],["永遠","えいえん","eien","永远"],
    ["別れ","わかれ","wakare","离别"],["出会い","であい","deai","相遇"],["温か","あたたか","atataka","温暖的","温かい"],
    ["遠く","とおく","tooku","远方"],["明日","あした","ashita","明天"],["昨日","きのう","kinou","昨天"],
    ["空","そら","sora","天空"],["海","うみ","umi","海"],["雲","くも","kumo","云"],
    ["花","はな","hana","花"],["桜","さくら","sakura","樱花"],["月明かり","つきあかり","tsukiakari","月光"],
    ["手紙","てがみ","tegami","信；书信"],["回帰","かいき","kaiki","回归"],["浪漫","ろまん","roman","浪漫"],
    ["満月","まんげつ","mangetsu","满月"],["目覚め","めざめ","mezame","醒来；觉醒"],["芽生え","めばえ","mebae","萌芽"],
    ["笑顔","えがお","egao","笑容"],["想い","おもい","omoi","思念；心意"],
    ["情景","じょうけい","joukei","情景"],["経験","けいけん","keiken","经历；经验"],
    ["懸命","けんめい","kenmei","拼命；竭尽全力"],["名曲","めいきょく","meikyoku","名曲"],
    ["嗜好","しこう","shikou","喜好"],["四季","しき","shiki","四季"],["店内","てんない","tennai","店内"],
    ["内容","ないよう","naiyou","内容"],["洋菓子","ようがし","yougashi","西式点心"],["味覚","みかく","mikaku","味觉"],
    ["物語","ものがたり","monogatari","故事"],["理想","りそう","risou","理想"],["想像","そうぞう","souzou","想象"],
    ["造花","ぞうか","zouka","人造花"],["奏で","かなで","kanade","演奏；奏响","奏でる・奏で・奏で"],
  ].map(item => item.length >= 5 ? item : [...item, item[0]]);
  const text = sourceWords.map(item => `${item[0]} ${item[3] || ""}`).join(" ");
  const lyricSignals = text.match(/歌|音|声|心|夢|涙|月|夜|空|星|雪|風|雨|光|影|未来|感情|時間|香り|苦味|温もり|記憶|世界|希望|別れ|思い/g) || [];
  if (new Set(lyricSignals).size >= 2) {
    const relatedExisting = supplementalPool().filter(item =>
      /音楽|映画|写真|空|海|月|雪|天気|曇り|朝|桜|世界|時間|色|感情|香り|温か/.test(`${item[0]} ${item[3]}`)
    );
    return [...lyricWords, ...relatedExisting];
  }
  return supplementalPool();
}

const wordBoundaryCache = new WeakMap();

function kanaToRomaji(reading) {
  const base = {
    あ:"a",い:"i",う:"u",え:"e",お:"o",か:"ka",き:"ki",く:"ku",け:"ke",こ:"ko",
    さ:"sa",し:"shi",す:"su",せ:"se",そ:"so",た:"ta",ち:"chi",つ:"tsu",て:"te",と:"to",
    な:"na",に:"ni",ぬ:"nu",ね:"ne",の:"no",は:"ha",ひ:"hi",ふ:"fu",へ:"he",ほ:"ho",
    ま:"ma",み:"mi",む:"mu",め:"me",も:"mo",や:"ya",ゆ:"yu",よ:"yo",
    ら:"ra",り:"ri",る:"ru",れ:"re",ろ:"ro",わ:"wa",を:"o",ん:"n",
    が:"ga",ぎ:"gi",ぐ:"gu",げ:"ge",ご:"go",ざ:"za",じ:"ji",ず:"zu",ぜ:"ze",ぞ:"zo",
    だ:"da",ぢ:"ji",づ:"zu",で:"de",ど:"do",ば:"ba",び:"bi",ぶ:"bu",べ:"be",ぼ:"bo",
    ぱ:"pa",ぴ:"pi",ぷ:"pu",ぺ:"pe",ぽ:"po",
  };
  const digraph = {
    きゃ:"kya",きゅ:"kyu",きょ:"kyo",しゃ:"sha",しゅ:"shu",しょ:"sho",
    ちゃ:"cha",ちゅ:"chu",ちょ:"cho",にゃ:"nya",にゅ:"nyu",にょ:"nyo",
    ひゃ:"hya",ひゅ:"hyu",ひょ:"hyo",みゃ:"mya",みゅ:"myu",みょ:"myo",
    りゃ:"rya",りゅ:"ryu",りょ:"ryo",ぎゃ:"gya",ぎゅ:"gyu",ぎょ:"gyo",
    じゃ:"ja",じゅ:"ju",じょ:"jo",びゃ:"bya",びゅ:"byu",びょ:"byo",
    ぴゃ:"pya",ぴゅ:"pyu",ぴょ:"pyo",
  };
  const kana = [...String(reading)].map(character => {
    const code = character.charCodeAt(0);
    return code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : character;
  });
  let result = "";
  let doubleNext = false;
  for (let index = 0; index < kana.length; index += 1) {
    if (kana[index] === "っ") { doubleNext = true; continue; }
    if (kana[index] === "ー") {
      const vowel = result.match(/[aeiou]$/)?.[0];
      if (vowel) result += vowel;
      continue;
    }
    const pair = kana[index] + (kana[index + 1] || "");
    let syllable = digraph[pair];
    if (syllable) index += 1;
    else syllable = base[kana[index]] || kana[index];
    if (doubleNext && /^[bcdfghjklmnpqrstvwxyz]/.test(syllable)) syllable = syllable[0] + syllable;
    doubleNext = false;
    result += syllable;
  }
  return result;
}

function readingForSurface(currentWord, currentReading, targetWord) {
  if (currentWord === targetWord) return currentReading;
  const currentTail = currentWord.match(/[ぁ-ゖァ-ヺー]+$/u)?.[0] || "";
  const targetTail = targetWord.match(/[ぁ-ゖァ-ヺー]+$/u)?.[0] || "";
  if (currentTail && currentReading.endsWith(currentTail)) {
    return `${currentReading.slice(0, -currentTail.length)}${targetTail}`;
  }
  return currentReading;
}

function verbFormVariants(item) {
  const [word, reading, , , form = word] = item;
  const parts = String(form).split("・").filter(Boolean);
  if (parts.length < 3) return [];
  const labels = ["じしょ", "ます", "ない", "可能"];
  return parts.slice(0, 4).map((part, index) => {
    const [surface, encodedReading, encodedRomaji] = part.split("|");
    const formReading = encodedReading || readingForSurface(word, reading, surface);
    return {
      surface,
      reading: formReading,
      romaji: encodedRomaji || kanaToRomaji(formReading),
      label: labels[index] || `かたち${index + 1}`,
    };
  });
}

function completeFormLabel(item) {
  const variants = verbFormVariants(item);
  return variants.length ? variants.map(variant => variant.surface).join("・") : (item[4] || item[0]);
}

function adjectivePuzzleEntry(item) {
  if (verbFormVariants(item).length) return item;
  const [word, reading, romaji, meaning, form = word] = item;
  const explicitAdjective = form !== word && /[いなた]$/u.test(form);
  const inferredAdjective = form === word &&
    /[いなた]$/u.test(word) &&
    /的|形容/u.test(meaning);
  if (!explicitAdjective && !inferredAdjective) return item;
  const surface = word.replace(/[いなた]$/u, "") || word;
  const puzzleReading = reading.replace(/[いなた]$/u, "") || reading;
  return [surface, puzzleReading, kanaToRomaji(puzzleReading) || romaji, meaning, form];
}

function puzzleFormOptions(rawItem) {
  const normalized = rawItem.length >= 5
    ? rawItem.slice(0, 5)
    : [...rawItem.slice(0, 4), rawItem[0]];
  const item = adjectivePuzzleEntry(normalized);
  const variants = verbFormVariants(item);
  if (!variants.length) return [item];
  return variants.map(variant => [
    variant.surface,
    variant.reading,
    variant.romaji,
    item[3],
    item[4],
  ]);
}

function optimizedPuzzleSource(source, seedText) {
  const optionSets = source.map(puzzleFormOptions);
  const allOptions = optionSets.flat();
  return optionSets.map((options, sourceIndex) => options
    .map((candidate, optionIndex) => {
      let sourceMatches = 0;
      optionSets.forEach((otherOptions, otherIndex) => {
        if (otherIndex === sourceIndex) return;
        if (otherOptions.some(other => compatibleDirection(candidate, other))) sourceMatches += 1;
      });
      const overallMatches = allOptions.reduce((count, other) =>
        count + Number(Boolean(compatibleDirection(candidate, other))), 0);
      const tie = [...`${seedText}:${sourceIndex}:${optionIndex}`]
        .reduce((value, character) => (value * 33 + character.codePointAt(0)) >>> 0, 5381) % 997;
      return {
        candidate,
        score: sourceMatches * 1000 + overallMatches * 10 + tie / 1000,
      };
    })
    .sort((a, b) => b.score - a.score)[0].candidate);
}

function wordBoundary(item) {
  if (item && typeof item === "object" && wordBoundaryCache.has(item)) return wordBoundaryCache.get(item);
  const units = soundUnits(item?.[1] || "");
  const boundary = { first: units[0] || "", last: units.at(-1) || "" };
  if (item && typeof item === "object") wordBoundaryCache.set(item, boundary);
  return boundary;
}

function seededShuffle(items, seedText) {
  let seed = [...String(seedText)].reduce((value, character) => ((value * 31) + character.codePointAt(0)) >>> 0, 2166136261);
  const result = items.map(item => [...item]);
  for (let index = result.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function compatibleDirection(left, right) {
  const a = wordBoundary(left);
  const b = wordBoundary(right);
  if (a.last && a.last === b.first) return "forward";
  if (b.last && b.last === a.first) return "backward";
  return "";
}

function hexSlotsConnected(fromPosition, toPosition) {
  return Number.isInteger(fromPosition)
    && Number.isInteger(toPosition)
    && fromPosition >= 0
    && toPosition === fromPosition + 1
    && Math.floor(fromPosition / 4) === Math.floor(toPosition / 4);
}

function placementDirection(left, right, fromPosition, toPosition, mode) {
  if (mode !== "hex") return compatibleDirection(left, right);
  if (!hexSlotsConnected(fromPosition, toPosition)) return "";
  const a = wordBoundary(left);
  const b = wordBoundary(right);
  return a.last && a.last === b.first ? "forward" : "";
}

function availableParentIndices(items, nextPosition, mode) {
  return items.map((_, index) => index).filter(index =>
    mode !== "hex" || hexSlotsConnected(index, nextPosition)
  );
}

function comesBefore(a, b) {
  return a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
}

function segmentsCross(a, b, c, d) {
  const turn = (p, q, r) =>
    (q[1] - p[1]) * (r[0] - p[0]) - (q[0] - p[0]) * (r[1] - p[1]);
  const epsilon = 0.0001;
  return turn(a, b, c) * turn(a, b, d) < -epsilon &&
    turn(c, d, a) * turn(c, d, b) < -epsilon;
}

function segmentPassesWordSlot(a, b, point) {
  const start = { x: a[1] * 1.6, y: a[0] };
  const end = { x: b[1] * 1.6, y: b[0] };
  const center = { x: point[1] * 1.6, y: point[0] };
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx ** 2 + dy ** 2;
  if (!lengthSquared) return false;
  const t = Math.max(0, Math.min(1,
    ((center.x - start.x) * dx + (center.y - start.y) * dy) / lengthSquared
  ));
  if (t < 0.06 || t > 0.94) return false;
  const nearestX = start.x + dx * t;
  const nearestY = start.y + dy * t;
  return Math.abs(nearestX - center.x) < 0.72 &&
    Math.abs(nearestY - center.y) < 0.42;
}

function disconnectedPartCount(itemCount, edges) {
  if (!itemCount) return 0;
  const adjacency = Array.from({ length: itemCount }, () => []);
  edges.forEach(([from, to]) => {
    if (from === to || !adjacency[from] || !adjacency[to]) return;
    adjacency[from].push(to);
    adjacency[to].push(from);
  });
  const visited = new Set();
  let parts = 0;
  for (let start = 0; start < itemCount; start += 1) {
    if (visited.has(start)) continue;
    parts += 1;
    const queue = [start];
    visited.add(start);
    while (queue.length) {
      const current = queue.shift();
      adjacency[current].forEach(next => {
        if (visited.has(next)) return;
        visited.add(next);
        queue.push(next);
      });
    }
  }
  return parts;
}

function assignHexPositions(items, sourceEdges) {
  const positions = packedHexPositions(items.length);
  const assigned = positions.map((_, index) => index);
  const valid = sourceEdges.every(([from, to]) =>
    placementDirection(items[from], items[to], from, to, "hex") === "forward"
  );
  return valid ? { positions, assigned } : null;
}

function layoutMetrics(edges, assigned, positions, mode = "standard") {
  let distance = 0;
  let crossings = 0;
  let directionErrors = 0;
  let longEdges = 0;
  let nodeObstructions = 0;
  let edgeShapeErrors = 0;
  edges.forEach(([from, to]) => {
    const a = positions[assigned[from]];
    const b = positions[assigned[to]];
    const edgeDistance = Math.hypot(a[0] - b[0], a[1] - b[1]);
    distance += edgeDistance;
    longEdges += Math.max(0, edgeDistance - 2.35) ** 2;
    if (!comesBefore(a, b)) directionErrors += 1;
    if (mode === "hex") {
      const rowDistance = Math.abs(a[0] - b[0]);
      const columnDistance = Math.abs(a[1] - b[1]);
      if (!(rowDistance === 1 && columnDistance === 1)) edgeShapeErrors += 1;
    }
    assigned.forEach((slot, node) => {
      if (node === from || node === to) return;
      if (segmentPassesWordSlot(a, b, positions[slot])) nodeObstructions += 1;
    });
  });
  for (let left = 0; left < edges.length; left += 1) {
    const [aFrom, aTo] = edges[left];
    for (let right = left + 1; right < edges.length; right += 1) {
      const [bFrom, bTo] = edges[right];
      if (aFrom === bFrom || aFrom === bTo || aTo === bFrom || aTo === bTo) continue;
      if (segmentsCross(
        positions[assigned[aFrom]],
        positions[assigned[aTo]],
        positions[assigned[bFrom]],
        positions[assigned[bTo]],
      )) crossings += 1;
    }
  }
  return {
    distance,
    crossings,
    directionErrors,
    nodeObstructions,
    edgeShapeErrors,
    score: directionErrors * 1000000 + edgeShapeErrors * 500000 +
      nodeObstructions * 100000 + crossings * 1000 + longEdges * 120 + distance,
  };
}

function layoutConnectedGroup(items, sourceEdges, groupIndex, mode = "standard") {
  const adjacency = Array.from({ length: items.length }, () => []);
  sourceEdges.forEach(([from, to]) => {
    adjacency[from].push(to);
    adjacency[to].push(from);
  });
  const outgoing = Array.from({ length: items.length }, () => []);
  const indegree = Array(items.length).fill(0);
  sourceEdges.forEach(([from, to]) => {
    outgoing[from].push(to);
    indegree[to] += 1;
  });
  const ready = items.map((_, index) => index).filter(index => indegree[index] === 0);
  const topologicalOrder = [];
  while (ready.length) {
    ready.sort((a, b) => adjacency[b].length - adjacency[a].length || a - b);
    const node = ready.shift();
    topologicalOrder.push(node);
    outgoing[node].forEach(next => {
      indegree[next] -= 1;
      if (indegree[next] === 0) ready.push(next);
    });
  }
  if (topologicalOrder.length < items.length) {
    items.forEach((_, index) => {
      if (!topologicalOrder.includes(index)) topologicalOrder.push(index);
    });
  }
  const incoming = Array.from({ length: items.length }, () => []);
  sourceEdges.forEach(([from, to]) => incoming[to].push(from));
  const hexAssignment = mode === "hex" ? assignHexPositions(items, sourceEdges) : null;
  const layoutSources = mode === "hex"
    ? [["honeycomb", packedHexPositions(items.length)]]
    : Object.entries(mapPositions).filter(([map]) => map !== "spiral");
  const layouts = hexAssignment ? [{
    map: "honeycomb",
    positions: hexAssignment.positions,
    assigned: hexAssignment.assigned,
    ...layoutMetrics(sourceEdges, hexAssignment.assigned, hexAssignment.positions, mode),
  }] : layoutSources
    .flatMap(([map, positions], mapIndex) => {
      const slots = items.map((_, index) => index)
        .sort((a, b) => positions[a][0] - positions[b][0] || positions[a][1] - positions[b][1]);
      return Array.from({ length: Math.min(6, items.length) }, (_, variant) => {
        const assigned = Array(items.length).fill(-1);
        const available = new Set(slots);
        topologicalOrder.forEach((node, orderIndex) => {
          const parents = incoming[node].filter(parent => assigned[parent] >= 0);
          let candidates = [...available].filter(slot =>
            parents.every(parent => comesBefore(positions[assigned[parent]], positions[slot]))
          );
          if (!candidates.length) candidates = [...available];
          const scored = candidates.map(slot => {
            const point = positions[slot];
            const parentDistance = parents.reduce((sum, parent) => {
              const parentPoint = positions[assigned[parent]];
              const distance = Math.hypot(parentPoint[0] - point[0], parentPoint[1] - point[1]);
              const shapePenalty = mode === "hex" &&
                !(Math.abs(parentPoint[0] - point[0]) === 1 && Math.abs(parentPoint[1] - point[1]) === 1)
                ? 5000
                : 0;
              return sum + distance + Math.max(0, distance - 2.2) * 20 + shapePenalty;
            }, 0);
            let crossings = 0;
            parents.forEach(parent => {
              sourceEdges.forEach(([from, to]) => {
                if (assigned[from] < 0 || assigned[to] < 0 || from === parent || to === parent) return;
                if (segmentsCross(
                  positions[assigned[parent]],
                  point,
                  positions[assigned[from]],
                  positions[assigned[to]],
                )) crossings += 1;
              });
            });
            const centerBias = parents.length
              ? 0
              : Math.abs(point[1] - 4) * 0.35 + point[0] * 0.15;
            const variantBias = ((slot * 17 + variant * 13 + orderIndex * 7) % 23) / 100;
            return { slot, score: crossings * 1000 + parentDistance * 12 + centerBias + variantBias };
          }).sort((a, b) => a.score - b.score || a.slot - b.slot);
          const choice = scored[Math.min(variant && orderIndex === 0 ? variant : 0, scored.length - 1)].slot;
          assigned[node] = choice;
          available.delete(choice);
        });
        let metrics = layoutMetrics(sourceEdges, assigned, positions, mode);
        if (metrics.directionErrors) {
          topologicalOrder.forEach((node, orderIndex) => { assigned[node] = slots[orderIndex]; });
          metrics = layoutMetrics(sourceEdges, assigned, positions, mode);
        }
        for (let pass = 0; pass < 6; pass += 1) {
          let improved = false;
          for (let left = 0; left < assigned.length; left += 1) {
            for (let right = left + 1; right < assigned.length; right += 1) {
              [assigned[left], assigned[right]] = [assigned[right], assigned[left]];
              const candidate = layoutMetrics(sourceEdges, assigned, positions, mode);
              if (candidate.directionErrors === 0 && candidate.score + 0.001 < metrics.score) {
                metrics = candidate;
                improved = true;
              } else {
                [assigned[left], assigned[right]] = [assigned[right], assigned[left]];
              }
            }
          }
          if (!improved) break;
        }
        const branchBonus = map === "branch" && Math.max(...adjacency.map(neighbors => neighbors.length)) >= 3 ? -12 : 0;
        const varietyBonus = mapIndex === groupIndex % 4 ? -2 : 0;
        return {
          map,
          positions,
          assigned,
          crossings: metrics.crossings,
          nodeObstructions: metrics.nodeObstructions,
          edgeShapeErrors: metrics.edgeShapeErrors,
          directionErrors: metrics.directionErrors,
          score: metrics.score + branchBonus + varietyBonus,
        };
      });
    });
  const chosen = layouts.sort((a, b) =>
    a.directionErrors - b.directionErrors ||
    a.edgeShapeErrors - b.edgeShapeErrors ||
    a.nodeObstructions - b.nodeObstructions ||
    a.crossings - b.crossings ||
    a.score - b.score
  )[0];
  const arrangedWords = Array(items.length);
  const oldToNew = new Map();
  chosen.assigned.forEach((slot, oldIndex) => {
    arrangedWords[slot] = items[oldIndex];
    oldToNew.set(oldIndex, slot);
  });
  const proposedEdges = sourceEdges.map(([from, to]) => [oldToNew.get(from), oldToNew.get(to)]);
  const edges = mode === "hex" ? [] : proposedEdges;
  const used = new Set(edges.map(edge => [...edge].sort((a, b) => a - b).join(":")));
  const degree = Array(items.length).fill(0);
  edges.forEach(([from, to]) => { degree[from] += 1; degree[to] += 1; });
  for (let left = 0; left < items.length; left += 1) {
    for (let right = left + 1; right < items.length; right += 1) {
      const key = `${left}:${right}`;
      if (used.has(key) || degree[left] >= 3 || degree[right] >= 3) continue;
      const rowDistance = Math.abs(chosen.positions[left][0] - chosen.positions[right][0]);
      const columnDistance = Math.abs(chosen.positions[left][1] - chosen.positions[right][1]);
      if (mode === "hex") {
        if (rowDistance !== 1 || columnDistance !== 1) continue;
      } else if (Math.hypot(rowDistance, columnDistance) > 1.6) continue;
      const first = comesBefore(chosen.positions[left], chosen.positions[right]) ? left : right;
      const second = first === left ? right : left;
      const firstBoundary = wordBoundary(arrangedWords[first]);
      const secondBoundary = wordBoundary(arrangedWords[second]);
      if (!firstBoundary.last || firstBoundary.last !== secondBoundary.first) continue;
      const crossesExisting = edges.some(([from, to]) => {
        if (from === first || from === second || to === first || to === second) return false;
        return segmentsCross(
          chosen.positions[first],
          chosen.positions[second],
          chosen.positions[from],
          chosen.positions[to],
        );
      });
      if (crossesExisting) continue;
      edges.push([first, second]);
      used.add(key);
      degree[left] += 1;
      degree[right] += 1;
    }
  }
  if (mode === "hex") {
    // The honeycomb board is a strict diamond lattice: every visible link must
    // occupy one diagonal lattice segment, never a free-angle shortcut.
    for (const [from, to] of proposedEdges) {
      const key = [from, to].sort((a, b) => a - b).join(":");
      if (used.has(key) || degree[from] >= 3 || degree[to] >= 3) continue;
      const a = chosen.positions[from];
      const b = chosen.positions[to];
      if (Math.abs(a[0] - b[0]) !== 1 || Math.abs(a[1] - b[1]) !== 1) continue;
      const first = comesBefore(a, b) ? from : to;
      const second = first === from ? to : from;
      const firstBoundary = wordBoundary(arrangedWords[first]);
      const secondBoundary = wordBoundary(arrangedWords[second]);
      if (!firstBoundary.last || firstBoundary.last !== secondBoundary.first) continue;
      edges.push([first, second]);
      used.add(key);
      degree[from] += 1;
      degree[to] += 1;
    }
  }
  if (disconnectedPartCount(items.length, edges) > MAX_DISCONNECTED_PARTS) {
    throw new Error("蜂の巣パズルのつながりを四つ以内にできませんでした。");
  }
  return { words: arrangedWords, edges, map: chosen.map };
}

function balancedSourcePartitions(adjacency) {
  const sourceCount = adjacency.length;
  if (!sourceCount) return [];
  const visited = new Set();
  const components = [];
  for (let start = 0; start < sourceCount; start += 1) {
    if (visited.has(start)) continue;
    const component = [];
    const queue = [start];
    visited.add(start);
    while (queue.length) {
      const current = queue.shift();
      component.push(current);
      adjacency[current].forEach(next => {
        if (visited.has(next)) return;
        visited.add(next);
        queue.push(next);
      });
    }
    components.push(component);
  }
  for (let groupCount = Math.max(1, Math.ceil(sourceCount / 18)); groupCount <= sourceCount; groupCount += 1) {
    const target = Math.ceil(sourceCount / groupCount);
    const chunks = components.flatMap(component => {
      const result = [];
      for (let index = 0; index < component.length; index += target) {
        result.push(component.slice(index, index + target));
      }
      return result;
    }).sort((a, b) => b.length - a.length);
    const buckets = Array.from({ length: groupCount }, () => ({ indices: [], chunks: 0 }));
    chunks.forEach(chunk => {
      const bucket = buckets
        .filter(candidate => candidate.indices.length + chunk.length <= target)
        .sort((a, b) => a.indices.length - b.indices.length || a.chunks - b.chunks)[0] ||
        buckets.sort((a, b) => a.indices.length - b.indices.length || a.chunks - b.chunks)[0];
      bucket.indices.push(...chunk);
      bucket.chunks += 1;
    });
    const estimatedSizes = buckets.map(bucket => bucket.indices.length + Math.max(0, bucket.chunks - 1));
    if (buckets.every(bucket => bucket.indices.length) && estimatedSizes.every(size => size <= 18)) {
      return buckets.map(bucket => new Set(bucket.indices));
    }
  }
  return Array.from({ length: sourceCount }, (_, index) => new Set([index]));
}

// A puzzle's edge graph may contain at most this many disconnected pieces
// (the main linked chain plus any words that could not be chained in).
const MAX_DISCONNECTED_PARTS = 4;

function linkedChainGroups(list, mode = "standard") {
  const size = mode === "hex" ? hexVertexPositions.length : 22;
  const source = list?.words?.length ? list.words : generatedSets.coffee;
  const puzzleSource = optimizedPuzzleSource(source, `${list.id}:${list.title}`);
  const sourceWords = seededShuffle(
    puzzleSource,
    `${list.id}:${list.title}:${source.length}`,
  );
  const sourceAlternatives = sourceWords.map(selected => {
    const original = source.find(item =>
      String(item[4] || item[0]) === String(selected[4] || selected[0]) &&
      String(item[3] || "") === String(selected[3] || "")
    );
    return original ? puzzleFormOptions(original) : [selected];
  });
  sourceWords.forEach((item, sourceIndex) => { item[5] = sourceIndex; });
  sourceAlternatives.forEach((options, sourceIndex) => {
    options.forEach(option => { option[5] = sourceIndex; });
  });
  const sourceKeys = new Set(sourceAlternatives.flat().map(item => `${item[0]}|${item[1]}`));
  const bridgePool = seededShuffle(
    [
      ...themedSupplementalPool(sourceWords)
        .flatMap(puzzleFormOptions)
        .filter(item => !sourceKeys.has(`${item[0]}|${item[1]}`)),
    ],
    `${list.id}:bridges`,
  );
  const supplementUsage = new Map();
  const bridgePriority = candidate =>
    (sourceKeys.has(`${candidate[0]}|${candidate[1]}`) ? -20 : 0) +
    (supplementUsage.get(candidate[0]) || 0) * 30;
  const adjacency = Array.from({ length: sourceWords.length }, () => []);
  for (let left = 0; left < sourceWords.length; left += 1) {
    for (let right = left + 1; right < sourceWords.length; right += 1) {
      if (!sourceAlternatives[left].some(leftOption =>
        sourceAlternatives[right].some(rightOption =>
          compatibleDirection(leftOption, rightOption)
        )
      )) continue;
      adjacency[left].push(right);
      adjacency[right].push(left);
    }
  }
  const directAdjacency = adjacency.map(neighbors => [...neighbors]);
  const connectivityWords = [...sourceWords, ...bridgePool];
  const connectivityComponents = Array(connectivityWords.length).fill(-1);
  let componentId = 0;
  for (let start = 0; start < connectivityWords.length; start += 1) {
    if (connectivityComponents[start] >= 0) continue;
    const queue = [start];
    connectivityComponents[start] = componentId;
    while (queue.length) {
      const current = queue.shift();
      for (let next = 0; next < connectivityWords.length; next += 1) {
        if (
          connectivityComponents[next] >= 0 ||
          next === current ||
          !compatibleDirection(connectivityWords[current], connectivityWords[next])
        ) continue;
        connectivityComponents[next] = componentId;
        queue.push(next);
      }
    }
    componentId += 1;
  }
  for (let left = 0; left < sourceWords.length; left += 1) {
    for (let right = left + 1; right < sourceWords.length; right += 1) {
      if (
        connectivityComponents[left] !== connectivityComponents[right] ||
        adjacency[left].includes(right)
      ) continue;
      adjacency[left].push(right);
      adjacency[right].push(left);
    }
  }
  const groups = [];

  const makeGroup = (sourcePool, targetSourceCount) => {
    const currentDegree = index => directAdjacency[index].reduce((count, neighbor) => count + Number(sourcePool.has(neighbor)), 0);
    const seed = [...sourcePool].sort((a, b) => currentDegree(b) - currentDegree(a) || a - b)[0];
    sourcePool.delete(seed);
    const groupWords = [[...sourceWords[seed]]];
    const treeEdges = [];
    let sourceCount = 1;
    let unlinkedCount = 0;
    const localKeys = new Set(groupWords.map(item => `${item[0]}|${item[1]}`));
    const bridgeBlocked = candidate => {
      const key = `${candidate[0]}|${candidate[1]}`;
      return localKeys.has(key) || [...sourcePool].some(index =>
        sourceAlternatives[index].some(option => `${option[0]}|${option[1]}` === key)
      );
    };
    while (groupWords.length < size && sourceCount < targetSourceCount) {
      if (unlinkedCount < MAX_DISCONNECTED_PARTS - 1 && sourceCount === targetSourceCount - 1) {
        const detachedSourceIndex = [...sourcePool]
          .filter(index => currentDegree(index) === 0)
          .sort((a, b) => a - b)[0];
        if (Number.isInteger(detachedSourceIndex)) {
          const detachedCandidate = sourceAlternatives[detachedSourceIndex][0];
          sourcePool.delete(detachedSourceIndex);
          groupWords.push([...detachedCandidate]);
          localKeys.add(`${detachedCandidate[0]}|${detachedCandidate[1]}`);
          sourceCount += 1;
          unlinkedCount += 1;
          continue;
        }
      }
      const directOptions = [...sourcePool].flatMap(sourceIndex =>
        sourceAlternatives[sourceIndex].flatMap(candidate =>
          availableParentIndices(groupWords, groupWords.length, mode).flatMap(parentIndex => {
            const parentWord = groupWords[parentIndex];
            const direction = placementDirection(
              parentWord,
              candidate,
              parentIndex,
              groupWords.length,
              mode,
            );
            return direction ? [{
              sourceIndex,
              parentIndex,
              direction,
              degree: currentDegree(sourceIndex),
              candidate,
            }] : [];
          })
        )
      ).sort((a, b) => a.degree - b.degree || a.sourceIndex - b.sourceIndex);
      let selection = directOptions[0];
      let picked;
      if (selection) {
        sourcePool.delete(selection.sourceIndex);
        picked = [...selection.candidate];
        sourceCount += 1;
      } else {
        if (unlinkedCount < MAX_DISCONNECTED_PARTS - 1 && sourcePool.size) {
          const detachedSourceIndex = [...sourcePool]
            .sort((a, b) => currentDegree(b) - currentDegree(a) || a - b)[0];
          const detachedCandidate = sourceAlternatives[detachedSourceIndex]
            .sort((a, b) => {
              const aConnections = [...sourcePool].reduce((count, otherIndex) =>
                count + Number(sourceAlternatives[otherIndex].some(option =>
                  compatibleDirection(a, option)
                )), 0);
              const bConnections = [...sourcePool].reduce((count, otherIndex) =>
                count + Number(sourceAlternatives[otherIndex].some(option =>
                  compatibleDirection(b, option)
                )), 0);
              return bConnections - aConnections;
            })[0];
          sourcePool.delete(detachedSourceIndex);
          groupWords.push([...detachedCandidate]);
          localKeys.add(`${detachedCandidate[0]}|${detachedCandidate[1]}`);
          sourceCount += 1;
          unlinkedCount += 1;
          continue;
        }
        const bridgeOptions = bridgePool.flatMap((candidate, bridgeIndex) => {
          if (bridgeBlocked(candidate)) return [];
          return availableParentIndices(groupWords, groupWords.length, mode).flatMap(parentIndex => {
            const parentWord = groupWords[parentIndex];
            const direction = placementDirection(
              parentWord,
              candidate,
              parentIndex,
              groupWords.length,
              mode,
            );
            if (!direction) return [];
            const unlock = [...sourcePool].reduce((count, sourceIndex) =>
              count + Number(sourceAlternatives[sourceIndex].some(option =>
                compatibleDirection(candidate, option)
              )), 0);
            return [{ bridgeIndex, parentIndex, direction, unlock }];
          });
        }).sort((a, b) =>
          b.unlock - a.unlock ||
          bridgePriority(bridgePool[a.bridgeIndex]) -
          bridgePriority(bridgePool[b.bridgeIndex])
        );
        selection = bridgeOptions.find(option => option.unlock > 0);
        if (!selection && groupWords.length + 2 <= size) {
          const maximumDepth = size - groupWords.length - 1;
          const queue = bridgePool.flatMap((candidate, bridgeIndex) => {
            if (bridgeBlocked(candidate)) return [];
            return availableParentIndices(groupWords, groupWords.length, mode).flatMap(parentIndex => {
              const parentWord = groupWords[parentIndex];
              const direction = placementDirection(
                parentWord,
                candidate,
                parentIndex,
                groupWords.length,
                mode,
              );
              return direction ? [{ parentIndex, path: [{ bridgeIndex, direction }] }] : [];
            });
          }).sort((a, b) =>
            bridgePriority(bridgePool[a.path[0].bridgeIndex]) -
            bridgePriority(bridgePool[b.path[0].bridgeIndex])
          );
          const bestDepth = new Map();
          let bridgePath = null;
          while (queue.length && !bridgePath) {
            const state = queue.shift();
            const currentStep = state.path.at(-1);
            const currentWord = bridgePool[currentStep.bridgeIndex];
            const previousDepth = bestDepth.get(currentStep.bridgeIndex);
            if (previousDepth !== undefined && previousDepth <= state.path.length) continue;
            bestDepth.set(currentStep.bridgeIndex, state.path.length);
            const currentPosition = groupWords.length + state.path.length - 1;
            const nextPosition = currentPosition + 1;
            if ([...sourcePool].some(sourceIndex => sourceAlternatives[sourceIndex].some(option =>
              placementDirection(currentWord, option, currentPosition, nextPosition, mode)
            ))) {
              bridgePath = state;
              break;
            }
            if (state.path.length >= maximumDepth) continue;
            bridgePool.forEach((candidate, bridgeIndex) => {
              if (
                state.path.some(step => step.bridgeIndex === bridgeIndex) ||
                bridgeBlocked(candidate)
              ) return;
              const direction = placementDirection(
                currentWord,
                candidate,
                currentPosition,
                nextPosition,
                mode,
              );
              if (!direction) return;
              queue.push({
                parentIndex: state.parentIndex,
                path: [...state.path, { bridgeIndex, direction }],
              });
            });
          }
          if (bridgePath) {
            let parentIndex = bridgePath.parentIndex;
            bridgePath.path.forEach(step => {
              const candidate = [...bridgePool[step.bridgeIndex]];
              const newPosition = groupWords.length;
              groupWords.push(candidate);
              localKeys.add(`${candidate[0]}|${candidate[1]}`);
              supplementUsage.set(candidate[0], (supplementUsage.get(candidate[0]) || 0) + 1);
              treeEdges.push(step.direction === "forward"
                ? [parentIndex, newPosition]
                : [newPosition, parentIndex]);
              parentIndex = newPosition;
            });
            continue;
          }
        }
        if (!selection) break;
        picked = [...bridgePool[selection.bridgeIndex]];
        supplementUsage.set(picked[0], (supplementUsage.get(picked[0]) || 0) + 1);
      }
      const newIndex = groupWords.length;
      groupWords.push(picked);
      localKeys.add(`${picked[0]}|${picked[1]}`);
      treeEdges.push(selection.direction === "forward"
        ? [selection.parentIndex, newIndex]
        : [newIndex, selection.parentIndex]);
    }

    const minimumSize = 10;
    while (groupWords.length < minimumSize) {
      const bridgeOptions = bridgePool.flatMap((candidate, bridgeIndex) => {
        if (bridgeBlocked(candidate)) return [];
        return availableParentIndices(groupWords, groupWords.length, mode).flatMap(parentIndex => {
          const parentWord = groupWords[parentIndex];
          const direction = placementDirection(
            parentWord,
            candidate,
            parentIndex,
            groupWords.length,
            mode,
          );
          return direction ? [{ bridgeIndex, parentIndex, direction }] : [];
        });
      }).sort((a, b) =>
        bridgePriority(bridgePool[a.bridgeIndex]) -
        bridgePriority(bridgePool[b.bridgeIndex])
      );
      const selection = bridgeOptions[0];
      if (!selection) break;
      const picked = [...bridgePool[selection.bridgeIndex]];
      const newIndex = groupWords.length;
      groupWords.push(picked);
      localKeys.add(`${picked[0]}|${picked[1]}`);
      supplementUsage.set(picked[0], (supplementUsage.get(picked[0]) || 0) + 1);
      treeEdges.push(selection.direction === "forward"
        ? [selection.parentIndex, newIndex]
        : [newIndex, selection.parentIndex]);
    }

    const layout = layoutConnectedGroup(groupWords, treeEdges, groups.length, mode);
    groups.push({
      id: groups.length + 1,
      listId: list.id,
      title: list.title,
      words: layout.words,
      edges: layout.edges,
      sourceCount,
      unlinkedCount,
      map: layout.map,
    });
    return sourcePool;
  };

  const remaining = new Set(sourceWords.map((_, index) => index));
  const minimumGroupCount = Math.max(1, Math.ceil(sourceWords.length / size));
  for (let groupIndex = 0; groupIndex < minimumGroupCount && remaining.size; groupIndex += 1) {
    const groupsLeft = minimumGroupCount - groupIndex;
    const balancedTarget = Math.ceil(remaining.size / groupsLeft);
    const isolatedPressure = [...remaining].filter(sourceIndex =>
      !directAdjacency[sourceIndex].some(neighbor => remaining.has(neighbor))
    ).length;
    const sourceTarget = Math.min(
      remaining.size,
      size,
      balancedTarget + Math.max(0, isolatedPressure - groupsLeft),
    );
    makeGroup(remaining, sourceTarget);
  }
  const coveredSourceIds = new Set(groups.flatMap(group =>
    group.words.map(word => word[5]).filter(Number.isInteger)
  ));
  remaining.clear();
  sourceWords.forEach((_, sourceIndex) => {
    if (!coveredSourceIds.has(sourceIndex)) remaining.add(sourceIndex);
  });

  groups.forEach(group => {
    if (!remaining.size) return;
    for (let wordIndex = 0; wordIndex < group.words.length && remaining.size; wordIndex += 1) {
      if (Number.isInteger(group.words[wordIndex][5])) continue;
      const incoming = group.edges.filter(([, to]) => to === wordIndex);
      const outgoing = group.edges.filter(([from]) => from === wordIndex);
      const replacement = [...remaining].flatMap(sourceIndex =>
        sourceAlternatives[sourceIndex].flatMap(candidate => {
          const boundary = wordBoundary(candidate);
          const fits = incoming.every(([from]) =>
            wordBoundary(group.words[from]).last === boundary.first
          ) && outgoing.every(([, to]) =>
            boundary.last === wordBoundary(group.words[to]).first
          );
          return fits ? [{ sourceIndex, candidate }] : [];
        })
      )[0];
      if (!replacement) continue;
      group.words[wordIndex] = [...replacement.candidate];
      group.sourceCount += 1;
      remaining.delete(replacement.sourceIndex);
    }
  });

  groups.forEach(group => {
    while (remaining.size && group.words.length < size) {
      const connection = [...remaining].flatMap(sourceIndex =>
        sourceAlternatives[sourceIndex].flatMap(candidate =>
          availableParentIndices(group.words, group.words.length, mode).flatMap(parentIndex => {
            const parentWord = group.words[parentIndex];
            const direction = placementDirection(
              parentWord,
              candidate,
              parentIndex,
              group.words.length,
              mode,
            );
            return direction ? [{ sourceIndex, candidate, parentIndex, direction }] : [];
          })
        )
      )[0];
      if (!connection) break;
      const newIndex = group.words.length;
      const expandedWords = [...group.words, [...connection.candidate]];
      const expandedEdges = [...group.edges, connection.direction === "forward"
        ? [connection.parentIndex, newIndex]
        : [newIndex, connection.parentIndex]];
      const layout = layoutConnectedGroup(expandedWords, expandedEdges, group.id - 1, mode);
      group.words = layout.words;
      group.edges = layout.edges;
      group.map = layout.map;
      group.sourceCount += 1;
      remaining.delete(connection.sourceIndex);
    }
  });

  groups.forEach(group => {
    if (!remaining.size || (group.unlinkedCount || 0) >= MAX_DISCONNECTED_PARTS - 1) return;
    if (group.words.length < size) {
      const sourceIndex = [...remaining]
        .sort((a, b) => directAdjacency[a].length - directAdjacency[b].length || a - b)[0];
      const candidate = sourceAlternatives[sourceIndex]
        .sort((a, b) => {
          const aDegree = sourceWords.reduce((count, other) =>
            count + Number(Boolean(compatibleDirection(a, other))), 0);
          const bDegree = sourceWords.reduce((count, other) =>
            count + Number(Boolean(compatibleDirection(b, other))), 0);
          return bDegree - aDegree;
        })[0];
      group.words.push([...candidate]);
      group.sourceCount += 1;
      group.unlinkedCount = (group.unlinkedCount || 0) + 1;
      remaining.delete(sourceIndex);
      return;
    }
    const replaceableLeaf = group.words.map((word, wordIndex) => ({
      wordIndex,
      sourceIndex: word[5],
      incoming: group.edges.filter(([, to]) => to === wordIndex),
      outgoing: group.edges.filter(([from]) => from === wordIndex),
    })).reverse().find(candidate =>
      !Number.isInteger(candidate.sourceIndex) &&
      candidate.incoming.length + candidate.outgoing.length === 1
    );
    if (!replaceableLeaf) return;
    const sourceIndex = [...remaining]
      .sort((a, b) => directAdjacency[a].length - directAdjacency[b].length || a - b)[0];
    const candidate = sourceAlternatives[sourceIndex]
      .sort((a, b) => {
        const aDegree = sourceWords.reduce((count, other) =>
          count + Number(Boolean(compatibleDirection(a, other))), 0);
        const bDegree = sourceWords.reduce((count, other) =>
          count + Number(Boolean(compatibleDirection(b, other))), 0);
        return bDegree - aDegree;
      })[0];
    group.words[replaceableLeaf.wordIndex] = [...candidate];
    group.edges = group.edges.filter(([from, to]) =>
      from !== replaceableLeaf.wordIndex && to !== replaceableLeaf.wordIndex
    );
    group.sourceCount += 1;
    group.unlinkedCount = (group.unlinkedCount || 0) + 1;
    remaining.delete(sourceIndex);
  });

  // A vocabulary item must never create an otherwise unnecessary puzzle by
  // itself. After exhausting valid links and bridge words, use the spare
  // capacity in the minimum set of puzzles for the few genuinely isolated
  // entries — but never push a group past MAX_DISCONNECTED_PARTS disjoint
  // pieces.
  [...groups]
    .sort((a, b) => a.words.length - b.words.length || a.id - b.id)
    .forEach(group => {
      while (
        remaining.size &&
        group.words.length < size &&
        (group.unlinkedCount || 0) < MAX_DISCONNECTED_PARTS - 1
      ) {
        const sourceIndex = [...remaining][0];
        group.words.push([...sourceAlternatives[sourceIndex][0]]);
        group.sourceCount += 1;
        group.unlinkedCount = (group.unlinkedCount || 0) + 1;
        remaining.delete(sourceIndex);
      }
    });

  while (remaining.size) makeGroup(remaining, Math.min(remaining.size, size));
  groups.forEach(group => {
    group.sourceCount = new Set(
      group.words.map(word => word[5]).filter(Number.isInteger)
    ).size;
  });
  const playableGroups = groups.filter(group => group.words.length >= 10);
  const orphanGroups = groups.filter(group => group.words.length === 1);
  orphanGroups.forEach(orphan => {
    const target = playableGroups
      .filter(group =>
        (group.unlinkedCount || 0) < MAX_DISCONNECTED_PARTS - 1 &&
        group.words.length < size
      )
      .sort((a, b) =>
        (a.unlinkedCount || 0) - (b.unlinkedCount || 0) ||
        a.words.length - b.words.length ||
        a.id - b.id
      )[0];
    if (target) {
      target.words.push([...orphan.words[0]]);
      target.sourceCount += 1;
      target.unlinkedCount = (target.unlinkedCount || 0) + 1;
      orphan.words = [];
      return;
    }
    const holding = groups.find(group =>
      group.holding && group.words.length < MAX_DISCONNECTED_PARTS
    ) || (() => {
      const created = {
        id: groups.length + 1,
        listId: list.id,
        title: list.title,
        words: [],
        edges: [],
        sourceCount: 0,
        unlinkedCount: 0,
        map: mode === "hex" ? "honeycomb" : "diamond",
        holding: true,
      };
      groups.push(created);
      return created;
    })();
    holding.words.push([...orphan.words[0]]);
    holding.sourceCount += 1;
    holding.unlinkedCount = holding.words.length;
    orphan.words = [];
  });
  return groups
    .filter(group => group.words.length >= 10 || group.holding)
    .map((group, index) => ({ ...group, id: index + 1 }));
}

const puzzleGroupCache = new Map();
const linkedGeneralGroups = list => linkedChainGroups(list, "standard");

function incomingHexSlots(position) {
  return hexVertexPositions
    .map((_, index) => index)
    .filter(index => index < position && hexSlotsConnected(index, position));
}

function indexOptionsByFirst(options) {
  const index = new Map();
  options.forEach(option => {
    const first = wordBoundary(option.word).first;
    if (!first) return;
    if (!index.has(first)) index.set(first, []);
    index.get(first).push(option);
  });
  return index;
}

function buildHoneycombGroup({
  remaining,
  sourceVariants,
  sourceByFirst,
  sourceDifficulty,
  bridgeOptions,
  bridgeByFirst,
  bridgeUsage,
}) {
  const beamWidth = 72;
  const completed = [];
  let maximumLength = 0;
  const remainingFirstCounts = new Map([...sourceByFirst].map(([sound, options]) => [
    sound,
    new Set(options
      .filter(option => remaining.has(option.sourceIndex))
      .map(option => option.sourceIndex)).size,
  ]));
  const sourceUnlock = word => {
    const last = wordBoundary(word).last;
    return last ? (remainingFirstCounts.get(last) || 0) : 0;
  };
  const continuationMemo = new Map();
  const continuationScore = (word, steps) => {
    if (steps <= 0) return 1;
    const last = wordBoundary(word).last;
    const memoKey = `${last}:${steps}`;
    if (continuationMemo.has(memoKey)) return continuationMemo.get(memoKey);
    const nextWords = [
      ...(sourceByFirst.get(last) || [])
        .filter(option => remaining.has(option.sourceIndex))
        .map(option => option.word),
      ...(bridgeByFirst.get(last) || []).map(option => option.word),
    ];
    const score = nextWords.reduce((best, nextWord) =>
      Math.max(best, continuationScore(nextWord, steps - 1)), 0);
    continuationMemo.set(memoKey, score);
    return score;
  };
  const bridgeKey = word => `${word[0]}|${word[1]}`;
  const stateScore = state => {
    const nextPosition = state.words.length;
    const frontierUnlock = nextPosition >= hexVertexPositions.length ? 0 :
      incomingHexSlots(nextPosition).reduce((sum, parentIndex) =>
        sum + sourceUnlock(state.words[parentIndex]), 0);
    return state.sourceIds.size * 1000000 +
      Math.min(state.words.length, 12) * 5000 +
      state.hardness * 5000 + state.productivity * 1200 + frontierUnlock * 80 -
      state.supplementCount * 900 - state.repeatPenalty * 80 -
      state.rootCount * 12;
  };
  let beam = [{
    words: [],
    edges: [],
    sourceIds: new Set(),
    localBridgeCounts: new Map(),
    rootCount: 0,
    supplementCount: 0,
    repeatPenalty: 0,
    hardness: 0,
    productivity: 0,
  }];

  for (let position = 0; position < hexVertexPositions.length && beam.length; position += 1) {
    const nextBeam = [];
    beam.forEach(state => {
      if (state.words.length >= 12 && state.sourceIds.size) completed.push(state);
      const parentIndices = incomingHexSlots(position);
      const currentParts = disconnectedPartCount(state.words.length, state.edges);
      const matchingParents = candidate => {
        const first = wordBoundary(candidate).first;
        return parentIndices.filter(parentIndex =>
          wordBoundary(state.words[parentIndex]).last === first
        );
      };
      const candidates = new Map();
      const addCandidate = (type, word, sourceIndex = null, reuseSourceIndex = null) => {
        if (type === "source" && (!remaining.has(sourceIndex) || state.sourceIds.has(sourceIndex))) return;
        if (type === "bridge" && Number.isInteger(reuseSourceIndex) && remaining.has(reuseSourceIndex)) return;
        const key = type === "source"
          ? `s:${sourceIndex}:${word[0]}:${word[1]}`
          : `b:${bridgeKey(word)}`;
        if (type === "bridge" && (state.localBridgeCounts.get(bridgeKey(word)) || 0) >= 2) return;
        const parents = matchingParents(word);
        if (!parents.length && currentParts >= MAX_DISCONNECTED_PARTS) return;
        const unlock = sourceUnlock(word);
        const last = wordBoundary(word).last;
        const productivity = unlock + Math.min(4, (bridgeByFirst.get(last) || []).length) * 0.35;
        const stepsRemaining = position < 12 ? 2 - (position % 3) : 0;
        const continuation = continuationScore(word, stepsRemaining);
        if (stepsRemaining && !continuation) return;
        const difficulty = type === "source" ? (sourceDifficulty[sourceIndex] || 0) : 0;
        const usage = type === "bridge" ? (bridgeUsage.get(bridgeKey(word)) || 0) : 0;
        const candidate = { type, word, sourceIndex, parents, unlock, productivity, continuation, difficulty, usage };
        const previous = candidates.get(key);
        if (!previous || candidate.parents.length > previous.parents.length) candidates.set(key, candidate);
      };

      parentIndices.forEach(parentIndex => {
        const sound = wordBoundary(state.words[parentIndex]).last;
        (sourceByFirst.get(sound) || []).forEach(option =>
          addCandidate("source", option.word, option.sourceIndex)
        );
        (bridgeByFirst.get(sound) || []).forEach(option =>
          addCandidate("bridge", option.word, null, option.reuseSourceIndex)
        );
      });

      const hasLinkedCandidate = [...candidates.values()].some(candidate => candidate.parents.length);
      const requiredRoot = position < 12 && position % 3 === 0;
      if (currentParts < MAX_DISCONNECTED_PARTS && !hasLinkedCandidate && requiredRoot) {
        const unusedSources = [...remaining].filter(sourceIndex => !state.sourceIds.has(sourceIndex));
        const difficultRoots = [...unusedSources]
          .sort((a, b) => sourceDifficulty[a] - sourceDifficulty[b] || a - b)
          .slice(0, 5);
        const productiveRoots = [...unusedSources]
          .flatMap(sourceIndex => sourceVariants[sourceIndex].map(word => ({ sourceIndex, word, unlock: sourceUnlock(word) })))
          .sort((a, b) => b.unlock - a.unlock || sourceDifficulty[a.sourceIndex] - sourceDifficulty[b.sourceIndex])
          .slice(0, 5);
        difficultRoots.forEach(sourceIndex =>
          sourceVariants[sourceIndex].slice(0, 2).forEach(word => addCandidate("source", word, sourceIndex))
        );
        productiveRoots.forEach(option => addCandidate("source", option.word, option.sourceIndex));
        [...bridgeOptions]
          .sort((a, b) =>
            sourceUnlock(b.word) - sourceUnlock(a.word) ||
            (bridgeUsage.get(bridgeKey(a.word)) || 0) - (bridgeUsage.get(bridgeKey(b.word)) || 0)
          )
          .slice(0, 10)
          .forEach(option => addCandidate("bridge", option.word, null, option.reuseSourceIndex));
      }

      const ranked = [...candidates.values()].sort((a, b) =>
        Number(b.type === "source") - Number(a.type === "source") ||
        b.continuation - a.continuation ||
        a.difficulty - b.difficulty || b.unlock - a.unlock ||
        a.usage - b.usage || String(a.word[0]).localeCompare(String(b.word[0]), "ja")
      );
      const sourceChildren = ranked.filter(candidate => candidate.type === "source" && candidate.parents.length).slice(0, 14);
      const sourceRoots = ranked.filter(candidate => candidate.type === "source" && !candidate.parents.length).slice(0, 8);
      const bridges = ranked.filter(candidate => candidate.type === "bridge").slice(0, 8);
      [...sourceChildren, ...sourceRoots, ...bridges].forEach(candidate => {
        const sourceIds = new Set(state.sourceIds);
        const localBridgeCounts = new Map(state.localBridgeCounts);
        let hardness = state.hardness;
        let supplementCount = state.supplementCount;
        let repeatPenalty = state.repeatPenalty;
        let productivity = state.productivity;
        if (candidate.type === "source") {
          sourceIds.add(candidate.sourceIndex);
          hardness += 1 / (1 + candidate.difficulty);
        } else {
          const key = bridgeKey(candidate.word);
          localBridgeCounts.set(key, (localBridgeCounts.get(key) || 0) + 1);
          supplementCount += 1;
          repeatPenalty += candidate.usage;
        }
        productivity += candidate.productivity;
        nextBeam.push({
          words: [...state.words, [...candidate.word]],
          edges: [...state.edges, ...candidate.parents.map(parentIndex => [parentIndex, position])],
          sourceIds,
          localBridgeCounts,
          rootCount: state.rootCount + Number(candidate.parents.length === 0),
          supplementCount,
          repeatPenalty,
          hardness,
          productivity,
        });
        maximumLength = Math.max(maximumLength, position + 1);
      });
    });
    beam = nextBeam
      .sort((a, b) => stateScore(b) - stateScore(a))
      .slice(0, beamWidth);
  }
  beam.forEach(state => {
    if (state.words.length >= 12 && state.sourceIds.size) completed.push(state);
  });
  const chosen = completed
    .filter(state =>
      state.words.length >= 12 && state.words.length <= 16 &&
      disconnectedPartCount(state.words.length, state.edges) <= MAX_DISCONNECTED_PARTS
    )
    .sort((a, b) =>
      b.sourceIds.size - a.sourceIds.size ||
      b.hardness - a.hardness ||
      a.supplementCount - b.supplementCount ||
      a.repeatPenalty - b.repeatPenalty ||
      b.words.length - a.words.length ||
      a.rootCount - b.rootCount
    )[0];
  if (!chosen) throw new Error(`蜂の巣パズルを12語以上で組み立てられませんでした（${maximumLength}語）。`);
  chosen.localBridgeCounts.forEach((count, key) =>
    bridgeUsage.set(key, (bridgeUsage.get(key) || 0) + count)
  );
  return chosen;
}

function buildHoneycombGroupByChains({
  remaining,
  sourceVariants,
  sourceDifficulty,
  bridgeOptions,
  bridgeUsage,
}) {
  const bridgeKey = word => `${word[0]}|${word[1]}`;
  const usedSourceIds = new Set();
  const localBridgeCounts = new Map();
  const chains = [];

  const availableCandidates = () => {
    const candidates = [];
    [...remaining].forEach(sourceIndex => {
      if (usedSourceIds.has(sourceIndex)) return;
      sourceVariants[sourceIndex].forEach(word => candidates.push({
        type: "source",
        sourceIndex,
        word,
        difficulty: sourceDifficulty[sourceIndex] || 0,
        usage: 0,
      }));
    });
    bridgeOptions.forEach(option => {
      if (
        Number.isInteger(option.reuseSourceIndex) &&
        remaining.has(option.reuseSourceIndex) &&
        !usedSourceIds.has(option.reuseSourceIndex)
      ) return;
      const key = bridgeKey(option.word);
      const localLimit = Number.isInteger(option.reuseSourceIndex) ? 1 : 2;
      if ((localBridgeCounts.get(key) || 0) >= localLimit) return;
      candidates.push({
        type: "bridge",
        sourceIndex: null,
        word: option.word,
        difficulty: 0,
        usage: bridgeUsage.get(key) || 0,
      });
    });
    return candidates;
  };

  const selectChain = requireSource => {
    const candidates = availableCandidates();
    const byFirst = new Map();
    candidates.forEach(candidate => {
      const first = wordBoundary(candidate.word).first;
      if (!first) return;
      if (!byFirst.has(first)) byFirst.set(first, []);
      byFirst.get(first).push(candidate);
    });
    const candidateRank = (a, b) =>
      Number(b.type === "source") - Number(a.type === "source") ||
      a.difficulty - b.difficulty || a.usage - b.usage;
    byFirst.forEach(options => options.sort(candidateRank));
    const sourceRoots = candidates.filter(candidate => candidate.type === "source").sort(candidateRank).slice(0, 180);
    const bridgeRoots = candidates.filter(candidate => candidate.type === "bridge").sort(candidateRank).slice(0, 60);
    const roots = [...sourceRoots, ...bridgeRoots]
      .filter(root => (byFirst.get(wordBoundary(root.word).last) || []).length);
    const makeState = root => {
      const sourceIds = new Set();
      const bridgeCounts = new Map(localBridgeCounts);
      if (root.type === "source") sourceIds.add(root.sourceIndex);
      else {
        const key = bridgeKey(root.word);
        bridgeCounts.set(key, (bridgeCounts.get(key) || 0) + 1);
      }
      return {
        sequence: [root],
        sourceIds,
        bridgeCounts,
        hardness: root.type === "source" ? 1 / (1 + root.difficulty) : 0,
        repeatPenalty: root.type === "bridge" ? root.usage : 0,
      };
    };
    const stateScore = state =>
      state.sourceIds.size * 1000000 +
      state.hardness * 12000 -
      state.repeatPenalty * 120;
    let beam = roots.map(makeState);
    for (let depth = 1; depth < 4 && beam.length; depth += 1) {
      const next = [];
      beam.forEach(state => {
        const lastSound = wordBoundary(state.sequence.at(-1).word).last;
        const options = (byFirst.get(lastSound) || []).slice(0, 24);
        options.forEach(candidate => {
          if (candidate.type === "source" && state.sourceIds.has(candidate.sourceIndex)) return;
          const sourceIds = new Set(state.sourceIds);
          const bridgeCounts = new Map(state.bridgeCounts);
          let hardness = state.hardness;
          let repeatPenalty = state.repeatPenalty;
          if (candidate.type === "source") {
            sourceIds.add(candidate.sourceIndex);
            hardness += 1 / (1 + candidate.difficulty);
          } else {
            const key = bridgeKey(candidate.word);
            bridgeCounts.set(key, (bridgeCounts.get(key) || 0) + 1);
            if (bridgeCounts.get(key) > 2) return;
            repeatPenalty += candidate.usage;
          }
          if (depth < 3 && !(byFirst.get(wordBoundary(candidate.word).last) || []).length) return;
          next.push({
            sequence: [...state.sequence, candidate],
            sourceIds,
            bridgeCounts,
            hardness,
            repeatPenalty,
          });
        });
      });
      beam = next.sort((a, b) => stateScore(b) - stateScore(a)).slice(0, 700);
    }
    const best = beam
      .filter(state => state.sequence.length === 4 && (!requireSource || state.sourceIds.size))
      .sort((a, b) => stateScore(b) - stateScore(a))[0];
    return best ? {
      sequence: best.sequence,
      sourceIds: [...best.sourceIds],
      score: stateScore(best),
    } : null;
  };

  for (let chainIndex = 0; chainIndex < 3; chainIndex += 1) {
    const availableSourceCount = [...remaining].filter(index => !usedSourceIds.has(index)).length;
    const selection = selectChain(availableSourceCount > 0);
    if (!selection) throw new Error("三語の接続チェーンを作れませんでした。");
    selection.sourceIds.forEach(sourceIndex => usedSourceIds.add(sourceIndex));
    selection.sequence.filter(candidate => candidate.type === "bridge").forEach(candidate => {
      const key = bridgeKey(candidate.word);
      localBridgeCounts.set(key, (localBridgeCounts.get(key) || 0) + 1);
    });
    chains.push(selection.sequence);
  }

  const words = chains.flatMap(chain => chain.map(candidate => [...candidate.word]));
  const edges = chains.flatMap((_, chainIndex) => {
    const start = chainIndex * 4;
    return [[start, start + 1], [start + 1, start + 2], [start + 2, start + 3]];
  });

  const isolatedSource = [...remaining]
    .filter(sourceIndex => !usedSourceIds.has(sourceIndex))
    .sort((a, b) => sourceDifficulty[a] - sourceDifficulty[b] || a - b)[0];
  if (Number.isInteger(isolatedSource)) {
    const root = [...sourceVariants[isolatedSource]]
      .sort((a, b) => {
        const aLast = wordBoundary(a).last;
        const bLast = wordBoundary(b).last;
        const aOptions = availableCandidates().filter(candidate => wordBoundary(candidate.word).first === aLast).length;
        const bOptions = availableCandidates().filter(candidate => wordBoundary(candidate.word).first === bLast).length;
        return bOptions - aOptions;
      })[0];
    words.push([...root]);
    usedSourceIds.add(isolatedSource);
    while (words.length < 16) {
      const parentIndex = words.length - 1;
      const last = wordBoundary(words[parentIndex]).last;
      const candidate = availableCandidates()
        .filter(option => wordBoundary(option.word).first === last)
        .sort((a, b) =>
          Number(b.type === "source") - Number(a.type === "source") ||
          a.difficulty - b.difficulty || a.usage - b.usage
        )[0];
      if (!candidate) break;
      if (candidate.type === "source") usedSourceIds.add(candidate.sourceIndex);
      else {
        const key = bridgeKey(candidate.word);
        localBridgeCounts.set(key, (localBridgeCounts.get(key) || 0) + 1);
      }
      const newIndex = words.length;
      words.push([...candidate.word]);
      edges.push([parentIndex, newIndex]);
    }
  }

  if (!usedSourceIds.size) throw new Error("ことばリストの語を配置できませんでした。");
  localBridgeCounts.forEach((count, key) =>
    bridgeUsage.set(key, (bridgeUsage.get(key) || 0) + count)
  );
  return {
    words,
    edges,
    sourceIds: usedSourceIds,
    supplementCount: words.length - usedSourceIds.size,
    rootCount: disconnectedPartCount(words.length, edges),
  };
}

function absorbHoneycombSources(groups, remaining, sourceVariants) {
  let absorbed = 0;
  let changed = true;
  while (changed && remaining.size) {
    changed = false;
    for (const group of groups) {
      for (let wordIndex = 0; wordIndex < group.words.length && remaining.size; wordIndex += 1) {
        if (Number.isInteger(group.words[wordIndex][5])) continue;
        const incoming = group.edges.filter(([, to]) => to === wordIndex);
        const outgoing = group.edges.filter(([from]) => from === wordIndex);
        const replacement = [...remaining].flatMap(sourceIndex =>
          sourceVariants[sourceIndex].map(word => ({ sourceIndex, word }))
        ).find(candidate => {
          const boundary = wordBoundary(candidate.word);
          return incoming.every(([from]) =>
            wordBoundary(group.words[from]).last === boundary.first
          ) && outgoing.every(([, to]) =>
            boundary.last === wordBoundary(group.words[to]).first
          );
        });
        if (!replacement) continue;
        group.words[wordIndex] = [...replacement.word];
        remaining.delete(replacement.sourceIndex);
        group.sourceCount += 1;
        absorbed += 1;
        changed = true;
      }
      while (group.words.length < 16 && remaining.size) {
        const parentIndex = group.words.length === 12 ? null : group.words.length - 1;
        const last = parentIndex === null ? "" : wordBoundary(group.words[parentIndex]).last;
        const extensionOptions = [...remaining].flatMap(sourceIndex =>
          sourceVariants[sourceIndex].map(word => ({ sourceIndex, word }))
        );
        const extension = parentIndex === null
          ? extensionOptions[0]
          : extensionOptions.find(candidate => wordBoundary(candidate.word).first === last);
        if (!extension) break;
        const newIndex = group.words.length;
        group.words.push([...extension.word]);
        if (parentIndex !== null) group.edges.push([parentIndex, newIndex]);
        remaining.delete(extension.sourceIndex);
        group.sourceCount += 1;
        absorbed += 1;
        changed = true;
      }
    }
  }
  return absorbed;
}

function validGeneratedHoneycombGroup(group, listId) {
  if (group.words.length < 12 || group.words.length > 16) return false;
  if (disconnectedPartCount(group.words.length, group.edges) > MAX_DISCONNECTED_PARTS) return false;
  const positions = packedHexPositions(group.words.length, group.id, listId);
  if (positions.length !== group.words.length) return false;
  if (new Set(positions.map(position => position.join(","))).size !== positions.length) return false;
  const expectedEdges = [];
  for (let to = 1; to < group.words.length; to += 1) {
    if (Math.floor((to - 1) / 4) === Math.floor(to / 4)) expectedEdges.push([to - 1, to]);
  }
  const edgeKeys = new Set(group.edges.map(([from, to]) => `${from}:${to}`));
  if (edgeKeys.size !== expectedEdges.length) return false;
  return expectedEdges.every(([from, to]) => {
    const fromPosition = positions[from];
    const toPosition = positions[to];
    const diagonal = fromPosition && toPosition
      && Math.abs(fromPosition[0] - toPosition[0]) === 1
      && Math.abs(fromPosition[1] - toPosition[1]) === 1;
    return diagonal
      && edgeKeys.has(`${from}:${to}`)
      && wordBoundary(group.words[from]).last === wordBoundary(group.words[to]).first;
  });
}

function linkedStrictHoneycombGroups(list) {
  const source = list?.words?.length ? list.words : generatedSets.coffee;
  const sourceVariants = source.map((item, sourceIndex) =>
    puzzleFormOptions(item).map(word => {
      const tagged = [...word];
      tagged[5] = sourceIndex;
      return tagged;
    })
  );
  const sourceOptions = sourceVariants.flatMap((options, sourceIndex) =>
    options.map(word => ({ sourceIndex, word }))
  );
  const sourceDifficulty = sourceVariants.map((options, sourceIndex) => {
    const linked = new Set();
    options.forEach(option => {
      const boundary = wordBoundary(option);
      sourceOptions.forEach(other => {
        if (other.sourceIndex === sourceIndex) return;
        const otherBoundary = wordBoundary(other.word);
        if (boundary.last === otherBoundary.first || otherBoundary.last === boundary.first) {
          linked.add(other.sourceIndex);
        }
      });
    });
    return linked.size;
  });
  const seenBridges = new Set();
  const bridgeOptions = [
    ...sourceOptions.map(option => ({
      word: option.word.slice(0, 5),
      reuseSourceIndex: option.sourceIndex,
    })),
    ...themedSupplementalPool(source)
      .flatMap(puzzleFormOptions)
      .map(word => ({ word, reuseSourceIndex: null })),
  ]
    .filter(option => {
      const { word } = option;
      const key = `${word[0]}|${word[1]}`;
      if (seenBridges.has(key)) return false;
      seenBridges.add(key);
      return true;
    });
  const bridgeUsage = new Map();
  const remaining = new Set(source.map((_, sourceIndex) => sourceIndex));
  const groups = [];
  while (remaining.size) {
    let result;
    try {
      result = buildHoneycombGroupByChains({
        remaining,
        sourceVariants,
        sourceDifficulty,
        bridgeOptions,
        bridgeUsage,
      });
    } catch (error) {
      if (absorbHoneycombSources(groups, remaining, sourceVariants)) continue;
      throw new Error(`${error.message} 残り${remaining.size}語・${groups.length}パズル。`);
    }
    result.sourceIds.forEach(sourceIndex => remaining.delete(sourceIndex));
    groups.push({
      id: groups.length + 1,
      listId: list.id,
      title: list.title,
      words: result.words,
      edges: result.edges,
      sourceCount: result.sourceIds.size,
      unlinkedCount: disconnectedPartCount(result.words.length, result.edges) - 1,
      map: "honeycomb",
    });
    absorbHoneycombSources(groups, remaining, sourceVariants);
  }
  const sourceOccurrences = groups.flatMap(group =>
    group.words.map(word => word[5]).filter(Number.isInteger)
  );
  const covered = new Set(sourceOccurrences);
  const invalidGroup = groups.some(group => !validGeneratedHoneycombGroup(group, list.id));
  if (covered.size !== source.length || sourceOccurrences.length !== source.length || invalidGroup) {
    throw new Error("ことばリストの全語をパズルへ収録できませんでした。");
  }
  return groups;
}

function linkedHoneycombGroups(list) {
  const source = list?.words?.length ? list.words : generatedSets.coffee;
  if (list?.tutorial) {
    return [{
      id: 1,
      listId: list.id,
      title: list.title,
      words: source.map(item => [...item]),
      edges: TUTORIAL_EDGES.map(edge => [...edge]),
      sourceCount: source.length,
      unlinkedCount: 0,
      map: "honeycomb",
    }];
  }
  return linkedStrictHoneycombGroups(list);
}

function puzzleGroups(list = currentVocabulary()) {
  const mapMode = list.mapMode === "hex" ? "hex" : "standard";
  const signature = `${mapMode}:${list.id}:${list.words.map(item =>
    `${item[0]}/${item[1]}/${item[4] || ""}`
  ).join("|")}`;
  const cached = puzzleGroupCache.get(signature);
  if (cached) return cached;
  const groups = mapMode === "hex"
    ? linkedHoneycombGroups(list)
    : linkedGeneralGroups(list);
  puzzleGroupCache.set(signature, groups);
  return groups;
}

function renderEditorRows() {
  el("editor-rows").innerHTML = currentGeneratedList.map(([word, reading, romaji, meaning, form = word], index) => `
    <div class="editor-row" data-editor-row data-romaji="${escapeHtml(romaji)}" data-form="${escapeHtml(form)}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <input value="${escapeHtml(word)}" aria-label="${index + 1}ばんのことば">
      <input value="${escapeHtml(reading)}" aria-label="${index + 1}ばんのよみ">
      <input value="${escapeHtml(meaning)}" aria-label="${index + 1}ばんのいみ">
      <button type="button" data-remove-word aria-label="${index + 1}ばんをけす">×</button>
    </div>
  `).join("");
  document.querySelectorAll("[data-remove-word]").forEach(button => button.addEventListener("click", () => {
    button.closest("[data-editor-row]").remove();
    [...document.querySelectorAll("[data-editor-row]")].forEach((row, index) => {
      row.querySelector("span").textContent = String(index + 1).padStart(2, "0");
    });
  }));
}

function openEditor() {
  renderEditorRows();
  pendingListMapMode = currentVocabulary().mapMode === "hex" ? "hex" : "standard";
  document.querySelectorAll("[data-list-map]").forEach(button => {
    const activeButton = button.dataset.listMap === pendingListMapMode;
    button.classList.toggle("active", activeButton);
    button.setAttribute("aria-pressed", activeButton ? "true" : "false");
  });
  el("editor-modal").hidden = false;
}

function saveEditedWords() {
  const edited = [...document.querySelectorAll("[data-editor-row]")].map(row => {
    const inputs = row.querySelectorAll("input");
    const word = inputs[0].value.trim();
    const reading = inputs[1].value.trim();
    const meaning = inputs[2].value.trim();
    return word && reading ? [word, reading, row.dataset.romaji || kanaToRomaji(reading), meaning || "いみを追加", row.dataset.form || word] : null;
  }).filter(Boolean);
  if (!edited.length) return;
  currentGeneratedList = edited;
  const list = currentVocabulary();
  list.words = edited;
  list.mapMode = pendingListMapMode;
  betaMapMode = pendingListMapMode;
  puzzleGroupCache.clear();
  renderGenerated();
  renderCards();
  el("editor-modal").hidden = true;
  scheduleAutoSave();
}

function openPuzzleSetup(id) {
  const groups = puzzleGroups(currentVocabulary());
  pendingPuzzleId = Math.min(Math.max(1, id), groups.length);
  const group = groups[pendingPuzzleId - 1];
  selectedMap = group.map || selectedMap;
  el("map-preview").dataset.map = selectedMap;
  el("auto-map-name").textContent = betaMapMode === "hex" ? "β・はちのす" : ({
    honeycomb: "はちのす",
    diamond: "ひしがた",
    branch: "えだ",
    spiral: "うず",
    wave: "なみ",
  })[selectedMap] || "オート";
  el("setup-title").textContent = `${group.title}・パズル ${String(pendingPuzzleId).padStart(2, "0")}`;
  el("setup-modal").hidden = false;
  renderMapPreview(group);
}

function inputAsUrl(value) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(?:[/?#].*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return "";
}

function saveSnapshot() {
  return {
    version: 2,
    topic: el("topic").value,
    generatedList: currentGeneratedList,
    generatedTitle: currentGeneratedTitle,
    generatedSource: currentGeneratedSource,
    vocabularyLists,
    activeListId,
    activeWords,
    activeEdges,
    active,
    difficulty,
    endingMode,
    readingMode,
    betaMapMode,
    theme,
    selectedMap,
    order,
    completed,
    completionRecords,
    puzzleGenerationVersion: PUZZLE_GENERATION_VERSION,
    savedAt: new Date().toISOString(),
  };
}

function validSavedOrder(value) {
  return Array.isArray(value) &&
    value.length === activeWords.length &&
    new Set(value).size === activeWords.length &&
    value.every(wordId => Number.isInteger(wordId) && wordId >= 0 && wordId < activeWords.length);
}

function validGeneratedList(value) {
  return Array.isArray(value) && value.length > 0 &&
    value.every(item => Array.isArray(item) && item.length >= 4 && item.slice(0, 4).every(part => typeof part === "string"));
}

function restoreSnapshot(save) {
  if (!save || typeof save !== "object") throw new Error("セーブデータを読みこめませんでした。");
  autoSaveReady = false;
  const legacySpiralSave = save.selectedMap === "spiral";
  const stalePuzzleSave = save.puzzleGenerationVersion !== PUZZLE_GENERATION_VERSION;
  difficulty = Object.hasOwn(fixedByDifficulty, save.difficulty) ? save.difficulty : "normal";
  endingMode = ["shown", "hidden"].includes(save.endingMode) ? save.endingMode : "shown";
  readingMode = ["hiragana", "romaji"].includes(save.readingMode) ? save.readingMode : "hiragana";
  betaMapMode = ["standard", "hex"].includes(save.betaMapMode) ? save.betaMapMode : "hex";
  theme = ["dark", "light"].includes(save.theme) ? save.theme : "dark";
  selectedMap = !legacySpiralSave && !stalePuzzleSave && Object.hasOwn(mapPositions, save.selectedMap)
    ? save.selectedMap
    : "honeycomb";
  if (Array.isArray(save.vocabularyLists)) {
    const restoredLists = save.vocabularyLists.filter(list =>
      list && typeof list.id === "string" && typeof list.title === "string" && validGeneratedList(list.words)
    ).map(list => ({
      id: list.id,
      title: compactTopicTitle(list.title),
      source: typeof list.source === "string" ? list.source : "",
      tutorial: Boolean(list.tutorial),
      mapMode: list.tutorial
        ? "hex"
        : (["standard", "hex"].includes(list.mapMode) ? list.mapMode : "hex"),
      words: list.words.map(item => item.slice(0, 5)),
      createdAt: Number(list.createdAt) || Date.now(),
    }));
    vocabularyLists = [
      tutorialVocabulary(),
      ...restoredLists.filter(list => !list.tutorial && list.id !== TUTORIAL_LIST_ID),
    ];
  } else if (validGeneratedList(save.generatedList)) {
    currentGeneratedList = save.generatedList.map(item => item.slice(0, 4));
    currentGeneratedTitle = typeof save.generatedTitle === "string" ? save.generatedTitle : "ほぞんしたことば";
    currentGeneratedSource = typeof save.generatedSource === "string" ? save.generatedSource : "";
    vocabularyLists = [
      tutorialVocabulary(),
      {
        id: "saved-list",
        title: compactTopicTitle(currentGeneratedTitle),
        source: currentGeneratedSource,
        tutorial: false,
        mapMode: "hex",
        words: currentGeneratedList,
        createdAt: Date.now(),
      },
    ];
  }
  const savedActiveListId = save.activeListId === "tutorial-coffee"
    ? TUTORIAL_LIST_ID
    : save.activeListId;
  activeListId = vocabularyLists.some(list => list.id === savedActiveListId)
    ? savedActiveListId
    : vocabularyLists[0].id;
  activateVocabulary(activeListId);
  active = Number.isInteger(save.active) && save.active >= 1 && save.active <= puzzleGroups().length ? save.active : 1;
  completed = Array.isArray(save.completed)
    ? [...new Set(save.completed.filter(id =>
      (typeof id === "string" && id.length > 0) ||
      (Number.isInteger(id) && id >= 1 && id <= puzzleGroups().length)
    ))]
    : [];
  completionRecords = save.completionRecords && typeof save.completionRecords === "object"
    ? Object.fromEntries(Object.entries(save.completionRecords).filter(([, grade]) => ["blue", "gold"].includes(grade)))
    : Object.fromEntries(completed.map(id => [id, "blue"]));
  el("topic").value = typeof save.topic === "string" ? save.topic : "";
  const restoredGroup = puzzleGroups()[active - 1] || puzzleGroups()[0];
  if (legacySpiralSave || stalePuzzleSave) selectedMap = restoredGroup.map;
  activeWords = !legacySpiralSave && !stalePuzzleSave && validGeneratedList(save.activeWords)
    ? save.activeWords.map(item => item.slice(0, 5))
    : restoredGroup.words.map(item => [...item]);
  activeEdges = !legacySpiralSave && !stalePuzzleSave && Array.isArray(save.activeEdges)
    ? save.activeEdges.filter(edge => Array.isArray(edge) && edge.length === 2 && edge.every(index => Number.isInteger(index) && index >= 0 && index < activeWords.length))
    : (restoredGroup.edges || buildPuzzleEdges(activeWords, selectedMap));
  fixed = new Set(fixedByDifficulty[difficulty].filter(position => position < activeWords.length));
  allowedSignatures = computeAllowedSignatures();
  order = !legacySpiralSave && !stalePuzzleSave && validSavedOrder(save.order) ? [...save.order] : createShuffledOrder();
  selected = null;
  localStorage.setItem("kotonoha-completed", JSON.stringify(completed));
  localStorage.setItem("kotonoha-completion-records", JSON.stringify(completionRecords));
  localStorage.setItem("kotonoha-difficulty", difficulty);
  localStorage.setItem("kotonoha-ending", endingMode);
  localStorage.setItem("kotonoha-reading", readingMode);
  localStorage.setItem("kotonoha-beta-map", betaMapMode);
  localStorage.setItem("kotonoha-theme", theme);
  el("puzzle-number").textContent = `パズル ${String(active).padStart(2, "0")}`;
  el("puzzle-title").textContent = `${puzzleGroups()[active - 1]?.title || "ことば"}・その${active}`;
  el("puzzle-board").dataset.map = selectedMap;
  el("map-preview").dataset.map = selectedMap;
  applyTheme();
  updateReadingControls();
  updateDifficultyControls();
  updateEndingControls();
  updateBetaMapControls();
  renderGenerated();
  renderCards();
  renderBoard();
  autoSaveReady = true;
}

function setSaveAvailability(available) {
  hasSavedGame = available;
  el("load-game").disabled = !available;
  el("delete-save").disabled = !available;
}

const LOCAL_SAVE_KEYS = ["kotonoha-save", "kotonoha-save-backup"];

function readLocalSave(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

function localSavedGame() {
  return LOCAL_SAVE_KEYS
    .map(readLocalSave)
    .filter(Boolean)
    .sort((a, b) => saveTime(b) - saveTime(a))[0] || null;
}

function writeLocalSave(save) {
  const serialized = JSON.stringify(save);
  let stored = false;
  LOCAL_SAVE_KEYS.forEach(key => {
    try {
      localStorage.setItem(key, serialized);
      stored = true;
    } catch {
      // A second copy may still succeed when one entry is unavailable.
    }
  });
  return stored;
}

function removeLocalSave() {
  LOCAL_SAVE_KEYS.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Keep deletion best-effort on restricted browsers.
    }
  });
}

function saveTime(save) {
  const value = Date.parse(save?.savedAt || "");
  return Number.isFinite(value) ? value : 0;
}

async function apiJson(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "通信できませんでした。");
  return payload;
}

async function readSavedGame() {
  const localSave = localSavedGame();
  if (location.protocol === "file:" || !accountUser) return { save: localSave, local: true };
  try {
    const payload = await apiJson("./api/save", { cache: "no-store" });
    const remoteSave = payload.save;
    const save = saveTime(localSave) >= saveTime(remoteSave) ? localSave : remoteSave;
    if (save) writeLocalSave(save);
    return { ...payload, save, local: save === localSave };
  } catch {
    return { save: localSave, local: true };
  }
}

async function saveGame(silent = false) {
  const save = saveSnapshot();
  writeLocalSave(save);
  let synced = false;
  if (location.protocol !== "file:" && accountUser) {
    try {
      await apiJson("./api/save", {
        method: "POST",
        body: JSON.stringify({ save }),
      });
      synced = true;
    } catch {
      synced = false;
    }
  }
  setSaveAvailability(true);
  if (!silent || (accountUser && !synced)) {
    el("save-status").textContent = synced
      ? "この端末とクラウドにほぞんしました"
      : accountUser
        ? "この端末にほぞんしました。クラウドとはどうきできませんでした"
        : "この端末にほぞんしました";
  }
}

function scheduleAutoSave() {
  if (!autoSaveReady) return;
  writeLocalSave(saveSnapshot());
  setSaveAvailability(true);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveGame(true), 1200);
}

async function refreshSaveAvailability() {
  const payload = await readSavedGame();
  setSaveAvailability(Boolean(payload.save));
  el("save-status").textContent = payload.save ? "つづきからあそべます" : "セーブデータはありません";
  autoSaveReady = true;
}

async function loadSavedGame() {
  const status = el("save-status");
  status.textContent = "セーブデータを読みこんでいます";
  const payload = await readSavedGame();
  if (!payload.save) {
    setSaveAvailability(false);
    status.textContent = "セーブデータはありません";
    return;
  }
  try {
    restoreSnapshot(payload.save);
    status.textContent = "つづきからはじめました";
    el("game").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch {
    status.textContent = "セーブデータを読みこめませんでした";
  }
}

async function deleteSavedGame() {
  if (location.protocol !== "file:" && accountUser) {
    try {
      await apiJson("./api/save", { method: "DELETE" });
    } catch {
      // The local copy is still cleared below.
    }
  }
  removeLocalSave();
  setSaveAvailability(false);
  el("save-status").textContent = "セーブデータをけしました";
}

function renderAccountState() {
  const signedIn = Boolean(accountUser);
  el("account-signed-out").hidden = signedIn;
  el("account-signed-in").hidden = !signedIn;
  el("account-email-label").textContent = accountUser?.email || "";
  el("account-button").classList.toggle("signed-in", signedIn);
  el("account-button").textContent = signedIn ? "どうき中" : "人";
  el("account-button").setAttribute("aria-label", signedIn ? `${accountUser.email}でログイン中` : "アカウント");
}

async function syncAfterLogin() {
  const localSave = localSavedGame();
  const remote = await apiJson("./api/save", { cache: "no-store" });
  if (remote.save && saveTime(remote.save) > saveTime(localSave)) {
    writeLocalSave(remote.save);
    restoreSnapshot(remote.save);
    el("account-status").textContent = "クラウドの新しいデータをこの端末にどうきしました。";
  } else if (localSave) {
    await apiJson("./api/save", {
      method: "POST",
      body: JSON.stringify({ save: localSave }),
    });
    el("account-status").textContent = "この端末のデータをクラウドにどうきしました。";
  } else {
    el("account-status").textContent = "ログインしました。";
  }
  await refreshSaveAvailability();
}

async function submitAccount(action) {
  const email = el("account-email").value.trim();
  const password = el("account-password").value;
  const status = el("account-status");
  status.textContent = action === "register" ? "アカウントをつくっています…" : "ログインしています…";
  try {
    const payload = await apiJson(`./api/auth/${action}`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    accountUser = payload.user;
    el("account-password").value = "";
    renderAccountState();
    await syncAfterLogin();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "アカウントを操作できませんでした。";
  }
}

async function logoutAccount() {
  try {
    await apiJson("./api/auth/logout", { method: "POST" });
  } catch {
    // The local save remains usable even when the logout request fails.
  }
  accountUser = null;
  renderAccountState();
  el("account-status").textContent = "ログアウトしました。この端末のデータはそのまま使えます。";
  await refreshSaveAvailability();
}

async function initializePersistence() {
  renderAccountState();
  const localSave = localSavedGame();
  if (localSave) {
    try {
      restoreSnapshot(localSave);
      setSaveAvailability(true);
      el("save-status").textContent = "この端末のデータを読みこみました";
    } catch {
      setSaveAvailability(false);
      autoSaveReady = true;
    }
  } else {
    setSaveAvailability(false);
    el("save-status").textContent = "セーブデータはありません";
    autoSaveReady = true;
  }

  if (location.protocol !== "file:") {
    try {
      const payload = await apiJson("./api/auth/status", { cache: "no-store" });
      accountUser = payload.user;
    } catch {
      accountUser = null;
    }
  }
  renderAccountState();
  if (!accountUser) return;
  const payload = await readSavedGame();
  if (payload.save && saveTime(payload.save) > saveTime(localSave)) {
    try {
      restoreSnapshot(payload.save);
      setSaveAvailability(true);
      writeLocalSave(payload.save);
      el("save-status").textContent = "クラウドのデータを読みこみました";
      return;
    } catch {
      // Keep the page usable and allow a new local save if old data is invalid.
    }
  }
  autoSaveReady = true;
}

async function extractFromUrl(url) {
  const response = await fetch("./api/extract", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const payload = await response.json().catch(() => ({}));
  if (payload.pdf) return extractFromPdf(url);
  if (!response.ok) throw new Error(payload.error || "ページからことばを取り出せませんでした。");
  if (!Array.isArray(payload.words) || !payload.words.length) {
    throw new Error("かんじのことばを見つけられませんでした。");
  }
  currentGeneratedList = payload.words;
  currentGeneratedTitle = payload.title || "ページ";
  currentGeneratedSource = payload.sourceUrl || url;
  storeGeneratedList();
}

async function extractFromPdf(url) {
  const status = el("extract-status");
  status.textContent = "PDFをひらいて、ページのもじをよみこんでいます。";
  const pdfResponse = await fetch(`./api/pdf?url=${encodeURIComponent(url)}`);
  if (!pdfResponse.ok) {
    const payload = await pdfResponse.json().catch(() => ({}));
    throw new Error(payload.error || "PDFをよみこめませんでした。");
  }
  const pdfjs = await import("./vendor/pdf.min.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdf.worker.min.mjs", location.href).href;
  const documentTask = pdfjs.getDocument({ data: await pdfResponse.arrayBuffer() });
  const pdf = await documentTask.promise;
  const pageLimit = Math.min(pdf.numPages, 80);
  const pageTexts = [];
  for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
    status.textContent = `PDFのもじをよみこんでいます（${pageNumber} / ${pageLimit}ページ）`;
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageWidth = Math.abs((page.view?.[2] || 0) - (page.view?.[0] || 0));
    const allText = content.items.map(item => item.str || "").join(" ");
    const primaryItems = pageWidth
      ? content.items.filter(item => Number(item.transform?.[4] ?? pageWidth) < pageWidth * 0.45)
      : [];
    const secondaryItems = pageWidth
      ? content.items.filter(item => Number(item.transform?.[4] ?? 0) >= pageWidth * 0.45)
      : [];
    const primaryColumn = primaryItems.map(item => item.str || "").join(" ");
    const secondaryColumn = secondaryItems.map(item => item.str || "").join(" ");
    const count = (value, pattern) => value.match(pattern)?.length || 0;
    const leftKana = count(primaryColumn, /[\u3040-\u30ff]/g);
    const rightKana = count(secondaryColumn, /[\u3040-\u30ff]/g);
    const rightHan = count(secondaryColumn, /[\p{Script=Han}]/gu);
    const isBilingualWordList = leftKana >= 8 && rightHan >= 8 && rightKana * 3 < rightHan;
    // Bilingual word lists commonly place Japanese on the left and translations
    // on the right. In that layout, read only the Japanese source column.
    pageTexts.push(isBilingualWordList ? primaryColumn : allText);
  }
  const text = pageTexts.join("\n").slice(0, 1_500_000);
  if (!/[\p{Script=Han}々〆ヵヶ]/u.test(text)) {
    throw new Error("もじのないPDFです。がぞうだけのPDFには、もじのにんしきがひつようです。");
  }
  status.textContent = "PDFのことばとよみをしらべています。";
  const response = await fetch("./api/extract-text", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text,
      title: decodeURIComponent(new URL(url).pathname.split("/").pop() || "PDF"),
      sourceUrl: url,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "PDFからことばをとりだせませんでした。");
  currentGeneratedList = payload.words;
  currentGeneratedTitle = payload.title || "PDF";
  currentGeneratedSource = payload.sourceUrl || url;
  storeGeneratedList();
}

function storeGeneratedList() {
  const title = compactTopicTitle(currentGeneratedTitle);
  const sourceKey = currentGeneratedSource || `topic:${title}`;
  const existing = vocabularyLists.find(list => (list.source || `topic:${list.title}`) === sourceKey);
  const list = {
    id: existing?.id || `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    source: currentGeneratedSource,
    tutorial: false,
    mapMode: existing
      ? (existing.mapMode === "standard" ? "standard" : "hex")
      : "hex",
    words: currentGeneratedList.map(item => item.length >= 5 ? item.slice(0, 5) : [...item.slice(0, 4), item[0]]),
    createdAt: existing?.createdAt || Date.now(),
  };
  if (existing) vocabularyLists[vocabularyLists.indexOf(existing)] = list;
  else vocabularyLists.unshift(list);
  puzzleGroupCache.clear();
  activateVocabulary(list.id);
}

function soundUnits(reading) {
  const normalizedReading = [...String(reading || "").normalize("NFKC")]
    .map(character => {
      const code = character.charCodeAt(0);
      return code >= 0x30a1 && code <= 0x30f6
        ? String.fromCharCode(code - 0x60)
        : character;
    })
    .join("")
    .replace(/[^ぁ-ゖー]/g, "");
  const small = "ゃゅょぁぃぅぇぉゎ";
  const aRow = "あかさたなはまやらわがざだばぱ";
  const iRow = "いきしちにひみりぎじぢびぴ";
  const uRow = "うくすつぬふむゆるぐずづぶぷゔ";
  const oRow = "おこそとのほもよろをごぞどぼぽ";
  const eRow = "えけせてねへめれげぜでべぺ";
  const chars = [...normalizedReading];
  const units = [];
  for (let index = 0; index < chars.length; index += 1) {
    let unit = chars[index];
    if (small.includes(chars[index + 1])) unit += chars[++index];
    if (chars[index + 1] === "ー") {
      unit += "ː";
      index += 1;
    }
    const lastKana = unit.at(-1);
    const vowel =
      aRow.includes(lastKana) || lastKana === "ゃ" || lastKana === "ぁ" || lastKana === "ゎ" ? "a" :
      iRow.includes(lastKana) || lastKana === "ぃ" ? "i" :
      uRow.includes(lastKana) || lastKana === "ゅ" || lastKana === "ぅ" ? "u" :
      eRow.includes(lastKana) || lastKana === "ぇ" ? "e" :
      oRow.includes(lastKana) || lastKana === "ょ" || lastKana === "ぉ" ? "o" : "";
    const nextKana = chars[index + 1];
    const isLong =
      (vowel === "a" && nextKana === "あ") ||
      (vowel === "i" && nextKana === "い") ||
      (vowel === "u" && nextKana === "う") ||
      (vowel === "e" && (nextKana === "え" || nextKana === "い")) ||
      (vowel === "o" && (nextKana === "お" || nextKana === "う"));
    if (vowel === "a" && nextKana === "い") {
      unit += "い";
      index += 1;
    } else if (isLong) {
      unit += nextKana;
      index += 1;
    }
    if (chars[index + 1] === "ん") unit += chars[++index];
    units.push(unit);
  }
  return units;
}

function boundarySignature(wordId) {
  const units = soundUnits(activeWords[wordId]?.[1] || "");
  return `${units[0]}|${units.at(-1)}`;
}

function signatureParts(signature) {
  return signature.split("|");
}

function expandEquivalentComponentSolutions(allowed, signatures, edges) {
  const neighbors = Array.from({ length: signatures.length }, () => new Set());
  edges.forEach(([from, to]) => {
    neighbors[from]?.add(to);
    neighbors[to]?.add(from);
  });
  const unseen = new Set(signatures.map((_, position) => position));
  const components = [];
  while (unseen.size) {
    const start = unseen.values().next().value;
    const component = [];
    const queue = [start];
    unseen.delete(start);
    while (queue.length) {
      const position = queue.shift();
      component.push(position);
      neighbors[position].forEach(next => {
        if (!unseen.has(next)) return;
        unseen.delete(next);
        queue.push(next);
      });
    }
    components.push(component);
  }
  const descriptors = components.map(component => {
    const componentSet = new Set(component);
    const indegree = new Map(component.map(position => [position, 0]));
    edges.forEach(([from, to]) => {
      if (componentSet.has(from) && componentSet.has(to)) indegree.set(to, indegree.get(to) + 1);
    });
    const queue = component.filter(position => indegree.get(position) === 0).sort((a, b) => a - b);
    const ordered = [];
    while (queue.length) {
      const position = queue.shift();
      ordered.push(position);
      edges.forEach(([from, to]) => {
        if (from !== position || !componentSet.has(to)) return;
        indegree.set(to, indegree.get(to) - 1);
        if (indegree.get(to) === 0) {
          queue.push(to);
          queue.sort((a, b) => a - b);
        }
      });
    }
    component.filter(position => !ordered.includes(position)).sort((a, b) => a - b)
      .forEach(position => ordered.push(position));
    const localIndex = new Map(ordered.map((position, index) => [position, index]));
    const topology = edges
      .filter(([from, to]) => componentSet.has(from) && componentSet.has(to))
      .map(([from, to]) => `${localIndex.get(from)}>${localIndex.get(to)}`)
      .sort()
      .join(",");
    return { ordered, key: `${ordered.length}:${topology}` };
  });
  const equivalentGroups = new Map();
  descriptors
    .filter(component => !component.ordered.some(position => fixed.has(position)))
    .forEach(component => {
      if (!equivalentGroups.has(component.key)) equivalentGroups.set(component.key, []);
      equivalentGroups.get(component.key).push(component);
    });
  equivalentGroups.forEach(group => {
    if (group.length < 2) return;
    for (let role = 0; role < group[0].ordered.length; role += 1) {
      const interchangeable = new Set();
      group.forEach(component => {
        const position = component.ordered[role];
        allowed[position].forEach(signature => interchangeable.add(signature));
        interchangeable.add(signatures[position]);
      });
      group.forEach(component => {
        const position = component.ordered[role];
        interchangeable.forEach(signature => allowed[position].add(signature));
      });
    }
  });
  return allowed;
}

function computeAllowedSignatures() {
  const signatures = activeWords.map((_, wordId) => boundarySignature(wordId));
  const counts = new Map();
  signatures.forEach(signature => counts.set(signature, (counts.get(signature) || 0) + 1));
  const uniqueSignatures = [...counts.keys()];
  const incoming = Array.from({ length: activeWords.length }, () => []);
  const outgoing = Array.from({ length: activeWords.length }, () => []);
  activeEdges.forEach(([from, to]) => {
    outgoing[from]?.push(to);
    incoming[to]?.push(from);
  });
  const assignment = Array(activeWords.length).fill("");
  const remaining = new Map(counts);
  fixed.forEach(position => {
    const signature = signatures[position];
    assignment[position] = signature;
    remaining.set(signature, (remaining.get(signature) || 0) - 1);
  });
  const allowed = activeWords.map((_, position) =>
    fixed.has(position) ? new Set([signatures[position]]) : new Set()
  );
  const matchesAssignedNeighbors = (position, signature) => {
    const [first, last] = signatureParts(signature);
    return incoming[position].every(from => !assignment[from] || signatureParts(assignment[from])[1] === first) &&
      outgoing[position].every(to => !assignment[to] || last === signatureParts(assignment[to])[0]);
  };
  const candidatesFor = position => uniqueSignatures.filter(signature =>
    (remaining.get(signature) || 0) > 0 &&
    matchesAssignedNeighbors(position, signature)
  );
  const hasForwardDomains = () => assignment.every((signature, position) =>
    signature || candidatesFor(position).length > 0
  );
  const visit = () => {
    const unassigned = assignment
      .map((signature, position) => signature ? null : position)
      .filter(position => position !== null);
    if (!unassigned.length) {
      assignment.forEach((signature, position) => allowed[position].add(signature));
      return;
    }
    const choices = unassigned.map(position => ({
      position,
      candidates: candidatesFor(position),
      degree: incoming[position].length + outgoing[position].length,
    })).sort((a, b) =>
      a.candidates.length - b.candidates.length ||
      b.degree - a.degree ||
      a.position - b.position
    );
    const choice = choices[0];
    for (const signature of choice.candidates) {
      assignment[choice.position] = signature;
      remaining.set(signature, remaining.get(signature) - 1);
      if (hasForwardDomains()) visit();
      remaining.set(signature, remaining.get(signature) + 1);
      assignment[choice.position] = "";
    }
  };
  visit();
  const resolved = allowed.map((signaturesForPosition, position) =>
    signaturesForPosition.size ? signaturesForPosition : new Set([signatures[position]])
  );
  return expandEquivalentComponentSolutions(resolved, signatures, activeEdges);
}

function isAcceptedPosition(wordId, position) {
  if (fixed.has(position)) return wordId === position;
  return allowedSignatures[position]?.has(boundarySignature(wordId)) || false;
}

function isSolvedArrangement() {
  return order.every((wordId, position) => isAcceptedPosition(wordId, position));
}

function createShuffledOrder() {
  const result = Array(activeWords.length).fill(null);
  fixed.forEach(position => result[position] = position);
  const positions = activeWords.map((_, position) => position).filter(position => !fixed.has(position));
  const available = activeWords.map((_, wordId) => wordId).filter(wordId => !fixed.has(wordId));
  positions.sort((a, b) => {
    const aCount = available.filter(wordId => !isAcceptedPosition(wordId, a)).length;
    const bCount = available.filter(wordId => !isAcceptedPosition(wordId, b)).length;
    return aCount - bCount;
  });

  const place = index => {
    if (index === positions.length) return true;
    const position = positions[index];
    const offset = (position + active * 3) % Math.max(1, available.length);
    const candidates = [...available.slice(offset), ...available.slice(0, offset)];
    for (const wordId of candidates) {
      if (isAcceptedPosition(wordId, position)) continue;
      result[position] = wordId;
      available.splice(available.indexOf(wordId), 1);
      if (place(index + 1)) return true;
      available.push(wordId);
      result[position] = null;
    }
    return false;
  };

  if (place(0)) return result;
  const fallback = activeWords.map((_, wordId) => wordId).filter(wordId => !fixed.has(wordId));
  return activeWords.map((_, position) =>
    fixed.has(position) ? position : fallback[(fallback.indexOf(position) + 4) % fallback.length]
  );
}

function buildPuzzleEdges(items, mapName) {
  const positions = mapPositions[mapName] || graphPositions;
  const edges = [];
  const used = new Set();
  const degree = Array(items.length).fill(0);
  for (let index = 0; index < items.length - 1; index += 1) {
    const left = wordBoundary(items[index]);
    const right = wordBoundary(items[index + 1]);
    const edge = left.last === right.first
      ? [index, index + 1]
      : right.last === left.first
        ? [index + 1, index]
        : null;
    if (!edge) continue;
    edges.push(edge);
    used.add(`${index}:${index + 1}`);
    degree[index] += 1;
    degree[index + 1] += 1;
  }
  const candidates = [];
  for (let from = 0; from < items.length; from += 1) {
    const fromLast = soundUnits(items[from][1]).at(-1);
    if (!fromLast) continue;
    for (let to = 0; to < items.length; to += 1) {
      if (from === to || soundUnits(items[to][1])[0] !== fromLast) continue;
      const [fr, fc] = positions[from] || [1, 1];
      const [tr, tc] = positions[to] || [1, 1];
      const distance = Math.hypot(fr - tr, fc - tc);
      if (distance <= 2.25) candidates.push({ from, to, distance });
    }
  }
  candidates.sort((a, b) => a.distance - b.distance || a.from - b.from || a.to - b.to);
  for (const candidate of candidates) {
    const key = [candidate.from, candidate.to].sort((a, b) => a - b).join(":");
    if (used.has(key) || degree[candidate.from] >= 3 || degree[candidate.to] >= 3) continue;
    edges.push([candidate.from, candidate.to]);
    used.add(key);
    degree[candidate.from] += 1;
    degree[candidate.to] += 1;
    if (edges.length >= Math.min(items.length + 5, 26)) break;
  }
  return edges;
}

function rebuildPuzzle() {
  fixed = new Set((fixedByDifficulty[difficulty] || fixedByDifficulty.normal).filter(position => position < activeWords.length));
  allowedSignatures = computeAllowedSignatures();
  order = createShuffledOrder();
  selected = null;
}

function isVerbEntry(item) {
  return verbFormVariants(item).length >= 3;
}

function displayWord(item) {
  const word = item[0];
  if (endingMode !== "hidden") return word;
  const variants = verbFormVariants(item);
  if (!variants.length) return word;
  const variant = variants.find(candidate => candidate.surface === word) || variants[0];
  const label = variant.label;
  const characters = [...word];
  const stem = characters.length > 1 ? characters.slice(0, -1).join("") : word;
  return stem ? `${stem}（${label}）` : `${word}（${label}）`;
}

function matchingSound(fromPosition, toPosition) {
  const left = activeWords[fromPosition]?.[1] || "";
  const right = activeWords[toPosition]?.[1] || "";
  const leftUnits = soundUnits(left);
  const rightUnits = soundUnits(right);
  return leftUnits.at(-1) === rightUnits[0] ? leftUnits.at(-1) : "";
}

function completionKey(listId, puzzleId) {
  return `connected-v6:${listId}:${puzzleId}`;
}

function allPuzzleDescriptors() {
  return vocabularyLists.flatMap(list => puzzleGroups(list).map(group => ({
    ...group,
    key: completionKey(list.id, group.id),
    list,
  })));
}

function puzzleRowMarkup(list, detailed = false) {
  const groups = puzzleGroups(list);
  const visible = detailed ? groups : groups.slice(0, 6);
  return `
    <div class="puzzle-row">
      <div class="puzzle-row-title">
        <small>${list.tutorial ? "TUTORIAL" : list.source ? "インポート" : "ことばリスト"}</small>
        <strong>${escapeHtml(list.title)}</strong>
        <span>${list.words.length}このことば・${groups.length}このパズル</span>
      </div>
      <div class="puzzle-dots">
        ${visible.map(group => {
          const key = completionKey(list.id, group.id);
          return `
          <button class="puzzle-token ${activeListId === list.id && active === group.id ? "chosen" : ""} ${completionRecords[key] ? `completed-${completionRecords[key]}` : ""}" data-list-id="${escapeHtml(list.id)}" data-puzzle="${group.id}">
            ${group.id}<small>${group.words.length}こ</small>
          </button>`;
        }).join("")}
      </div>
    </div>`;
}

function bindPuzzleButtons(container) {
  container.querySelectorAll("[data-puzzle][data-list-id]").forEach(button => button.addEventListener("click", () => {
    activateVocabulary(button.dataset.listId);
    el("puzzle-list-modal").hidden = true;
    pendingPuzzleId = Number(button.dataset.puzzle);
    if (currentVocabulary().tutorial) el("tutorial-modal").hidden = false;
    else openPuzzleSetup(pendingPuzzleId);
  }));
}

function renderRandomRow() {
  const descriptors = allPuzzleDescriptors();
  const categories = [
    { label: "あたらしい", grade: null, className: "random-unplayed" },
    { label: "クリア", grade: "blue", className: "random-cleared" },
    { label: "パーフェクト", grade: "gold", className: "random-perfect" },
  ];
  el("random-row").innerHTML = categories.map((category, index) => {
    const matches = descriptors.filter(item => (completionRecords[item.key] || null) === category.grade);
    const item = matches.length ? matches[(randomSeed + index) % matches.length] : null;
    if (!item) return `<button class="${category.className} random-missing" disabled><span>—</span><small>${category.label}</small><strong>まだありません</strong></button>`;
    return `<button class="${category.className}" data-list-id="${escapeHtml(item.list.id)}" data-puzzle="${item.id}">
      <span>${item.id}</span><small>${category.label}</small><strong>${escapeHtml(item.list.title)}</strong>
    </button>`;
  }).join("");
  bindPuzzleButtons(el("random-row"));
}

function renderCards() {
  const descriptors = allPuzzleDescriptors();
  const previewLimit = 12;
  el("puzzle-cards").innerHTML = vocabularyLists.slice(0, 3).map(list => puzzleRowMarkup(list)).join("") +
    (descriptors.length > previewLimit
      ? `<div class="puzzle-list-footer"><button id="open-puzzle-list">すべてひらく →</button></div>`
      : "");
  bindPuzzleButtons(el("puzzle-cards"));
  el("all-puzzle-cards").innerHTML = vocabularyLists.map(list => puzzleRowMarkup(list, true)).join("");
  bindPuzzleButtons(el("all-puzzle-cards"));
  el("open-puzzle-list")?.addEventListener("click", () => el("puzzle-list-modal").hidden = false);
  renderRandomRow();
}

function swap(a, b) {
  if (a === b || fixed.has(a) || fixed.has(b)) return;
  [order[a], order[b]] = [order[b], order[a]];
  renderBoard();
  scheduleAutoSave();
}

function renderBoard() {
  const accepted = order.map((wordId, position) => isAcceptedPosition(wordId, position));
  const solved = isSolvedArrangement();
  const betaPositions = betaMapMode === "hex" ? packedHexPositions(activeWords.length) : null;
  el("board-wrap").classList.toggle("solved", solved);
  el("board-wrap").classList.toggle("beta-hex", betaMapMode === "hex");
  el("success").hidden = !solved;
  el("puzzle-board").innerHTML = `<svg class="board-lines" aria-hidden="true">
    <defs>
      <marker id="board-arrow" markerWidth="8" markerHeight="8" refX="6.4" refY="4" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1,1 L6.4,4 L1,7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
      </marker>
      <marker id="board-end-dot" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
        <circle cx="3.5" cy="3.5" r="2.5" fill="currentColor"></circle>
      </marker>
    </defs>
  </svg>` + order.map((wordId, position) => {
    const item = activeWords[wordId];
    const [word, hiragana, romaji, meaning, form = word] = item;
    const isCorrect = accepted[position];
    const shownWord = displayWord(item);
    const isVerb = isVerbEntry(item);
    const isAdjective = !isVerb && form !== word;
    const detailForm = completeFormLabel(item);
    const [desktopRow, desktopColumn] = betaPositions
      ? betaPositions[position]
      : (mapPositions[selectedMap] || graphPositions)[position];
    const mobileRow = betaPositions ? desktopRow : 10 - desktopColumn;
    const mobileColumn = betaPositions ? desktopColumn : 8 - desktopRow;
    const desktopOffset = desktopRow % 2 ? 0 : 0.5;
    const mobileOffset = mobileRow % 2 ? 0 : 0.5;
    return `<button class="word-node ${isCorrect ? "correct" : ""} ${fixed.has(position) ? "fixed" : ""} ${selected === position ? "selected" : ""}" draggable="${!fixed.has(position)}" data-position="${position}" style="--row:${desktopRow};--col:${desktopColumn};--mrow:${mobileRow};--mcol:${mobileColumn};--hrow:${desktopRow};--hcol:${desktopColumn};--hoff:${desktopOffset};--hmrow:${mobileRow};--hmcol:${mobileColumn};--hmoff:${mobileOffset};--delay:${position * 28}ms" aria-label="${shownWord}、${isCorrect ? "ただしい場所" : "いどうできます"}">
      <span class="hex-fill" aria-hidden="true"></span>${isCorrect ? `<span class="reading">${readingMode === "hiragana" ? hiragana : romaji}</span>` : ""}<span class="node-word">${shownWord}</span>
      ${isCorrect ? `<span class="tooltip"><em>${isVerb ? "じしょ・ます・ない・可能" : isAdjective ? "もとのかたち・いみ" : "ことば・いみ"}</em><strong>${detailForm}</strong><small>${meaning}</small></span>` : ""}
    </button>`;
  }).join("");
  document.querySelectorAll("[data-position]").forEach(node => {
    const position = Number(node.dataset.position);
    node.addEventListener("click", () => {
      if (fixed.has(position)) return;
      if (selected === null) selected = position;
      else { swap(selected, position); selected = null; }
      renderBoard();
    });
    node.addEventListener("dragstart", () => dragged = position);
    node.addEventListener("dragover", event => event.preventDefault());
    node.addEventListener("drop", () => { if (dragged !== null) swap(dragged, position); dragged = null; });
  });
  if (solved) {
    const grade = difficulty === "hard" ? "gold" : "blue";
    const key = completionKey(activeListId, active);
    let changed = false;
    if (!completed.includes(key)) {
      completed.push(key);
      changed = true;
    }
    if (!completionRecords[key] || (completionRecords[key] === "blue" && grade === "gold")) {
      completionRecords[key] = grade;
      changed = true;
    }
    if (changed) {
      localStorage.setItem("kotonoha-completed", JSON.stringify(completed));
      localStorage.setItem("kotonoha-completion-records", JSON.stringify(completionRecords));
      renderCards();
    }
  }
  requestAnimationFrame(drawEdges);
}

function drawEdges() {
  const board = el("puzzle-board");
  const layer = board.querySelector(".board-lines");
  if (!layer) return;
  layer.querySelectorAll(".board-edge,.hex-scaffold").forEach(edge => edge.remove());
  const boardRect = board.getBoundingClientRect();
  layer.setAttribute("viewBox", `0 0 ${boardRect.width} ${boardRect.height}`);
  layer.setAttribute("width", boardRect.width);
  layer.setAttribute("height", boardRect.height);
  const nodeRects = [...board.querySelectorAll("[data-position]")].map(node => {
    const rect = node.getBoundingClientRect();
    return {
      position: Number(node.dataset.position),
      width: rect.width,
      height: rect.height,
      centerX: rect.left + rect.width / 2 - boardRect.left,
      centerY: rect.top + rect.height / 2 - boardRect.top,
      left: rect.left - boardRect.left - 9,
      right: rect.right - boardRect.left + 9,
      top: rect.top - boardRect.top - 32,
      bottom: rect.bottom - boardRect.top + 9,
    };
  });
  const rectByPosition = new Map(nodeRects.map(rect => [rect.position, rect]));
  activeEdges.forEach(([fromPosition, toPosition]) => {
    const fromRect = rectByPosition.get(fromPosition);
    const toRect = rectByPosition.get(toPosition);
    if (!fromRect || !toRect) return;
    const dx = toRect.centerX - fromRect.centerX;
    const dy = toRect.centerY - fromRect.centerY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const unitX = dx / distance;
    const unitY = dy / distance;
    const exitDistance = rect => Math.min(
      Math.abs(unitX) > 0.0001 ? rect.width / 2 / Math.abs(unitX) : Infinity,
      Math.abs(unitY) > 0.0001 ? rect.height / 2 / Math.abs(unitY) : Infinity,
    );
    const isHexMap = betaMapMode === "hex";
    const startX = fromRect.centerX + unitX * (exitDistance(fromRect) + 7);
    const startY = fromRect.centerY + unitY * (exitDistance(fromRect) + 7);
    const endX = toRect.centerX - unitX * (exitDistance(toRect) + (isHexMap ? 7 : 18));
    const endY = toRect.centerY - unitY * (exitDistance(toRect) + (isHexMap ? 7 : 18));
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", isHexMap ? "hex-scaffold" : "board-edge");
    path.setAttribute("d", `M ${startX} ${startY} L ${endX} ${endY}`);
    path.setAttribute("marker-end", isHexMap ? "url(#board-end-dot)" : "url(#board-arrow)");
    path.dataset.from = String(fromPosition);
    path.dataset.to = String(toPosition);
    path.dataset.sound = matchingSound(fromPosition, toPosition);
    layer.appendChild(path);
  });
}

function drawPreviewEdges(edges) {
  const preview = el("map-preview");
  const layer = preview.querySelector(".preview-lines");
  if (!layer) return;
  layer.querySelectorAll(".preview-edge").forEach(edge => edge.remove());
  const previewRect = preview.getBoundingClientRect();
  layer.setAttribute("viewBox", `0 0 ${previewRect.width} ${previewRect.height}`);
  layer.setAttribute("width", previewRect.width);
  layer.setAttribute("height", previewRect.height);
  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
    const [fromPosition, toPosition] = edges[edgeIndex];
    const from = preview.querySelector(`[data-preview-position="${fromPosition}"]`);
    const to = preview.querySelector(`[data-preview-position="${toPosition}"]`);
    if (!from || !to) continue;
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const ax = a.left + a.width / 2 - previewRect.left;
    const ay = a.top + a.height / 2 - previewRect.top;
    const bx = b.left + b.width / 2 - previewRect.left;
    const by = b.top + b.height / 2 - previewRect.top;
    const dx = bx - ax;
    const dy = by - ay;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const unitX = dx / distance;
    const unitY = dy / distance;
    const startX = ax + unitX * 12;
    const startY = ay + unitY * 12;
    const endX = bx - unitX * 22;
    const endY = by - unitY * 22;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const isHexMap = betaMapMode === "hex";
    path.setAttribute("class", isHexMap ? "preview-edge preview-hex-edge" : "preview-edge");
    path.setAttribute("d", `M ${startX} ${startY} L ${endX} ${endY}`);
    path.setAttribute("marker-end", isHexMap ? "url(#preview-end-dot)" : "url(#preview-arrow)");
    layer.appendChild(path);
  }
}

function renderMapPreview(group) {
  const positions = betaMapMode === "hex"
    ? packedHexPositions(group.words.length, group.id, group.listId || activeListId)
    : (mapPositions[group.map] || graphPositions);
  const usedPositions = positions.slice(0, group.words.length);
  const rows = usedPositions.map(point => point[0]);
  const columns = usedPositions.map(point => point[1]);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minColumn = Math.min(...columns);
  const maxColumn = Math.max(...columns);
  const rowSpan = Math.max(1, maxRow - minRow);
  const columnSpan = Math.max(1, maxColumn - minColumn);
  el("map-preview").innerHTML = `
    <svg class="preview-lines" aria-hidden="true">
      <defs>
        <marker id="preview-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M1,1 L6,3.5 L1,6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path>
        </marker>
        <marker id="preview-end-dot" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2.2" fill="currentColor"></circle>
        </marker>
      </defs>
    </svg>
    ${group.words.map((_, position) => {
      const [row, column] = positions[position];
      const top = 10 + ((row - minRow) / rowSpan) * 80;
      const left = 10 + ((column - minColumn) / columnSpan) * 80;
      return `<span class="preview-node" data-preview-position="${position}" style="left:${left}%;top:${top}%"></span>`;
    }).join("")}`;
  requestAnimationFrame(() => drawPreviewEdges(group.edges || []));
}

function updateReadingControls() {
  document.querySelectorAll("[data-reading-mode]").forEach(button => {
    button.classList.toggle("active", button.dataset.readingMode === readingMode);
    button.setAttribute("aria-pressed", button.dataset.readingMode === readingMode ? "true" : "false");
  });
}

function updateDifficultyControls() {
  document.querySelectorAll("[data-difficulty]").forEach(button => {
    const activeButton = button.dataset.difficulty === difficulty;
    button.classList.toggle("active", activeButton);
    button.setAttribute("aria-pressed", activeButton ? "true" : "false");
  });
}

function updateEndingControls() {
  document.querySelectorAll("[data-ending-mode]").forEach(button => {
    const activeButton = button.dataset.endingMode === endingMode;
    button.classList.toggle("active", activeButton);
    button.setAttribute("aria-pressed", activeButton ? "true" : "false");
  });
}

function updateBetaMapControls() {
  document.querySelectorAll("[data-beta-map]").forEach(button => {
    const activeButton = button.dataset.betaMap === betaMapMode;
    button.classList.toggle("active", activeButton);
    button.setAttribute("aria-pressed", activeButton ? "true" : "false");
  });
  el("board-wrap").classList.toggle("beta-hex", betaMapMode === "hex");
  el("map-preview").classList.toggle("beta-hex-preview", betaMapMode === "hex");
  if (betaMapMode === "hex") el("auto-map-name").textContent = "β・はちのす";
}

function applyTheme() {
  document.documentElement.dataset.theme = theme;
  const button = el("theme-toggle");
  const isLight = theme === "light";
  button.textContent = isLight ? "☾ くらく" : "☀ あかるく";
  button.setAttribute("aria-pressed", isLight ? "true" : "false");
}

function setPuzzleFullscreen(enabled) {
  el("game").classList.toggle("fullscreen-game", enabled);
  document.body.classList.toggle("puzzle-fullscreen", enabled);
  el("fullscreen-toggle").textContent = enabled ? "× もどる" : "⛶ ぜんがめん";
  el("fullscreen-toggle").setAttribute("aria-pressed", enabled ? "true" : "false");
  requestAnimationFrame(drawEdges);
}

function topologicalPuzzleLayout(words, edges) {
  const outgoing = Array.from({ length: words.length }, () => []);
  const indegree = Array(words.length).fill(0);
  edges.forEach(([from, to]) => {
    if (!outgoing[from].includes(to)) outgoing[from].push(to);
    indegree[to] += 1;
  });
  const ready = words.map((_, index) => index).filter(index => indegree[index] === 0);
  const sorted = [];
  while (ready.length) {
    ready.sort((a, b) => a - b);
    const current = ready.shift();
    sorted.push(current);
    outgoing[current].forEach(next => {
      indegree[next] -= 1;
      if (indegree[next] === 0) ready.push(next);
    });
  }
  words.forEach((_, index) => {
    if (!sorted.includes(index)) sorted.push(index);
  });
  const oldToNew = new Map(sorted.map((oldIndex, newIndex) => [oldIndex, newIndex]));
  return {
    words: sorted.map(index => [...words[index]]),
    edges: edges.map(([from, to]) => [oldToNew.get(from), oldToNew.get(to)]),
  };
}

function packedHexPositions(count, puzzleId = active, listId = activeListId) {
  if (count <= tutorialHexPositions.length) return tutorialHexPositions.slice(0, count);
  const seed = [...`${listId}:${puzzleId}`]
    .reduce((value, character) => ((value * 33) + character.codePointAt(0)) >>> 0, 5381);
  const incompleteChainLength = count >= 12 && count <= 16 ? count - 12 : 4;
  const configurations = hexDiamondConfigurations[incompleteChainLength];
  const configuration = configurations[seed % configurations.length];
  return configuration.flat().slice(0, count).map(point => [...point]);
}

function choosePuzzle(id) {
  const list = currentVocabulary();
  const groups = puzzleGroups(list);
  const group = groups[id - 1] || groups[0];
  if (!group) return;
  active = id;
  const chosenLayout = { words: group.words.map(item => [...item]), edges: group.edges || [] };
  activeWords = chosenLayout.words;
  selectedMap = group.map;
  activeEdges = chosenLayout.edges.length
    ? chosenLayout.edges
    : buildPuzzleEdges(activeWords, selectedMap);
  rebuildPuzzle();
  el("puzzle-number").textContent = `パズル ${String(id).padStart(2,"0")}`;
  el("puzzle-title").textContent = `${group.title || "ことば"}・その${id}`;
  el("puzzle-board").dataset.map = selectedMap;
  renderCards();
  renderBoard();
  scheduleAutoSave();
  el("setup-modal").hidden = true;
  el("game").hidden = false;
}

el("generate").addEventListener("click", async () => {
  const button = el("generate");
  const value = el("topic").value.trim();
  const url = inputAsUrl(value);
  const status = el("extract-status");
  button.disabled = true;
  button.classList.add("is-loading");
  button.setAttribute("aria-label", url ? "ページをよみこんでいます" : "ことばをさがしています");
  status.className = "extract-status";
  status.textContent = url ? "ページのぶんしょうと、ことばのよみをしらべています。" : "";
  try {
    if (url) {
      if (location.protocol === "file:") {
        throw new Error("URLからの抽出はオンライン版で使えます。");
      }
      await extractFromUrl(url);
    } else {
      await new Promise(resolve => setTimeout(resolve, 450));
      currentGeneratedList = generatedSets.coffee.map(item => [...item]);
      currentGeneratedTitle = value ? compactTopicTitle(value) : "珈琲";
      currentGeneratedSource = "";
      storeGeneratedList();
    }
    renderGenerated();
    status.textContent = `${currentGeneratedList.length}このことばからパズルをつくっています。`;
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
    renderCards();
    status.classList.add("success-message");
    status.textContent = `${currentGeneratedList.length}このことばをみつけました。`;
    scheduleAutoSave();
  } catch (error) {
    status.classList.add("error-message");
    const message = error instanceof Error ? error.message : "";
    status.textContent = /[\u3040-\u30ff\u3400-\u9fff]/u.test(message)
      ? message
      : "ページからことばを取り出せませんでした。";
  } finally {
    button.disabled = false;
    button.classList.remove("is-loading");
    button.setAttribute("aria-label", "ことばリストをつくる");
  }
});
el("topic").addEventListener("keydown", event => {
  if (event.key !== "Enter" || event.isComposing || el("generate").disabled) return;
  event.preventDefault();
  el("generate").click();
});
el("to-puzzles").addEventListener("click", () => el("puzzles").scrollIntoView({ behavior: "smooth" }));
el("reset").addEventListener("click", () => { order = createShuffledOrder(); selected = null; renderBoard(); scheduleAutoSave(); });
el("next-puzzle").addEventListener("click", () => choosePuzzle(active % puzzleGroups().length + 1));
el("open-library").addEventListener("click", () => el("library-modal").hidden = false);
el("account-button").addEventListener("click", () => {
  el("account-status").textContent = accountUser
    ? "この端末とクラウドのデータをどうきします。"
    : "ログインしなくても、この端末へのほぞんは使えます。";
  el("account-modal").hidden = false;
});
el("account-login").addEventListener("click", () => submitAccount("login"));
el("account-register").addEventListener("click", () => submitAccount("register"));
el("account-logout").addEventListener("click", logoutAccount);
el("account-password").addEventListener("keydown", event => {
  if (event.key === "Enter") submitAccount("login");
});
el("random-refresh").addEventListener("click", () => {
  randomSeed += 1;
  renderRandomRow();
});
el("start-tutorial").addEventListener("click", () => {
  activateVocabulary(TUTORIAL_LIST_ID);
  el("tutorial-modal").hidden = true;
  renderGenerated();
  renderCards();
  openPuzzleSetup(pendingPuzzleId || 1);
});
el("save-words").addEventListener("click", saveEditedWords);
el("add-word").addEventListener("click", () => {
  const index = document.querySelectorAll("[data-editor-row]").length;
  el("editor-rows").insertAdjacentHTML("beforeend", `
    <div class="editor-row" data-editor-row data-romaji="" data-form="">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <input value="" aria-label="${index + 1}ばんのことば">
      <input value="" aria-label="${index + 1}ばんのよみ">
      <input value="" aria-label="${index + 1}ばんのいみ">
      <button type="button" data-remove-word aria-label="${index + 1}ばんをけす">×</button>
    </div>`);
  const row = el("editor-rows").lastElementChild;
  row.querySelector("[data-remove-word]").addEventListener("click", () => row.remove());
  row.querySelector("input").focus();
});
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => {
  el(button.dataset.close).hidden = true;
}));
el("start-puzzle").addEventListener("click", () => choosePuzzle(pendingPuzzleId));
el("close-game").addEventListener("click", () => {
  el("game").hidden = true;
  setPuzzleFullscreen(false);
});
el("save-game").addEventListener("click", () => saveGame(false));
el("load-game").addEventListener("click", loadSavedGame);
el("delete-save").addEventListener("click", deleteSavedGame);
el("theme-toggle").addEventListener("click", () => {
  theme = theme === "light" ? "dark" : "light";
  localStorage.setItem("kotonoha-theme", theme);
  applyTheme();
  scheduleAutoSave();
  requestAnimationFrame(drawEdges);
});
el("fullscreen-toggle").addEventListener("click", () => {
  setPuzzleFullscreen(!el("game").classList.contains("fullscreen-game"));
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && el("game").classList.contains("fullscreen-game")) setPuzzleFullscreen(false);
});
document.querySelectorAll("[data-difficulty]").forEach(button => button.addEventListener("click", () => {
  difficulty = button.dataset.difficulty;
  localStorage.setItem("kotonoha-difficulty", difficulty);
  rebuildPuzzle();
  updateDifficultyControls();
  renderBoard();
  scheduleAutoSave();
}));
document.querySelectorAll("[data-ending-mode]").forEach(button => button.addEventListener("click", () => {
  endingMode = button.dataset.endingMode;
  localStorage.setItem("kotonoha-ending", endingMode);
  updateEndingControls();
  renderBoard();
  scheduleAutoSave();
}));
document.querySelectorAll("[data-reading-mode]").forEach(button => button.addEventListener("click", () => {
  readingMode = button.dataset.readingMode;
  localStorage.setItem("kotonoha-reading", readingMode);
  updateReadingControls();
  renderGenerated();
  renderBoard();
  scheduleAutoSave();
}));
document.querySelectorAll("[data-list-map]").forEach(button => button.addEventListener("click", () => {
  pendingListMapMode = button.dataset.listMap === "hex" ? "hex" : "standard";
  document.querySelectorAll("[data-list-map]").forEach(option => {
    const activeButton = option.dataset.listMap === pendingListMapMode;
    option.classList.toggle("active", activeButton);
    option.setAttribute("aria-pressed", activeButton ? "true" : "false");
  });
}));
window.addEventListener("resize", () => requestAnimationFrame(() => {
  drawEdges();
  if (!el("setup-modal").hidden) {
    const group = puzzleGroups(currentVocabulary())[pendingPuzzleId - 1];
    if (group) drawPreviewEdges(group.edges || []);
  }
}));
window.addEventListener("pagehide", () => {
  if (autoSaveReady) writeLocalSave(saveSnapshot());
});

const initialGroup = puzzleGroups(currentVocabulary())[0];
activeWords = initialGroup.words.map(item => [...item]);
selectedMap = initialGroup.map;
activeEdges = initialGroup.edges || buildPuzzleEdges(activeWords, selectedMap);
rebuildPuzzle();
applyTheme();
updateReadingControls();
updateDifficultyControls();
updateEndingControls();
updateBetaMapControls();
renderGenerated();
renderCards();
renderBoard();
initializePersistence();
