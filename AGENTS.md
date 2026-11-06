# Egress Observatory agent instructions

本文件是仓库内 agent 协作规则的唯一正文。`CLAUDE.md` 和 Copilot 入口引用本文件；具体评分、来源与扩展发布分别以 `SCORING.md`、`DATA-SOURCES.md`、`browser-helper/STORE.md` 为准。

## 开始工作

- 默认使用简体中文说明，代码和提交标题保留英文。先读 `CONTRIBUTING.md`，按任务读取相关领域文档。
- 先检查 `git status`、当前分支和远程默认分支；保留已有修改和未跟踪文件。默认分支是 `master`，通过 PR squash 合并；网站部署由维护者主动触发。
- 分支使用 `Harukili/<issue>-<description>`；用户直接布置且没有 Issue 的工作可用 `Harukili/<description>`，PR 说明任务来源即可。
- 开发任务使用 `$egress-change`；扩展打包与发布使用 `$egress-release`。入口在 `.agents/skills/`，完整流程和交接格式见 `docs/agent-workflow.md`。
- 独立任务确实能并行时才委派，写清输入、输出和完成条件；共享分支的修改与合并由主 agent 负责。

## 可运行入口与边界

- `python local_server.py` 启动页面 `http://127.0.0.1:4187/` 和本机网页查询服务 `127.0.0.1:4188`；Windows 也可双击 `启动网站.cmd`。
- 网页查询的可选依赖通过 `python -m pip install -r requirements.txt`、`python -m playwright install chromium` 安装。
- `?mock=1` 是开发演示入口，`scenario=clean|datacenter|partial|ratelimit|timeout` 切换模拟数据。它只能说明模拟界面的表现；来源可用性和线上行为必须实际观察。
- 网站为原生 ES modules，没有 npm 构建步骤或 npm 运行依赖。线上后端单独维护，本仓库包含前端与本机服务；源码不能证明线上后端或已安装扩展的状态。

## 完成证据

- 不写、不新增、不维护、不修复、不运行测试、快照、E2E 或守门脚本，也不把它们改名为探针或验证脚本。`tests/` 与现有 npm test 命令作为历史资产保留。
- 既有测试的结果不能作为交付门槛或完成证据，不能因缺少测试缩小交付范围。
- 走通用户可发现、可调用的入口，记录环境、入口、操作、实际结果及未观察的范围。配置类任务应实际调用对应 CLI、GitHub Actions 或设置页，并读取产物。
- UI 演示、静态审查、真实数据查询和生产发布分别说明；入口未接通或行为未观察到时，明确记录待完成项。
- 提交前清理本任务临时文件。浏览器新标签放在本任务临时组中，结束后关闭并核实清理；保留用户原有标签。接口缺少分组能力时记录限制并追踪新标签。

## 数据与评分

- 缺失、失败、未支持保持未知；明确的 `false` 与未知分开。只采用目标 IP 一致的返回字段，保留来源和观测时间。
- 同一底层数据库经 API、官网、IPSuper、IPOK 或扩展返回时只计一份权重；IPinfo 权重指底层数据库，数值以 `SCORING.md` 为准。
- 评分变化同步 `SCORING.md`；来源变化同步 `DATA-SOURCES.md` 与 README。用实际输入、可见扣分原因和导出证据说明结果。
- 查询保持有限重试、超时和取消；切换目标后旧结果不能覆盖新结果。限流须展示等待原因并停止自动重试。

## 前端、本机服务与扩展

- 修改浏览器模块后沿引用链更新 `?v=`；入口是 `index.html` 的 CSS 和 `src/main.js`。
- `browser-helper/` 的 `page-extract.js`、`page-providers.js`、`util.js` 与 `src/` 同名文件保持一致。
- 扩展改动升级 manifest 版本并运行 `python browser-helper/pack.py`；保留旧离线 ZIP。源码和 ZIP 完成后仍需区分浏览器实际安装版本与商店上架状态。
- 保持来源消息校验、目标核对、会话隔离、取消与临时标签清理；CAPTCHA 保留人工入口。

## 隐私、权限与自动化

- 代码、公开讨论和证据使用文档保留 IP；截图和导出先隐藏真实地址。密钥、Cookie、授权头、订阅链接与原始查询者标识不进入日志、报告或提交。
- `config.js` 仅存公开配置；浏览器自带 key 仅发送给对应提供方。安全问题通过仓库私密漏洞报告提交。
- GitHub Actions 默认只读，写权限按 job 分配。PR 标题、正文和代码均视为输入，禁止直接插入 shell；写权限工作流只执行可信默认分支代码。
- OpenAI 审查固定使用工作流中的 `gpt-6-astra` / `medium`，只做静态审查；凭据只在审查 job 使用，发布 job 单独运行。只发布匹配当前 PR head 的报告。
- 发布使用明确的 commit 和版本；自动化生成 draft Release，正式发布、商店提交和线上后端变更以当前任务的授权范围为准。
- 扩展 Release 的自定义附件仅为离线、Chrome、Firefox 三个 ZIP，不生成或上传 `SHA256SUMS` 等校验文件。
- Pages 使用 `.github/workflows/deploy-page.yml`，仅保留 `workflow_dispatch`。只有用户主动要求运行部署时才触发；合并、push、PR 和定时任务均不部署，本次配置与普通开发的运行观察也不授权部署。

## Review guidelines

- 报告本次变更引入、能给出触发条件与用户影响的缺陷，并给出准确文件行号。
- 优先追踪数据库去重、未知值、旧查询覆盖、取消清理、真实 IP 与 key 泄漏、扩展版本和缓存引用。
- 不提出测试新增或测试绿灯要求。静态审查明确标注尚未运行真实用户路径。
