import assert from "node:assert/strict";
import { test } from "node:test";

import { mapCoc7Worksheet } from "../src/coc7Mapper.js";

test("maps COC7 attributes and derived values from fixed cells", () => {
  const character = mapCoc7Worksheet({
    U3: 40,
    AA3: 50,
    AG3: 60,
    U5: 70,
    AA5: 80,
    AG5: 90,
    U7: 55,
    AA7: 65,
    AE7: 8,
    F10: 9,
    H10: 10,
    N10: 45,
    P10: 99,
    V10: 30,
    X10: 30,
    AD10: 12,
    AF10: 12
  });

  assert.deepEqual(character.attributes, {
    STR: 40,
    DEX: 50,
    POW: 60,
    CON: 70,
    APP: 80,
    EDU: 90,
    SIZ: 55,
    INT: 65,
    MOV: 8
  });
  assert.deepEqual(character.derived, {
    DB: "0",
    BUILD: 0,
    HP: 9,
    HPMax: 9,
    SAN: 45,
    SANMax: 99,
    Luck: 30,
    LuckMax: 30,
    MP: 12,
    MPMax: 12
  });
});

test("maps skills from both COC7 skill table halves", () => {
  const character = mapCoc7Worksheet({
    C17: "估价",
    P17: 5,
    C33: "格斗:",
    E33: "斗殴",
    P33: 25,
    C36: "射击:",
    E36: "手枪",
    P36: 20,
    W16: "图书馆使用",
    AJ16: 20,
    W36: "生存:",
    Y36: "山脉",
    AJ36: 10,
    W41: "",
    AJ41: 0
  });

  assert.deepEqual(character.skills, {
    "估价": 5,
    "格斗:斗殴": 25,
    "射击:手枪": 20,
    "图书馆使用": 20,
    "生存:山脉": 10
  });
});

test("maps derived values and skills from the newer COC7 sheet layout", () => {
  const character = mapCoc7Worksheet({
    AE7: "幸运\nLuck",
    AG7: 60,
    E10: 8,
    G10: 8,
    W10: 12,
    Y10: 12,
    AF10: 8,
    F18: "估价",
    R18: 5,
    F34: "格斗：",
    H34: "斗殴",
    R34: 55,
    AB17: "图书馆使用",
    AN17: 60,
    AB31: "科学①",
    AD31: "地质学",
    AN31: 46
  });

  assert.equal(character.derived.HP, 8);
  assert.equal(character.derived.HPMax, 8);
  assert.equal(character.derived.Luck, 60);
  assert.equal(character.derived.MP, 12);
  assert.equal(character.derived.MPMax, 12);
  assert.equal(character.attributes.MOV, 8);
  assert.deepEqual(character.skills, {
    "估价": 5,
    "格斗:斗殴": 55,
    "图书馆使用": 60,
    "科学①:地质学": 46
  });
});

test("uses calculated HP and MP cells as their max values", () => {
  const character = mapCoc7Worksheet({
    E10: 8,
    G10: 99,
    W10: 12,
    Y10: 99
  });

  assert.equal(character.derived.HP, 8);
  assert.equal(character.derived.HPMax, 8);
  assert.equal(character.derived.MP, 12);
  assert.equal(character.derived.MPMax, 12);
});

test("maps weapons from the COC7 combat table", () => {
  const character = mapCoc7Worksheet({
    B53: "无",
    Q53: 55,
    W53: "1D3+DB",
    AA53: "——",
    B54: "弹簧刀",
    Q54: 55,
    W54: "1D4+DB",
    AA54: "接触",
    B55: "",
    Q55: 0
  });

  assert.deepEqual(character.weapons, [
    {
      name: "无",
      hitRate: 55,
      damage: "1D3+DB",
      range: "——"
    },
    {
      name: "弹簧刀",
      hitRate: 55,
      damage: "1D4+DB",
      range: "接触"
    }
  ]);
});

test("defaults unnamed brawl weapon rows to their skill name", () => {
  const character = mapCoc7Worksheet({
    B53: "",
    M53: "斗殴",
    Q53: 55,
    W53: "1D3+DB",
    AA53: "——"
  });

  assert.deepEqual(character.weapons, [
    {
      name: "斗殴",
      hitRate: 55,
      damage: "1D3+DB",
      range: "——"
    }
  ]);
});

test("maps profile fields and calculates damage bonus and build", () => {
  const character = mapCoc7Worksheet({
    E5: "学生",
    E6: 16,
    U3: 73,
    U7: 52
  });

  assert.deepEqual(character.profile, {
    occupation: "学生",
    age: 16
  });
  assert.equal(character.derived.DB, "+1D4");
  assert.equal(character.derived.BUILD, 1);
});

test("calculates COC7 damage bonus and build thresholds", () => {
  assert.equal(mapCoc7Worksheet({ U3: 30, U7: 34 }).derived.DB, "-2");
  assert.equal(mapCoc7Worksheet({ U3: 40, U7: 44 }).derived.DB, "-1");
  assert.equal(mapCoc7Worksheet({ U3: 60, U7: 64 }).derived.DB, "0");
  assert.equal(mapCoc7Worksheet({ U3: 80, U7: 84 }).derived.DB, "+1D4");
  assert.equal(mapCoc7Worksheet({ U3: 100, U7: 104 }).derived.DB, "+1D6");
  assert.equal(mapCoc7Worksheet({ U3: 140, U7: 144 }).derived.DB, "+2D6");
  assert.equal(mapCoc7Worksheet({ U3: 140, U7: 145 }).derived.DB, "+3D6");
  assert.equal(mapCoc7Worksheet({ U3: 140, U7: 145 }).derived.BUILD, 4);
  assert.equal(mapCoc7Worksheet({ U3: 180, U7: 185 }).derived.DB, "+4D6");
  assert.equal(mapCoc7Worksheet({ U3: 180, U7: 185 }).derived.BUILD, 5);
});

test("maps background paragraph fields from the COC7 sheet", () => {
  const character = mapCoc7Worksheet({
    AA63: "相信知识",
    AA65: "登山的学姐",
    AA67: "故乡小镇",
    AA69: "祖传的水银小瓶",
    AA71: "沉默寡言",
    AA75: "无",
    AA77: "无"
  });

  assert.deepEqual(character.background, {
    "特質": "沉默寡言",
    "思想及信念": "相信知识",
    "重要之人及理由": "登山的学姐",
    "意義非凡之地": "故乡小镇",
    "寶貴之物": "祖传的水银小瓶",
    "傷勢及傷痕": "无",
    "恐懼症及狂躁症": "无"
  });
});

test("maps inventory paragraph fields from carried item cells", () => {
  const character = mapCoc7Worksheet({
    F79: "耳机、钱包、手机",
    N79: "地质学书",
    N80: "简易急救箱"
  });

  assert.deepEqual(character.items, {
    "擁有的物品與資產": "",
    "攜帶物品": "耳机、钱包、手机\n地质学书\n简易急救箱"
  });
});

test("maps the long background story to public character info", () => {
  const character = mapCoc7Worksheet({
    W79: "出生在小镇，后来成为调查员。"
  });

  assert.deepEqual(character.info, {
    public: "出生在小镇，后来成为调查员。"
  });
});
