# TRPGLine COC7 Excel Importer

TRPGLine COC7 Excel Importer 是一个 Tampermonkey / 油猴用户脚本，用于把固定格式的 COC7 Excel 角色卡导入到 TRPGLine Link 角色卡页面。

脚本会在 TRPGLine 页面右侧添加一个导入入口，读取 `.xlsx` / `.xls` 文件后，将 Excel 中的角色数据写入当前打开的角色卡页面，并在面板中显示导入结果。

## 功能

- 读取固定格式的 COC7 Excel 角色卡。
- 导入基础属性：STR、DEX、POW、CON、APP、EDU、SIZ、INT、MOV。
- 导入衍生值：HP、SAN、Luck、MP 等。
- 导入职业、年龄等基础资料。
- 导入技能表，支持带分支的技能名称。
- 导入武器表，包括名称、命中率、伤害、射程。
- 导入身世背景、物品和公开信息。
- 生成导入报告，区分成功和失败字段，方便手动补齐。

## 安装

1. 安装浏览器扩展：
   - [Tampermonkey](https://www.tampermonkey.net/)
   - 或其他兼容 UserScript 的脚本管理器
2. 打开脚本安装地址：

   ```text
   https://raw.githubusercontent.com/Knight3050/trpg-sheet-importer/main/dist/trpgline-coc7-importer.user.js
   ```

3. 在脚本管理器中确认安装。

脚本匹配以下页面：

```text
*://trpgline.com/*
*://*.trpgline.com/*
```

## 使用方法

1. 打开 TRPGLine Link 的角色卡页面。
2. 点击页面右侧的 `COC7 导入` 按钮。
3. 在弹出的面板中选择 COC7 Excel 文件。
4. 确认预览信息后，点击 `导入当前页`。
5. 根据导入报告检查是否有字段未找到或导入失败。

TRPGLine 的角色卡内容通常分布在不同标签页中。基础属性、技能、背景、物品等页面结构不同，如果某些字段未导入成功，请切换到对应的角色卡页面后再次导入。

## 自动更新

Tampermonkey 会根据脚本头部的 `@version` 判断是否有新版本。发布新版本时需要：

1. 修改 `dist/trpgline-coc7-importer.user.js`。
2. 提升脚本头部的 `@version`。
3. 提交并推送到 GitHub。

建议在脚本头部维护以下字段，以便用户自动更新：

```js
// @updateURL    https://raw.githubusercontent.com/Knight3050/trpg-sheet-importer/main/dist/trpgline-coc7-importer.user.js
// @downloadURL  https://raw.githubusercontent.com/Knight3050/trpg-sheet-importer/main/dist/trpgline-coc7-importer.user.js
// @supportURL   https://github.com/Knight3050/trpg-sheet-importer/issues
```

## 开发

项目使用 Node.js 原生测试框架。

```powershell
npm test
```

目录结构：

```text
src/
  coc7Mapper.js        # COC7 Excel 单元格映射
  trpglineAdapter.js   # TRPGLine 页面 DOM 写入适配
  importReport.js      # 导入报告渲染
dist/
  trpgline-coc7-importer.user.js
tests/
  *.test.js
```

## 发布流程

```powershell
npm test
git status
git add .
git commit -m "Release v0.1.x"
git push
```

发布前请确认：

- `npm test` 通过。
- `dist/trpgline-coc7-importer.user.js` 的 `@version` 已提升。
- 如果修改了 `src/`，需要同步更新 `dist/` 中的用户脚本。

## 当前限制

- 仅支持项目内已适配的固定 COC7 Excel 角色卡格式。
- TRPGLine 页面结构变化可能导致部分字段找不到。
- 不同语言或不同模板中的字段名称可能需要继续补充别名。
- `src/` 和 `dist/` 目前需要手动保持同步。

## License

未指定许可证。公开仓库维护时，建议后续补充明确的开源许可证。
