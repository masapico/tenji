export const identifyTenji = (value: string) => {
  if (TenjiMap[value]) {
    const char: string = TenjiMap[value];
    if (char.startsWith("cmb")) {
      return "組合せに利用する点";
    } else {
      return TenjiMap[value];
    }
  }
};

export const identifyTenjiArray = (values: string[]) => {
  const chars: string[] = [];
  const cmb: string[] = [];
  values.map((value) => {
    if (TenjiMap[value]) {
      const char: string = TenjiMap[value];
      if (char.startsWith("cmb")) {
        cmb.push(value);
        chars.push("　");
      } else {
        if (cmb.length !== 0) {
          // 組合せパターンの値 12桁
          const cmbValue = `${cmb[0]}${value}`;
          cmb.pop(); // 組合せ判定後に削除

          console.log(TenjiCombinationMap[cmbValue]);

          if (TenjiCombinationMap[cmbValue]) {
            chars.push(`${TenjiCombinationMap[cmbValue]}`);
          }
        } else {
          chars.push(`${char}`);
        }
      }
    } else {
      // TenjiMapに存在しない場合は全角アンダーバー
      chars.push("　");
    }
  });
  return chars;
};

export const getTenjiValues = (words: string) => {
  let tmp = words.replace("^", "_");
  // 先に組合せパターンを変換
  const cmbKeys = Object.keys(TenjiCombinationMap);
  cmbKeys.map((key) => {
    if (tmp.includes(TenjiCombinationMap[key])) {
      const replaceValue = `${key.substring(0, 6)}^${key.substring(
        6,
        key.length
      )}^`;
      const regex = new RegExp(TenjiCombinationMap[key], "g");
      tmp = tmp.replace(regex, replaceValue);
    }
  });
  const keys = Object.keys(TenjiMap);
  keys.map((key) => {
    if (tmp.includes(TenjiMap[key])) {
      const regex = new RegExp(TenjiMap[key], "g");
      tmp = tmp.replace(regex, `${key}^`);
    }
  });
  // 最後の^は削除して分割
  return tmp.substring(0, tmp.length - 1).split("^");
};

const TenjiMap: Record<string, string> = {
  // 値の並び
  // | 1 | 4 |
  // | 2 | 5 |
  // | 3 | 6 |
  "000010": "cmbDakuten",
  "000001": "cmbHanDakuten",
  "000100": "cmbYouon",
  "000110": "cmbYouDakuon",
  "000101": "cmbYouDakuon",
  "010000": "っ",
  "010010": "ー",
  "000011": "、",
  "010011": "。",
  "011010": "！",
  "010001": "？",
  "100000": "あ",
  "110000": "い",
  "100100": "う",
  "110100": "え",
  "010100": "お",
  "100001": "か",
  "110001": "き",
  "100101": "く",
  "110101": "け",
  "010101": "こ",
  "100011": "さ",
  "110011": "し",
  "100111": "す",
  "110111": "せ",
  "010111": "そ",
  "101010": "た",
  "111010": "ち",
  "101110": "つ",
  "111110": "て",
  "011110": "と",
  "101000": "な",
  "111000": "に",
  "101100": "ぬ",
  "111100": "ね",
  "011100": "の",
  "101001": "は",
  "111001": "ひ",
  "101101": "ふ",
  "111101": "へ",
  "011101": "ほ",
  "101011": "ま",
  "111011": "み",
  "101111": "む",
  "111111": "め",
  "011111": "も",
  "001100": "や",
  "001101": "ゆ",
  "001110": "よ",
  "100010": "ら",
  "110010": "り",
  "100110": "る",
  "110110": "れ",
  "010110": "ろ",
  "001000": "わ",
  "001010": "を",
  "001011": "ん",
};

const TenjiCombinationMap: Record<string, string> = {
  "000100100001": "きゃ",
  "000100100101": "きゅ",
  "000100010101": "きょ",
  "000100100011": "しゃ",
  "000100100111": "しゅ",
  "000100010111": "しょ",
  "000100101010": "ちゃ",
  "000100101110": "ちゅ",
  "000100011110": "ちょ",
  "000100101000": "にゃ",
  "000100101100": "にゅ",
  "000100011100": "にょ",
  "000100101001": "ひゃ",
  "000100101101": "ひゅ",
  "000100011101": "ひょ",
  "000100101011": "みゃ",
  "000100101111": "みゅ",
  "000100011111": "みょ",
  "000100100010": "りゃ",
  "000100100110": "りゅ",
  "000100010110": "りょ",
  "000110100001": "ぎゃ",
  "000110100101": "ぎゅ",
  "000110010101": "ぎょ",
  "000110100011": "じゃ",
  "000110100111": "じゅ",
  "000110010111": "じょ",
  "000110101010": "ぢゃ",
  "000110101110": "ぢゅ",
  "000110011110": "ぢょ",
  "000110101001": "びゃ",
  "000110101101": "びゅ",
  "000110011101": "びょ",
  "000101101001": "ぴゃ",
  "000101101101": "ぴゅ",
  "000101011101": "ぴょ",
  // 特殊音を追加 ウィ～トゥ～ヴ
  // １文字は最後に並べて置く必要あり
  "000010100001": "が",
  "000010110001": "ぎ",
  "000010100101": "ぐ",
  "000010110101": "げ",
  "000010010101": "ご",
  "000010100011": "ざ",
  "000010110011": "じ",
  "000010100111": "ず",
  "000010110111": "ぜ",
  "000010010111": "ぞ",
  "000010101010": "だ",
  "000010111010": "ぢ",
  "000010101110": "づ",
  "000010111110": "で",
  "000010011110": "ど",
  "000010101001": "ば",
  "000010111001": "び",
  "000010101101": "ぶ",
  "000010111101": "べ",
  "000010011101": "ぼ",
  "000001101001": "ぱ",
  "000001111001": "ぴ",
  "000001101101": "ぷ",
  "000001111101": "ぺ",
  "000001011101": "ぽ",
};
