import assert from "node:assert/strict";
import { test } from "node:test";

import {
  findAttributeRow,
  findValueButton,
  findWeaponRows,
  ensureWeaponRows,
  findInfoEditor,
  findParagraphRow,
  normalizeSkillName,
  setAttributeValue,
  setInfoValue,
  setParagraphValue,
  setWeaponRow
} from "../src/trpglineAdapter.js";

test("normalizes simplified, traditional, and English skill names to one key", () => {
  assert.equal(normalizeSkillName("估价"), "appraise");
  assert.equal(normalizeSkillName("估價"), "appraise");
  assert.equal(normalizeSkillName("Appraise"), "appraise");
  assert.equal(normalizeSkillName("Library Use"), "libraryUse");
  assert.equal(normalizeSkillName("圖書館使用"), "libraryUse");
  assert.equal(normalizeSkillName("尺寸"), "SIZ");
  assert.equal(normalizeSkillName("生命值"), "HP");
  assert.equal(normalizeSkillName("職業"), "occupation");
  assert.equal(normalizeSkillName("年龄"), "age");
  assert.equal(normalizeSkillName("傷害加值"), "DB");
  assert.equal(normalizeSkillName("BUILD"), "BUILD");
  assert.equal(normalizeSkillName("取悦"), "charm");
  assert.equal(normalizeSkillName("威嚇"), "intimidate");
  assert.equal(normalizeSkillName("心理分析"), "psychoanalysis");
  assert.equal(normalizeSkillName("尋找藏匿物"), "spotHidden");
  assert.equal(normalizeSkillName("隱密行動"), "stealth");
  assert.equal(normalizeSkillName("讀唇語"), "readLips");
  assert.equal(normalizeSkillName("地質學"), "geology");
});

test("finds a TRPGLine attribute row by any known alias", () => {
  const appraiseRow = createRow("估價");
  const listenRow = createRow("聆聽");
  const geologyRow = createRow("地質學");
  const hpRow = createRow("生命值");
  const mpRow = createRow("MP");
  const root = createRoot([appraiseRow, listenRow, geologyRow, hpRow, mpRow]);

  assert.equal(findAttributeRow(root, "估价"), appraiseRow);
  assert.equal(findAttributeRow(root, "Listen"), listenRow);
  assert.equal(findAttributeRow(root, "科学①:地质学"), geologyRow);
  assert.equal(findAttributeRow(root, "HPMax"), hpRow);
  assert.equal(findAttributeRow(root, "MPMax"), mpRow);
  assert.equal(findAttributeRow(root, "不存在"), null);
});

test("sets an attribute value through the temporary number input", async () => {
  const row = createRow("估價");

  const result = await setAttributeValue(row, 35);

  assert.deepEqual(result, { ok: true });
  assert.equal(row.button.clicks, 1);
  assert.equal(row.numberInput.value, "35");
  assert.deepEqual(row.numberInput.events, ["input", "change", "blur"]);
});

test("uses the middle value button for number rows with minus and plus buttons", () => {
  const row = createNumberRow("力量");

  assert.equal(findValueButton(row), row.valueButton);
});

test("falls back to plus and minus buttons when no number input appears", async () => {
  const row = createNumberRow("幸運", 50);

  const result = await setAttributeValue(row, 53);

  assert.deepEqual(result, { ok: true });
  assert.equal(row.minusButton.clicks, 0);
  assert.equal(row.plusButton.clicks, 3);
});

test("uses a document-level number input for bar rows", async () => {
  const row = createBarRow("生命值", 0);

  const result = await setAttributeValue(row, 8);

  assert.deepEqual(result, { ok: true });
  assert.equal(row.valueButton.clicks, 1);
  assert.equal(row.documentInput.value, "8");
  assert.deepEqual(row.documentInput.events, ["input", "change", "blur"]);
});

test("sets the max button for bar rows", async () => {
  const row = createBarRow("生命值", 0);

  const result = await setAttributeValue(row, 8, { part: "max" });

  assert.deepEqual(result, { ok: true });
  assert.equal(row.valueButton.clicks, 0);
  assert.equal(row.maxButton.clicks, 1);
  assert.equal(row.documentInput.value, "8");
});

test("sets text attributes such as occupation and DB", async () => {
  const row = createTextAttributeRow("職業");

  const result = await setAttributeValue(row, "学生");

  assert.deepEqual(result, { ok: true });
  assert.equal(row.textInput.value, "学生");
  assert.deepEqual(row.textInput.events, ["input", "change", "blur"]);
});

test("finds paragraph rows such as background and item fields", () => {
  const traitRow = createParagraphRow("特質");
  const carryRow = createParagraphRow("攜帶物品");
  const root = createRoot([traitRow, carryRow]);

  assert.equal(findParagraphRow(root, "特質"), traitRow);
  assert.equal(findParagraphRow(root, "攜帶物品"), carryRow);
  assert.equal(findParagraphRow(root, "不存在"), null);
});

test("sets contenteditable paragraph fields", () => {
  const row = createParagraphRow("特質");

  const result = setParagraphValue(row, "沉默寡言");

  assert.deepEqual(result, { ok: true });
  assert.equal(row.editor.textContent, "沉默寡言");
  assert.deepEqual(row.editor.events, ["input", "change", "blur"]);
});

test("finds and sets the public object info editor", () => {
  const root = createInfoRoot();
  const editor = findInfoEditor(root);

  const result = setInfoValue(editor, "出生在小镇，后来成为调查员。");

  assert.equal(editor, root.editor);
  assert.deepEqual(result, { ok: true });
  assert.equal(root.editor.textContent, "出生在小镇，后来成为调查员。");
  assert.deepEqual(root.editor.events, ["input", "change", "blur"]);
});

test("finds weapon rows after the TRPGLine weapon header", () => {
  const headerRow = createWeaponHeaderRow();
  const weaponRow = createWeaponRow();
  const root = createRoot([createRow("護甲名稱"), headerRow, weaponRow]);

  assert.deepEqual(findWeaponRows(root), [weaponRow]);
});

test("sets weapon row text and hit rate fields", async () => {
  const row = createWeaponRow();

  const result = await setWeaponRow(row, {
    name: "弹簧刀",
    hitRate: 55,
    damage: "1D4+DB",
    range: "接触"
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(row.columns[0].textInput.value, "弹簧刀");
  assert.equal(row.columns[1].numberInput.value, "55");
  assert.equal(row.columns[2].textInput.value, "1D4+DB");
  assert.equal(row.columns[3].textInput.value, "接触");
});

test("adds weapon rows when the TRPGLine weapon table is too short", async () => {
  const root = createWeaponRootWithAddButton();

  const rows = await ensureWeaponRows(root, 2);

  assert.equal(root.addButton.clicks, 1);
  assert.equal(rows.length, 2);
});

test("stops adding weapon rows when the add button does not create a row", async () => {
  const root = createWeaponRootWithAddButton({ addCreatesRow: false });

  const rows = await Promise.race([
    ensureWeaponRows(root, 2),
    new Promise((resolve) => setTimeout(() => resolve("timeout"), 50))
  ]);

  assert.notEqual(rows, "timeout");
  assert.equal(root.addButton.clicks, 1);
  assert.equal(rows.length, 1);
});

function createRoot(rows) {
  return {
    querySelectorAll(selector) {
      return selector === ".character-attribute" || selector === ".character-attribute--row" ? rows : [];
    }
  };
}

function createWeaponHeaderRow() {
  const labels = ["名稱", "命中率", "傷害", "範圍", "命中骰", "傷害骰"];

  return {
    querySelector() {
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".character-attribute--row--column") {
        return labels.map((label) => ({ textContent: label }));
      }

      return [];
    }
  };
}

function createWeaponRow() {
  const columns = [
    createTextColumn(),
    createNumberColumn(),
    createTextColumn(),
    createTextColumn(),
    createButtonOnlyColumn(),
    createButtonOnlyColumn()
  ];

  return {
    columns,
    querySelector() {
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".character-attribute--row--column") {
        return columns;
      }

      return [];
    }
  };
}

function createTextColumn() {
  const textInput = {
    value: "",
    events: [],
    dispatchEvent(event) {
      this.events.push(event.type);
    },
    blur() {
      this.events.push("blur");
    }
  };
  const button = {
    clicks: 0,
    classList: { contains: () => false },
    click() {
      this.clicks += 1;
    }
  };

  return {
    textInput,
    querySelector(selector) {
      if (selector === "textarea, input[type=\"text\"], input:not([type])") return textInput;
      if (selector === "button") return button;
      if (selector === ".character-attribute__value button, button") return button;
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };
}

function createNumberColumn() {
  const numberInput = {
    value: "",
    events: [],
    dispatchEvent(event) {
      this.events.push(event.type);
    },
    blur() {
      this.events.push("blur");
    }
  };
  const button = {
    clicks: 0,
    textContent: "0",
    classList: { contains: () => false },
    click() {
      this.clicks += 1;
    }
  };

  return {
    numberInput,
    querySelector(selector) {
      if (selector === "input[type=\"number\"]") return numberInput;
      if (selector === "button") return button;
      if (selector === ".character-attribute__value button, button") return button;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "button") return [button];
      return [];
    }
  };
}

function createButtonOnlyColumn() {
  return {
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };
}

function createWeaponRootWithAddButton({ addCreatesRow = true } = {}) {
  const headerRow = createWeaponHeaderRow();
  const weaponRows = [createWeaponRow()];
  const addButton = {
    clicks: 0,
    click() {
      this.clicks += 1;
      if (addCreatesRow) {
        weaponRows.push(createWeaponRow());
      }
    }
  };
  const fieldset = {
    textContent: "武器",
    querySelector(selector) {
      if (selector === "legend button[aria-haspopup]") return addButton;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".character-attribute--row") return [headerRow, ...weaponRows];
      return [];
    }
  };

  return {
    addButton,
    querySelectorAll(selector) {
      if (selector === ".character-attribute--row") return [headerRow, ...weaponRows];
      if (selector === "fieldset.character-category") return [fieldset];
      return [];
    }
  };
}

function createRow(name) {
  const nameElement = { textContent: name };
  const button = {
    clicks: 0,
    click() {
      this.clicks += 1;
    }
  };
  const numberInput = {
    value: "",
    events: [],
    dispatchEvent(event) {
      this.events.push(event.type);
    },
    blur() {
      this.events.push("blur");
    }
  };

  return {
    button,
    numberInput,
    querySelector(selector) {
      if (selector === ".character-attribute__name") return nameElement;
      if (selector === ".character-attribute__value button") return button;
      if (selector === '.character-attribute__value input[type="number"]') return numberInput;
      return null;
    }
  };
}

function createNumberRow(name, currentValue = 50) {
  const nameElement = { textContent: name };
  const minusButton = {
    clicks: 0,
    classList: { contains: (name) => name === "btn-svg" },
    click() {
      this.clicks += 1;
    }
  };
  const valueButton = {
    textContent: String(currentValue),
    classList: { contains: () => false },
    click() {}
  };
  const plusButton = {
    clicks: 0,
    classList: { contains: (name) => name === "btn-svg" },
    click() {
      this.clicks += 1;
    }
  };

  return {
    minusButton,
    valueButton,
    plusButton,
    querySelector(selector) {
      if (selector === ".character-attribute__name") return nameElement;
      if (selector === '.character-attribute__value input[type="number"]') return null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".character-attribute__value button") {
        return [minusButton, valueButton, plusButton];
      }

      return [];
    }
  };
}

function createBarRow(name, currentValue) {
  const nameElement = { textContent: name };
  const documentInput = {
    value: "",
    events: [],
    dispatchEvent(event) {
      this.events.push(event.type);
    },
    blur() {
      this.events.push("blur");
    }
  };
  const ownerDocument = {
    querySelector(selector) {
      if (selector === '.character-attribute__value input[type="number"], input[type="number"]') {
        return documentInput;
      }

      return null;
    }
  };
  const valueButton = {
    textContent: String(currentValue),
    clicks: 0,
    classList: { contains: () => false },
    click() {
      this.clicks += 1;
    }
  };
  const maxButton = {
    textContent: "12",
    clicks: 0,
    classList: { contains: () => false },
    click() {
      this.clicks += 1;
    }
  };

  return {
    ownerDocument,
    valueButton,
    maxButton,
    documentInput,
    querySelector(selector) {
      if (selector === ".character-attribute__name") return nameElement;
      if (selector === '.character-attribute__value input[type="number"]') return null;
      if (selector === ".character-attribute__value button") return valueButton;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".character-attribute__value button") {
        return [valueButton, maxButton];
      }

      return [];
    }
  };
}

function createTextAttributeRow(name) {
  const nameElement = { textContent: name };
  const textInput = {
    value: "",
    events: [],
    dispatchEvent(event) {
      this.events.push(event.type);
    },
    blur() {
      this.events.push("blur");
    }
  };
  const button = {
    clicks: 0,
    classList: { contains: () => false },
    click() {
      this.clicks += 1;
    }
  };

  return {
    textInput,
    querySelector(selector) {
      if (selector === ".character-attribute__name") return nameElement;
      if (selector === '.character-attribute__value input[type="number"]') return null;
      if (selector === ".character-attribute__value button") return button;
      if (selector === 'textarea, input[type="text"], input:not([type])') return textInput;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".character-attribute__value button") return [button];
      return [];
    }
  };
}

function createParagraphRow(name) {
  const nameElement = { textContent: name };
  const editor = {
    textContent: "",
    events: [],
    focus() {},
    dispatchEvent(event) {
      this.events.push(event.type);
    },
    blur() {
      this.events.push("blur");
    }
  };

  return {
    editor,
    querySelector(selector) {
      if (selector === ".character-attribute__name") return nameElement;
      if (selector === '[contenteditable="true"], [role="textbox"][contenteditable="true"]') return editor;
      return null;
    }
  };
}

function createInfoRoot() {
  const editor = {
    textContent: "",
    events: [],
    focus() {},
    dispatchEvent(event) {
      this.events.push(event.type);
    },
    blur() {
      this.events.push("blur");
    }
  };

  return {
    editor,
    querySelector(selector) {
      if (selector === ".sheet-content--info pre[contenteditable=\"true\"]") return editor;
      return null;
    }
  };
}
