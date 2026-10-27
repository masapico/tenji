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
import {
  GOJUON_MATRIX,
  CHAR_SECTIONS,
  getAllCharItems,
  getDotNumbers,
  formatDotNumbers,
  getTenjiPatternDetails,
} from "./tenji-data.js";

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

/** 文字一覧タブが初期レンダリングされたかどうか */
let isChartRendered = false;

/** 現在選択されている文字カテゴリフィルター */
let activeCategory = "all";

/** 現在モーダルに表示中の文字データ */
let currentDetailItem = null;

// =============================================================================
// DOM生成ヘルパー関数
// =============================================================================

/**
 * 1マスの点字セルDOM要素を作成します。
 *
 * @param {Object} options
 * @param {string} options.cellValue - 6桁の点字バイナリ文字列 (例: "100000")
 * @param {string} options.kana - 対応するひらがな文字 (例: "あ")
 * @param {boolean} [options.editable=true] - ドットをクリック可能にするかどうか
 * @param {boolean} [options.showDotNumbers=false] - 点番号バッジを表示するかどうか
 * @param {Function} [options.onDotToggle=null] - ドット切り替え時のコールバック (dotIndex, newCellValue) => void
 * @returns {HTMLElement} 点字マスのDOM要素
 */
function createTenjiCellElement({
  cellValue = "000000",
  kana = "　",
  editable = true,
  showDotNumbers = false,
  onDotToggle = null,
}) {
  const cell = document.createElement("div");
  cell.className = `tenji-cell ${editable ? "" : "tenji-cell--readonly"}`;
  cell.setAttribute("role", "group");

  const tooltip = identifyTenji(cellValue) || (kana.trim() ? kana : "空マス");
  const dots = getDotNumbers(cellValue);
  const dotsText = formatDotNumbers(dots);

  cell.setAttribute("aria-label", `点字マス: ${tooltip} (${dotsText})`);
  cell.setAttribute("title", `${tooltip} (${dotsText})`);

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
      dotBtn.addEventListener("click", (e) => {
        e.stopPropagation();
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

  // 点番号バッジ
  if (showDotNumbers) {
    const badge = document.createElement("div");
    badge.className = "tenji-dot-numbers";
    badge.textContent = dots.length > 0 ? dots.join("・") : "-";
    cell.appendChild(badge);
  }

  return cell;
}

/**
 * 2マスの組み合わせ文字カード（濁音・拗音等）のDOM要素を作成します。
 *
 * @param {Object} item
 * @param {string} item.char - ひらがな（例: "きゃ"）
 * @param {string} item.bits - 12桁バイナリ文字列（前置6桁 + 本体6桁）
 * @param {string} [item.category] - カテゴリ
 * @param {string} [item.categoryName] - カテゴリ表示名
 * @param {string} [item.note] - 注釈
 * @returns {HTMLElement}
 */
function createComboCardElement(item) {
  const { char, bits, note } = item;
  const bits1 = bits.substring(0, 6);
  const bits2 = bits.substring(6, 12);
  const dots1 = getDotNumbers(bits1);
  const dots2 = getDotNumbers(bits2);

  const card = document.createElement("button");
  card.type = "button";
  card.className = "tenji-combo-card";
  card.setAttribute(
    "aria-label",
    `${char}: 前置 ${formatDotNumbers(dots1)}、本体 ${formatDotNumbers(dots2)}`
  );

  const cellsWrap = document.createElement("div");
  cellsWrap.className = "tenji-combo-card__cells";

  // 1マス目（前置マス）
  const cell1 = createTenjiCellElement({
    cellValue: bits1,
    kana: "前置",
    editable: false,
    showDotNumbers: true,
  });
  cellsWrap.appendChild(cell1);

  // プラス記号
  const plus = document.createElement("span");
  plus.className = "tenji-combo-card__plus";
  plus.textContent = "+";
  cellsWrap.appendChild(plus);

  // 2マス目（本体マス）
  const cell2 = createTenjiCellElement({
    cellValue: bits2,
    kana: "本体",
    editable: false,
    showDotNumbers: true,
  });
  cellsWrap.appendChild(cell2);

  card.appendChild(cellsWrap);

  // カード下部の文字ラベルと点番号サマリー
  const footer = document.createElement("div");
  footer.className = "tenji-combo-card__footer";

  const charLabel = document.createElement("div");
  charLabel.className = "tenji-combo-card__char";
  charLabel.textContent = char;
  footer.appendChild(charLabel);

  const dotsSummary = document.createElement("div");
  dotsSummary.className = "tenji-combo-card__dots tenji-dot-numbers";
  dotsSummary.textContent = `${dots1.join("・")} + ${dots2.join("・")}`;
  footer.appendChild(dotsSummary);

  card.appendChild(footer);

  // クリックで詳細モーダルを表示
  card.addEventListener("click", () => {
    openCharDetailModal(item);
  });

  return card;
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
        showDotNumbers: true,
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
      showDotNumbers: true,
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
// 文字一覧・五十音表モード (ModeChart) のレンダリングと制御
// =============================================================================

/**
 * 五十音（清音）マトリクスセクションのDOM要素を生成します。
 * @returns {HTMLElement}
 */
function buildGojuonSectionElement() {
  const section = document.createElement("section");
  section.className = "tenji-section";
  section.dataset.sectionCategory = "gojuon";

  // セクションヘッダー
  const header = document.createElement("div");
  header.className = "tenji-section__header";
  header.innerHTML = `
    <h3 class="tenji-section__title">五十音（清音）表</h3>
    <p class="tenji-section__desc">
      母音（あ・い・う・え・お）の点配置に、各行（子音）固有の点を加算して成り立ちます。
    </p>
  `;
  section.appendChild(header);

  // マトリクステーブル
  const wrapper = document.createElement("div");
  wrapper.className = "tenji-matrix-wrapper";

  const table = document.createElement("table");
  table.className = "tenji-matrix-table";
  table.setAttribute("aria-label", "五十音点字マトリクス表");

  // 列ヘッダー（母音段）
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  const cornerTh = document.createElement("th");
  cornerTh.scope = "col";
  cornerTh.textContent = "行＼段";
  headRow.appendChild(cornerTh);

  GOJUON_MATRIX.columns.forEach((col) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.className = "tenji-matrix-th-col";
    th.innerHTML = `${col.label}<span class="tenji-vowel-note">${col.vowelDots}</span>`;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // テーブルボディ（各行・マス）
  const tbody = document.createElement("tbody");
  GOJUON_MATRIX.rows.forEach((row) => {
    const tr = document.createElement("tr");

    // 行ヘッダー（行名＋子音の加算規則）
    const th = document.createElement("th");
    th.scope = "row";
    th.className = "tenji-matrix-th-row";
    th.innerHTML = `${row.name}<span class="tenji-consonant-note">${row.consonantNote}</span>`;
    tr.appendChild(th);

    // 5つの段セル
    row.items.forEach((item) => {
      const td = document.createElement("td");
      if (item) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tenji-char-btn";
        btn.setAttribute(
          "aria-label",
          `${item.char}: ${formatDotNumbers(getDotNumbers(item.bits))}`
        );

        const cellEl = createTenjiCellElement({
          cellValue: item.bits,
          kana: item.char,
          editable: false,
          showDotNumbers: true,
        });

        btn.appendChild(cellEl);
        btn.addEventListener("click", () => {
          openCharDetailModal({
            char: item.char,
            bits: item.bits,
            category: "gojuon",
            categoryName: "五十音（清音）",
            groupName: row.name,
            note: `${row.name}（${row.consonantNote}）`,
          });
        });

        td.appendChild(btn);
      } else {
        const empty = document.createElement("div");
        empty.className = "tenji-cell-empty";
        empty.setAttribute("aria-hidden", "true");
        td.appendChild(empty);
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
  section.appendChild(wrapper);

  // 「ん」の補足カード
  const extraRow = GOJUON_MATRIX.rows.find((r) => r.extra);
  if (extraRow && extraRow.extra) {
    const extraWrap = document.createElement("div");
    extraWrap.style.marginTop = "var(--dads-space-3)";
    extraWrap.style.display = "flex";
    extraWrap.style.alignItems = "center";
    extraWrap.style.gap = "var(--dads-space-3)";

    extraRow.extra.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tenji-char-btn";
      btn.style.width = "auto";
      btn.setAttribute(
        "aria-label",
        `${item.char}: ${formatDotNumbers(getDotNumbers(item.bits))}`
      );

      const cellEl = createTenjiCellElement({
        cellValue: item.bits,
        kana: item.char,
        editable: false,
        showDotNumbers: true,
      });
      btn.appendChild(cellEl);
      btn.addEventListener("click", () => {
        openCharDetailModal({
          char: item.char,
          bits: item.bits,
          category: "gojuon",
          categoryName: "五十音（清音）",
          groupName: "撥音（ん）",
          note: item.note,
        });
      });

      const noteText = document.createElement("span");
      noteText.style.fontSize = "var(--dads-font-size-sm)";
      noteText.style.color = "var(--dads-color-text-secondary)";
      noteText.textContent = `※ ${item.char}: ${item.note}`;

      extraWrap.appendChild(btn);
      extraWrap.appendChild(noteText);
    });
    section.appendChild(extraWrap);
  }

  return section;
}

/**
 * 濁音・拗音・特殊音・記号セクションのDOM要素を生成します。
 * @param {Object} sec
 * @returns {HTMLElement}
 */
function buildCharSectionElement(sec) {
  const section = document.createElement("section");
  section.className = "tenji-section";
  section.dataset.sectionCategory = sec.category;

  const header = document.createElement("div");
  header.className = "tenji-section__header";
  header.innerHTML = `
    <h3 class="tenji-section__title">${sec.title}</h3>
    <p class="tenji-section__desc">${sec.description}</p>
  `;
  section.appendChild(header);

  sec.groups.forEach((grp) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "tenji-group";

    const title = document.createElement("h4");
    title.className = "tenji-group__title";
    title.textContent = grp.name;
    groupDiv.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "tenji-group__grid";

    grp.items.forEach((item) => {
      const itemData = {
        ...item,
        category: sec.category,
        categoryName: sec.title,
        groupName: grp.name,
      };

      if (item.bits.length === 12) {
        // 2マス組み合わせ
        const card = createComboCardElement(itemData);
        grid.appendChild(card);
      } else {
        // 1マス記号など
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tenji-char-btn";
        btn.style.width = "auto";
        btn.setAttribute(
          "aria-label",
          `${item.char}: ${formatDotNumbers(getDotNumbers(item.bits))}`
        );

        const cellEl = createTenjiCellElement({
          cellValue: item.bits,
          kana: item.char,
          editable: false,
          showDotNumbers: true,
        });

        btn.appendChild(cellEl);
        btn.addEventListener("click", () => {
          openCharDetailModal(itemData);
        });
        grid.appendChild(btn);
      }
    });

    groupDiv.appendChild(grid);
    section.appendChild(groupDiv);
  });

  return section;
}

/**
 * 文字一覧タブ全体の初期レンダリングを行います。
 */
function renderChartMode() {
  if (isChartRendered) return;

  const container = document.getElementById("chart-sections-container");
  if (!container) return;

  container.innerHTML = "";

  // 1. 五十音（清音）表
  const gojuonSection = buildGojuonSectionElement();
  container.appendChild(gojuonSection);

  // 2. 濁音・拗音・特殊音・記号セクション
  CHAR_SECTIONS.forEach((sec) => {
    const secEl = buildCharSectionElement(sec);
    container.appendChild(secEl);
  });

  isChartRendered = true;
}

/**
 * 検索キーワードおよびカテゴリチップに基づき表示を更新します。
 */
function filterChart() {
  const searchInput = document.getElementById("chart-search-input");
  const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
  const searchContainer = document.getElementById("chart-search-results");
  const sectionsContainer = document.getElementById("chart-sections-container");

  if (!searchContainer || !sectionsContainer) return;

  if (query.length > 0) {
    // 検索モード: セクション全体を隠し、ヒットした文字をグリッド表示
    sectionsContainer.style.display = "none";
    searchContainer.style.display = "block";
    searchContainer.innerHTML = "";

    const allItems = getAllCharItems();
    const hits = allItems.filter((item) => {
      const matchChar = item.char.includes(query);
      const matchCategory = item.categoryName.toLowerCase().includes(query);
      const matchGroup = item.groupName.toLowerCase().includes(query);
      const matchFilter = activeCategory === "all" || item.category === activeCategory;
      return (matchChar || matchCategory || matchGroup) && matchFilter;
    });

    const countEl = document.createElement("div");
    countEl.className = "tenji-search-count";
    countEl.textContent = `「${query}」の検索結果: ${hits.length} 件`;
    searchContainer.appendChild(countEl);

    if (hits.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "tenji-search-empty";
      emptyEl.textContent = "該当する文字が見つかりませんでした。別の文字や音（例: きゃ、が）をお試しください。";
      searchContainer.appendChild(emptyEl);
    } else {
      const grid = document.createElement("div");
      grid.className = "tenji-group__grid";
      hits.forEach((item) => {
        if (item.bits.length === 12) {
          const card = createComboCardElement(item);
          grid.appendChild(card);
        } else {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "tenji-char-btn";
          btn.style.width = "auto";
          btn.setAttribute(
            "aria-label",
            `${item.char}: ${formatDotNumbers(getDotNumbers(item.bits))}`
          );

          const cellEl = createTenjiCellElement({
            cellValue: item.bits,
            kana: item.char,
            editable: false,
            showDotNumbers: true,
          });
          btn.appendChild(cellEl);
          btn.addEventListener("click", () => {
            openCharDetailModal(item);
          });
          grid.appendChild(btn);
        }
      });
      searchContainer.appendChild(grid);
    }
  } else {
    // 通常モード: セクションを表示し、カテゴリチップに応じて表示切り替え
    searchContainer.style.display = "none";
    sectionsContainer.style.display = "flex";

    const sections = sectionsContainer.querySelectorAll(".tenji-section");
    sections.forEach((sec) => {
      const cat = sec.dataset.sectionCategory;
      if (activeCategory === "all" || activeCategory === cat) {
        sec.style.display = "block";
      } else {
        sec.style.display = "none";
      }
    });
  }
}

// =============================================================================
// 文字詳細ダイアログ (Modal) の制御
// =============================================================================

/**
 * 文字詳細ダイアログを開きます。
 * @param {Object} item
 */
function openCharDetailModal(item) {
  currentDetailItem = item;
  const dialog = document.getElementById("char-detail-dialog");
  if (!dialog) return;

  const titleEl = document.getElementById("dialog-char-title");
  const nameEl = document.getElementById("dialog-char-name");
  const dotsEl = document.getElementById("dialog-char-dots");
  const catEl = document.getElementById("dialog-char-category");
  const noteRowEl = document.getElementById("dialog-char-note-row");
  const noteEl = document.getElementById("dialog-char-note");
  const previewEl = document.getElementById("dialog-char-preview");

  titleEl.textContent = `文字詳細: 「${item.char}」`;
  nameEl.textContent = item.char;
  catEl.textContent = `${item.categoryName || ""} (${item.groupName || ""})`;

  if (item.note) {
    noteRowEl.style.display = "flex";
    noteEl.textContent = item.note;
  } else {
    noteRowEl.style.display = "none";
  }

  // 点番号とプレビュー生成
  const pattern = getTenjiPatternDetails(item.bits);
  dotsEl.textContent = pattern.summary;

  previewEl.innerHTML = "";
  if (pattern.cells.length === 1) {
    const cellEl = createTenjiCellElement({
      cellValue: pattern.cells[0].bits,
      kana: item.char,
      editable: false,
      showDotNumbers: true,
    });
    previewEl.appendChild(cellEl);
  } else if (pattern.cells.length === 2) {
    const card = createComboCardElement(item);
    previewEl.appendChild(card);
  }

  dialog.showModal();
}

/**
 * 文字詳細ダイアログを閉じます。
 */
function closeCharDetailModal() {
  const dialog = document.getElementById("char-detail-dialog");
  if (dialog && dialog.open) {
    dialog.close();
  }
}

/**
 * 現在のモーダルの文字を点字入力モード（ModeTenji）に転送して試す処理
 */
function handleTryInTenjiMode() {
  if (!currentDetailItem) return;

  closeCharDetailModal();
  switchTab("tenji");

  // 1行目の先頭に該当文字をセット
  const bits = currentDetailItem.bits;
  if (bits.length === 6) {
    tenjiRows[0][0] = bits;
  } else if (bits.length === 12) {
    tenjiRows[0][0] = bits.substring(0, 6);
    if (tenjiRows[0].length < 2) {
      tenjiRows[0].push(bits.substring(6, 12));
    } else {
      tenjiRows[0][1] = bits.substring(6, 12);
    }
  }

  renderTenjiRows();

  // 点字エリアへスムーズスクロール
  const container = document.getElementById("tenji-rows-container");
  if (container) {
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * 現在のモーダルの文字と点番号を音声合成で読み上げます。
 */
function handleSpeakChar() {
  if (!currentDetailItem) return;

  if (!("speechSynthesis" in window)) {
    alert("お使いのブラウザは音声読み上げに対応していません。");
    return;
  }

  window.speechSynthesis.cancel(); // 既存の読み上げを停止

  const pattern = getTenjiPatternDetails(currentDetailItem.bits);
  let text = `${currentDetailItem.char}。`;

  if (pattern.cells.length === 1) {
    text += `${pattern.summary}。`;
  } else if (pattern.cells.length === 2) {
    text += `2マス構成。前置、${formatDotNumbers(pattern.cells[0].dots)}。本体、${formatDotNumbers(pattern.cells[1].dots)}。`;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.9; // やや聞き取りやすいゆっくりめの速度
  window.speechSynthesis.speak(utterance);
}

// =============================================================================
// タブ・モード切替 (WAI-ARIA Tabs パターン)
// =============================================================================

/**
 * 表示タブを切り替えます。
 * @param {"tenji" | "kana" | "chart"} mode
 */
export function switchTab(mode) {
  const tabTenji = document.getElementById("tab-tenji");
  const tabKana = document.getElementById("tab-kana");
  const tabChart = document.getElementById("tab-chart");

  const panelTenji = document.getElementById("panel-tenji");
  const panelKana = document.getElementById("panel-kana");
  const panelChart = document.getElementById("panel-chart");

  // タブボタンのアクティブ同期
  tabTenji.setAttribute("aria-selected", mode === "tenji" ? "true" : "false");
  tabKana.setAttribute("aria-selected", mode === "kana" ? "true" : "false");
  if (tabChart) {
    tabChart.setAttribute("aria-selected", mode === "chart" ? "true" : "false");
  }

  // パネルのアクティブ同期
  panelTenji.classList.toggle("is-active", mode === "tenji");
  panelKana.classList.toggle("is-active", mode === "kana");
  if (panelChart) {
    panelChart.classList.toggle("is-active", mode === "chart");
  }

  if (mode === "kana") {
    // ひらがな入力欄へフォーカス移動
    const inputEl = document.getElementById("kana-input");
    if (inputEl && !inputEl.disabled) {
      setTimeout(() => inputEl.focus(), 50);
    }
  } else if (mode === "chart") {
    // 文字一覧の描画と初期化
    renderChartMode();
  }
}

// =============================================================================
// 初期化 (DOM Ready)
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. タブ切り替えイベント
  const tabTenji = document.getElementById("tab-tenji");
  const tabKana = document.getElementById("tab-kana");
  const tabChart = document.getElementById("tab-chart");

  if (tabTenji && tabKana) {
    tabTenji.addEventListener("click", () => switchTab("tenji"));
    tabKana.addEventListener("click", () => switchTab("kana"));
  }
  if (tabChart) {
    tabChart.addEventListener("click", () => switchTab("chart"));
  }

  // 2. 点字モード: 「行を追加する」ボタン
  const addRowBtn = document.getElementById("btn-add-row");
  if (addRowBtn) {
    addRowBtn.addEventListener("click", handleAddNewRow);
  }

  // 3. ひらがなモード: リアルタイム変換・クリアボタン
  const translateBtn = document.getElementById("btn-kana-translate");
  const clearBtn = document.getElementById("btn-kana-clear");
  const inputEl = document.getElementById("kana-input");

  if (inputEl) {
    inputEl.addEventListener("input", handleKanaTranslate);
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

  // 4. 文字一覧モード: ツールバー制御（検索・点番号トグル・印刷）
  const searchInput = document.getElementById("chart-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", filterChart);
  }

  const toggleDots = document.getElementById("toggle-dot-numbers");
  const chartPanel = document.getElementById("panel-chart");
  if (toggleDots && chartPanel) {
    toggleDots.addEventListener("change", () => {
      chartPanel.classList.toggle("hide-dot-numbers", !toggleDots.checked);
    });
  }

  const printBtn = document.getElementById("btn-chart-print");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // 5. 文字一覧モード: カテゴリフィルターチップ
  const chips = document.querySelectorAll(".tenji-chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeCategory = chip.dataset.category || "all";
      filterChart();
    });
  });

  // 6. 文字詳細ダイアログイベント
  const closeDialogBtn = document.getElementById("btn-dialog-close");
  const tryDialogBtn = document.getElementById("btn-dialog-try");
  const speakDialogBtn = document.getElementById("btn-dialog-speak");
  const dialog = document.getElementById("char-detail-dialog");

  if (closeDialogBtn) {
    closeDialogBtn.addEventListener("click", closeCharDetailModal);
  }

  if (tryDialogBtn) {
    tryDialogBtn.addEventListener("click", handleTryInTenjiMode);
  }

  if (speakDialogBtn) {
    speakDialogBtn.addEventListener("click", handleSpeakChar);
  }

  // ダイアログ外（backdrop）クリックで閉じる
  if (dialog) {
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        closeCharDetailModal();
      }
    });
  }

  // 7. 点字モードの初期描画
  renderTenjiRows();
});
