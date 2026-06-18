export const SKILL_ALIASES = {
  appraise: {
    zhHans: ["估价"],
    zhHant: ["估價"],
    en: ["Appraise"]
  },
  libraryUse: {
    zhHans: ["图书馆使用"],
    zhHant: ["圖書館使用"],
    en: ["Library Use"]
  },
  listen: {
    zhHans: ["聆听"],
    zhHant: ["聆聽"],
    en: ["Listen"]
  },
  charm: {
    zhHans: ["取悦", "魅惑"],
    zhHant: ["取悅", "魅惑"],
    en: ["Charm"]
  },
  intimidate: {
    zhHans: ["恐吓"],
    zhHant: ["恐嚇", "威嚇"],
    en: ["Intimidate"]
  },
  psychoanalysis: {
    zhHans: ["精神分析"],
    zhHant: ["精神分析", "心理分析"],
    en: ["Psychoanalysis"]
  },
  spotHidden: {
    zhHans: ["侦查", "侦察"],
    zhHant: ["偵查", "偵察", "尋找藏匿物"],
    en: ["Spot Hidden"]
  },
  stealth: {
    zhHans: ["潜行"],
    zhHant: ["潛行", "隱密行動"],
    en: ["Stealth"]
  },
  readLips: {
    zhHans: ["读唇"],
    zhHant: ["讀唇", "讀唇語"],
    en: ["Read Lips"]
  },
  naturalWorld: {
    zhHans: ["博物学"],
    zhHant: ["博物學", "自然學"],
    en: ["Natural World"]
  },
  navigate: {
    zhHans: ["导航", "领航"],
    zhHant: ["導航", "領航"],
    en: ["Navigate"]
  },
  driveAuto: {
    zhHans: ["汽车驾驶"],
    zhHant: ["汽車駕駛", "駕駛汽車"],
    en: ["Drive Auto"]
  },
  electricalRepair: {
    zhHans: ["电气维修"],
    zhHant: ["電氣維修", "電器維修"],
    en: ["Electrical Repair"]
  },
  operateHeavyMachinery: {
    zhHans: ["操作重型机械"],
    zhHant: ["操作重型機械", "重型機械"],
    en: ["Operate Heavy Machinery"]
  },
  animalHandling: {
    zhHans: ["驯兽"],
    zhHant: ["馴獸", "馴養動物"],
    en: ["Animal Handling"]
  },
  diving: {
    zhHans: ["潜水"],
    zhHant: ["潛水"],
    en: ["Diving"]
  },
  artillery: {
    zhHans: ["炮术"],
    zhHant: ["炮術", "砲術"],
    en: ["Artillery"]
  },
  biology: {
    zhHans: ["生物学"],
    zhHant: ["生物學"],
    en: ["Biology"]
  },
  geology: {
    zhHans: ["地质学"],
    zhHant: ["地質學"],
    en: ["Geology"]
  },
  SIZ: {
    zhHans: ["体型", "尺寸"],
    zhHant: ["體型", "尺寸"],
    en: ["SIZ"]
  },
  HP: {
    zhHans: ["体力", "生命值"],
    zhHant: ["體力", "生命值"],
    en: ["HP", "Hit Points"]
  },
  HPMax: {
    zhHans: ["体力", "生命值"],
    zhHant: ["體力", "生命值"],
    en: ["HPMax", "HP", "Hit Points"]
  },
  DB: {
    zhHans: ["伤害加值"],
    zhHant: ["傷害加值"],
    en: ["DB", "Damage Bonus"]
  },
  BUILD: {
    zhHans: ["体格"],
    zhHant: ["體格"],
    en: ["BUILD", "Build"]
  },
  occupation: {
    zhHans: ["职业"],
    zhHant: ["職業"],
    en: ["Occupation"]
  },
  age: {
    zhHans: ["年龄"],
    zhHant: ["年齡"],
    en: ["Age"]
  },
  MPMax: {
    zhHans: ["魔法"],
    zhHant: ["魔法"],
    en: ["MPMax", "MP", "Magic Points"]
  }
};

export function normalizeSkillName(name) {
  const normalized = normalizeText(name);

  for (const [key, aliases] of Object.entries(SKILL_ALIASES)) {
    const values = [
      ...(aliases.zhHans ?? []),
      ...(aliases.zhHant ?? []),
      ...(aliases.en ?? [])
    ];

    if (values.some((alias) => normalizeText(alias) === normalized)) {
      return key;
    }
  }

  return normalized;
}

export function findAttributeRow(root, wantedName) {
  const wantedKey = normalizeSkillName(wantedName);
  const fallbackKey = getSpecializedKey(wantedName);
  const rows = [...root.querySelectorAll(".character-attribute")];

  return rows.find((row) => {
    const name = row.querySelector(".character-attribute__name")?.textContent;
    const rowKey = normalizeSkillName(name);
    return rowKey === wantedKey || rowKey === fallbackKey || rowKey === getMaxBaseKey(wantedKey);
  }) ?? null;
}

export function findParagraphRow(root, wantedName) {
  const wantedKey = normalizeText(wantedName);
  const rows = [...root.querySelectorAll(".character-attribute")];

  return rows.find((row) => {
    const name = row.querySelector(".character-attribute__name")?.textContent;
    return normalizeText(name) === wantedKey && Boolean(findEditableParagraph(row));
  }) ?? null;
}

export function setParagraphValue(row, value) {
  const editor = findEditableParagraph(row);

  if (!editor) {
    return { ok: false, reason: "未找到段落输入框" };
  }

  editor.focus?.();
  editor.textContent = String(value ?? "");
  editor.dispatchEvent(createDomEvent("input"));
  editor.dispatchEvent(createDomEvent("change"));
  editor.blur?.();

  return { ok: true };
}

export function findInfoEditor(root) {
  return root.querySelector('.sheet-content--info pre[contenteditable="true"]');
}

export function setInfoValue(editor, value) {
  if (!editor) {
    return { ok: false, reason: "未找到公开信息输入框" };
  }

  setEditableContent(editor, value);
  return { ok: true };
}

function getMaxBaseKey(key) {
  return String(key).endsWith("Max") ? String(key).slice(0, -3) : "";
}

function getSpecializedKey(name) {
  const text = String(name ?? "");
  const separatorIndex = text.indexOf(":");

  if (separatorIndex < 0) {
    return "";
  }

  return normalizeSkillName(text.slice(separatorIndex + 1));
}

export function findValueButton(row, options = {}) {
  const buttons = [...(row.querySelectorAll?.(".character-attribute__value button") ?? [])];
  const nonIconButton = buttons.find((button) => !button.classList?.contains("btn-svg"));
  const nonIconButtons = buttons.filter((button) => !button.classList?.contains("btn-svg"));

  if (options.part === "max" && nonIconButtons.length > 1) {
    return nonIconButtons[1];
  }

  if (nonIconButton) {
    return nonIconButton;
  }

  return row.querySelector(".character-attribute__value button");
}

export async function setAttributeValue(row, value, options = {}) {
  const button = findValueButton(row, options);

  if (!button) {
    return { ok: false, reason: "未找到数值按钮" };
  }

  button.click();
  await wait(0);

  const input = findNumberInput(row);

  if (!input && isTextAttributeRow(row)) {
    const textInput = findTextInput(row);

    if (!textInput) {
      return { ok: false, reason: "未找到文本输入框" };
    }

    setInputValue(textInput, value);
    return { ok: true };
  }

  if (!input) {
    return setValueWithStepper(row, button, value);
  }

  setInputValue(input, value);

  return { ok: true };
}

export function findWeaponRows(root) {
  const rows = [...root.querySelectorAll(".character-attribute--row")];
  const headerIndex = rows.findIndex(isWeaponHeaderRow);

  if (headerIndex < 0) {
    return [];
  }

  return rows.slice(headerIndex + 1).filter(isWeaponDataRow);
}

export async function ensureWeaponRows(root, count) {
  let rows = findWeaponRows(root);

  while (rows.length < count) {
    const addButton = findWeaponAddButton(root);

    if (!addButton) {
      return rows;
    }

    addButton.click();
    await wait(0);
    const nextRows = findWeaponRows(root);

    if (nextRows.length <= rows.length) {
      return rows;
    }

    rows = nextRows;
  }

  return rows;
}

export async function setWeaponRow(row, weapon) {
  const columns = [...row.querySelectorAll(".character-attribute--row--column")];

  if (columns.length < 4) {
    return { ok: false, reason: "武器行列数不足" };
  }

  const results = [
    await setColumnTextValue(columns[0], weapon.name),
    await setColumnNumberValue(columns[1], weapon.hitRate),
    await setColumnTextValue(columns[2], weapon.damage),
    await setColumnTextValue(columns[3], weapon.range)
  ];
  const failed = results.find((result) => !result.ok);

  if (failed) {
    return failed;
  }

  return { ok: true };
}

function findNumberInput(row) {
  return row.querySelector('.character-attribute__value input[type="number"]')
    ?? row.ownerDocument?.querySelector('.character-attribute__value input[type="number"], input[type="number"]')
    ?? null;
}

function isTextAttributeRow(row) {
  return row.classList?.contains("character-attribute--text")
    || Boolean(findTextInput(row));
}

function isWeaponHeaderRow(row) {
  const labels = [...(row.querySelectorAll?.(".character-attribute--row--column") ?? [])]
    .map((column) => normalizeText(column.textContent));

  return labels.includes("名稱")
    && labels.includes("命中率")
    && labels.includes("傷害")
    && labels.includes("範圍");
}

function isWeaponDataRow(row) {
  const columns = [...(row.querySelectorAll?.(".character-attribute--row--column") ?? [])];

  return columns.length >= 4 && columns.some((column) => column.querySelector?.("button"));
}

function findWeaponAddButton(root) {
  const fieldsets = [...(root.querySelectorAll?.("fieldset.character-category") ?? [])];
  const weaponFieldset = fieldsets.find((fieldset) => {
    const text = normalizeText(fieldset.textContent);
    const rows = [...(fieldset.querySelectorAll?.(".character-attribute--row") ?? [])];
    return text.includes("武器") || rows.some(isWeaponHeaderRow);
  });

  return weaponFieldset?.querySelector?.("legend button[aria-haspopup]") ?? null;
}

async function setColumnTextValue(column, value) {
  const button = column.querySelector(".character-attribute__value button, button");

  if (button) {
    button.click();
    await wait(0);
  }

  const input = findTextInput(column);

  if (!input) {
    return { ok: false, reason: "未找到文本输入框" };
  }

  setInputValue(input, value);
  return { ok: true };
}

async function setColumnNumberValue(column, value) {
  const button = findColumnValueButton(column);

  if (!button) {
    return { ok: false, reason: "未找到数值按钮" };
  }

  button.click();
  await wait(0);

  const input = column.querySelector('input[type="number"]');

  if (!input) {
    return setValueWithStepper(column, button, value);
  }

  setInputValue(input, value);
  return { ok: true };
}

function findColumnValueButton(column) {
  const buttons = [...(column.querySelectorAll?.("button") ?? [])];
  const nonIconButton = buttons.find((button) => !button.classList?.contains("btn-svg"));

  return nonIconButton ?? buttons[0] ?? null;
}

function findTextInput(column) {
  return column.querySelector('textarea, input[type="text"], input:not([type])')
    ?? column.ownerDocument?.querySelector('textarea, input[type="text"], input:not([type])')
    ?? null;
}

function findEditableParagraph(row) {
  return row.querySelector('[contenteditable="true"], [role="textbox"][contenteditable="true"]');
}

function setEditableContent(editor, value) {
  editor.focus?.();
  editor.textContent = String(value ?? "");
  editor.dispatchEvent(createDomEvent("input"));
  editor.dispatchEvent(createDomEvent("change"));
  editor.blur?.();
}

function setInputValue(input, value) {
  const nextValue = String(value ?? "");
  const prototype = Object.getPrototypeOf(input);
  const descriptor = prototype ? Object.getOwnPropertyDescriptor(prototype, "value") : null;

  if (descriptor?.set) {
    descriptor.set.call(input, nextValue);
  } else {
    input.value = nextValue;
  }

  input.dispatchEvent(createDomEvent("input"));
  input.dispatchEvent(createDomEvent("change"));
  input.blur();
}

function setValueWithStepper(row, valueButton, value) {
  const current = Number(valueButton?.textContent?.trim());
  const target = Number(value);

  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return { ok: false, reason: "点击后未出现数字输入框" };
  }

  const buttons = [...(row.querySelectorAll?.(".character-attribute__value button") ?? [])];
  const iconButtons = buttons.filter((button) => button.classList?.contains("btn-svg"));

  if (iconButtons.length < 2) {
    return { ok: false, reason: "点击后未出现数字输入框，也未找到加减按钮" };
  }

  const [minusButton, plusButton] = iconButtons;
  const delta = target - current;
  const stepButton = delta >= 0 ? plusButton : minusButton;

  for (let index = 0; index < Math.abs(delta); index += 1) {
    stepButton.click();
  }

  return { ok: true };
}

function createDomEvent(type) {
  if (typeof Event === "function") {
    return new Event(type, { bubbles: true });
  }

  return { type, bubbles: true };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
