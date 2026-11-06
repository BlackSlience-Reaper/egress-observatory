---
name: egress-release
description: 为 Egress 浏览器扩展准备版本、离线及商店包、GitHub draft Release 和可追溯的安装证据；用于明确的扩展打包或发布任务。
---

# Egress release

读取根目录 `AGENTS.md`、`browser-helper/STORE.md` 与 `CONTRIBUTING.md` 的扩展约定。先确认任务需要本地包、draft Release、正式 Release 或商店提交中的哪些结果。

- 版本来自 `browser-helper/manifest.json`；有运行代码改动时递增版本。共享提取文件先与 `src/` 同步，再运行 `python browser-helper/pack.py`。
- 打包器同步页面和文档版本，生成 `downloads/egress-browser-helper-vVERSION.zip` 及 `dist/` 下 Chrome、Firefox 商店包。保留旧离线包，商店包不提交到 Git。
- 从扩展管理页加载或更新实际扩展，再从网站入口观察本轮涉及的行为；记录浏览器、实际安装版本、入口和结果。无法观察安装行为时明确范围。
- 合并后的默认分支可通过 Actions 的 **Prepare Helper Release → Run workflow**，或 `gh workflow run helper-release.yml --ref master` 生成 draft Release，自定义附件仅为离线、Chrome、Firefox 三个 ZIP；工作流会绑定实际 commit，且拒绝覆盖已有同版本 Release。
- 从 `gh release list` / Release 页面读取实际草稿与附件。Firefox ZIP 是商店签名用上传包，安装需使用签名后的版本。
- 只有当前任务已授权正式发布或商店提交时才执行；否则交付实际草稿 URL 和包。正式发布后也需分别核实 GitHub Release、安装版本与商店状态。

不运行测试或守门脚本，不从打包成功推断扩展实际运行成功。发布记录采用 `docs/agent-workflow.md` 的证据格式。
