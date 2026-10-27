/**
 * @file tenji-core.test.js
 * @description tenji-core.js のユニットテスト（前置符・濁音・拗音等の回帰テスト）
 */

import { identifyTenjiArray } from "../js/tenji-core.js";

// 環境に応じた出力ヘルパー
const log = typeof console !== "undefined" && console.log ? console.log.bind(console) : print;
const logError = typeof console !== "undefined" && console.error ? console.error.bind(console) : print;

// テストランナーヘルパー
let passedCount = 0;
let failedCount = 0;

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    passedCount++;
    log(`  ✓ ${message}`);
  } else {
    failedCount++;
    logError(`  ✗ ${message}`);
    logError(`    期待値: ${expectedStr}`);
    logError(`    実際値: ${actualStr}`);
  }
}

function runTests() {
  log("=== identifyTenjiArray 回帰テスト ===");

  // 1. 通常の「濁点＋か」「半濁点＋は」「拗音＋か」
  log("\n[1. 通常の合成音]");
  assertEqual(
    identifyTenjiArray(["000010", "100001"]),
    ["　", "が"],
    "濁点＋か → ［'　', 'が'］"
  );
  assertEqual(
    identifyTenjiArray(["000001", "101001"]),
    ["　", "ぱ"],
    "半濁点＋は → ［'　', 'ぱ'］"
  );
  assertEqual(
    identifyTenjiArray(["000100", "100001"]),
    ["　", "きゃ"],
    "拗音＋か → ［'　', 'きゃ'］"
  );

  // 2. 前置符＋空マス＋か
  log("\n[2. 前置符＋空マス＋か]");
  assertEqual(
    identifyTenjiArray(["000010", "000000", "100001"]),
    ["　", "　", "か"],
    "濁点＋空マス＋か → ［'　', '　', 'か'］ (空マスを越えて濁点適用されない)"
  );
  assertEqual(
    identifyTenjiArray(["000100", "000000", "100001"]),
    ["　", "　", "か"],
    "拗音＋空マス＋か → ［'　', '　', 'か'］ (空マスを越えて拗音適用されない)"
  );

  // 3. 前置符＋未定義マス＋か
  log("\n[3. 前置符＋未定義マス＋か]");
  assertEqual(
    identifyTenjiArray(["000010", "11111111", "100001"]),
    ["　", "　", "か"],
    "濁点＋未定義マス＋か → ［'　', '　', 'か'］ (未定義マスを越えて持ち越さない)"
  );

  // 4. 前置符の連続
  log("\n[4. 前置符の連続]");
  assertEqual(
    identifyTenjiArray(["000010", "000010", "100001"]),
    ["　", "　", "が"],
    "濁点＋濁点＋か → ［'　', '　', 'が'］ (直前の前置符のみ有効)"
  );
  assertEqual(
    identifyTenjiArray(["000001", "000010", "100001"]),
    ["　", "　", "が"],
    "半濁点＋濁点＋か → ［'　', '　', 'が'］ (直前の濁点が適用され半濁点は破棄)"
  );
  assertEqual(
    identifyTenjiArray(["000010", "000001", "101001"]),
    ["　", "　", "ぱ"],
    "濁点＋半濁点＋は → ［'　', '　', 'ぱ'］ (直前の半濁点が適用され濁点は破棄)"
  );
  assertEqual(
    identifyTenjiArray(["000010", "000010", "000010", "100001"]),
    ["　", "　", "　", "が"],
    "前置符3連続＋か → ［'　', '　', '　', 'が'］"
  );

  // 5. 行末の前置符
  log("\n[5. 行末の前置符]");
  assertEqual(
    identifyTenjiArray(["100000", "000010"]),
    ["あ", "　"],
    "あ＋濁点（行末） → ［'あ', '　'］"
  );
  assertEqual(
    identifyTenjiArray(["000010"]),
    ["　"],
    "濁点のみ（行末） → ［'　'］"
  );
  assertEqual(
    identifyTenjiArray(["000010", "000010"]),
    ["　", "　"],
    "前置符の連続（行末） → ［'　', '　'］"
  );

  // 6. 前置符＋合成不可文字
  log("\n[6. 前置符＋合成不可文字]");
  assertEqual(
    identifyTenjiArray(["000010", "100000"]),
    ["　", "あ"],
    "濁点＋あ → ［'　', 'あ'］ (合成不可文字はそのまま出力)"
  );
  assertEqual(
    identifyTenjiArray(["000010", "100000", "100001"]),
    ["　", "あ", "か"],
    "濁点＋あ＋か → ［'　', 'あ', 'か'］ (濁点は'あ'で消費され'か'には波及しない)"
  );

  // 7. 基本動作・境界値
  log("\n[7. 基本動作・境界値]");
  assertEqual(
    identifyTenjiArray([]),
    [],
    "空配列 → ［］"
  );
  assertEqual(
    identifyTenjiArray(["100000", "110000"]),
    ["あ", "い"],
    "清音のみ → ［'あ', 'い'］"
  );
  assertEqual(
    identifyTenjiArray(["000010", "100001", "000010", "100001"]),
    ["　", "が", "　", "が"],
    "濁音の連続 → ［'　', 'が', '　', 'が'］"
  );

  log("\n----------------------------------------");
  log(`結果: ${passedCount} 件成功, ${failedCount} 件失敗`);
  if (failedCount > 0) {
    if (typeof process !== "undefined" && process.exit) {
      process.exit(1);
    } else if (typeof quit !== "undefined") {
      quit(1);
    }
  }
}

runTests();
