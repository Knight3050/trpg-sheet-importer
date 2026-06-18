const GROUP_TITLES = {
  basic: "基础数值",
  skills: "技能",
  weapons: "武器",
  background: "身世背景",
  items: "物品",
  info: "物件資訊"
};

const GROUP_ORDER = ["basic", "skills", "weapons", "background", "items", "info"];

export function createReportEntry(group, name, value, result) {
  return {
    group,
    name,
    value,
    ok: result.ok,
    reason: result.reason ?? ""
  };
}

export function renderImportReport(entries) {
  return GROUP_ORDER
    .map((group) => renderGroup(group, entries.filter((entry) => entry.group === group)))
    .filter(Boolean)
    .join("");
}

function renderGroup(group, entries) {
  if (entries.length === 0) {
    return "";
  }

  const items = entries.map(renderEntry).join("");

  return `<section class="report-group"><h3>${escapeHtml(GROUP_TITLES[group] ?? group)}</h3>${items}</section>`;
}

function renderEntry(entry) {
  const className = entry.ok ? "report-ok" : "report-fail";
  const label = entry.ok ? "成功" : "失败";
  const reason = entry.ok || !entry.reason ? "" : `（${entry.reason}）`;

  return `<div class="${className}">${label}：${escapeHtml(entry.name)} = ${escapeHtml(entry.value)}${escapeHtml(reason)}</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
