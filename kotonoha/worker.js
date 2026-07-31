const MAX_HTML_CHARS = 1_500_000;
const MAX_CANDIDATES = 44;
const MAX_WORDS = 44;
const MAX_STRUCTURED_WORDS = 1_200;
const MAX_SAVE_CHARS = 200_000;
const SESSION_COOKIE = "kotonoha_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const PASSWORD_ITERATIONS = 210_000;
const kanjiPattern = /[\p{Script=Han}々〆ヵヶ]/u;
const userSchema = `CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL
)`;
const sessionSchema = `CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
)`;
const saveSchema = `CREATE TABLE IF NOT EXISTS user_saves (
  user_id TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;
const translationSchema = `CREATE TABLE IF NOT EXISTS translation_cache (
  source TEXT PRIMARY KEY NOT NULL,
  translated TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

const json = (body, status = 200, extraHeaders = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...extraHeaders,
  },
});

function bytesToBase64Url(bytes) {
  let binary = "";
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function sha256(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)));
}

async function derivePasswordHash(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    hash: "SHA-256",
    salt,
    iterations: PASSWORD_ITERATIONS,
  }, key, 256);
  return bytesToBase64Url(new Uint8Array(bits));
}

function equalSecret(left, right) {
  const a = base64UrlToBytes(left);
  const b = base64UrlToBytes(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

function cookieValue(request, name) {
  const cookies = request.headers.get("cookie") || "";
  const pair = cookies.split(";").map(item => item.trim()).find(item => item.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : "";
}

function sessionCookie(request, token, maxAge = SESSION_MAX_AGE) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function isPrivateHostname(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;
  const octets = ipv4.slice(1).map(Number);
  if (octets.some(value => value > 255)) return true;
  return octets[0] === 10 ||
    octets[0] === 127 ||
    octets[0] === 0 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168);
}

function parsePublicUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("URLをたしかめてください。");
  }
  if (!["http:", "https:"].includes(parsed.protocol) || isPrivateHostname(parsed.hostname)) {
    throw new Error("このURLは読みこめません。");
  }
  parsed.hash = "";
  return parsed;
}

async function fetchHtml(initialUrl) {
  let current = parsePublicUrl(initialUrl);
  for (let redirect = 0; redirect < 5; redirect += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      headers: {
        "accept": "text/html,application/xhtml+xml",
        "user-agent": "Kotonoha-Kanji-Puzzle/1.0",
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("ページの移動先が見つかりません。");
      current = parsePublicUrl(new URL(location, current).href);
      continue;
    }
    if (!response.ok) throw new Error(`ページを読みこめませんでした（${response.status}）。`);
    const type = response.headers.get("content-type") || "";
    if (type.includes("application/pdf") || current.pathname.toLowerCase().endsWith(".pdf")) {
      const error = new Error("PDFの文字を読みこんでいます。");
      error.pdf = true;
      throw error;
    }
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) {
      throw new Error("HTMLのページを入力してください。");
    }
    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (declaredSize > MAX_HTML_CHARS * 3) throw new Error("ページが大きすぎます。");
    return {
      html: (await response.text()).slice(0, MAX_HTML_CHARS),
      finalUrl: current.href,
    };
  }
  throw new Error("ページの移動が多すぎます。");
}

async function fetchPdf(initialUrl) {
  let current = parsePublicUrl(initialUrl);
  for (let redirect = 0; redirect < 5; redirect += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      headers: {
        "accept": "application/pdf",
        "user-agent": "Kotonoha-Kanji-Puzzle/1.0",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("PDFの移動先が見つかりません。");
      current = parsePublicUrl(new URL(location, current).href);
      continue;
    }
    if ((response.status === 403 || response.status === 406) && !current.searchParams.has("download")) {
      // Some document servers reject cloud fetches for the bare file URL but
      // allow the exact same resource when it is marked as a download.
      current.searchParams.set("download", "1");
      continue;
    }
    if (!response.ok) throw new Error(`PDFを読みこめませんでした（${response.status}）。`);
    const type = response.headers.get("content-type") || "";
    if (!type.includes("application/pdf") && !current.pathname.toLowerCase().endsWith(".pdf")) {
      throw new Error("PDFのリンクを入力してください。");
    }
    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (declaredSize > 15_000_000) throw new Error("PDFが大きすぎます。");
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 15_000_000) throw new Error("PDFが大きすぎます。");
    return new Response(bytes, {
      headers: {
        "content-type": "application/pdf",
        "cache-control": "no-store",
      },
    });
  }
  throw new Error("PDFの移動が多すぎます。");
}

function decodeEntities(text) {
  const named = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " ",
  };
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity) => {
    if (entity[0] === "#") {
      const hexadecimal = entity[1].toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    }
    return named[entity.toLowerCase()] || " ";
  });
}

function visibleTextFromHtml(html) {
  return decodeEntities(html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|svg|noscript|template|iframe)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<rt[^>]*>[\s\S]*?<\/rt>/gi, "")
    .replace(/<(br|p|div|article|section|main|header|footer|li|h[1-6]|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromHtml(html, fallback) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return fallback;
  return decodeEntities(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(0, 80);
}

function textFromFragment(fragment) {
  return decodeEntities(String(fragment || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|svg|noscript|template)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

function compactListTitle(title, sourceUrl = "") {
  const normalized = String(title || "").normalize("NFKC");
  const jlpt = normalized.match(/\bN[1-5]\b/i);
  if (jlpt) return jlpt[0].toUpperCase();

  const translations = [
    [/\btravel\b/i, "旅行"],
    [/\bfood\b|\bcooking\b/i, "料理"],
    [/\bcoffee\b|\bcafe\b/i, "珈琲"],
    [/\buniversity\b|\bcollege\b/i, "大学"],
    [/\bseason/i, "四季"],
    [/\bwork\b|\bjob\b/i, "仕事"],
    [/\bvocab(?:ulary)?\b|\bwords?\b/i, "語彙"],
  ];
  for (const [pattern, japanese] of translations) {
    if (pattern.test(normalized)) return japanese;
  }

  const japaneseParts = normalized.match(/[\p{Script=Han}\u3040-\u30ffー]{1,8}/gu) || [];
  const useful = japaneseParts.find(part => !/^(日本語|完全|一覧|単語|語彙|ページ)$/u.test(part));
  if (useful) return [...useful].slice(0, 8).join("");

  try {
    const host = new URL(sourceUrl).hostname.replace(/^www\./, "").split(".")[0];
    return [...host].slice(0, 8).join("") || "ことば";
  } catch {
    return "ことば";
  }
}

function beginsOrEndsWithKanji(word) {
  const characters = [...word];
  return Boolean(characters.length && (kanjiPattern.test(characters[0]) || kanjiPattern.test(characters.at(-1))));
}

function normalizeTableWord(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/^[^\p{L}々〆ヵヶ]+|[^\p{L}々〆ヵヶ]+$/gu, "")
    .replace(/\s+/g, "");
}

function wordsInsidePhrase(value) {
  const normalized = normalizeTableWord(value);
  const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
  const segmented = [...segmenter.segment(String(value || "").normalize("NFKC"))]
    .filter(segment => segment.isWordLike)
    .map(segment => normalizeTableWord(segment.segment))
    .filter(word => word && kanjiPattern.test(word) && beginsOrEndsWithKanji(word));
  if (segmented.length) return [...new Set(segmented)];
  return normalized && kanjiPattern.test(normalized) && beginsOrEndsWithKanji(normalized)
    ? [normalized]
    : [];
}

const chineseMeaningDictionary = new Map(Object.entries({
  "to meet": "见面", "blue": "蓝色", "red": "红色", "white": "白色", "black": "黑色",
  "bright": "明亮的", "dark": "昏暗的", "new": "新的", "old": "旧的", "good": "好的",
  "bad": "不好的", "big": "大的", "small": "小的", "long": "长的", "short": "短的",
  "high": "高的", "low": "低的", "cheap": "便宜的", "expensive": "昂贵的", "busy": "忙碌的",
  "fun": "有趣的", "interesting": "有趣的", "boring": "无聊的", "difficult": "困难的",
  "easy": "简单的", "hot": "热的", "cold": "冷的", "warm": "温暖的", "cool": "凉爽的",
  "delicious": "好吃的", "sweet": "甜的", "spicy": "辣的", "salty": "咸的",
  "morning": "早晨", "afternoon": "下午", "evening": "傍晚", "night": "夜晚",
  "today": "今天", "tomorrow": "明天", "yesterday": "昨天", "week": "星期",
  "month": "月份", "year": "年", "time": "时间", "hour": "小时", "minute": "分钟",
  "day": "日；白天", "birthday": "生日", "holiday": "假日", "summer": "夏天",
  "winter": "冬天", "spring": "春天", "autumn": "秋天", "rain": "雨", "snow": "雪",
  "weather": "天气", "sky": "天空", "sea": "海", "river": "河", "mountain": "山",
  "country": "国家", "town": "城镇", "city": "城市", "village": "村庄", "road": "道路",
  "station": "车站", "airport": "机场", "school": "学校", "university": "大学",
  "hospital": "医院", "bank": "银行", "post office": "邮局", "library": "图书馆",
  "shop": "商店", "department store": "百货商店", "restaurant": "餐厅", "room": "房间",
  "house": "房屋；家", "home": "家", "entrance": "入口", "exit": "出口",
  "window": "窗户", "door": "门", "table": "桌子", "chair": "椅子", "desk": "书桌",
  "book": "书", "dictionary": "词典", "newspaper": "报纸", "magazine": "杂志",
  "letter": "信", "paper": "纸", "pencil": "铅笔", "pen": "笔", "bag": "包",
  "umbrella": "雨伞", "shoe": "鞋", "clothes": "衣服", "money": "钱", "ticket": "票",
  "car": "汽车", "train": "电车；火车", "bus": "公交车", "bicycle": "自行车",
  "airplane": "飞机", "food": "食物", "water": "水", "tea": "茶", "coffee": "咖啡",
  "rice": "米饭", "bread": "面包", "meat": "肉", "fish": "鱼", "vegetable": "蔬菜",
  "fruit": "水果", "egg": "鸡蛋", "milk": "牛奶", "family": "家人；家庭",
  "father": "父亲", "mother": "母亲", "older brother": "哥哥", "older sister": "姐姐",
  "younger brother": "弟弟", "younger sister": "妹妹", "child": "孩子", "friend": "朋友",
  "teacher": "老师", "student": "学生", "doctor": "医生", "person": "人",
  "man": "男人", "woman": "女人", "name": "名字", "body": "身体", "head": "头",
  "face": "脸", "eye": "眼睛", "ear": "耳朵", "mouth": "嘴", "hand": "手",
  "foot": "脚", "voice": "声音", "language": "语言", "Japanese language": "日语",
  "question": "问题", "answer": "回答", "meaning": "意思", "number": "数字；号码",
  "music": "音乐", "movie": "电影", "picture": "图画；照片", "photo": "照片",
  "sport": "运动", "work": "工作", "job": "工作；职业", "study": "学习",
  "to go": "去", "to come": "来", "to return": "回来；返回", "to enter": "进入",
  "to leave": "离开", "to walk": "走路", "to run": "跑", "to stop": "停下",
  "to sit": "坐", "to stand": "站立", "to get up": "起床", "to sleep": "睡觉",
  "to eat": "吃", "to drink": "喝", "to buy": "买", "to sell": "卖",
  "to read": "读", "to write": "写", "to speak": "说", "to say": "说",
  "to listen": "听", "to hear": "听见", "to see": "看见", "to look": "看",
  "to watch": "观看", "to know": "知道", "to understand": "理解", "to remember": "记住",
  "to forget": "忘记", "to learn": "学习", "to teach": "教", "to ask": "询问",
  "to answer": "回答", "to call": "打电话；呼叫", "to wait": "等待", "to use": "使用",
  "to make": "制作", "to do": "做", "to open": "打开", "to close": "关闭",
  "to put": "放置", "to take": "拿取", "to give": "给", "to receive": "收到",
  "to lend": "借出", "to borrow": "借入", "to send": "发送", "to show": "展示",
  "to live": "居住；生活", "to work": "工作", "to rest": "休息", "to play": "玩",
  "to sing": "唱歌", "to swim": "游泳", "to become": "变成", "to begin": "开始",
  "to finish": "结束", "to turn": "转弯", "to cross": "穿过", "to hurry": "赶快",
  "there is": "有；存在", "there are": "有；存在", "many": "许多", "few": "少量",
  "all": "全部", "same": "相同", "different": "不同", "together": "一起",
}));

const japaneseMeaningCorrections = new Map(Object.entries({
  "感情": "感情；情感",
  "開戦": "开战",
  "鮮やか": "鲜艳；鲜明",
  "色彩": "色彩",
  "意味": "意思；含义",
  "此処": "这里",
  "温もり": "温暖；暖意",
  "求める": "寻求；要求",
  "伸ばす": "伸展；延长",
  "全部": "全部",
  "午前": "上午",
  "英語": "英语",
  "豚肉": "猪肉",
  "有る": "有；存在",
  "一番": "第一；最好",
  "色": "颜色",
  "終わる": "结束",
  "回": "次；回",
  "階": "楼层",
  "会社": "公司",
  "鍵": "钥匙",
  "側": "侧；一边",
  "切手": "邮票",
  "語": "语言",
  "背": "身高",
  "度": "次；度",
  "遠い": "远的",
  "日": "日；号",
  "箱": "箱子",
  "始め": "开始",
  "半分": "一半",
  "辺": "一带；附近",
  "方": "方向；一方",
  "他": "其他",
  "屋": "店；屋",
  "生き抜く": "顽强活下去；坚持到底",
  "理由": "理由；原因",
  "歌詞": "歌词",
  "安らか": "安详；平静",
  "温もり": "温暖；暖意",
  "初めて": "初次；第一次",
  "刻む": "刻下；铭记",
  "向き": "方向；朝向",
  "溶け合う": "交融；融为一体",
  "立つ": "站立；起身",
  "未来": "未来",
  "苦味": "苦味",
  "香り": "香气",
  "月": "月亮",
  "雪": "雪",
  "世界": "世界",
  "時間": "时间",
  "歌": "歌曲；歌唱",
  "声": "声音；嗓音",
  "心": "心；心灵",
  "夢": "梦；梦想",
  "涙": "眼泪",
  "夜": "夜晚",
  "光": "光；光芒",
  "記憶": "记忆",
}));

function translateMeaningToChinese(value) {
  const original = String(value || "").normalize("NFKC").trim();
  if (!original) return "";
  if (/[\p{Script=Han}]/u.test(original)) return original;
  const clean = original
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(?:intransitive|transitive|verb|noun|adjective|adverb|particle)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const exact = chineseMeaningDictionary.get(clean.toLowerCase());
  if (exact) return exact;
  const parts = clean.split(/\s*(?:;|,|\/|・|\bor\b|\band\b)\s*/i).filter(Boolean);
  const translated = parts.map(part => {
    const normalized = part.toLowerCase().replace(/^(?:a|an|the)\s+/, "").trim();
    if (chineseMeaningDictionary.has(normalized)) return chineseMeaningDictionary.get(normalized);
    if (normalized.startsWith("to ") && chineseMeaningDictionary.has(normalized.slice(3))) {
      return chineseMeaningDictionary.get(normalized.slice(3));
    }
    const tokenTranslations = {
      north: "北", south: "南", east: "东", west: "西", inside: "里面", outside: "外面",
      right: "右", left: "左", front: "前面", back: "后面", above: "上面", below: "下面",
      morning: "早晨", evening: "傍晚", school: "学校", room: "房间", person: "人",
      thing: "事物", place: "场所", animal: "动物", flower: "花", tree: "树",
    };
    const tokens = normalized.split(/\s+/).map(token => tokenTranslations[token]).filter(Boolean);
    return tokens.length ? tokens.join("") : "";
  }).filter(Boolean);
  return translated.length ? [...new Set(translated)].join("；") : original;
}

function translationSource(word) {
  const meaning = String(word?.[3] || "").normalize("NFKC").trim();
  if (meaning && !/[\p{Script=Han}]/u.test(meaning)) {
    return { cacheKey: `en:${meaning.toLowerCase()}`, text: meaning, pair: "en|zh-CN" };
  }
  return { cacheKey: `ja:${word?.[0] || ""}`, text: word?.[0] || "", pair: "ja|zh-CN" };
}

function translationBatches(items) {
  const batches = [];
  let batch = [];
  let bytes = 0;
  for (const item of items) {
    const itemBytes = new TextEncoder().encode(item.text).length;
    const separatorBytes = batch.length ? 1 : 0;
    if (batch.length && (bytes + separatorBytes + itemBytes > 420 || batch.length >= 24)) {
      batches.push(batch);
      batch = [];
      bytes = 0;
    }
    batch.push(item);
    bytes += (batch.length > 1 ? 1 : 0) + itemBytes;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

async function fetchTranslationBatch(batch, env = {}) {
  if (!batch.length) return [];
  const query = batch.map(item => item.text).join("\n");
  const [sourceLang, targetLang] = batch[0].pair.split("|");
  const endpoint = String(env.DEEPLX_URL || "https://deeplx.1stg.me/translate").trim();
  const headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "user-agent": "KotonohaKanjiPuzzle/1.0",
  };
  if (env.DEEPLX_TOKEN) headers.authorization = `Bearer ${env.DEEPLX_TOKEN}`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: query,
        source_lang: sourceLang === "en" ? "EN" : "JA",
        target_lang: targetLang.toUpperCase().startsWith("ZH") ? "ZH" : targetLang.toUpperCase(),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const translatedText = String(
      payload?.data ||
      payload?.translations?.[0]?.text ||
      "",
    ).trim();
    if (!translatedText || /^https?:\/\//i.test(translatedText)) return [];
    let results = translatedText.split(/\r?\n/).map(value => value.trim());
    if (results.length !== batch.length) {
      results = translatedText.split(/\s*(?:\|\|\||＜＜＜KOTONOHA＞＞＞)\s*/).map(value => value.trim());
    }
    if (results.length !== batch.length) return [];
    return results.map((translated, index) => ({
      ...batch[index],
      translated: translated
        .replace(/(?:^|；)([^；]+)(?:；\1)+/gu, "$1")
        .replace(/\s+/g, " ")
        .trim(),
    })).filter(item =>
      item.translated &&
      item.translated !== item.text &&
      /[\p{Script=Han}]/u.test(item.translated)
    );
  } catch {
    return [];
  }
}

async function cachedTranslations(db, cacheKeys) {
  if (!db || !cacheKeys.length) return new Map();
  try {
    await db.prepare(translationSchema).run();
    const found = new Map();
    for (let index = 0; index < cacheKeys.length; index += 80) {
      const keys = cacheKeys.slice(index, index + 80);
      const placeholders = keys.map(() => "?").join(",");
      const result = await db.prepare(
        `SELECT source, translated FROM translation_cache WHERE source IN (${placeholders})`
      ).bind(...keys).all();
      (result?.results || []).forEach(row => found.set(row.source, row.translated));
    }
    return found;
  } catch {
    return new Map();
  }
}

async function storeTranslations(db, translations) {
  if (!db || !translations.length) return;
  try {
    await db.prepare(translationSchema).run();
    const updatedAt = new Date().toISOString();
    await db.batch(translations.map(item => db.prepare(
      `INSERT INTO translation_cache (source, translated, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(source) DO UPDATE SET translated = excluded.translated, updated_at = excluded.updated_at`
    ).bind(item.cacheKey, item.translated, updatedAt)));
  } catch {
    // Translation still succeeds when persistent cache is temporarily unavailable.
  }
}

async function enrichChineseMeanings(words, env = {}) {
  const result = words.map(item => [...item]);
  const unresolved = [];
  result.forEach((word, index) => {
    const correction = japaneseMeaningCorrections.get(word[0]);
    if (correction) {
      word[3] = correction;
      return;
    }
    const meaning = String(word[3] || "").trim();
    if (meaning && /[\p{Script=Han}]/u.test(meaning) && !/^(相关词义|页面词汇|词义)$/u.test(meaning)) return;
    const source = translationSource(word);
    if (source.text) unresolved.push({ ...source, index });
  });
  const unique = [...new Map(unresolved.map(item => [item.cacheKey, item])).values()];
  const cached = await cachedTranslations(env.DB, unique.map(item => item.cacheKey));
  unresolved.forEach(item => {
    if (cached.has(item.cacheKey)) result[item.index][3] = cached.get(item.cacheKey);
  });
  const missing = unique.filter(item => !cached.has(item.cacheKey));
  const translated = [];
  for (const pair of ["en|zh-CN", "ja|zh-CN"]) {
    const pairItems = missing.filter(item => item.pair === pair);
    for (const batch of translationBatches(pairItems)) {
      translated.push(...await fetchTranslationBatch(batch, env));
    }
  }
  const live = new Map(translated.map(item => [item.cacheKey, item.translated]));
  unresolved.forEach(item => {
    if (live.has(item.cacheKey)) result[item.index][3] = live.get(item.cacheKey);
  });
  await storeTranslations(env.DB, translated);
  const japaneseFallback = result.flatMap((word, index) => {
    if (/[\p{Script=Han}]/u.test(String(word[3] || ""))) return [];
    return [{
      cacheKey: `ja:${word[0]}`,
      text: word[0],
      pair: "ja|zh-CN",
      index,
    }];
  });
  const fallbackUnique = [...new Map(japaneseFallback.map(item => [item.cacheKey, item])).values()];
  const fallbackCached = await cachedTranslations(env.DB, fallbackUnique.map(item => item.cacheKey));
  japaneseFallback.forEach(item => {
    if (fallbackCached.has(item.cacheKey)) result[item.index][3] = fallbackCached.get(item.cacheKey);
  });
  const fallbackTranslated = [];
  const fallbackMissing = fallbackUnique.filter(item => !fallbackCached.has(item.cacheKey));
  for (const batch of translationBatches(fallbackMissing)) {
    fallbackTranslated.push(...await fetchTranslationBatch(batch, env));
  }
  const fallbackLive = new Map(fallbackTranslated.map(item => [item.cacheKey, item.translated]));
  japaneseFallback.forEach(item => {
    if (fallbackLive.has(item.cacheKey)) result[item.index][3] = fallbackLive.get(item.cacheKey);
  });
  await storeTranslations(env.DB, fallbackTranslated);
  result.forEach(word => {
    if (!word[3] || !/[\p{Script=Han}]/u.test(word[3]) || /^(相关词义|页面词汇|词义)$/u.test(word[3])) {
      word[3] = japaneseMeaningCorrections.get(word[0]) || word[0];
    }
  });
  return result;
}

function extractStructuredWords(html) {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  const words = [];
  const seen = new Set();
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)]
      .map(match => textFromFragment(match[1]));
    if (cells.length < 2 || /^(kanji|漢字)$/i.test(cells[0]) || /^(furigana|よみ)$/i.test(cells[1])) continue;
    const reading = cells[1]
      .split(/[／/,，]/u)[0]
      .replace(/[〜~]/g, "")
      .replace(/\s+/g, "")
      .trim();
    if (!reading || !/[\u3040-\u30ff]/u.test(reading)) continue;
    const romaji = (cells[2] || "").split(/[,，/]/u)[0].replace(/[〜~]/g, "").trim();
    const meaning = translateMeaningToChinese(cells.slice(3).join("・").trim());
    const normalizedCell = normalizeTableWord(cells[0]);
    const candidates = wordsInsidePhrase(cells[0]);
    const phraseWasSplit = candidates.length > 1 || candidates[0] !== normalizedCell;
    for (const word of candidates) {
      const candidateReading = phraseWasSplit ? "" : reading;
      const key = `${word}\u0000${candidateReading}`;
      if (seen.has(key)) continue;
      seen.add(key);
      words.push(phraseWasSplit
        ? [word, "", "", ""]
        : [word, reading, romaji || kanaToRomaji(reading), meaning]);
      if (words.length >= MAX_STRUCTURED_WORDS) return words;
    }
  }
  return words;
}

function collectCandidates(text, { allowSingleKanji = false } = {}) {
  const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
  const counts = new Map();
  let sequence = 0;
  for (const segment of segmenter.segment(text)) {
    if (!segment.isWordLike) continue;
    const token = segment.segment
      .normalize("NFKC")
      .replace(/^[^\p{L}々〆ヵヶ]+|[^\p{L}々〆ヵヶ]+$/gu, "");
    const tokenLength = [...token].length;
    const minimumLength = allowSingleKanji ? 1 : 2;
    if (!token || tokenLength < minimumLength || tokenLength > 18 || !kanjiPattern.test(token) || !beginsOrEndsWithKanji(token)) continue;
    if (/^(これ|それ|ため|よう|もの|こと|ところ|とき|及び|また|さらに|ページ|サイト)$/u.test(token)) continue;
    const existing = counts.get(token);
    if (existing) existing.count += 1;
    else counts.set(token, { token, count: 1, order: sequence++ });
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.order - b.order)
    .slice(0, MAX_CANDIDATES)
    .map(item => item.token);
}

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
  const kana = [...reading].map(character => {
    const code = character.charCodeAt(0);
    return code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : character;
  });
  let result = "";
  let doubleNext = false;
  for (let index = 0; index < kana.length; index += 1) {
    if (kana[index] === "っ") {
      doubleNext = true;
      continue;
    }
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

function conjugatedStem(value, mode, kind) {
  if (kind === "suru" && value.endsWith("する")) return `${value.slice(0, -2)}し`;
  if (kind === "kuru") {
    if (value.endsWith("くる")) return `${value.slice(0, -2)}${mode === "masu" ? "き" : "こ"}`;
    if (value.endsWith("来る")) return `${value.slice(0, -2)}来`;
  }
  if (kind === "ichidan" && value.endsWith("る")) return value.slice(0, -1);
  const endings = {
    う: ["い", "わ"], く: ["き", "か"], ぐ: ["ぎ", "が"], す: ["し", "さ"],
    つ: ["ち", "た"], ぬ: ["に", "な"], ぶ: ["び", "ば"], む: ["み", "ま"], る: ["り", "ら"],
  };
  const ending = value.at(-1);
  const replacement = endings[ending]?.[mode === "masu" ? 0 : 1];
  return replacement ? `${value.slice(0, -1)}${replacement}` : value;
}

function cleanFreeDictionaryForm(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+\^$/u, "")
    .replace(/\s+(?:intransitive|transitive|godan|ichidan|suru|kuru).*$/iu, "")
    .replace(/\s*\[[^\]]*\]\s*$/u, "")
    .trim();
}

function freeDictionaryForm(entry, predicate, {
  preferEnding = "",
  removeEnding = "",
} = {}) {
  const forms = (entry?.forms || [])
    .filter(form => predicate(form.tags || [], cleanFreeDictionaryForm(form.word)))
    .map(form => ({
      value: cleanFreeDictionaryForm(form.word),
      tags: form.tags || [],
    }))
    .filter(form => form.value && !/^(?:no-table-tags|ja-[a-z-]+)$/iu.test(form.value));
  const rank = form => {
    const value = form.value;
    const isJapanese = /[\p{Script=Han}\u3040-\u30ff]/u.test(value);
    const hasKanji = /[\p{Script=Han}]/u.test(value);
    const isKana = /^[\u3040-\u30ffー]+$/u.test(value);
    const ending = !preferEnding || value.endsWith(preferEnding);
    const noisy = form.tags.some(tag => /colloquial|literary|archaic|historical|error/i.test(tag));
    return Number(isJapanese) * 100 + Number(ending) * 40 + Number(hasKanji) * 20 +
      Number(isKana) * 10 - Number(noisy) * 30 - value.length / 100;
  };
  const surface = forms
    .filter(form => /[\p{Script=Han}]/u.test(form.value))
    .sort((a, b) => rank(b) - rank(a))[0]?.value;
  const reading = forms
    .filter(form => /^[\u3040-\u30ffー]+$/u.test(form.value))
    .sort((a, b) => rank(b) - rank(a))[0]?.value;
  if (!surface && !reading) return null;
  const trimEnding = value => removeEnding && value?.endsWith(removeEnding)
    ? value.slice(0, -removeEnding.length)
    : value;
  return {
    surface: trimEnding(surface),
    reading: trimEnding(reading),
  };
}

function readingForSurface(currentWord, currentReading, targetWord) {
  if (!targetWord || currentWord === targetWord) return currentReading;
  const currentTail = currentWord.match(/[ぁ-ゖァ-ヺー]+$/u)?.[0] || "";
  const targetTail = targetWord.match(/[ぁ-ゖァ-ヺー]+$/u)?.[0] || "";
  if (currentTail && currentReading.endsWith(currentTail)) {
    return `${currentReading.slice(0, -currentTail.length)}${targetTail}`;
  }
  return currentReading;
}

function normalizedFreeDictionaryEntry(entry, word, reading) {
  const partOfSpeech = String(entry?.partOfSpeech || "").toLowerCase();
  if (partOfSpeech === "adjective") {
    if (word.endsWith("い") && reading.endsWith("い")) {
      return [word.slice(0, -1), reading.slice(0, -1), kanaToRomaji(reading.slice(0, -1)), word];
    }
    const attributive = freeDictionaryForm(
      entry,
      tags => tags.includes("attributive") && tags.includes("stem"),
      { preferEnding: "な" },
    );
    if (attributive?.surface?.endsWith("な")) {
      const displayWord = attributive.surface.slice(0, -1);
      const displayReading = (attributive.reading || readingForSurface(word, reading, attributive.surface)).replace(/な$/u, "");
      return [displayWord, displayReading, kanaToRomaji(displayReading), attributive.surface];
    }
  }
  if (partOfSpeech !== "verb") return [word, reading, kanaToRomaji(reading), word];

  const stem = freeDictionaryForm(
    entry,
    tags => tags.length === 1 && tags[0] === "stem",
  ) || freeDictionaryForm(
    entry,
    tags => tags.includes("continuative") && tags.includes("stem"),
  );
  const negative = freeDictionaryForm(
    entry,
    (tags, value) => tags.includes("negative") && !tags.includes("formal") &&
      !tags.includes("past") && value.endsWith("ない"),
    { preferEnding: "ない", removeEnding: "ない" },
  );
  const potential = freeDictionaryForm(
    entry,
    tags => tags.includes("potential") && !tags.includes("negative") &&
      !tags.includes("passive") && !tags.includes("colloquial"),
    { preferEnding: "る", removeEnding: "る" },
  ) || freeDictionaryForm(
    entry,
    tags => tags.includes("imperative") && !tags.includes("literary"),
  );
  const forms = [
    { surface: word, reading },
    stem,
    negative,
    potential,
  ].map((form, index) => {
    const surface = form?.surface || (index ? word : word);
    const formReading = form?.reading || readingForSurface(word, reading, surface);
    return `${surface}|${formReading}|${kanaToRomaji(formReading)}`;
  });
  return [word, reading, kanaToRomaji(reading), forms.join("・")];
}

function normalizedDictionaryEntry(entry, exactForm) {
  const parts = (entry.senses || []).flatMap(sense => sense.parts_of_speech || []);
  const partText = parts.join(" ");
  const word = exactForm.word;
  const reading = exactForm.reading;
  const isNaAdjective = /Na-adjective/i.test(partText);
  const isIAdjective = /I-adjective/i.test(partText);
  if (isNaAdjective) {
    const displayWord = word.endsWith("な") ? word.slice(0, -1) : word;
    const displayReading = reading.endsWith("な") ? reading.slice(0, -1) : reading;
    return [displayWord, displayReading, kanaToRomaji(displayReading), `${displayWord}な`];
  }
  if (isIAdjective && word.endsWith("い") && reading.endsWith("い")) {
    const displayWord = word.slice(0, -1);
    const displayReading = reading.slice(0, -1);
    return [displayWord, displayReading, kanaToRomaji(displayReading), word];
  }
  const isVerb = /\bverb\b|Godan|Ichidan|Suru|Kuru/i.test(partText);
  if (!isVerb) return [word, reading, kanaToRomaji(reading), word];
  const kind = /Suru/i.test(partText) || word.endsWith("する")
    ? "suru"
    : /Kuru/i.test(partText) || word === "来る"
      ? "kuru"
      : /Ichidan/i.test(partText)
        ? "ichidan"
        : "godan";
  const masuWord = conjugatedStem(word, "masu", kind);
  const naiWord = conjugatedStem(word, "nai", kind);
  const masuReading = conjugatedStem(reading, "masu", kind);
  const naiReading = conjugatedStem(reading, "nai", kind);
  const encodedForms = [
    `${word}|${reading}|${kanaToRomaji(reading)}`,
    `${masuWord}|${masuReading}|${kanaToRomaji(masuReading)}`,
    `${naiWord}|${naiReading}|${kanaToRomaji(naiReading)}`,
  ].join("・");
  return [word, reading, kanaToRomaji(reading), encodedForms];
}

function preferredFreeDictionaryEntry(entries, partText, candidate) {
  const normalizedPartText = String(partText || "");
  if (/\bverb\b|Godan|Ichidan|Suru|Kuru/i.test(normalizedPartText)) {
    return entries.find(entry => entry.partOfSpeech === "verb") || null;
  }
  if (/adjective/i.test(normalizedPartText) || candidate.endsWith("い")) {
    return entries.find(entry => entry.partOfSpeech === "adjective") || null;
  }
  return entries.find(entry => entry.partOfSpeech === "noun") || entries[0] || null;
}

async function fetchFreeDictionaryEntries(candidate) {
  try {
    const response = await fetch(
      `https://freedictionaryapi.com/api/v1/entries/ja/${encodeURIComponent(candidate)}?translations=false`,
      {
        headers: { "accept": "application/json" },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) return null;
    const payload = await response.json();
    return Array.isArray(payload?.entries) ? payload.entries : [];
  } catch {
    return [];
  }
}

async function lookupWord(candidate, provided = null) {
  try {
    const freeDictionaryPromise = fetchFreeDictionaryEntries(candidate);
    const jishoPromise = fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(candidate)}`, {
      headers: { "accept": "application/json" },
      signal: AbortSignal.timeout(8_000),
    }).then(async response => response.ok ? response.json() : null).catch(() => null);
    const [jishoPayload, freeEntries] = await Promise.all([jishoPromise, freeDictionaryPromise]);
    const entries = Array.isArray(jishoPayload?.data) ? jishoPayload.data : [];
    const entry = entries.find(item => item.japanese?.some(form => form.word === candidate)) || null;
    const exactForm = entry?.japanese?.find(form => form.word === candidate) || null;
    const word = exactForm?.word || provided?.[0] || "";
    const reading = exactForm?.reading || provided?.[1] || "";
    if (!word || !reading) return null;
    const partText = (entry?.senses || []).flatMap(sense => sense.parts_of_speech || []).join(" ");
    const freeEntry = preferredFreeDictionaryEntry(freeEntries, partText, candidate);
    const normalized = freeEntry
      ? normalizedFreeDictionaryEntry(freeEntry, word, reading)
      : normalizedDictionaryEntry(entry || { senses: [] }, { word, reading });
    const providedMeaning = String(provided?.[3] || "").trim();
    const meaning = providedMeaning ||
      translateMeaningToChinese(entry?.senses?.[0]?.english_definitions?.slice(0, 2).join("・"));
    const [normalizedWord, normalizedReading, romaji, form] = normalized;
    return [normalizedWord, normalizedReading, romaji, meaning, form];
  } catch {
    return null;
  }
}

async function extractWords(url, env) {
  const { html, finalUrl } = await fetchHtml(url);
  const pageTitle = titleFromHtml(html, new URL(finalUrl).hostname);
  const rawStructuredWords = extractStructuredWords(html);
  const structuredWords = [];
  const structuredSeen = new Set();
  for (let index = 0; index < rawStructuredWords.length; index += 6) {
    const batch = await Promise.all(rawStructuredWords.slice(index, index + 6).map(item =>
      lookupWord(item[0], item)
    ));
    for (const item of batch) {
      if (!item || structuredSeen.has(item[0])) continue;
      structuredSeen.add(item[0]);
      structuredWords.push(item);
    }
  }
  if (structuredWords.length >= 8) {
    return {
      title: compactListTitle(pageTitle, finalUrl),
      sourceUrl: finalUrl,
      words: await enrichChineseMeanings(structuredWords, env),
    };
  }
  const text = visibleTextFromHtml(html);
  const result = await extractWordsFromText(text, pageTitle, finalUrl, {}, env);
  result.title = compactListTitle(pageTitle, finalUrl);
  return result;
}

async function extractWordsFromText(text, title, sourceUrl, options = {}, env = {}) {
  if (!text?.trim()) throw new Error("ページの本文が見つかりません。");
  const candidates = collectCandidates(text, options);
  const found = [];
  const seen = new Set();
  for (let index = 0; index < candidates.length && found.length < MAX_WORDS; index += 6) {
    const batch = await Promise.all(candidates.slice(index, index + 6).map(lookupWord));
    for (const word of batch) {
      if (!word || seen.has(word[0])) continue;
      seen.add(word[0]);
      found.push(word);
      if (found.length === MAX_WORDS) break;
    }
  }
  if (!found.length) throw new Error("かんじのことばを見つけられませんでした。");
  return {
    title: String(title || "ページからのことば").slice(0, 100),
    sourceUrl: String(sourceUrl || "").slice(0, 2048),
    words: await enrichChineseMeanings(found, env),
  };
}

async function ensureAccountTables(db) {
  await db.prepare(userSchema).run();
  await db.prepare(sessionSchema).run();
  await db.prepare(saveSchema).run();
}

function normalizedEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) && email.length <= 254 ? email : "";
}

function validPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}

async function createSession(request, db, userId) {
  const token = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256(token);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_MAX_AGE * 1000);
  await db.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
  ).bind(tokenHash, userId, expiresAt.toISOString(), createdAt.toISOString()).run();
  return sessionCookie(request, token);
}

async function currentUser(request, env) {
  if (!env.DB) return null;
  await ensureAccountTables(env.DB);
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(
    `SELECT users.id, users.email, sessions.expires_at AS expiresAt
     FROM sessions JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ?`
  ).bind(tokenHash).first();
  if (!row) return null;
  if (Date.parse(row.expiresAt) <= Date.now()) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    return null;
  }
  return { id: row.id, email: row.email, tokenHash };
}

async function handleAuthRequest(request, env, action) {
  if (!env.DB) return json({ error: "アカウントを使えません。" }, 503);
  await ensureAccountTables(env.DB);
  if (action === "status" && request.method === "GET") {
    const user = await currentUser(request, env);
    return json({ user: user ? { email: user.email } : null });
  }
  if (action === "logout" && request.method === "POST") {
    const user = await currentUser(request, env);
    if (user) {
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(user.tokenHash).run();
    }
    return json({ ok: true }, 200, { "set-cookie": sessionCookie(request, "", 0) });
  }
  if (!["register", "login"].includes(action) || request.method !== "POST") {
    return json({ error: "この操作は使えません。" }, 405);
  }
  const body = await request.json().catch(() => ({}));
  const email = normalizedEmail(body.email);
  const password = body.password;
  if (!email) return json({ error: "メールアドレスをたしかめてください。" }, 400);
  if (!validPassword(password)) {
    return json({ error: "パスワードは8〜128文字で入力してください。" }, 400);
  }
  if (action === "register") {
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return json({ error: "このメールアドレスはすでに使われています。" }, 409);
    const id = crypto.randomUUID();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await derivePasswordHash(password, salt);
    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, email, passwordHash, bytesToBase64Url(salt), new Date().toISOString()).run();
    const cookie = await createSession(request, env.DB, id);
    return json({ user: { email } }, 201, { "set-cookie": cookie });
  }
  const row = await env.DB.prepare(
    "SELECT id, email, password_hash AS passwordHash, password_salt AS passwordSalt FROM users WHERE email = ?"
  ).bind(email).first();
  if (!row) return json({ error: "メールアドレスまたはパスワードがちがいます。" }, 401);
  const passwordHash = await derivePasswordHash(password, base64UrlToBytes(row.passwordSalt));
  if (!equalSecret(passwordHash, row.passwordHash)) {
    return json({ error: "メールアドレスまたはパスワードがちがいます。" }, 401);
  }
  const cookie = await createSession(request, env.DB, row.id);
  return json({ user: { email: row.email } }, 200, { "set-cookie": cookie });
}

async function handleSaveRequest(request, env) {
  if (!env.DB) return json({ error: "ほぞんを使えません。" }, 503);
  const user = await currentUser(request, env);
  if (!user) return json({ error: "ログインがひつようです。" }, 401);
  if (request.method === "GET") {
    const row = await env.DB.prepare(
      "SELECT payload, updated_at AS updatedAt FROM user_saves WHERE user_id = ?"
    ).bind(user.id).first();
    if (!row) return json({ save: null });
    try {
      return json({ save: JSON.parse(row.payload), updatedAt: row.updatedAt });
    } catch {
      return json({ error: "セーブデータを読みこめませんでした。" }, 500);
    }
  }
  if (request.method === "POST") {
    const body = await request.json();
    const payload = JSON.stringify(body?.save);
    if (!body?.save || payload.length > MAX_SAVE_CHARS) {
      return json({ error: "セーブデータの内容をたしかめてください。" }, 400);
    }
    const updatedAt = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO user_saves (user_id, payload, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`
    ).bind(user.id, payload, updatedAt).run();
    return json({ ok: true, updatedAt });
  }
  if (request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM user_saves WHERE user_id = ?").bind(user.id).run();
    return json({ ok: true });
  }
  return json({ error: "この操作は使えません。" }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/pdf" && request.method === "GET") {
      try {
        return await fetchPdf(url.searchParams.get("url") || "");
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "PDFを読みこめませんでした。" }, 400);
      }
    }
    if (url.pathname === "/api/extract-text" && request.method === "POST") {
      try {
        const body = await request.json();
        if (typeof body?.text !== "string" || !body.text.trim() || body.text.length > MAX_HTML_CHARS) {
          return json({ error: "PDFの文字を読みこめませんでした。" }, 400);
        }
        return json(await extractWordsFromText(
          body.text,
          body.title,
          body.sourceUrl,
          { allowSingleKanji: true },
          env,
        ));
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "PDFからことばを取り出せませんでした。" }, 422);
      }
    }
    if (url.pathname.startsWith("/api/auth/")) {
      try {
        return await handleAuthRequest(request, env, url.pathname.slice("/api/auth/".length));
      } catch {
        return json({ error: "アカウントを操作できませんでした。" }, 500);
      }
    }
    if (url.pathname === "/api/save") {
      try {
        return await handleSaveRequest(request, env);
      } catch {
        return json({ error: "セーブデータを操作できませんでした。" }, 500);
      }
    }
    if (url.pathname === "/api/extract" && request.method === "POST") {
      try {
        const body = await request.json();
        if (typeof body?.url !== "string" || body.url.length > 2048) {
          return json({ error: "URLをたしかめてください。" }, 400);
        }
        return json(await extractWords(body.url, env));
      } catch (error) {
        const message = error instanceof Error ? error.message : "ページを読みこめませんでした。";
        if (error?.pdf) return json({ error: message, pdf: true }, 415);
        const status = /URL|読みこめません|HTML|大きすぎ|移動/.test(message) ? 400 : 422;
        return json({ error: message }, status);
      }
    }

    const assetPath = url.pathname === "/" ? "/index.html" : url.pathname;
    if (env.ASSETS) {
      const assetUrl = new URL(assetPath, url.origin);
      const response = await env.ASSETS.fetch(new Request(assetUrl, request));
      if (response.status !== 404) return response;
    }
    return new Response("Not found", { status: 404 });
  },
};

export {
  collectCandidates,
  compactListTitle,
  enrichChineseMeanings,
  extractStructuredWords,
  fetchTranslationBatch,
  lookupWord,
  normalizedFreeDictionaryEntry,
  translateMeaningToChinese,
  visibleTextFromHtml,
  wordsInsidePhrase,
};
