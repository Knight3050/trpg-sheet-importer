# TRPGLine COC7 Importer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a first Tampermonkey script that reads the provided COC7 Excel template, previews parsed attributes and skills, and fills matching TRPGLine character sheet fields.

**Architecture:** Keep parsing logic testable as pure JavaScript modules, then embed the same logic into a single `.user.js` script for Tampermonkey. The userscript uses SheetJS in the browser, converts the workbook into a standard character object, and fills TRPGLine by clicking value buttons and setting the temporary number input.

**Tech Stack:** JavaScript, Node built-in test runner, Tampermonkey, SheetJS via `@require`.

---

### Task 1: Project Skeleton

**Files:**
- Create: `package.json`
- Create: `src/coc7Mapper.js`
- Create: `tests/coc7Mapper.test.js`

- [ ] Add a minimal Node test setup using `"type": "module"` and `node --test`.
- [ ] Create an empty mapper module with exported function names.
- [ ] Write the first failing test for parsing attributes from a worksheet-like cell object.

### Task 2: Excel Mapper

**Files:**
- Modify: `src/coc7Mapper.js`
- Modify: `tests/coc7Mapper.test.js`

- [ ] Test that named attributes map from `U3`, `AA3`, `AG3`, `U5`, `AA5`, `AG5`, `U7`, `AA7`, and `AE7`.
- [ ] Test that derived values map from `F10`, `H10`, `N10`, `P10`, `V10`, `X10`, `AD10`, and `AF10`.
- [ ] Test that skills are read from both table halves, including branch skills like `格斗:斗殴`.
- [ ] Implement the smallest mapper that passes these tests.

### Task 3: TRPGLine Adapter

**Files:**
- Create: `src/trpglineAdapter.js`
- Create: `tests/trpglineAdapter.test.js`

- [ ] Test skill name normalization across simplified Chinese, traditional Chinese, and English aliases.
- [ ] Test finding a `.character-attribute` row by alias.
- [ ] Implement value setting by clicking a row button, waiting for a number input, setting value, dispatching `input` and `change`, then blurring.

### Task 4: Userscript

**Files:**
- Create: `dist/trpgline-coc7-importer.user.js`

- [ ] Add Tampermonkey metadata with SheetJS CDN.
- [ ] Add a small floating import panel.
- [ ] Add file upload, workbook parsing, preview rendering, import button, and report rendering.
- [ ] Inline the tested mapper and adapter logic.

### Task 5: Verification

**Files:**
- Modify as needed from earlier tasks.

- [ ] Run `npm test`.
- [ ] Confirm the userscript exists at `dist/trpgline-coc7-importer.user.js`.
- [ ] Provide Tampermonkey installation and test instructions.
