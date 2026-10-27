/**
 * @file tenji-data.js
 * @description 点字文字一覧・五十音表用の構造化データおよびユーティリティ
 */

/**
 * 6ビットの点字文字列から、突起しているドット番号の配列（1〜6）を返します。
 * @param {string} bits6 - 6桁の点字バイナリ文字列（例: "100100"）
 * @returns {number[]} 突起しているドット番号の配列（例: [1, 4]）
 */
export function getDotNumbers(bits6) {
  if (!bits6 || bits6.length !== 6) return [];
  const map = [1, 2, 3, 4, 5, 6];
  const dots = [];
  for (let i = 0; i < 6; i++) {
    if (bits6[i] === "1") {
      dots.push(map[i]);
    }
  }
  return dots;
}

/**
 * 点番号の配列を読みやすい文字列にフォーマットします（例: "1・4の点"）。
 * @param {number[]} dots
 * @returns {string}
 */
export function formatDotNumbers(dots) {
  if (!dots || dots.length === 0) return "点なし";
  return `${dots.join("・")}の点`;
}

/**
 * 6桁または12桁の点字ビット列から、マスごとの点番号ラベルを生成します。
 * 2マスの場合は「前置: 4の点 / 本体: 1・6の点」のような形式になります。
 * @param {string} bits
 * @returns {{ cells: Array<{ bits: string, dots: number[], label: string }>, summary: string }}
 */
export function getTenjiPatternDetails(bits) {
  if (!bits) return { cells: [], summary: "" };

  if (bits.length === 6) {
    const dots = getDotNumbers(bits);
    return {
      cells: [{ bits, dots, label: formatDotNumbers(dots) }],
      summary: formatDotNumbers(dots),
    };
  } else if (bits.length === 12) {
    const bits1 = bits.substring(0, 6);
    const bits2 = bits.substring(6, 12);
    const dots1 = getDotNumbers(bits1);
    const dots2 = getDotNumbers(bits2);
    return {
      cells: [
        { bits: bits1, dots: dots1, label: `前置: ${formatDotNumbers(dots1)}` },
        { bits: bits2, dots: dots2, label: `本体: ${formatDotNumbers(dots2)}` },
      ],
      summary: `[前置] ${formatDotNumbers(dots1)} + [本体] ${formatDotNumbers(dots2)}`,
    };
  }

  return { cells: [], summary: "" };
}

/**
 * 五十音（清音）マトリクスデータ
 * 段（母音）: あ、い、う、え、お
 * 行（子音）: あ行〜わ行
 */
export const GOJUON_MATRIX = {
  columns: [
    { key: "a", label: "あ段", vowelDots: "1の点" },
    { key: "i", label: "い段", vowelDots: "1・2の点" },
    { key: "u", label: "う段", vowelDots: "1・4の点" },
    { key: "e", label: "え段", vowelDots: "1・2・4の点" },
    { key: "o", label: "お段", vowelDots: "2・4の点" },
  ],
  rows: [
    {
      name: "あ行",
      consonantNote: "母音のみ",
      items: [
        { char: "あ", bits: "100000" },
        { char: "い", bits: "110000" },
        { char: "う", bits: "100100" },
        { char: "え", bits: "110100" },
        { char: "お", bits: "010100" },
      ],
    },
    {
      name: "か行",
      consonantNote: "＋6の点",
      items: [
        { char: "か", bits: "100001" },
        { char: "き", bits: "110001" },
        { char: "く", bits: "100101" },
        { char: "け", bits: "110101" },
        { char: "こ", bits: "010101" },
      ],
    },
    {
      name: "さ行",
      consonantNote: "＋5・6の点",
      items: [
        { char: "さ", bits: "100011" },
        { char: "し", bits: "110011" },
        { char: "す", bits: "100111" },
        { char: "せ", bits: "110111" },
        { char: "そ", bits: "010111" },
      ],
    },
    {
      name: "た行",
      consonantNote: "＋3・5の点",
      items: [
        { char: "た", bits: "101010" },
        { char: "ち", bits: "111010" },
        { char: "つ", bits: "101110" },
        { char: "て", bits: "111110" },
        { char: "と", bits: "011110" },
      ],
    },
    {
      name: "な行",
      consonantNote: "＋3の点",
      items: [
        { char: "な", bits: "101000" },
        { char: "に", bits: "111000" },
        { char: "ぬ", bits: "101100" },
        { char: "ね", bits: "111100" },
        { char: "の", bits: "011100" },
      ],
    },
    {
      name: "は行",
      consonantNote: "＋3・6の点",
      items: [
        { char: "は", bits: "101001" },
        { char: "ひ", bits: "111001" },
        { char: "ふ", bits: "101101" },
        { char: "へ", bits: "111101" },
        { char: "ほ", bits: "011101" },
      ],
    },
    {
      name: "ま行",
      consonantNote: "＋3・5・6の点",
      items: [
        { char: "ま", bits: "101011" },
        { char: "み", bits: "111011" },
        { char: "む", bits: "101111" },
        { char: "め", bits: "111111" },
        { char: "も", bits: "011111" },
      ],
    },
    {
      name: "や行",
      consonantNote: "母音を下段配置",
      items: [
        { char: "や", bits: "001100" },
        null,
        { char: "ゆ", bits: "001101" },
        null,
        { char: "よ", bits: "001110" },
      ],
    },
    {
      name: "ら行",
      consonantNote: "＋5の点",
      items: [
        { char: "ら", bits: "100010" },
        { char: "り", bits: "110010" },
        { char: "る", bits: "100110" },
        { char: "れ", bits: "110110" },
        { char: "ろ", bits: "010110" },
      ],
    },
    {
      name: "わ行・ん",
      consonantNote: "固有の点配置",
      items: [
        { char: "わ", bits: "001000" },
        null,
        null,
        null,
        { char: "を", bits: "001010" },
      ],
      extra: [{ char: "ん", bits: "001011", note: "撥音（3・5・6の点）" }],
    },
  ],
};

/**
 * カテゴリごとの一覧データ（マトリクス以外の濁音、半濁音、拗音、特殊音、記号）
 */
export const CHAR_SECTIONS = [
  {
    id: "dakuon",
    title: "濁音・半濁音",
    category: "dakuon",
    description: "濁音は前に【濁点（5の点）】、半濁音は前に【半濁点（6の点）】を置く2マス構成です。",
    groups: [
      {
        name: "が行（濁音）",
        items: [
          { char: "が", bits: "000010100001" },
          { char: "ぎ", bits: "000010110001" },
          { char: "ぐ", bits: "000010100101" },
          { char: "げ", bits: "000010110101" },
          { char: "ご", bits: "000010010101" },
        ],
      },
      {
        name: "ざ行（濁音）",
        items: [
          { char: "ざ", bits: "000010100011" },
          { char: "じ", bits: "000010110011" },
          { char: "ず", bits: "000010100111" },
          { char: "ぜ", bits: "000010110111" },
          { char: "ぞ", bits: "000010010111" },
        ],
      },
      {
        name: "だ行（濁音）",
        items: [
          { char: "だ", bits: "000010101010" },
          { char: "ぢ", bits: "000010111010" },
          { char: "づ", bits: "000010101110" },
          { char: "で", bits: "000010111110" },
          { char: "ど", bits: "000010011110" },
        ],
      },
      {
        name: "ば行（濁音）",
        items: [
          { char: "ば", bits: "000010101001" },
          { char: "び", bits: "000010111001" },
          { char: "ぶ", bits: "000010101101" },
          { char: "べ", bits: "000010111101" },
          { char: "ぼ", bits: "000010011101" },
        ],
      },
      {
        name: "ぱ行（半濁音）",
        items: [
          { char: "ぱ", bits: "000001101001" },
          { char: "ぴ", bits: "000001111001" },
          { char: "ぷ", bits: "000001101101" },
          { char: "ぺ", bits: "000001111101" },
          { char: "ぽ", bits: "000001011101" },
        ],
      },
      {
        name: "ヴ（濁音）",
        items: [{ char: "ヴ", bits: "000010100100" }],
      },
    ],
  },
  {
    id: "youon",
    title: "拗音（ようおん）",
    category: "youon",
    description: "拗音は前に【拗音点（4の点）】、拗濁音は【4・5の点】、拗半濁音は【4・6の点】を置きます。",
    groups: [
      {
        name: "き・し・ち行の拗音",
        items: [
          { char: "きゃ", bits: "000100100001" },
          { char: "きゅ", bits: "000100100101" },
          { char: "きょ", bits: "000100010101" },
          { char: "しゃ", bits: "000100100011" },
          { char: "しゅ", bits: "000100100111" },
          { char: "しょ", bits: "000100010111" },
          { char: "ちゃ", bits: "000100101010" },
          { char: "ちゅ", bits: "000100101110" },
          { char: "ちょ", bits: "000100011110" },
        ],
      },
      {
        name: "に・ひ・み・り行の拗音",
        items: [
          { char: "にゃ", bits: "000100101000" },
          { char: "にゅ", bits: "000100101100" },
          { char: "にょ", bits: "000100011100" },
          { char: "ひゃ", bits: "000100101001" },
          { char: "ひゅ", bits: "000100101101" },
          { char: "ひょ", bits: "000100011101" },
          { char: "みゃ", bits: "000100101011" },
          { char: "みゅ", bits: "000100101111" },
          { char: "みょ", bits: "000100011111" },
          { char: "りゃ", bits: "000100100010" },
          { char: "りゅ", bits: "000100100110" },
          { char: "りょ", bits: "000100010110" },
        ],
      },
      {
        name: "拗濁音（ぎ・じ・ぢ・び）",
        items: [
          { char: "ぎゃ", bits: "000110100001" },
          { char: "ぎゅ", bits: "000110100101" },
          { char: "ぎょ", bits: "000110010101" },
          { char: "じゃ", bits: "000110100011" },
          { char: "じゅ", bits: "000110100111" },
          { char: "じょ", bits: "000110010111" },
          { char: "ぢゃ", bits: "000110101010" },
          { char: "ぢゅ", bits: "000110101110" },
          { char: "ぢょ", bits: "000110011110" },
          { char: "びゃ", bits: "000110101001" },
          { char: "びゅ", bits: "000110101101" },
          { char: "びょ", bits: "000110011101" },
        ],
      },
      {
        name: "拗半濁音（ぴ）",
        items: [
          { char: "ぴゃ", bits: "000101101001" },
          { char: "ぴゅ", bits: "000101101101" },
          { char: "ぴょ", bits: "000101011101" },
        ],
      },
    ],
  },
  {
    id: "tokusyu",
    title: "特殊音・外来音",
    category: "tokusyu",
    description: "外来語や現代語の表現に用いられる特殊な音の組み合わせです。",
    groups: [
      {
        name: "合拗音・う段系（うぃ、くぁ等）",
        items: [
          { char: "うぃ", bits: "010001110000" },
          { char: "うぇ", bits: "010001110100" },
          { char: "うぉ", bits: "010001010100" },
          { char: "くぁ", bits: "010001100001" },
          { char: "くぃ", bits: "010001110001" },
          { char: "くぇ", bits: "010001110101" },
          { char: "くぉ", bits: "010001010101" },
          { char: "ぐぁ", bits: "010011100001" },
          { char: "ぐぃ", bits: "010011110001" },
          { char: "ぐぇ", bits: "010011110101" },
          { char: "ぐぉ", bits: "010011010101" },
        ],
      },
      {
        name: "つ・ふ・ヴ系（つぁ、ふぁ、ヴぁ等）",
        items: [
          { char: "つぁ", bits: "010001101010" },
          { char: "つぃ", bits: "010001111010" },
          { char: "つぇ", bits: "010001111110" },
          { char: "つぉ", bits: "010001011110" },
          { char: "ふぁ", bits: "010001101001" },
          { char: "ふぃ", bits: "010001111001" },
          { char: "ふぇ", bits: "010001111101" },
          { char: "ふぉ", bits: "010001011101" },
          { char: "ヴぁ", bits: "010011101001" },
          { char: "ヴぃ", bits: "010011111001" },
          { char: "ヴぇ", bits: "010011111101" },
          { char: "ヴぉ", bits: "010011011101" },
        ],
      },
      {
        name: "いぇ・しぇ・てぃ・でぃ・とぅ等",
        items: [
          { char: "いぇ", bits: "000100110100" },
          { char: "きぇ", bits: "000100110101" },
          { char: "しぇ", bits: "000100110111" },
          { char: "じぇ", bits: "000110110111" },
          { char: "ちぇ", bits: "000100111110" },
          { char: "にぇ", bits: "000100111100" },
          { char: "ひぇ", bits: "000100111101" },
          { char: "すぃ", bits: "000100110011" },
          { char: "ずぃ", bits: "000110110011" },
          { char: "てぃ", bits: "000100111010" },
          { char: "でぃ", bits: "000110111010" },
          { char: "とぅ", bits: "010001101110" },
          { char: "どぅ", bits: "010011101110" },
          { char: "てゅ", bits: "000101111010" },
          { char: "でゅ", bits: "000111111010" },
          { char: "ふゅ", bits: "000101001101" },
          { char: "ヴゅ", bits: "000111001101" },
          { char: "ふょ", bits: "000101001110" },
          { char: "ヴょ", bits: "000111001110" },
        ],
      },
    ],
  },
  {
    id: "symbols",
    title: "記号・促音・長音",
    category: "symbols",
    description: "単一マスで表現される補助記号です。",
    groups: [
      {
        name: "促音・長音・感嘆符",
        items: [
          { char: "っ", bits: "010000", note: "促音（2の点）" },
          { char: "ー", bits: "010010", note: "長音（2・5の点）" },
          { char: "！", bits: "011010", note: "感嘆符（2・3・5の点）" },
        ],
      },
    ],
  },
];

/**
 * 検索用に全文字アイテムをフラットな配列として生成します。
 * @returns {Array<{ char: string, bits: string, category: string, categoryName: string, groupName: string }>}
 */
export function getAllCharItems() {
  const items = [];

  // 1. 五十音
  GOJUON_MATRIX.rows.forEach((row) => {
    row.items.forEach((item) => {
      if (item) {
        items.push({
          char: item.char,
          bits: item.bits,
          category: "gojuon",
          categoryName: "五十音（清音）",
          groupName: row.name,
        });
      }
    });
    if (row.extra) {
      row.extra.forEach((item) => {
        items.push({
          char: item.char,
          bits: item.bits,
          category: "gojuon",
          categoryName: "五十音（清音）",
          groupName: row.name,
          note: item.note,
        });
      });
    }
  });

  // 2. 濁音・拗音・特殊音・記号
  CHAR_SECTIONS.forEach((sec) => {
    sec.groups.forEach((grp) => {
      grp.items.forEach((item) => {
        items.push({
          char: item.char,
          bits: item.bits,
          category: sec.category,
          categoryName: sec.title,
          groupName: grp.name,
          note: item.note,
        });
      });
    });
  });

  return items;
}

