/**
 * @file app.js
 * @description 点字アプリケーションのUI制御・イベントハンドリング・状態管理モジュール
 *
 * ビルド不要（No-build）構成で、ES Modules およびブラウザ標準APIを用いて動作します。
 */

import {
  identifyTenji,
  identifyTenjiArray,
  getTenjiValues,
} from "./tenji-core.js";

// =============================================================================
// 定数・設定
// =============================================================================

/** 点字1行あたりの初期マス数 */
const DEFAULT_FRAME_COUNT = 10;

/** 点字のドット番号とビットインデックスの対応
 * 点字の並び:
 *   | 1の点 (index 0) | 4の点 (index 3) |
 *   | 2の点 (index 1) | 5の点 (index 4) |
 *   | 3の点 (index 2) | 6の点 (index 5) |
 */
const DOT_DEFINITIONS = [
  { dotNumber: 1, index: 0, label: "1の点 (左上)" },
  { dotNumber: 4, index: 3, label: "4の点 (右上)" },
  { dotNumber: 2, index: 1, label: "2の点 (左中)" },
  { dotNumber: 5, index: 4, label: "5の点 (右中)" },
  { dotNumber: 3, index: 2, label: "3の点 (左下)" },
  { dotNumber: 6, index: 5, label: "6の点 (右下)" },
];

// =============================================================================
// アプリケーション全体の状態 (State)
// =============================================================================

/**
 * 点字入力モード（ModeTenji）の状態
 * 行ごとに、各マスの6桁バイナリ文字列（例: "000000"）の配列を保持します。
 * @type {Array<string[]>}
 */
let tenjiRows = [
  new Array(DEFAULT_FRAME_COUNT).fill("000000"),
];

// =============================================================================
// DOM生成ヘルパー関数
// =============================================================================

/**
 * 1マスの点字セルDOM要素を作成します。
 *
 * @param {Object} options
 * @param {string} options.cellValue - 6桁の点字バイナリ文字列 (例: "100000")
 * @param {string} options.kana - 対応するひらがな文字 (例: "あ")
 * @param {boolean} options.editable - ドットをクリック可能にするかどうか
 * @param {Function} [options.onDotToggle] - ドット切り替え時のコールバック (dotIndex, newCellValue) => void
 * @returns {HTMLElement} 点字マスのDOM要素
 */
function createTenjiCellElement({ cellValue = "000000", kana = "　", editable = true, onDotToggle = null }) {
  const cell = document.createElement("div");
  cell.className = `tenji-cell ${editable ? "" : "tenji-cell--readonly"}`;
  cell.setAttribute("role", "group");

  const tooltip = identifyTenji(cellValue) || (kana.trim() ? kana : "空マス");
  cell.setAttribute("aria-label", `点字マス: ${tooltip}`);
  cell.setAttribute("title", tooltip);

  // 6点のグリッドコンテナ
  const grid = document.createElement("div");
  grid.className = "tenji-grid";

  // 6つのドットボタンを作成
  DOT_DEFINITIONS.forEach(({ dotNumber, index, label }) => {
    const isPressed = cellValue[index] === "1";

    const dotBtn = document.createElement("button");
    dotBtn.type = "button";
    dotBtn.className = "tenji-dot";
    dotBtn.setAttribute("aria-pressed", isPressed ? "true" : "false");
    dotBtn.setAttribute("aria-label", `${label}: ${isPressed ? "オン" : "オフ"}`);

    if (editable) {
      dotBtn.addEventListener("click", () => {
        // 現在のビット列を更新
        const bits = cellValue.split("");
        bits[index] = bits[index] === "1" ? "0" : "1";
        const newCellValue = bits.join("");

        if (typeof onDotToggle === "function") {
          onDotToggle(index, newCellValue);
        }
      });
    } else {
      dotBtn.setAttribute("tabindex", "-1");
    }

    grid.appendChild(dotBtn);
  });

  cell.appendChild(grid);

  // マス下部の文字表示ラベル
  const charLabel = document.createElement("div");
  charLabel.className = "tenji-cell__char";
  charLabel.textContent = kana;
  cell.appendChild(charLabel);

  return cell;
}

// =============================================================================
// 点字入力モード (ModeTenji) のレンダリングと制御
// =============================================================================

/**
 * 点字入力モードの全行を画面に再描画します。
 */
function renderTenjiRows() {
  const container = document.getElementById("tenji-rows-container");
  if (!container) return;

  container.innerHTML = "";

  tenjiRows.forEach((rowValues, rowIndex) => {
    // 濁音・拗音などの合成判定を行い、各マスのひらがな配列を取得
    const kanaArray = identifyTenjiArray(rowValues);

    const rowWrapper = document.createElement("div");
    rowWrapper.className = "tenji-row";

    // 行ヘッダー（行番号と行削除ボタン）
    const rowHeader = document.createElement("div");
    rowHeader.className = "tenji-row__header";

    const rowTitle = document.createElement("div");
    rowTitle.className = "tenji-row__title";
    rowTitle.textContent = `${rowIndex + 1} 行目 (${rowValues.length}マス)`;
    rowHeader.appendChild(rowTitle);

    if (tenjiRows.length > 1) {
      const deleteRowBtn = document.createElement("button");
      deleteRowBtn.type = "button";
      deleteRowBtn.className = "dads-button dads-button--danger dads-button--sm no-print";
      deleteRowBtn.textContent = "この行を削除";
      deleteRowBtn.setAttribute("aria-label", `${rowIndex + 1}行目を削除`);
      deleteRowBtn.addEventListener("click", () => {
        tenjiRows.splice(rowIndex, 1);
        renderTenjiRows();
      });
      rowHeader.appendChild(deleteRowBtn);
    }

    rowWrapper.appendChild(rowHeader);

    // 行ボディ（横並びの点字マス列 ＋ 追加/削除コントローラー）
    const rowBody = document.createElement("div");
    rowBody.className = "tenji-row__body";

    // 各点字マスの生成
    rowValues.forEach((cellValue, cellIndex) => {
      const cellElement = createTenjiCellElement({
        cellValue,
        kana: kanaArray[cellIndex],
        editable: true,
        onDotToggle: (_dotIndex, newCellValue) => {
          rowValues[cellIndex] = newCellValue;
          renderTenjiRows();
        },
      });
      rowBody.appendChild(cellElement);
    });

    // 行末の「マス追加」「マス削除」コントローラー
    const controls = document.createElement("div");
    controls.className = "tenji-row-controls no-print";

    const addCellBtn = document.createElement("button");
    addCellBtn.type = "button";
    addCellBtn.className = "tenji-ctrl-button";
    addCellBtn.title = "マスを1つ追加";
    addCellBtn.setAttribute("aria-label", `${rowIndex + 1}行目にマスを追加`);
    addCellBtn.textContent = "＋";
    addCellBtn.addEventListener("click", () => {
      rowValues.push("000000");
      renderTenjiRows();
    });
    controls.appendChild(addCellBtn);

    if (rowValues.length > 1) {
      const removeCellBtn = document.createElement("button");
      removeCellBtn.type = "button";
      removeCellBtn.className = "tenji-ctrl-button tenji-ctrl-button--remove";
      removeCellBtn.title = "末尾のマスを1つ削除";
      removeCellBtn.setAttribute("aria-label", `${rowIndex + 1}行目の末尾のマスを削除`);
      removeCellBtn.textContent = "－";
      removeCellBtn.addEventListener("click", () => {
        rowValues.pop();
        renderTenjiRows();
      });
      controls.appendChild(removeCellBtn);
    }

    rowBody.appendChild(controls);
    rowWrapper.appendChild(rowBody);
    container.appendChild(rowWrapper);
  });
}

/**
 * 新しい点字行を追加します。
 */
function handleAddNewRow() {
  tenjiRows.push(new Array(DEFAULT_FRAME_COUNT).fill("000000"));
  renderTenjiRows();
}

// =============================================================================
// ひらがな入力モード (ModeKana) のレンダリングと制御
// =============================================================================

/**
 * 入力されたひらがな文字列から点字マス列を生成・表示します。
 * 入力欄を非活性化せず、常に編集・追加入力が可能な状態を維持します。
 */
function handleKanaTranslate() {
  const inputEl = document.getElementById("kana-input");
  const outputContainer = document.getElementById("kana-output-container");
  if (!inputEl || !outputContainer) return;

  const text = inputEl.value.trim();
  if (text.length === 0) {
    outputContainer.innerHTML = `
      <div class="tenji-kana-empty-hint">
        上の入力欄にひらがなを入力すると、ここに点字が表示されます。
      </div>`;
    return;
  }

  // 1. ひらがなから点字バイナリ配列を抽出
  const tenjiValues = getTenjiValues(text);
  // 2. 点字バイナリ配列から各マスのひらがな文字配列を取得
  const kanaChars = identifyTenjiArray(tenjiValues);

  // 3. 画面に点字マスを描画
  outputContainer.innerHTML = "";
  tenjiValues.forEach((cellValue, idx) => {
    const cellEl = createTenjiCellElement({
      cellValue,
      kana: kanaChars[idx],
      editable: false,
    });
    outputContainer.appendChild(cellEl);
  });
}

/**
 * ひらがな入力フォームをクリアして初期状態に戻します。
 */
function handleKanaClear() {
  const inputEl = document.getElementById("kana-input");
  const outputContainer = document.getElementById("kana-output-container");
  if (!inputEl || !outputContainer) return;

  inputEl.value = "";
  inputEl.focus();

  outputContainer.innerHTML = `
    <div class="tenji-kana-empty-hint">
      上の入力欄にひらがなを入力すると、ここに点字が表示されます。
    </div>`;
}

// =============================================================================
// タブ・モード切替 (WAI-ARIA Tabs パターン)
// =============================================================================

/**
 * 表示タブを切り替えます。
 * @param {"tenji" | "kana"} mode
 */
function switchTab(mode) {
  const tabTenji = document.getElementById("tab-tenji");
  const tabKana = document.getElementById("tab-kana");
  const panelTenji = document.getElementById("panel-tenji");
  const panelKana = document.getElementById("panel-kana");

  if (mode === "tenji") {
    tabTenji.setAttribute("aria-selected", "true");
    tabKana.setAttribute("aria-selected", "false");
    panelTenji.classList.add("is-active");
    panelKana.classList.remove("is-active");
  } else {
    tabTenji.setAttribute("aria-selected", "false");
    tabKana.setAttribute("aria-selected", "true");
    panelTenji.classList.remove("is-active");
    panelKana.classList.add("is-active");

    // ひらがな入力欄へフォーカス移動
    const inputEl = document.getElementById("kana-input");
    if (inputEl && !inputEl.disabled) {
      setTimeout(() => inputEl.focus(), 50);
    }
  }
}

// =============================================================================
// 初期化 (DOM Ready)
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. タブ切り替えイベント
  const tabTenji = document.getElementById("tab-tenji");
  const tabKana = document.getElementById("tab-kana");
  if (tabTenji && tabKana) {
    tabTenji.addEventListener("click", () => switchTab("tenji"));
    tabKana.addEventListener("click", () => switchTab("kana"));
  }

  // 2. 点字モード: 「行を追加する」ボタン
  const addRowBtn = document.getElementById("btn-add-row");
  if (addRowBtn) {
    addRowBtn.addEventListener("click", handleAddNewRow);
  }

  // 3. ひらがなモード: リアルタイム変換・ボタン変換・クリアボタン
  const translateBtn = document.getElementById("btn-kana-translate");
  const clearBtn = document.getElementById("btn-kana-clear");
  const inputEl = document.getElementById("kana-input");

  if (inputEl) {
    // 文字の入力・変換確定のたびにリアルタイム更新
    inputEl.addEventListener("input", handleKanaTranslate);

    // Enterキーでも変換を実行
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleKanaTranslate();
      }
    });
  }

  if (translateBtn) {
    translateBtn.addEventListener("click", handleKanaTranslate);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", handleKanaClear);
  }

  // 4. 点字モードの初期描画
  renderTenjiRows();
});

