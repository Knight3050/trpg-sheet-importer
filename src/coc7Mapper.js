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

export function mapCoc7Worksheet(cells) {
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
    occupation: normalizeText(readFirstValue(cells, PROFILE_CELL_MAP.occupation)),
    age: readFirstNumber(cells, PROFILE_CELL_MAP.age)
  };
}

function mapBackground(cells) {
  const background = {};

  for (const [label, address] of Object.entries(BACKGROUND_CELL_MAP)) {
    background[label] = normalizeText(readFirstValue(cells, address));
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
    public: normalizeText(readFirstValue(cells, INFO_CELL_MAP.public))
  };
}

function joinNonEmpty(values) {
  return values
    .map((value) => normalizeText(value))
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
  const name = normalizeText(cells[`${layout.name}${row}`])
    || normalizeText(cells[`${layout.skill}${row}`]);
  const hitRate = toNumber(cells[`${layout.hitRate}${row}`]);
  const damage = normalizeText(cells[`${layout.damage}${row}`]);
  const range = normalizeText(cells[`${layout.range}${row}`]);

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
  const name = normalizeText(rawName);
  const branch = normalizeText(rawBranch);

  if (!name) {
    return "";
  }

  if (name.endsWith(":") || name.endsWith("：")) {
    return branch ? `${name.replace(/：$/, ":")}${branch}` : "";
  }

  if (/[①②③④⑤⑥⑦⑧⑨]/.test(name)) {
    return branch ? `${name}:${branch}` : "";
  }

  return name;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}
