// ==UserScript==
// @name         TRPGLine COC7 Excel Importer
// @namespace    https://github.com/local/trpg-sheet-importer
// @version      0.1.11
// @description  Import the fixed COC7 Excel character sheet into TRPGLine Link sheets.
// @author       local
// @match        *://trpgline.com/*
// @match        *://*.trpgline.com/*
// @require      https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const ATTRIBUTE_CELL_MAP = {
    STR: "U3",
    DEX: "AA3",
    POW: "AG3",
    CON: "U5",
    APP: "AA5",
    EDU: "AG5",
    SIZ: "U7",
    INT: "AA7",
    MOV: ["AE7", "AF10"]
  };

  const DERIVED_CELL_MAP = {
    HP: ["F10", "E10"],
    HPMax: ["F10", "E10"],
    SAN: "N10",
    SANMax: "P10",
    Luck: ["V10", "AG7"],
    LuckMax: ["X10", "AG7"],
    MP: ["AD10", "W10"],
    MPMax: ["AD10", "W10"]
  };

  const PROFILE_CELL_MAP = {
    occupation: "E5",
    age: "E6"
  };

  const BACKGROUND_CELL_MAP = {
    "特質": "AA71",
    "思想及信念": "AA63",
    "重要之人及理由": "AA65",
    "意義非凡之地": "AA67",
    "寶貴之物": "AA69",
    "傷勢及傷痕": "AA75",
    "恐懼症及狂躁症": "AA77"
  };

  const ITEM_CELL_MAP = {
    "擁有的物品與資產": [],
    "攜帶物品": ["F79", "N79", "N80"]
  };

  const INFO_CELL_MAP = {
    public: "W79"
  };

  const SKILL_TABLE_LAYOUTS = [
    {
      startRow: 15,
      endRow: 46,
      left: { name: "C", branch: "E", value: "P" },
      right: { name: "W", branch: "Y", value: "AJ" }
    },
    {
      startRow: 16,
      endRow: 49,
      left: { name: "F", branch: "H", value: "R" },
      right: { name: "AB", branch: "AD", value: "AN" }
    }
  ];

  const WEAPON_TABLE_LAYOUTS = [
    {
      startRow: 53,
      endRow: 60,
      name: "B",
      skill: "M",
      hitRate: "Q",
      damage: "W",
      range: "AA"
    }
  ];

  const ALIASES = {
    STR: ["STR", "力量"],
    DEX: ["DEX", "敏捷"],
    POW: ["POW", "意志"],
    CON: ["CON", "体质", "體質"],
    APP: ["APP", "外貌"],
    EDU: ["EDU", "教育"],
    SIZ: ["SIZ", "体型", "體型", "尺寸"],
    INT: ["INT", "智力", "灵感", "靈感"],
    MOV: ["MOV", "移动力", "移動力"],
    HP: ["HP", "体力", "體力", "生命值", "Hit Points"],
    HPMax: ["HPMax", "体力", "體力", "生命值", "Hit Points"],
    SAN: ["SAN", "理智", "Sanity"],
    Luck: ["Luck", "幸运", "幸運"],
    MP: ["MP", "魔法", "Magic Points"],
    MPMax: ["MPMax", "MP", "魔法", "Magic Points"],
    DB: ["DB", "伤害加值", "傷害加值", "Damage Bonus"],
    BUILD: ["BUILD", "Build", "体格", "體格"],
    occupation: ["职业", "職業", "Occupation"],
    age: ["年龄", "年齡", "Age"],
    accounting: ["会计", "會計", "Accounting"],
    anthropology: ["人类学", "人類學", "Anthropology"],
    appraise: ["估价", "估價", "Appraise"],
    archaeology: ["考古学", "考古學", "Archaeology"],
    charm: ["取悦", "取悅", "魅惑", "Charm"],
    climb: ["攀爬", "Climb"],
    computerUse: ["计算机使用", "計算機使用", "电脑使用", "電腦使用", "Computer Use"],
    creditRating: ["信用评级", "信用評級", "Credit Rating"],
    cthulhuMythos: ["克苏鲁神话", "克蘇魯神話", "Cthulhu Mythos"],
    disguise: ["乔装", "喬裝", "Disguise"],
    dodge: ["闪避", "閃避", "Dodge"],
    driveAuto: ["汽车驾驶", "汽車駕駛", "駕駛汽車", "Drive Auto"],
    electricalRepair: ["电气维修", "電氣維修", "電器維修", "Electrical Repair"],
    electronics: ["电子学", "電子學", "Electronics"],
    fastTalk: ["话术", "話術", "Fast Talk"],
    firstAid: ["急救", "First Aid"],
    history: ["历史", "歷史", "History"],
    intimidate: ["恐吓", "恐嚇", "威嚇", "Intimidate"],
    jump: ["跳跃", "跳躍", "Jump"],
    languageOwn: ["母语", "母語", "Own Language"],
    languageOther: ["语言", "語言", "Language"],
    law: ["法律", "Law"],
    libraryUse: ["图书馆使用", "圖書館使用", "Library Use"],
    listen: ["聆听", "聆聽", "Listen"],
    locksmith: ["锁匠", "鎖匠", "Locksmith"],
    mechanicalRepair: ["机械维修", "機械維修", "Mechanical Repair"],
    medicine: ["医学", "醫學", "Medicine"],
    naturalWorld: ["博物学", "博物學", "自然", "自然學", "Natural World"],
    navigate: ["领航", "領航", "导航", "導航", "Navigate"],
    occult: ["神秘学", "神秘學", "Occult"],
    operateHeavyMachinery: ["操作重型机械", "操作重型機械", "重型機械", "Operate Heavy Machinery"],
    persuade: ["说服", "說服", "Persuade"],
    psychoanalysis: ["精神分析", "心理分析", "Psychoanalysis"],
    psychology: ["心理学", "心理學", "Psychology"],
    ride: ["骑术", "騎術", "Ride"],
    sleightOfHand: ["妙手", "巧手", "Sleight of Hand"],
    spotHidden: ["侦查", "侦察", "偵查", "偵察", "尋找藏匿物", "Spot Hidden"],
    stealth: ["潜行", "潛行", "隱密行動", "Stealth"],
    swim: ["游泳", "Swim"],
    throwSkill: ["投掷", "投擲", "Throw"],
    track: ["追踪", "追蹤", "Track"],
    fightingBrawl: ["格斗:斗殴", "格鬥:鬥毆", "鬥毆", "Fighting:Brawl", "Brawl"],
    fightingAxe: ["格斗:斧", "格鬥:斧", "Fighting:Axe"],
    firearmsHandgun: ["射击:手枪", "射擊:手槍", "手枪", "手槍", "Firearms:Handgun", "Handgun"],
    firearmsRifleShotgun: ["射击:步枪/霰弹枪", "射擊:步槍/霰彈槍", "步枪/霰弹枪", "步槍/霰彈槍", "Firearms:Rifle/Shotgun", "Rifle/Shotgun"],
    survivalMountain: ["生存:山脉", "生存:山脈", "山脉", "山脈", "Survival:Mountain"],
    readLips: ["罕见:读唇", "罕見:讀唇", "读唇", "讀唇", "讀唇語", "Read Lips"],
    animalHandling: ["驯兽", "馴獸", "馴養動物", "Animal Handling"],
    diving: ["潜水", "潛水", "Diving"],
    artillery: ["炮术", "砲術", "炮術", "Artillery"],
    geology: ["地质学", "地質學", "Geology"],
    biology: ["生物学", "生物學", "Biology"]
  };

  const STYLE = `
    #trpgline-coc7-importer-launcher {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 999998;
      min-height: 34px;
      padding: 0 12px;
      border: 1px solid #0e7490;
      border-radius: 6px;
      background: #ecfeff;
      color: #155e75;
      cursor: pointer;
      font: 13px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-weight: 700;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);
    }
    #trpgline-coc7-importer {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 999999;
      width: 320px;
      max-height: 70vh;
      overflow: auto;
      background: #ffffff;
      color: #1f2937;
      border: 1px solid #0e7490;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.25);
      font: 13px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    #trpgline-coc7-importer header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background: #0e7490;
      color: #ffffff;
      font-weight: 700;
    }
    #trpgline-coc7-importer main {
      padding: 10px;
    }
    #trpgline-coc7-importer button,
    #trpgline-coc7-importer label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 30px;
      padding: 0 10px;
      border: 1px solid #0e7490;
      border-radius: 6px;
      background: #ecfeff;
      color: #155e75;
      cursor: pointer;
      font-weight: 600;
    }
    #trpgline-coc7-importer input[type="file"] {
      display: none;
    }
    #trpgline-coc7-importer .actions {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    #trpgline-coc7-importer .summary {
      margin: 8px 0;
      color: #475569;
    }
    #trpgline-coc7-importer .output {
      max-height: 220px;
      overflow: auto;
      padding: 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
    }
    #trpgline-coc7-importer .report-group {
      margin-bottom: 10px;
    }
    #trpgline-coc7-importer .report-group h3 {
      margin: 0 0 4px;
      font: 700 13px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #0f172a;
    }
    #trpgline-coc7-importer .report-ok {
      color: #166534;
    }
    #trpgline-coc7-importer .report-fail {
      color: #b91c1c;
      font-weight: 700;
    }
    #trpgline-coc7-importer .danger {
      color: #b91c1c;
    }
  `;

  let parsedCharacter = null;

  initLauncher();
  initPanel();

  function initLauncher() {
    if (document.querySelector("#trpgline-coc7-importer-launcher")) {
      return;
    }

    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    const launcher = document.createElement("button");
    launcher.id = "trpgline-coc7-importer-launcher";
    launcher.type = "button";
    launcher.textContent = "COC7 导入";
    launcher.addEventListener("click", initPanel);
    document.body.appendChild(launcher);
  }

  function initPanel() {
    if (document.querySelector("#trpgline-coc7-importer")) {
      return;
    }

    const panel = document.createElement("section");
    panel.id = "trpgline-coc7-importer";
    panel.innerHTML = `
      <header>
        <span>COC7 Excel 导入</span>
        <button type="button" data-close>×</button>
      </header>
      <main>
        <div class="actions">
          <label>
            选择 Excel
            <input type="file" accept=".xlsx,.xls" data-file>
          </label>
          <button type="button" data-import disabled>导入当前页</button>
        </div>
        <div class="summary" data-summary>请选择 cocv7.xlsx。基础属性和技能表需要切到对应页面分别导入。</div>
        <div class="output" data-output></div>
      </main>
    `;

    document.body.appendChild(panel);

    panel.querySelector("[data-close]").addEventListener("click", () => panel.remove());
    panel.querySelector("[data-file]").addEventListener("change", handleFile);
    panel.querySelector("[data-import]").addEventListener("click", handleImport);
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    const panel = document.querySelector("#trpgline-coc7-importer");
    const summary = panel.querySelector("[data-summary]");
    const output = panel.querySelector("[data-output]");
    const importButton = panel.querySelector("[data-import]");

    if (!file) {
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets["人物卡"] ?? workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        throw new Error("没有找到可读取的工作表");
      }

      parsedCharacter = mapCoc7Worksheet(sheetToCells(sheet));
      importButton.disabled = false;
      summary.textContent = `已读取：属性 ${Object.keys(parsedCharacter.attributes).length} 个，衍生值 ${Object.keys(parsedCharacter.derived).length} 个，技能 ${Object.keys(parsedCharacter.skills).length} 个，武器 ${parsedCharacter.weapons.length} 把，身世背景 ${Object.keys(parsedCharacter.background).length} 项，物品 ${Object.keys(parsedCharacter.items).length} 项，物件資訊 ${Object.keys(parsedCharacter.info).length} 项。`;
      output.textContent = renderPreview(parsedCharacter);
    } catch (error) {
      parsedCharacter = null;
      importButton.disabled = true;
      summary.innerHTML = `<span class="danger">读取失败：${escapeHtml(error.message)}</span>`;
      output.textContent = "";
    }
  }

  async function handleImport() {
    if (!parsedCharacter) {
      return;
    }

    const panel = document.querySelector("#trpgline-coc7-importer");
    const summary = panel.querySelector("[data-summary]");
    const output = panel.querySelector("[data-output]");
    const report = [];
    const basicEntries = [
      ["职业", parsedCharacter.profile.occupation],
      ["年龄", parsedCharacter.profile.age],
      ...Object.entries(parsedCharacter.attributes),
      ...Object.entries(parsedCharacter.derived).filter(([key]) => !key.endsWith("Max")),
      ["HPMax", parsedCharacter.derived.HPMax],
      ["MPMax", parsedCharacter.derived.MPMax]
    ];
    const skillEntries = Object.entries(parsedCharacter.skills);
    const weaponEntries = parsedCharacter.weapons;
    const backgroundEntries = Object.entries(parsedCharacter.background);
    const itemEntries = Object.entries(parsedCharacter.items);
    const infoEntries = [["公開資訊", parsedCharacter.info.public]];
    const activeTab = getActivePropertyTab(document);

    summary.textContent = "正在导入当前页面能找到的字段...";

    if (!activeTab || activeTab === "basic") {
      await importEntries("basic", basicEntries, report);
    }

    if (!activeTab || activeTab === "skills") {
      await importEntries("skills", skillEntries, report);
    }

    if (!activeTab || activeTab === "battle") {
      await importWeapons(weaponEntries, report);
    }

    if (!activeTab || activeTab === "background") {
      await importParagraphEntries("background", backgroundEntries, report);
    }

    if (!activeTab || activeTab === "items") {
      await importParagraphEntries("items", itemEntries, report);
    }

    if (!activeTab || activeTab === "info") {
      await importInfoEntries(infoEntries, report);
    }

    summary.textContent = "导入完成，请检查页面后手动保存。";
    output.innerHTML = renderImportReport(report);
  }

  async function importEntries(group, entries, report) {
    for (const [name, value] of entries) {
      const row = findAttributeRow(document, name);

      if (!row) {
        report.push(createReportEntry(group, name, value, { ok: false, reason: "未找到字段" }));
        continue;
      }

      const result = await setAttributeValue(row, value, {
        part: String(name).endsWith("Max") ? "max" : "current"
      });
      report.push(createReportEntry(group, name, value, result));
    }
  }

  async function importParagraphEntries(group, entries, report) {
    for (const [name, value] of entries) {
      const row = findParagraphRow(document, name);

      if (!row) {
        report.push(createReportEntry(group, name, value, { ok: false, reason: "未找到段落字段" }));
        continue;
      }

      const result = setParagraphValue(row, value);
      report.push(createReportEntry(group, name, value, result));
    }
  }

  async function importInfoEntries(entries, report) {
    for (const [name, value] of entries) {
      const editor = findInfoEditor(document);
      const result = setInfoValue(editor, value);
      report.push(createReportEntry("info", name, value, result));
    }
  }

  function getActivePropertyTab(root) {
    if (root.querySelector(".sheet-content--info")) {
      return "info";
    }

    const activeButton = [...root.querySelectorAll(".sheet-content--property .btn-primary, .sheet-content--property button")]
      .find((button) => button.classList?.contains("btn-primary"));
    const text = normalizeAlias(activeButton?.textContent);

    if (["基本属性", "基本屬性"].some((label) => text.includes(normalizeAlias(label)))) {
      return "basic";
    }

    if (["技能表"].some((label) => text.includes(normalizeAlias(label)))) {
      return "skills";
    }

    if (["战斗", "戰鬥"].some((label) => text.includes(normalizeAlias(label)))) {
      return "battle";
    }

    if (["身世背景"].some((label) => text.includes(normalizeAlias(label)))) {
      return "background";
    }

    if (["物品"].some((label) => text.includes(normalizeAlias(label)))) {
      return "items";
    }

    return "";
  }

  async function importWeapons(weapons, report) {
    if (weapons.length === 0) {
      return;
    }

    const rows = await ensureWeaponRows(document, weapons.length);

    if (rows.length === 0) {
      for (const weapon of weapons) {
        report.push(createReportEntry("weapons", weapon.name, formatWeaponValue(weapon), { ok: false, reason: "未找到武器表" }));
      }

      return;
    }

    for (const [index, weapon] of weapons.entries()) {
      const row = rows[index];

      if (!row) {
        report.push(createReportEntry("weapons", weapon.name, formatWeaponValue(weapon), { ok: false, reason: "武器行不足，请先在网页新增武器行" }));
        continue;
      }

      const result = await setWeaponRow(row, weapon);
      report.push(createReportEntry("weapons", weapon.name, formatWeaponValue(weapon), result));
    }
  }

  function formatWeaponValue(weapon) {
    return `${weapon.hitRate} / ${weapon.damage} / ${weapon.range}`;
  }

  function createReportEntry(group, name, value, result) {
    return {
      group,
      name,
      value,
      ok: result.ok,
      reason: result.reason ?? ""
    };
  }

  function renderImportReport(entries) {
    return ["basic", "skills", "weapons", "background", "items", "info"]
      .map((group) => renderReportGroup(group, entries.filter((entry) => entry.group === group)))
      .filter(Boolean)
      .join("");
  }

  function renderReportGroup(group, entries) {
    if (entries.length === 0) {
      return "";
    }

    const titles = {
      basic: "基础数值",
      skills: "技能",
      weapons: "武器",
      background: "身世背景",
      items: "物品",
      info: "物件資訊"
    };
    const items = entries.map(renderReportEntry).join("");

    return `<section class="report-group"><h3>${escapeHtml(titles[group] ?? group)}</h3>${items}</section>`;
  }

  function renderReportEntry(entry) {
    const className = entry.ok ? "report-ok" : "report-fail";
    const label = entry.ok ? "成功" : "失败";
    const reason = entry.ok || !entry.reason ? "" : `（${entry.reason}）`;

    return `<div class="${className}">${label}：${escapeHtml(entry.name)} = ${escapeHtml(entry.value)}${escapeHtml(reason)}</div>`;
  }

  function mapCoc7Worksheet(cells) {
    const attributes = mapCells(cells, ATTRIBUTE_CELL_MAP);
    const derived = {
      ...mapCells(cells, DERIVED_CELL_MAP),
      ...calculateDamageProfile(attributes.STR, attributes.SIZ)
    };

    return {
      attributes,
      derived,
      profile: mapProfile(cells),
      skills: mapSkills(cells),
      weapons: mapWeapons(cells),
      background: mapBackground(cells),
      items: mapItems(cells),
      info: mapInfo(cells)
    };
  }

  function mapCells(cells, map) {
    const result = {};

    for (const [key, address] of Object.entries(map)) {
      result[key] = readFirstNumber(cells, address);
    }

    return result;
  }

  function mapProfile(cells) {
    return {
      occupation: String(readFirstValue(cells, PROFILE_CELL_MAP.occupation) ?? "").trim(),
      age: readFirstNumber(cells, PROFILE_CELL_MAP.age)
    };
  }

  function mapBackground(cells) {
    const background = {};

    for (const [label, address] of Object.entries(BACKGROUND_CELL_MAP)) {
      background[label] = String(readFirstValue(cells, address) ?? "").trim();
    }

    return background;
  }

  function mapItems(cells) {
    const items = {};

    for (const [label, addresses] of Object.entries(ITEM_CELL_MAP)) {
      items[label] = joinNonEmpty(addresses.map((address) => cells[address]));
    }

    return items;
  }

  function mapInfo(cells) {
    return {
      public: String(readFirstValue(cells, INFO_CELL_MAP.public) ?? "").trim()
    };
  }

  function joinNonEmpty(values) {
    return values
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
      .join("\n");
  }

  function calculateDamageProfile(str, siz) {
    const total = Number(str) + Number(siz);

    if (!Number.isFinite(total) || total <= 0) {
      return { DB: "0", BUILD: 0 };
    }

    if (total <= 64) return { DB: "-2", BUILD: -2 };
    if (total <= 84) return { DB: "-1", BUILD: -1 };
    if (total <= 124) return { DB: "0", BUILD: 0 };
    if (total <= 164) return { DB: "+1D4", BUILD: 1 };
    if (total <= 204) return { DB: "+1D6", BUILD: 2 };

    const extra = Math.floor((total - 205) / 80);
    return { DB: `+${2 + extra}D6`, BUILD: 3 + extra };
  }

  function readFirstValue(cells, addressOrAddresses) {
    const addresses = Array.isArray(addressOrAddresses)
      ? addressOrAddresses
      : [addressOrAddresses];

    for (const address of addresses) {
      const value = cells[address];

      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }

    return undefined;
  }

  function readFirstNumber(cells, addressOrAddresses) {
    const addresses = Array.isArray(addressOrAddresses)
      ? addressOrAddresses
      : [addressOrAddresses];

    for (const address of addresses) {
      const number = toNumberOrNull(cells[address]);

      if (number !== null) {
        return number;
      }
    }

    return 0;
  }

  function mapSkills(cells) {
    const skills = {};

    for (const layout of SKILL_TABLE_LAYOUTS) {
      for (let row = layout.startRow; row <= layout.endRow; row += 1) {
        addSkillFromColumns(skills, cells, layout.left, row);
        addSkillFromColumns(skills, cells, layout.right, row);
      }
    }

    return skills;
  }

  function mapWeapons(cells) {
    const weapons = [];

    for (const layout of WEAPON_TABLE_LAYOUTS) {
      for (let row = layout.startRow; row <= layout.endRow; row += 1) {
        const weapon = mapWeaponFromColumns(cells, layout, row);

        if (weapon) {
          weapons.push(weapon);
        }
      }
    }

    return weapons;
  }

  function mapWeaponFromColumns(cells, layout, row) {
    const name = String(cells[`${layout.name}${row}`] ?? "").trim()
      || String(cells[`${layout.skill}${row}`] ?? "").trim();
    const hitRate = toNumber(cells[`${layout.hitRate}${row}`]);
    const damage = String(cells[`${layout.damage}${row}`] ?? "").trim();
    const range = String(cells[`${layout.range}${row}`] ?? "").trim();

    if (!name || (!hitRate && !damage && !range)) {
      return null;
    }

    return {
      name,
      hitRate,
      damage,
      range
    };
  }

  function addSkillFromColumns(skills, cells, columns, row) {
    addSkill(
      skills,
      cells[`${columns.name}${row}`],
      cells[`${columns.branch}${row}`],
      cells[`${columns.value}${row}`]
    );
  }

  function addSkill(skills, rawName, rawBranch, rawValue) {
    const name = formatSkillName(rawName, rawBranch);

    if (!name) {
      return;
    }

    skills[name] = toNumber(rawValue);
  }

  function formatSkillName(rawName, rawBranch) {
    const name = String(rawName ?? "").trim().replace(/\s+/g, "");
    const branch = String(rawBranch ?? "").trim().replace(/\s+/g, "");

    if (!name) {
      return "";
    }

    if (name.endsWith(":") || name.endsWith("：")) {
      return branch ? `${name.replace(/：$/, ":")}${branch}` : "";
    }

    if (/[①②③④⑤⑥⑦⑧⑨]/.test(name)) {
      return branch ? `${name}:${branch}` : "";
    }

    return name.replace(/[Ω★]/g, "").trim();
  }

  function sheetToCells(sheet) {
    const cells = {};

    for (const address of Object.keys(sheet)) {
      if (address.startsWith("!")) {
        continue;
      }

      cells[address] = sheet[address].v;
    }

    return cells;
  }

  function findAttributeRow(root, wantedName) {
    const wantedKey = normalizeName(wantedName);
    const fallbackKey = getSpecializedKey(wantedName);
    const rows = [...root.querySelectorAll(".character-attribute")];

    return rows.find((row) => {
      const name = row.querySelector(".character-attribute__name")?.textContent;
      const rowKey = normalizeName(name);
      return rowKey === wantedKey || rowKey === fallbackKey || rowKey === getMaxBaseKey(wantedKey);
    }) ?? null;
  }

  function findParagraphRow(root, wantedName) {
    const wantedKey = normalizeAlias(wantedName);
    const rows = [...root.querySelectorAll(".character-attribute")];

    return rows.find((row) => {
      const name = row.querySelector(".character-attribute__name")?.textContent;
      return normalizeAlias(name) === wantedKey && Boolean(findEditableParagraph(row));
    }) ?? null;
  }

  function setParagraphValue(row, value) {
    const editor = findEditableParagraph(row);

    if (!editor) {
      return { ok: false, reason: "未找到段落输入框" };
    }

    setEditableContent(editor, value);

    return { ok: true };
  }

  function findEditableParagraph(row) {
    return row.querySelector('[contenteditable="true"], [role="textbox"][contenteditable="true"]');
  }

  function findInfoEditor(root) {
    return root.querySelector('.sheet-content--info pre[contenteditable="true"]');
  }

  function setInfoValue(editor, value) {
    if (!editor) {
      return { ok: false, reason: "未找到公开信息输入框" };
    }

    setEditableContent(editor, value);
    return { ok: true };
  }

  function setEditableContent(editor, value) {
    editor.focus?.();
    editor.textContent = String(value ?? "");
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.dispatchEvent(new Event("change", { bubbles: true }));
    editor.blur?.();
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

    return normalizeName(text.slice(separatorIndex + 1));
  }

  async function setAttributeValue(row, value, options = {}) {
    const button = findValueButton(row, options);

    if (!button) {
      return { ok: false, reason: "未找到数值按钮" };
    }

    button.click();
    await waitFor(() => findNumberInput(row), 800);

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

  function findWeaponRows(root) {
    const rows = [...root.querySelectorAll(".character-attribute--row")];
    const headerIndex = rows.findIndex(isWeaponHeaderRow);

    if (headerIndex < 0) {
      return [];
    }

    return rows.slice(headerIndex + 1).filter(isWeaponDataRow);
  }

  async function ensureWeaponRows(root, count) {
    let rows = findWeaponRows(root);

    while (rows.length < count) {
      const addButton = findWeaponAddButton(root);

      if (!addButton) {
        return rows;
      }

      addButton.click();
      await waitFor(() => findWeaponRows(root).length > rows.length, 800);
      const nextRows = findWeaponRows(root);

      if (nextRows.length <= rows.length) {
        return rows;
      }

      rows = nextRows;
    }

    return rows;
  }

  async function setWeaponRow(row, weapon) {
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
      .map((column) => normalizeAlias(column.textContent));

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
      const text = normalizeAlias(fieldset.textContent);
      const rows = [...(fieldset.querySelectorAll?.(".character-attribute--row") ?? [])];
      return text.includes("武器") || rows.some(isWeaponHeaderRow);
    });

    return weaponFieldset?.querySelector?.("legend button[aria-haspopup]") ?? null;
  }

  async function setColumnTextValue(column, value) {
    const button = column.querySelector(".character-attribute__value button, button");

    if (button) {
      button.click();
      await waitFor(() => findTextInput(column), 800);
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
    await waitFor(() => column.querySelector('input[type="number"]'), 800);

    const input = column.querySelector('input[type="number"]');

    if (!input) {
      return setValueWithColumnStepper(column, button, value);
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

  function setInputValue(input, value) {
    const nextValue = String(value ?? "");
    const prototype = Object.getPrototypeOf(input);
    const descriptor = prototype ? Object.getOwnPropertyDescriptor(prototype, "value") : null;

    input.focus?.();
    if (descriptor?.set) {
      descriptor.set.call(input, nextValue);
    } else {
      input.value = nextValue;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.blur();
  }

  function setValueWithColumnStepper(column, valueButton, value) {
    const current = Number(valueButton?.textContent?.trim());
    const target = Number(value);

    if (!Number.isFinite(current) || !Number.isFinite(target)) {
      return { ok: false, reason: "点击后未出现数字输入框" };
    }

    const buttons = [...(column.querySelectorAll?.("button") ?? [])];
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

  function setValueWithStepper(row, valueButton, value) {
    const current = Number(valueButton?.textContent?.trim());
    const target = Number(value);

    if (!Number.isFinite(current) || !Number.isFinite(target)) {
      return { ok: false, reason: "点击后未出现数字输入框" };
    }

    const buttons = [...row.querySelectorAll(".character-attribute__value button")];
    const iconButtons = buttons.filter((button) => button.classList.contains("btn-svg"));

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

  function findValueButton(row, options = {}) {
    const buttons = [...row.querySelectorAll(".character-attribute__value button")];
    const nonIconButtons = buttons.filter((button) => !button.classList.contains("btn-svg"));

    if (options.part === "max" && nonIconButtons.length > 1) {
      return nonIconButtons[1];
    }

    const nonIconButton = buttons.find((button) => !button.classList.contains("btn-svg"));

    if (nonIconButton) {
      return nonIconButton;
    }

    return row.querySelector(".character-attribute__value button");
  }

  function normalizeName(value) {
    const text = String(value ?? "")
      .trim()
      .replace(/[：]/g, ":")
      .replace(/[Ω★]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase();

    for (const [key, aliases] of Object.entries(ALIASES)) {
      if (aliases.some((alias) => normalizeAlias(alias) === normalizeAlias(text))) {
        return key;
      }
    }

    return normalizeAlias(text);
  }

  function normalizeAlias(value) {
    return String(value ?? "")
      .trim()
      .replace(/[：]/g, ":")
      .replace(/[Ω★]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function toNumber(value) {
    return toNumberOrNull(value) ?? 0;
  }

  function toNumberOrNull(value) {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function renderPreview(character) {
    const profile = Object.entries(character.profile)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    const attributes = Object.entries(character.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    const derived = Object.entries(character.derived)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    const skills = Object.entries(character.skills)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    const weapons = character.weapons
      .map((weapon) => `${weapon.name}: ${formatWeaponValue(weapon)}`)
      .join("\n");
    const background = Object.entries(character.background)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    const items = Object.entries(character.items)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    const info = Object.entries(character.info)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    return `[基础信息]\n${profile}\n\n[属性]\n${attributes}\n\n[衍生值]\n${derived}\n\n[技能]\n${skills}\n\n[武器]\n${weapons}\n\n[身世背景]\n${background}\n\n[物品]\n${items}\n\n[物件資訊]\n${info}`;
  }

  function waitFor(getValue, timeoutMs) {
    const startedAt = Date.now();

    return new Promise((resolve) => {
      const tick = () => {
        const value = getValue();

        if (value || Date.now() - startedAt >= timeoutMs) {
          resolve(value);
          return;
        }

        setTimeout(tick, 25);
      };

      tick();
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
