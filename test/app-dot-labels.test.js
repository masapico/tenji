/**
 * @file app-dot-labels.test.js
 * @description 点字マスのドット操作後における読み上げ用ラベル (aria-label) および
 *              aria-pressed の回帰テスト。
 *              全6点について、操作前後も同じ点番号・位置が保たれ、
 *              オン／オフだけが変わることを検証します。
 */

const log = typeof console !== "undefined" && console.log ? console.log.bind(console) : print;
const logError = typeof console !== "undefined" && console.error ? console.error.bind(console) : print;

let passedCount = 0;
let failedCount = 0;

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    passedCount++;
    log(`  ✓ ${message}`);
  } else {
    failedCount++;
    logError(`  ✗ ${message}`);
    logError(`    期待値: ${expected}`);
    logError(`    実際値: ${actual}`);
  }
}

// 簡易DOMノードモック
class MockElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.className = "";
    this.dataset = {};
    this.attributes = {};
    this.children = [];
    this.childNodes = this.children;
    this.parentNode = null;
    this.textContent = "";
    this.listeners = {};
    this.type = "";
    this.title = "";
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  addEventListener(type, listener) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  dispatchEvent(event) {
    const listeners = this.listeners[event.type] || [];
    for (const l of listeners) {
      l(event);
    }
  }

  click() {
    this.dispatchEvent({
      type: "click",
      stopPropagation: () => {},
      target: this,
    });
  }

  querySelector(selector) {
    const res = this.querySelectorAll(selector);
    return res.length > 0 ? res[0] : null;
  }

  querySelectorAll(selector) {
    const results = [];
    function search(node) {
      for (const child of node.children) {
        let match = false;
        if (selector.startsWith(".")) {
          const cls = selector.slice(1);
          if (child.className && child.className.split(/\s+/).includes(cls)) {
            match = true;
          }
        }
        if (match) results.push(child);
        search(child);
      }
    }
    search(this);
    return results;
  }
}

class MockDocument {
  constructor() {
    this.readyState = "complete";
    this.elementsById = {};
    this.body = new MockElement("body");
  }

  createElement(tagName) {
    return new MockElement(tagName);
  }

  querySelector(selector) {
    return this.body.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.body.querySelectorAll(selector);
  }

  getElementById(id) {
    return this.elementsById[id] || null;
  }

  registerElement(id, el) {
    this.elementsById[id] = el;
  }

  addEventListener() {}
}

async function runRegressionTests() {
  log("=== 点字ドット操作前後の aria-label / aria-pressed 回帰テスト ===");

  // Mock global DOM environment
  const mockDoc = new MockDocument();
  globalThis.document = mockDoc;
  globalThis.window = globalThis;

  const container = new MockElement("div");
  container.id = "tenji-rows-container";
  mockDoc.registerElement("tenji-rows-container", container);

  const preview = new MockElement("div");
  preview.id = "preview-output";
  mockDoc.registerElement("preview-output", preview);

  const charCount = new MockElement("div");
  charCount.id = "tenji-char-count";
  mockDoc.registerElement("tenji-char-count", charCount);

  // app.js を動的インポートして初期化
  await import("../js/app.js");

  // 行コンテナから行要素とセル要素を取得
  const rowWrapper = container.children[0];
  const rowBody = rowWrapper.querySelector(".tenji-row__body");
  const firstCell = rowBody.querySelectorAll(".tenji-cell")[0];
  const dotButtons = firstCell.querySelectorAll(".tenji-dot");

  assertEqual(dotButtons.length, 6, "1マス内に6個のドットボタンが存在する");

  const expectedDots = [
    { dotNumber: 1, bitIndex: 0, label: "1の点 (左上)" },
    { dotNumber: 4, bitIndex: 3, label: "4の点 (右上)" },
    { dotNumber: 2, bitIndex: 1, label: "2の点 (左中)" },
    { dotNumber: 5, bitIndex: 4, label: "5の点 (右中)" },
    { dotNumber: 3, bitIndex: 2, label: "3の点 (左下)" },
    { dotNumber: 6, bitIndex: 5, label: "6の点 (右下)" },
  ];

  log("\n[1. 初期状態のラベルと属性の検証]");
  dotButtons.forEach((btn, i) => {
    const expected = expectedDots[i];
    assertEqual(
      parseInt(btn.dataset.dotIndex, 10),
      expected.bitIndex,
      `ドット${i + 1} (${expected.label}) の dataset.dotIndex が ${expected.bitIndex}`
    );
    assertEqual(
      btn.getAttribute("aria-pressed"),
      "false",
      `ドット${i + 1} (${expected.label}) の初期 aria-pressed は false`
    );
    assertEqual(
      btn.getAttribute("aria-label"),
      `${expected.label}: オフ`,
      `ドット${i + 1} の初期 aria-label は「${expected.label}: オフ」`
    );
  });

  log("\n[2. 各ドットを個別にクリック（トグルON）した後のラベル・属性の検証]");
  for (let i = 0; i < dotButtons.length; i++) {
    const btn = dotButtons[i];
    const expected = expectedDots[i];

    // クリック（トグルON）
    btn.click();

    assertEqual(
      btn.getAttribute("aria-pressed"),
      "true",
      `ドット${expected.dotNumber} (${expected.label}) クリック後の aria-pressed は true`
    );
    assertEqual(
      btn.getAttribute("aria-label"),
      `${expected.label}: オン`,
      `ドット${expected.dotNumber} (${expected.label}) クリック後の aria-label は「${expected.label}: オン」`
    );

    // 他のドットのラベルが影響を受けていないかも検証
    for (let j = 0; j < dotButtons.length; j++) {
      if (i === j) continue;
      const otherBtn = dotButtons[j];
      const otherExpected = expectedDots[j];
      assertEqual(
        otherBtn.getAttribute("aria-label"),
        `${otherExpected.label}: オフ`,
        `他ドット${otherExpected.dotNumber} (${otherExpected.label}) の aria-label が保たれている`
      );
    }

    // クリック（トグルOFFに戻す）
    btn.click();

    assertEqual(
      btn.getAttribute("aria-pressed"),
      "false",
      `ドット${expected.dotNumber} (${expected.label}) 再クリック後の aria-pressed は false`
    );
    assertEqual(
      btn.getAttribute("aria-label"),
      `${expected.label}: オフ`,
      `ドット${expected.dotNumber} (${expected.label}) 再クリック後の aria-label は「${expected.label}: オフ」に戻る`
    );
  }

  log("\n[3. 全6ドットを全点灯した後のラベル・属性の検証]");
  dotButtons.forEach((btn) => btn.click());
  dotButtons.forEach((btn, i) => {
    const expected = expectedDots[i];
    assertEqual(
      btn.getAttribute("aria-pressed"),
      "true",
      `全点灯時: ドット${expected.dotNumber} の aria-pressed は true`
    );
    assertEqual(
      btn.getAttribute("aria-label"),
      `${expected.label}: オン`,
      `全点灯時: ドット${expected.dotNumber} の aria-label は「${expected.label}: オン」`
    );
  });

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

runRegressionTests().catch((err) => {
  logError("エラー発生:", err);
  if (typeof quit !== "undefined") quit(1);
});
