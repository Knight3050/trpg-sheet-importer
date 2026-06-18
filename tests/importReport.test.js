import assert from "node:assert/strict";
import { test } from "node:test";

import { createReportEntry, renderImportReport } from "../src/importReport.js";

test("renders grouped import report and marks failed entries", () => {
  const html = renderImportReport([
    createReportEntry("basic", "STR", 73, { ok: true }),
    createReportEntry("basic", "HP", 8, { ok: false, reason: "未找到字段" }),
    createReportEntry("skills", "会计", 5, { ok: true }),
    createReportEntry("skills", "博物学", 30, { ok: false, reason: "未找到字段" }),
    createReportEntry("weapons", "弹簧刀", "55 / 1D4+DB / 接触", { ok: true }),
    createReportEntry("background", "特質", "沉默寡言", { ok: true }),
    createReportEntry("items", "攜帶物品", "耳机", { ok: true }),
    createReportEntry("info", "公開資訊", "出生在小镇", { ok: true })
  ]);

  assert.match(html, /基础数值/);
  assert.match(html, /技能/);
  assert.match(html, /武器/);
  assert.match(html, /身世背景/);
  assert.match(html, /物品/);
  assert.match(html, /物件資訊/);
  assert.match(html, /class="report-ok">成功：STR = 73/);
  assert.match(html, /class="report-fail">失败：HP = 8（未找到字段）/);
  assert.match(html, /class="report-fail">失败：博物学 = 30（未找到字段）/);
  assert.match(html, /class="report-ok">成功：弹簧刀 = 55 \/ 1D4\+DB \/ 接触/);
  assert.match(html, /class="report-ok">成功：特質 = 沉默寡言/);
  assert.match(html, /class="report-ok">成功：攜帶物品 = 耳机/);
  assert.match(html, /class="report-ok">成功：公開資訊 = 出生在小镇/);
});
